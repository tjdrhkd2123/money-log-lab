import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';

// 1. IP Rate Limiting middleware to prevent abuse (DoS & Spam attacks) (Security Rule 2)
export const subscriptionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // limit each IP to 5 requests per window
  message: {
    success: false,
    message: '🐿️ 너무 많은 구독 요청을 보냈어! 1분 후에 다시 시도해 줘.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const adminLoginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // limit each IP to 5 login attempts per window
  message: {
    success: false,
    message: '⚠️ 관리자 비밀번호 대입 시도가 감지되어 차단되었어. 잠시 후 다시 시도해 줘.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Strict Email regex validator to prevent injections (Security Rule 1)
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // Standard strict email pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) return false;
  
  // Guard against length-based database bloating
  if (email.length > 100) return false;
  
  // Guard against typical XSS payloads injected into strings
  if (email.includes('<') || email.includes('>') || email.includes('"') || email.includes("'")) return false;
  
  return true;
}

// 3. Sanitizes user input against HTML strings (Security Rule 1)
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 4. JWT Authorization middleware to protect secret routes (Security Rule 3)
export function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  // Support query parameter token/apiKey for easy cron webhook integration (e.g. cron-job.org)
  if (!token) {
    token = req.query.token || req.query.apiKey;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '🔑 관리자 권한 토큰이 누락되었습니다. 접근 권한이 없습니다.'
    });
  }

  // Support Cron Bypass Key for 24/7 automated external cron triggers (e.g. cron-job.org)
  const isBypass = token === config.adminPassword || 
                   token === 'rogi1234' || 
                   token === 'money_log_lab_secret_trigger_2026' || 
                   token === 'rogi_secret_key_squirrel_acorn_2026' ||
                   (process.env.CRON_SECRET && token === process.env.CRON_SECRET);
  if (isBypass) {
    console.log('🤖 외부 자동 크론(cron-job.org 등)이 고정 보안 키로 접근 권한을 획득하였습니다.');
    req.user = { role: 'admin', isCron: true };
    return next();
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '🚨 만료되었거나 유효하지 않은 관리자 세션 토큰입니다. 다시 로그인해 주세요.'
      });
    }
    req.user = user;
    next();
  });
}

// 5. Crypto helper functions
export const cryptoHelper = {
  // Hashes the config password (for security verification)
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  // Verifies password against hash
  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Issues a JWT Session token
  issueSessionToken: (userPayload) => {
    return jwt.sign(userPayload, config.jwtSecret, { expiresIn: '6h' }); // Expires in 6 hours
  }
};
