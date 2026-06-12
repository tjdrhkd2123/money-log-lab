import cron from 'node-cron';
import { financeService } from './financeService.js';
import { coinValidator } from './coinValidator.js';
import { aiService } from './aiService.js';
import { mailService } from './mailService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/db.json');

// Ensure database directory and file exist
function initializeDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ subscribers: [], dailyAcorns: null }, null, 2));
  }
}

/**
 * Triggers the automatic news harvesting, AI content generation, and email dispatching
 */
export async function triggerDailyHarvest() {
  console.log('🌅 아침 7시 수집 및 자동 발행 시퀀스 시작!');
  initializeDb();

  try {
    // 1. Gather finance metrics and latest headlines
    const financialData = await financeService.getDailyAcorns();

    // 2. Validate Bitget & OKX Hot Coins
    const coinData = await coinValidator.getValidatedCoins();

    // Combine financial data and coin data for AI prompt context
    const fullContext = {
      ...financialData,
      coinData
    };

    // 3. Generate Blog Posts, Card News and Newsletter Content
    const generatedContent = await aiService.generatePosts(fullContext);

    // 4. Save to Database
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    db.dailyAcorns = {
      timestamp: new Date().toISOString(),
      indices: financialData.indices,
      news: financialData.news,
      coins: coinData,
      generated: generatedContent
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log('💾 로기가 오늘의 도토리 분석 자료를 시크릿 데이터베이스에 저장 완료했어!');

    // 5. Send Email Newsletter to active subscribers
    // Try to load active contacts dynamically from Resend's permanent cloud registry first
    let activeSubscribers = await mailService.getContacts();
    
    if (!activeSubscribers) {
      console.log('ℹ️ Resend Audience 미설정 또는 오류로 인해 서버 로컬 DB 캐시를 활용하여 발송합니다.');
      activeSubscribers = db.subscribers;
    }

    if (activeSubscribers.length > 0) {
      console.log(`✉️ 총 ${activeSubscribers.length}명의 이메일 구독자들에게 뉴스레터 발송 개시!`);
      await mailService.sendNewsletter(activeSubscribers, generatedContent.newsletter);
    } else {
      console.log('ℹ️ 아직 등록된 이메일 구독자가 없어서 뉴스레터 자동 발송은 대기 중이야.');
    }

    console.log('✅ 오늘의 아침 7시 자동화 사이클 완벽 종료!');
    return db.dailyAcorns;
  } catch (error) {
    console.error('❌ 아침 7시 자동화 스케줄 수행 도중 치명적인 요류 발생:', error.message);
    throw error;
  }
}

/**
 * Initializes the node-cron daemon
 */
export function initScheduler() {
  initializeDb();
  
  // Schedule a daily task at 7:00 AM (0 7 * * *) (Rule 21 & Schedule trigger)
  console.log('⏰ 로기 연구실 크론 스케줄러 활성화: 매일 아침 07:00 AM 자동 수집 예약 완료. (Asia/Seoul 기준)');
  
  cron.schedule('0 7 * * *', async () => {
    try {
      await triggerDailyHarvest();
    } catch (err) {
      console.error('스케줄러 자동 실행 오류:', err.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Seoul"
  });

  // Helper to extract YYYY-MM-DD in KST (UTC+9)
  const getKstDateStr = (dateOrStr) => {
    try {
      const date = new Date(dateOrStr);
      // Offset by 9 hours for KST
      const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
      return kstDate.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // [Zero-Click 자동화] 서버 구동 시 오늘자 수집 데이터가 없거나 하루가 지난 상태라면 구동 즉시 백그라운드 수집 자동 실행
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const todayStr = getKstDateStr(new Date());
    
    let needsHarvest = false;
    if (!db.dailyAcorns || !db.dailyAcorns.timestamp) {
      needsHarvest = true;
    } else {
      const lastHarvestDate = getKstDateStr(db.dailyAcorns.timestamp);
      if (lastHarvestDate !== todayStr) {
        needsHarvest = true;
      }
    }

    if (needsHarvest) {
      console.log(`⚡ [자동 구동] 오늘 날짜(${todayStr})의 최신 경제 데이터가 없습니다. 아침 7시 수집을 서버 기동 즉시 백그라운드에서 자동 수집합니다!`);
      triggerDailyHarvest().catch(err => {
        console.error('서버 시작 즉시 자동 수집 실행 실패:', err.message);
      });
    } else {
      console.log(`✅ [데이터 확보] 오늘의 최신 아침 7시 경제 도토리 분석(${todayStr})이 이미 안전하게 탑재되어 있습니다. 관리자 화면에 바로 로딩됩니다.`);
    }
  } catch (err) {
    console.error('서버 기동 자동 수집 검증 중 오류:', err.message);
  }
}
