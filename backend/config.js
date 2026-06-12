import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

export const config = {
  port: process.env.PORT || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  claudeApiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendAudienceId: process.env.RESEND_AUDIENCE_ID || '',
  senderEmail: process.env.SENDER_EMAIL || 'newsletter@moneyloglab.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'skdml4fkd!',
  jwtSecret: process.env.JWT_SECRET || 'rogi_secret_key_squirrel_acorn_2026',
};
