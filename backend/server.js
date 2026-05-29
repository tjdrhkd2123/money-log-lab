import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import util from 'util';

import { config } from './config.js';
import { initScheduler, triggerDailyHarvest } from './services/scheduler.js';
import { mailService } from './services/mailService.js';
import {
  subscriptionRateLimiter,
  adminLoginRateLimiter,
  isValidEmail,
  sanitizeInput,
  authenticateAdminToken,
  cryptoHelper
} from './services/security.js';

const execPromise = util.promisify(exec);
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

// Disable caching for all API endpoints to guarantee real-time updates of harvested data in the frontend
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve generated shorts videos statically
app.use('/shorts', express.static(path.join(__dirname, 'video_maker/output')));

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

// Asynchronous background video generation status holder
let videoGenerationState = {
  status: 'idle',
  error: null,
  videoUrl: null
};

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
        title: "📈 삼성전자 30만 원 깨지자 8조 순매수!",
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
 * 2.5 GET /api/public/debug-gemini
 * Exposes the raw response of the last Gemini call for debugging.
 */
app.get('/api/public/debug-gemini', (req, res) => {
  try {
    const debugPath = path.join(__dirname, 'data/debug_gemini_response.txt');
    if (!fs.existsSync(debugPath)) {
      return res.status(404).send('No debug log found. Please trigger a harvest first.');
    }
    const logContent = fs.readFileSync(debugPath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(logContent);
  } catch (error) {
    return res.status(500).send(`Error reading debug log: ${error.message}`);
  }
});

/**
 * 2.6 GET /api/public/debug-python
 * Exposes the log of python package installation during startup.
 */
app.get('/api/public/debug-python', (req, res) => {
  try {
    const debugPath = path.join(__dirname, 'data/debug_python_install.txt');
    if (!fs.existsSync(debugPath)) {
      return res.status(404).send('No python install log found yet.');
    }
    const logContent = fs.readFileSync(debugPath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(logContent);
  } catch (error) {
    return res.status(500).send(`Error reading python install log: ${error.message}`);
  }
});

/**
 * 3. POST /api/subscribe
 * Registers a new email subscriber. Protected by Rate Limiting and strict validations.
 */
app.post('/api/subscribe', subscriptionRateLimiter, async (req, res) => {
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
    
    // Check duplication in local cache
    if (db.subscribers.includes(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        message: '🐿️ 이미 로기의 도토리 경제 뉴스레터를 구독하고 계신 이메일이야!'
      });
    }

    // Attempt to register subscriber in Resend Audience registry
    const resendRes = await mailService.addContact(sanitizedEmail);
    if (!resendRes.success && !resendRes.simulated) {
      return res.status(500).json({
        success: false,
        message: `🚨 Resend 이메일 연동 등록 실패: ${resendRes.error}`
      });
    }

    db.subscribers.push(sanitizedEmail);
    writeDb(db);

    console.log(`➕ 신규 이메일 구독자 등록 완료 (로컬 캐시 및 Resend): ${sanitizedEmail}`);

    return res.status(201).json({
      success: true,
      message: '🐿️ 로기의 도토리 경제 뉴스레터 구독 성공! 내일부터 아침 7시에 경제 도토리를 배달해 줄게!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `서버 저장 중 알 수 없는 요류 발생: ${error.message}` });
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
app.get('/api/admin/daily-acorns', authenticateAdminToken, async (req, res) => {
  try {
    const db = getDb();
    
    // Dynamically load subscribers from Resend cloud registry to prevent visual DB wipes
    let activeSubscribers = await mailService.getContacts();
    let isResendActive = true;
    if (!activeSubscribers) {
      activeSubscribers = db.subscribers;
      isResendActive = false;
    }
    
    // Build diagnostic status for admin panel
    const audienceId = config.resendApiKey ? await mailService.getAudienceId().catch(() => null) : null;
    const diagnostics = {
      geminiApiKeyLoaded: !!config.geminiApiKey,
      claudeApiKeyLoaded: !!config.claudeApiKey,
      resendApiKeyLoaded: !!config.resendApiKey,
      senderEmail: config.senderEmail,
      audienceId: audienceId,
      isResendActive: isResendActive,
      resendError: mailService.getResendLastError()
    };
    
    return res.status(200).json({
      success: true,
      dailyAcorns: db.dailyAcorns,
      subscribersCount: activeSubscribers.length,
      subscribers: activeSubscribers,
      diagnostics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 7. POST /api/admin/sync-subscribers
 * Synchronizes and merges frontend local backup subscribers with server db cache.
 */
app.post('/api/admin/sync-subscribers', authenticateAdminToken, async (req, res) => {
  const { subscribers } = req.body;
  if (!subscribers || !Array.isArray(subscribers)) {
    return res.status(400).json({ success: false, message: '올바른 구독자 목록 데이터가 아닙니다.' });
  }

  try {
    const db = getDb();
    let mergedCount = 0;
    
    for (const email of subscribers) {
      const cleaned = email.trim().toLowerCase();
      if (cleaned && !db.subscribers.includes(cleaned)) {
        db.subscribers.push(cleaned);
        mergedCount++;
        // Attempt cloud registration if missing on Resend during dynamic restore
        if (config.resendApiKey) {
          await mailService.addContact(cleaned).catch(() => null);
        }
      }
    }
    
    if (mergedCount > 0) {
      writeDb(db);
      console.log(`🔄 프론트엔드 백업으로부터 ${mergedCount}명의 구독자가 복원 및 병합되었습니다.`);
    }

    // Build diagnostic status for response
    const audienceId = config.resendApiKey ? await mailService.getAudienceId().catch(() => null) : null;
    const diagnostics = {
      geminiApiKeyLoaded: !!config.geminiApiKey,
      claudeApiKeyLoaded: !!config.claudeApiKey,
      resendApiKeyLoaded: !!config.resendApiKey,
      senderEmail: config.senderEmail,
      audienceId: audienceId,
      isResendActive: !!audienceId,
      resendError: mailService.getResendLastError()
    };

    return res.status(200).json({
      success: true,
      message: `🔄 구독자 목록 동기화 완료! (${mergedCount}명 복원됨)`,
      subscribersCount: db.subscribers.length,
      subscribers: db.subscribers,
      diagnostics
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

/**
 * 8. POST /api/admin/generate-video
 * Dynamically updates SCENES with today's harvested AI data and executes video_maker script asynchronously in the background.
 */
app.post('/api/admin/generate-video', authenticateAdminToken, async (req, res) => {
  try {
    if (videoGenerationState.status === 'processing') {
      return res.status(400).json({
        success: false,
        message: '🐿️ 이미 유튜브 쇼츠 비디오가 렌더링 중입니다. 완료될 때까지 기다려 주세요!'
      });
    }

    console.log('🎬 유튜브 쇼츠 비디오 동적 제작 시퀀스 개시 (비동기 처리)!');
    const db = getDb();
    
    if (!db.dailyAcorns || !db.dailyAcorns.generated || !db.dailyAcorns.generated.posts) {
      return res.status(400).json({
        success: false,
        message: '오늘 날짜의 수집 정보 및 AI 작성 글이 아직 존재하지 않습니다. 먼저 뉴스 수집을 진행해 주세요!'
      });
    }

    const posts = db.dailyAcorns.generated.posts;
    const findPostText = (category) => {
      const post = posts.find(p => p.category === category);
      if (post) {
        return post.aeoSummary || post.recommendedTitle || '';
      }
      return '';
    };

    // Extract raw summaries for each scene
    const ecoSummary = findPostText('economic');
    const stockSummary = findPostText('stock');
    const coinSummary = findPostText('bitgetCoin') || findPostText('okxCoin');
    const realestateSummary = findPostText('realestate');

    // Make clean, conversational TTS speech text
    const cleanSpeech = (text) => {
      return text.replace(/[✅🚨🪙📈📊🏠⚠️🐿️🌰]/g, '').replace(/\[IMAGE_[0-9]+\]/g, '').replace(/\s+/g, ' ').replace(/"/g, "'").trim();
    };

    const introText = "안녕하세요! 다람쥐 연구원 로기에요. 오늘 아침 수집된 따끈따끈한 경제 도토리 소식 지금 바로 브리핑해 드릴게요!";
    const coinText = coinSummary 
      ? `첫 번째로, 가상자산 소식입니다. ${cleanSpeech(coinSummary)}`
      : "첫 번째로, 코인 마켓 소식입니다. 글로벌 가상자산 시장으로 대규모 자금이 활발히 유입되고 있습니다.";
    const stockText = stockSummary
      ? `두 번째는 국내 주식 시장 소식입니다. ${cleanSpeech(stockSummary)}`
      : "다음은 주식 뉴스입니다. 반도체 수급이 점차 회복세를 나타내며 활력을 되찾고 있습니다.";
    const ecoText = ecoSummary
      ? `세 번째로 거시 경제 및 글로벌 소식 볼까요? ${cleanSpeech(ecoSummary)}`
      : "세 번째로 경제 지표입니다. 고금리 기조가 이어지며 달러 자산이 강세를 나타내고 있습니다.";
    const realestateText = realestateSummary
      ? `네 번째는 부동산 트렌드 소식입니다. ${cleanSpeech(realestateSummary)}`
      : "네 번째로 부동산 동향입니다. 대출 보유세 부담 가중으로 인해 시장 거래량 흐름 변화가 뚜렷합니다.";
    const outroText = "오늘 로기가 준비한 경제 도토리는 여기까지에요! 더 자세한 분석은 로기의 머니로그랩에서 만나볼 수 있어요. 구독과 좋아요 부탁드려요! 안녕!";

    // Define color palettes
    const coinBgColor = "(245, 158, 11)";
    const stockBgColor = "(59, 130, 246)";
    const ecoBgColor = "(16, 185, 129)";
    const realestateBgColor = "(139, 92, 246)";

    // Read video_maker/main.py as template
    const mainPyPath = path.join(__dirname, 'video_maker/main.py');
    const tempPyPath = path.join(__dirname, 'video_maker/main_temp.py');
    
    if (!fs.existsSync(mainPyPath)) {
      return res.status(500).json({
        success: false,
        message: '서버 내에 비디오 메이커 스크립트(main.py)가 존재하지 않습니다.'
      });
    }

    let mainPyContent = fs.readFileSync(mainPyPath, 'utf-8');

    // Construct dynamically updated SCENES block
    const dynamicScenesBlock = `SCENES = [
    {"type": "intro", "text": "${introText}", "bg_color": (255, 240, 230)},
    {"type": "coin", "text": "${coinText}", "bg_color": ${coinBgColor}},
    {"type": "stock", "text": "${stockText}", "bg_color": ${stockBgColor}},
    {"type": "economy", "text": "${ecoText}", "bg_color": ${ecoBgColor}},
    {"type": "real_estate", "text": "${realestateText}", "bg_color": ${realestateBgColor}},
    {"type": "outro", "text": "${outroText}", "bg_color": (255, 240, 230)}
]`;

    // Swap SCENES block in python file
    const scenesRegex = /SCENES\s*=\s*\[[\s\S]*?\]/;
    mainPyContent = mainPyContent.replace(scenesRegex, dynamicScenesBlock);
    
    // Save to main_temp.py
    fs.writeFileSync(tempPyPath, mainPyContent, 'utf-8');
    console.log('💾 동적 씬이 장착된 main_temp.py 템플릿 임시 생성 완료!');

    // Update state to processing
    videoGenerationState = {
      status: 'processing',
      error: null,
      videoUrl: null
    };

    // Run python rendering process completely asynchronously in the background!
    console.log('🐍 파이썬 비디오 메이커 백그라운드 런처 실행...');
    const execCwd = path.join(__dirname, 'video_maker');
    
    execPromise('python main_temp.py', { cwd: execCwd })
      .then(({ stdout, stderr }) => {
        console.log('python stdout:', stdout);
        if (stderr) console.error('python stderr:', stderr);
        
        try {
          fs.unlinkSync(tempPyPath);
        } catch (e) {}

        const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const relativeVideoPath = `/shorts/logi_shorts_${todayStr}.mp4`;
        
        console.log(`🎉 성공적으로 유튜브 쇼츠 비디오 렌더링 완료! 주소: ${relativeVideoPath}`);
        
        videoGenerationState = {
          status: 'completed',
          error: null,
          videoUrl: relativeVideoPath
        };
      })
      .catch((err) => {
        console.error('파이썬 쇼츠 렌더링 에러:', err.message);
        try {
          fs.unlinkSync(tempPyPath);
        } catch (e) {}

        videoGenerationState = {
          status: 'failed',
          error: err.message,
          videoUrl: null
        };
      });

    return res.status(200).json({
      success: true,
      message: '🎬 유튜브 쇼츠 비디오 생성을 백그라운드에서 안전하게 시작했습니다!'
    });

  } catch (error) {
    videoGenerationState = {
      status: 'failed',
      error: error.message,
      videoUrl: null
    };
    res.status(500).json({
      success: false,
      message: `쇼츠 비디오 생성 개시 실패: ${error.message}`
    });
  }
});

/**
 * 8.5 GET /api/admin/video-status
 * Retrieves the current status of the background video generation.
 */
app.get('/api/admin/video-status', authenticateAdminToken, (req, res) => {
  return res.status(200).json({
    success: true,
    state: videoGenerationState
  });
});

// Automatically install python requirements inside Render.com container environment
async function installPythonRequirements() {
  console.log('🐍 [Render Python Sync] 파이썬 패키지(requirements.txt) 설치 상태 동기화 중...');
  
  const logDir = path.join(__dirname, 'data');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, 'debug_python_install.txt');
  
  let logContent = `=== Python Package Install Sync started at ${new Date().toISOString()} ===\n`;
  fs.writeFileSync(logPath, logContent, 'utf-8');

  const appendLog = (msg) => {
    console.log(msg);
    logContent += msg + '\n';
    fs.writeFileSync(logPath, logContent, 'utf-8');
  };

  try {
    const reqPath = path.join(__dirname, 'video_maker/requirements.txt');
    const libsDir = path.join(__dirname, 'video_maker/libs');
    if (!fs.existsSync(libsDir)) fs.mkdirSync(libsDir, { recursive: true });
    
    // Command 1: Try local target library install (Targeting libs folder, highly reliable on Render!)
    const cmd1 = `python -m pip install -r "${reqPath}" -t "${libsDir}" --upgrade --break-system-packages`;
    appendLog(`🐍 Command 1: ${cmd1}`);
    try {
      const { stdout, stderr } = await execPromise(cmd1);
      appendLog(`✅ Command 1 Success:\nStdout: ${stdout}\nStderr: ${stderr}`);
      return;
    } catch (err1) {
      appendLog(`⚠️ Command 1 Failed: ${err1.message}`);
    }

    // Command 2: Fallback to simple pip -t libs
    const cmd2 = `pip install -r "${reqPath}" -t "${libsDir}" --upgrade --break-system-packages`;
    appendLog(`🐍 Command 2: ${cmd2}`);
    try {
      const { stdout, stderr } = await execPromise(cmd2);
      appendLog(`✅ Command 2 Success:\nStdout: ${stdout}\nStderr: ${stderr}`);
      return;
    } catch (err2) {
      appendLog(`⚠️ Command 2 Failed: ${err2.message}`);
    }

    // Command 3: Fallback to user site-packages
    const cmd3 = `python -m pip install -r "${reqPath}" --user --upgrade --break-system-packages`;
    appendLog(`🐍 Command 3: ${cmd3}`);
    try {
      const { stdout, stderr } = await execPromise(cmd3);
      appendLog(`✅ Command 3 Success:\nStdout: ${stdout}\nStderr: ${stderr}`);
      return;
    } catch (err3) {
      appendLog(`⚠️ Command 3 Failed: ${err3.message}`);
    }

    // Command 4: Direct pip user site-packages
    const cmd4 = `pip install -r "${reqPath}" --user --upgrade --break-system-packages`;
    appendLog(`🐍 Command 4: ${cmd4}`);
    try {
      const { stdout, stderr } = await execPromise(cmd4);
      appendLog(`✅ Command 4 Success:\nStdout: ${stdout}\nStderr: ${stderr}`);
      return;
    } catch (err4) {
      appendLog(`❌ Command 4 Failed: ${err4.message}`);
    }

    appendLog('❌ [Render Python Sync] 모든 설치 방법이 실패했습니다. 비디오 생성 패키지를 수동으로 확인해야 할 수 있습니다.');
  } catch (globalErr) {
    appendLog(`❌ [Render Python Sync] 글로벌 오류: ${globalErr.message}`);
  }
}

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🐿️  Money Log Lab - 로기 연구소 서버 가동 중...`);
  console.log(`🔗  로컬 API 호스트: http://localhost:${PORT}`);
  console.log(`=======================================================`);
  
  // Dynamically install Python requirements in the background on startup (Render env)
  installPythonRequirements();
  
  // Launch the Cron Scheduler Daemon (7:00 AM)
  initScheduler();
});
