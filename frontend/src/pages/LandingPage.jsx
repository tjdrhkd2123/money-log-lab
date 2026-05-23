import React, { useState } from 'react';
import DashboardHome from '../components/DashboardHome.jsx';
import CardNews from '../components/CardNews.jsx';
import { Mail, Shield, ShieldCheck, Bell, Award, Coins } from 'lucide-react';

export default function LandingPage({ onNavigateToAdmin }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('https://money-log-lab-backend.onrender.com/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.message || '구독 신청 중 오류가 발생했어!' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: '로기 연구실 서버에 연결할 수 없어. 오률가 발생했어!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Navigation Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-accent-orange) 0%, var(--color-accent-emerald) 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: 'var(--shadow-neon-orange)'
          }}>
            🐿️
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '-0.03em' }}>
              머니로그랩 <span style={{ color: 'var(--color-accent-emerald)', fontWeight: '400' }}>Lab</span>
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em' }}>
              ROGI'S FINANCIAL ACORNS
            </p>
          </div>
        </div>
        
        <button 
          onClick={onNavigateToAdmin}
          className="btn-secondary"
          style={{ fontSize: '13px', padding: '8px 18px' }}
        >
          🔐 관리자 시크릿 룸
        </button>
      </header>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        marginBottom: '60px',
        position: 'relative'
      }}>
        <div className="pulse-glowing" style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          fontWeight: '700',
          color: 'var(--color-accent-emerald)',
          fontFamily: 'var(--font-headers)',
          background: 'rgba(0, 245, 212, 0.08)',
          padding: '6px 16px',
          borderRadius: '30px',
          border: '1px solid rgba(0, 245, 212, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Award size={14} />
          매일 아침 07:00 AM 신선한 경제 도토리 무료 배달
        </div>
        
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '800',
          fontFamily: 'var(--font-headers)',
          lineHeight: '1.2',
          marginBottom: '20px',
          marginTop: '30px',
          background: 'linear-gradient(to right, #ffffff 40%, var(--color-accent-emerald) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          경제 뉴스가 어렵니?<br/>
          다람쥐 연구원 로기가 쉽게 풀어줄게!
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: 'var(--color-text-secondary)',
          maxWidth: '650px',
          margin: '0 auto 36px auto',
          lineHeight: '1.6',
          fontWeight: '400'
        }}>
          환율 급등, 금리 폭탄, 코인 폭등까지 어려웠던 금융 상식들을<br/>
          중학생도 이해 가능한 쉬운 언어로 요약해서 배달해 준다구! 🐿️🌰
        </p>

        {/* Dynamic Email Newsletter Form */}
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <form onSubmit={handleSubscribe} className="glass-card" style={{
            padding: '8px',
            borderRadius: '40px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            background: 'rgba(13, 22, 39, 0.8)'
          }}>
            <div style={{ paddingLeft: '16px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} />
            </div>
            <input 
              type="email"
              placeholder="뉴스레터를 받아볼 이메일 주소를 적어줘!"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '15px',
                flex: '1',
                height: '40px',
                fontFamily: 'var(--font-body)'
              }}
            />
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
              style={{ padding: '0 24px', height: '46px', borderRadius: '23px', fontSize: '14px' }}
            >
              {loading ? '구독 신청 중...' : '경제 도토리 구독하기 🐿️'}
            </button>
          </form>

          {/* Security & Verification Alert */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            marginTop: '10px'
          }}>
            <ShieldCheck size={12} style={{ color: 'var(--color-accent-emerald)' }} />
            철벽 보안 데이터 보호 적용 및 스팸 방지 실시간 검증 완료
          </div>

          {/* Success/Error Feedbacks */}
          {status.message && (
            <div className="glass-card pulse-glowing" style={{
              marginTop: '20px',
              padding: '12px 18px',
              borderRadius: 'var(--border-radius-md)',
              borderLeft: status.type === 'success' ? '4px solid var(--color-accent-emerald)' : '4px solid var(--color-accent-orange)',
              background: 'rgba(5, 10, 20, 0.7)',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              color: status.type === 'success' ? 'var(--color-accent-emerald)' : 'var(--color-accent-orange)'
            }}>
              {status.message}
            </div>
          )}
        </div>
      </section>

      {/* Main Grid: Card News & Live Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        marginTop: '60px',
        alignItems: 'start'
      }}>
        {/* Card News Slide Component */}
        <section style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', color: '#ffffff', fontFamily: 'var(--font-headers)', marginBottom: '6px' }}>
              오늘의 로기 연구소 카드뉴스
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              좌우로 넘겨보며 오늘의 경제 핵심 도토리를 확인해봐!
            </p>
          </div>
          <CardNews />
        </section>

        {/* Real-time Indicators Dashboard Widget */}
        <section style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', color: '#ffffff', fontFamily: 'var(--font-headers)', marginBottom: '6px' }}>
              실시간 머니로그 금융 대시보드
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              수집된 원화 대비 가치 및 주요 코스피 지수를 한눈에 파악해봐!
            </p>
          </div>
          <DashboardHome />
        </section>
      </div>

      {/* Core Brand Value Section */}
      <section style={{
        marginTop: '80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '60px'
      }}>
        <div className="glass-card" style={{ background: 'rgba(5, 10, 20, 0.4)' }}>
          <div style={{ color: 'var(--color-accent-emerald)', marginBottom: '12px' }}><Coins size={28} /></div>
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>
            글로벌 포트폴리오 다각화
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            원화 자산의 감쇠 위기 속에서, 해외 선물 마켓 및 알트코인 지표를 적절히 병행하여 헷지 수단을 설계할 수 있도록 명료하게 분석합니다.
          </p>
        </div>

        <div className="glass-card" style={{ background: 'rgba(5, 10, 20, 0.4)' }}>
          <div style={{ color: 'var(--color-accent-orange)', marginBottom: '12px' }}><Bell size={28} /></div>
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>
            매일 아침 7시 이메일 발송
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            바쁜 출근길이나 등교시간에도 3분 내에 글로벌 경제 흐름을 간편하게 스캔하고 시작할 수 있도록 요약된 이메일 뉴스레터를 배달해 드립니다.
          </p>
        </div>

        <div className="glass-card" style={{ background: 'rgba(5, 10, 20, 0.4)' }}>
          <div style={{ color: 'var(--color-accent-blue)', marginBottom: '12px' }}><Shield size={28} /></div>
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>
            위협 공격 차단 보안
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            최신 API Rate-Limiter 미들웨어와 철저한 이스케이프 보안 메커니즘을 가동하여 해커의 악의적 위협(XSS/SQL 인젝션)으로부터 구독자 개인정보를 철통 수호합니다.
          </p>
        </div>
      </section>

      {/* Landing Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '80px',
        padding: '30px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: 'var(--color-text-muted)',
        fontSize: '13px'
      }}>
        <p>© 2026 머니로그랩 (Money Log Lab). All Rights Reserved.</p>
        <p style={{ marginTop: '5px' }}>다람쥐 연구원 로기가 물어오는 똑똑한 금융 도토리 🐿️🌰</p>
      </footer>

    </div>
  );
}
