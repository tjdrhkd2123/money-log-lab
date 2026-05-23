import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import { config } from './config.js';
import { initScheduler, triggerDailyHarvest } from './services/scheduler.js';
import {
  subscriptionRateLimiter,
  adminLoginRateLimiter,
  isValidEmail,
  sanitizeInput,
  authenticateAdminToken,
  cryptoHelper
} from './services/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data/db.json');

const app = express();

// 1. HTTP Security Headers and Cross-Origin Configuration (Security Rule 1 & 4)
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for local workspace testing, can be restricted later in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Load or initialize DB helper
function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ subscribers: [], dailyAcorns: null }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// 2. Pre-hash password on start to prepare fast comparisons
let hashedAdminPassword = '';
async function prepareHashedPassword() {
  hashedAdminPassword = await cryptoHelper.hashPassword(config.adminPassword);
  console.log(`🔐 로기 연구소 관리자 보안 키가 로딩되었습니다. (대시보드 패스워드: ${config.adminPassword})`);
}
prepareHashedPassword();

// ==========================================
// PUBLIC API ROUTES
// ==========================================

/**
 * 1. GET /api/public/indices
 * Fetches latest KOSPI, KOSDAQ, and USD/KRW indices for public landing page widgets.
 */
app.get('/api/public/indices', (req, res) => {
  try {
    const db = getDb();
    if (db.dailyAcorns && db.dailyAcorns.indices) {
      return res.status(200).json({
        success: true,
        indices: db.dailyAcorns.indices
      });
    }
    
    // Base indices fallback if no harvest happened yet
    return res.status(200).json({
      success: true,
      indices: {
        kospi: { price: '2,680.50', change: '+24.15', changePercent: '0.91', status: 'UP' },
        kosdaq: { price: '845.20', change: '-3.10', changePercent: '-0.36', status: 'DOWN' },
        usdKrw: { price: '1,365.50', change: '+4.50', changePercent: '0.33', status: 'UP' },
        timestamp: new Date().toLocaleString('ko-KR')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. GET /api/public/card-news
 * Fetches the daily generated card news for the main page slideshow.
 */
app.get('/api/public/card-news', (req, res) => {
  try {
    const db = getDb();
    if (db.dailyAcorns && db.dailyAcorns.generated && db.dailyAcorns.generated.cardNews) {
      return res.status(200).json({
        success: true,
        cardNews: db.dailyAcorns.generated.cardNews
      });
    }

    // High fidelity default card news if no harvesting happened yet
    const defaultCardNews = [
      {
        slideNumber: 1,
        title: "🐿️ 안녕하세요! 다람쥐 연구원 로기에요!",
        description: "머니로그랩에 오신 걸 환영해! 아침 7시마다 로기가 신선한 경제 소식을 모아 요약해 줄게. 이메일을 등록하고 매일 메일로 받아봐!",
        keyword: "로기 연구원"
      },
      {
        slideNumber: 2,
        title: "🚨 원달러 환율 1,360원 긴급 돌파!",
        description: "미국 금리 인하 지연 우려에 환율이 급격히 상승하며 물가 폭등 비상이 걸렸어. 내 자산 방어 포트폴리오를 준비해야 해!",
        keyword: "환율 급등"
      },
      {
        slideNumber: 3,
        title: "📈 삼성전자 7만 원 깨지자 8조 순매수!",
        description: "개인들이 외인들의 패닉 투매 물량을 받아내며 대규모 8조 원을 사들였어. 반도체 HBM 시장의 숨은 상승 뇌관이 폭발할 조짐일까?",
        keyword: "삼성전자"
      },
      {
        slideNumber: 4,
        title: "⚠️ 부동산 불패 강남 빌딩마저 비명!",
        description: "연 6%대 대출 고금리 부담을 이기지 못한 상가 매물이 경매 법정에 쏟아지고 유찰되고 있어. 단일 몰빵 투자는 자폭 행위야!",
        keyword: "강남 부동산"
      },
      {
        slideNumber: 5,
        title: "🐿️ 로기의 경제 도토리 솔루션!",
        description: "자산 변동성이 심해질 때는 해외 가상자산 병행 투자를 통해 위험을 헷징해야 해. 아래 제휴 배너 평생 혜택을 이용해 굴려봐! 👇",
        keyword: "리스크 분산"
      }
    ];

    return res.status(200).json({
      success: true,
      cardNews: defaultCardNews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. POST /api/subscribe
 * Registers a new email subscriber. Protected by Rate Limiting and strict validations.
 */
app.post('/api/subscribe', subscriptionRateLimiter, (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: '이메일 주소를 입력해 주세요.' });
  }

  const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

  // Strict email security checks (Security Rule 1)
  if (!isValidEmail(sanitizedEmail)) {
    return res.status(400).json({
      success: false,
      message: '🚨 올바르지 않은 이메일 서식 또는 허용되지 않는 보안 특수문자가 포함되었습니다.'
    });
  }

  try {
    const db = getDb();
    
    // Check duplication
    if (db.subscribers.includes(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        message: '🐿️ 이미 로기의 도토리 경제 뉴스레터를 구독하고 계신 이메일이야!'
      });
    }

    db.subscribers.push(sanitizedEmail);
    writeDb(db);

    console.log(`➕ 신규 이메일 구독자 등록 완료: ${sanitizedEmail}`);

    return res.status(201).json({
      success: true,
      message: '🐿️ 로기의 도토리 경제 뉴스레터 구독 성공! 내일부터 아침 7시에 경제 도토리를 배달해 줄게!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 저장 중 알 수 없는 요류가 발생했습니다.' });
  }
});

/**
 * 4. POST /api/admin/login
 * Validates admin password. Protected by Rate Limiter.
 */
app.post('/api/admin/login', adminLoginRateLimiter, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: '패스워드를 입력해 주세요.' });
  }

  try {
    const isMatched = await cryptoHelper.comparePassword(password, hashedAdminPassword);
    
    if (!isMatched) {
      console.log('⚠️ 시크릿 대시보드 권한 획득 실패 (비밀번호 불일치)');
      return res.status(401).json({
        success: false,
        message: '🔑 패스워드가 올바르지 않습니다. 로기의 시크릿 연구실에 들어갈 수 없습니다.'
      });
    }

    // Issue JWT security session token
    const token = cryptoHelper.issueSessionToken({ role: 'admin' });
    console.log('🔑 관리자 로그인 성공! 보안 세션 토큰 발급 완료.');

    return res.status(200).json({
      success: true,
      message: '🐿️ 로기 연구실 시크릿 대시보드 입장 완료!',
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '암호화 검증 중 오류가 발생했습니다.' });
  }
});

// ==========================================
// PROTECTED ADMIN API ROUTES (authenticateAdminToken)
// ==========================================

/**
 * 5. GET /api/admin/daily-acorns
 * Fetches the daily harvested indicators, coins and generated draft articles.
 */
app.get('/api/admin/daily-acorns', authenticateAdminToken, (req, res) => {
  try {
    const db = getDb();
    
    return res.status(200).json({
      success: true,
      dailyAcorns: db.dailyAcorns,
      subscribersCount: db.subscribers.length,
      subscribers: db.subscribers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 6. POST /api/admin/trigger-harvest
 * Manually starts a complete gather & AI writing cycle (Rule 19 trigger "수집해줘").
 */
app.post('/api/admin/trigger-harvest', authenticateAdminToken, async (req, res) => {
  try {
    console.log('⚡ 관리자 강제 수집 트리거 ("수집해줘" 시퀀스 실행)');
    const dailyAcorns = await triggerDailyHarvest();
    
    return res.status(200).json({
      success: true,
      message: '⚡ 오늘의 뉴스 수집 및 AI 4대 포스팅 글쓰기 + 독자 메일 발송이 성공적으로 완료되었습니다!',
      dailyAcorns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `자동화 수집 실행 중 실패: ${error.message}`
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🐿️  Money Log Lab - 로기 연구소 서버 가동 중...`);
  console.log(`🔗  로컬 API 호스트: http://localhost:${PORT}`);
  console.log(`=======================================================`);
  
  // Launch the Cron Scheduler Daemon (7:00 AM)
  initScheduler();
});
