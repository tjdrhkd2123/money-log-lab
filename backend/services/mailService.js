import axios from 'axios';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mailService = {
  /**
   * Sends the newsletter to a list of subscribers using Resend API.
   * Gracefully falls back to writing a mock email file locally if API Key is not set.
   */
  sendNewsletter: async (subscribers, newsletterContent) => {
    const { subject, htmlBody } = newsletterContent;
    
    // Ensure subscribers is an array of email strings
    const recipientEmails = subscribers.map(s => typeof s === 'string' ? s : s.email);
    
    if (recipientEmails.length === 0) {
      console.log('ℹ️ 발송할 구독자가 존재하지 않습니다.');
      return;
    }

    console.log(`✉️ 뉴스레터 발송 수신처: [${recipientEmails.join(', ')}]`);

    // If Resend API Key is missing, run in High-Fidelity Local Simulation Mode
    if (!config.resendApiKey) {
      console.log('ℹ️ RESEND_API_KEY 미설정 상태입니다. 로컬 발송 모의 저장을 진행합니다.');
      
      const mailLogDir = path.join(__dirname, '../data');
      if (!fs.existsSync(mailLogDir)) {
        fs.mkdirSync(mailLogDir, { recursive: true });
      }
      
      const mockMailPath = path.join(mailLogDir, 'last_sent_mail.html');
      const debugContainer = `
        <!-- LOCAL MAIL SIMULATION DEBUG CONTAINER -->
        <div style="background-color: #ffe8cc; border: 3px solid #ff922b; padding: 15px; margin-bottom: 20px; font-family: sans-serif; border-radius: 8px;">
          <h3 style="margin-top:0; color: #d9480f;">🐿️ 로기의 로컬 모의 뉴스레터 발송 디버거</h3>
          <p style="margin: 5px 0;"><strong>수신자 리스트:</strong> ${recipientEmails.join(', ')}</p>
          <p style="margin: 5px 0;"><strong>메일 제목:</strong> ${subject}</p>
          <p style="margin: 5px 0; font-size: 13px; color: #5c5f62;">* 이 파일은 Resend API 키가 없을 때 실제 발송 화면을 로컬 브라우저에서 미리 볼 수 있도록 모의 저장된 파일입니다.</p>
        </div>
        ${htmlBody}
      `;
      
      fs.writeFileSync(mockMailPath, debugContainer, 'utf-8');
      console.log(`💾 뉴스레터 뷰파일이 로컬 브라우저 미리보기용으로 저장되었습니다: [${mockMailPath}]`);
      return { success: true, simulated: true, path: mockMailPath };
    }

    // Call Resend REST API using Axios
    try {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: `Money Log Lab <${config.senderEmail}>`,
          to: recipientEmails,
          subject: subject,
          html: htmlBody
        },
        {
          headers: {
            'Authorization': `Bearer ${config.resendApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('🎉 Resend API를 통해 경제 도토리 뉴스레터 이메일 발송 성공!', response.data);
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message;
      console.error('❌ Resend API 메일 발송 중 오류 발생:', apiErrorMsg);
      return { success: false, error: apiErrorMsg };
    }
  }
};
