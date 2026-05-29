import axios from 'axios';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let resolvedAudienceId = config.resendAudienceId || null;
let resendLastError = null;

export const mailService = {
  /**
   * Retrieves the last captured Resend API error message.
   */
  getResendLastError: () => {
    return resendLastError;
  },

  /**
   * Clears the last captured Resend error message.
   */
  clearResendLastError: () => {
    resendLastError = null;
  },

  /**
   * Automatically discover or create the default Audience ID
   */
  getAudienceId: async () => {
    if (resolvedAudienceId) return resolvedAudienceId;
    if (!config.resendApiKey) {
      resendLastError = "RESEND_API_KEY가 서버 환경변수에 설정되어 있지 않습니다.";
      return null;
    }
    
    try {
      console.log('🔍 Resend에서 사용 가능한 주소록(Audience)을 자동으로 조회하고 있습니다...');
      const response = await axios.get('https://api.resend.com/audiences', {
        headers: {
          'Authorization': `Bearer ${config.resendApiKey}`
        },
        timeout: 8000
      });
      
      const audiences = response.data?.data || [];
      if (audiences.length > 0) {
        resolvedAudienceId = audiences[0].id;
        console.log(`🎯 기본 주소록 자동 감지 성공! (이름: ${audiences[0].name}, ID: ${resolvedAudienceId})`);
        resendLastError = null; // Clear error on success
        return resolvedAudienceId;
      }
      
      // If no audience exists, automatically create one!
      console.log('ℹ️ Resend에 등록된 주소록이 없습니다. 머니로그랩용 주소록을 자동 생성합니다...');
      const createRes = await axios.post(
        'https://api.resend.com/audiences',
        { name: 'Money Log Lab' },
        {
          headers: {
            'Authorization': `Bearer ${config.resendApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );
      
      resolvedAudienceId = createRes.data?.id;
      console.log(`🎯 신규 주소록 자동 생성 및 연동 성공! (ID: ${resolvedAudienceId})`);
      resendLastError = null; // Clear error on success
      return resolvedAudienceId;
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message;
      console.error('❌ Resend 주소록 ID 자동 감지 실패:', apiErrorMsg);
      resendLastError = `주소록 ID 자동 감지 실패: ${apiErrorMsg}`;
      return null;
    }
  },

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
      resendLastError = "RESEND_API_KEY 미설정으로 인한 시뮬레이션 작동 중";
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
      resendLastError = null; // Clear error on success
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message;
      console.error('❌ Resend API 메일 발송 중 오류 발생:', apiErrorMsg);
      resendLastError = `메일 발송 중 오류: ${apiErrorMsg}`;
      return { success: false, error: apiErrorMsg };
    }
  },

  /**
   * Adds a new subscriber contact to the Resend Audience.
   */
  addContact: async (email) => {
    if (!config.resendApiKey) {
      console.log('ℹ️ Resend API 미설정으로 로컬 DB에만 임시 저장됩니다.');
      resendLastError = "RESEND_API_KEY 미설정 상태입니다.";
      return { success: true, simulated: true };
    }

    const audienceId = await mailService.getAudienceId();
    if (!audienceId) {
      console.log('ℹ️ Resend Audience ID를 자동 조회하지 못해 로컬 DB에만 임시 저장됩니다.');
      // resendLastError is set by getAudienceId
      return { success: true, simulated: true };
    }
    
    try {
      const response = await axios.post(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          email: email,
          unsubscribed: false
        },
        {
          headers: {
            'Authorization': `Bearer ${config.resendApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );
      console.log(`🎉 Resend Audience에 신규 구독자 추가 성공: ${email}`);
      resendLastError = null; // Clear error on success
      return { success: true, contactId: response.data?.id };
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message;
      console.error(`❌ Resend Audience 구독자 추가 실패:`, apiErrorMsg);
      
      // If contact already exists, Resend returns conflict. Treat as success.
      if (apiErrorMsg.includes('already exists') || error.response?.status === 409) {
        resendLastError = null; // Don't count as a real blocker error
        return { success: true, alreadyExists: true };
      }
      
      resendLastError = `구독자 추가 실패: ${apiErrorMsg}`;
      return { success: false, error: apiErrorMsg };
    }
  },

  /**
   * Fetches all active contacts from the Resend Audience.
   */
  getContacts: async () => {
    if (!config.resendApiKey) {
      resendLastError = "RESEND_API_KEY가 존재하지 않습니다.";
      return null;
    }

    const audienceId = await mailService.getAudienceId();
    if (!audienceId) return null;
    
    try {
      const response = await axios.get(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          headers: {
            'Authorization': `Bearer ${config.resendApiKey}`
          },
          timeout: 10000
        }
      );
      
      const contacts = response.data?.data || [];
      // Filter active (subscribed) emails
      const activeEmails = contacts
        .filter(c => !c.unsubscribed)
        .map(c => c.email);
      
      console.log(`📋 Resend Audience로부터 ${activeEmails.length}명의 활성 구독자 목록을 안전하게 로드했습니다.`);
      resendLastError = null; // Clear error on success
      return activeEmails;
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message;
      console.error(`❌ Resend Audience 구독자 목록 가져오기 실패:`, apiErrorMsg);
      resendLastError = `구독자 목록 조회 실패: ${apiErrorMsg}`;
      return null;
    }
  }
};
