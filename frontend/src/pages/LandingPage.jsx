import React, { useState, useEffect } from 'react';
import DashboardHome from '../components/DashboardHome.jsx';
import CardNews from '../components/CardNews.jsx';
import { Mail, Shield, ShieldCheck, Bell, Award, Coins, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config.js';

export default function LandingPage({ onNavigateToAdmin }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [backendWaking, setBackendWaking] = useState(true);

  // 🐿️ 배포 서버 끈질기게 깨우기 (Wakeup Ping Loop)
  useEffect(() => {
    let intervalId;
    const wakeUpBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/indices`);
        if (res.ok) {
          console.log("🟢 배포 서버 기상 완료! 아침 7시 수집 자동 트리거 활성화.");
          setBackendWaking(false);
          clearInterval(intervalId);
        }
      } catch (err) {
        console.log("⏳ 배포 서버가 아직 쿨쿨 자고 있어 로기가 흔들어 깨우는 중...");
      }
    };

    wakeUpBackend();
    intervalId = setInterval(wakeUpBackend, 3000); // 완전히 일어날 때까지 3초 간격 노크

    return () => clearInterval(intervalId);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        
        // Save to local backup to prevent Render ephemeral storage wipe
        try {
          const backups = JSON.parse(localStorage.getItem('moneyloglab_backup_subscribers') || '[]');
          const cleanEmail = email.trim().toLowerCase();
          if (!backups.includes(cleanEmail)) {
            backups.push(cleanEmail);
            localStorage.setItem('moneyloglab_backup_subscribers', JSON.stringify(backups));
          }
        } catch (e) {
          console.error('Backup save failed:', e);
        }
        
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
      <header className="app-header">
        <div className="app-header-logo">
          <div style={{
            background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--bg-tertiary) 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.15)'
          }}>
            🐿️
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '-0.03em' }}>
              머니로그랩 <span style={{ color: 'var(--color-accent-blue)', fontWeight: '400' }}>Lab</span>
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
        <div style={{
          fontSize: '14px',
          fontWeight: '700',
          color: 'var(--color-accent-blue)',
          fontFamily: 'var(--font-headers)',
          background: 'rgba(59, 130, 246, 0.08)',
          padding: '6px 16px',
          borderRadius: '30px',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '24px'
        }}>
          <Award size={14} />
          매일 아침 07:00 AM 신선한 경제 도토리 무료 배달
        </div>
        
        <h1 className="hero-title" style={{
          background: 'linear-gradient(to right, var(--color-text-primary) 60%, var(--color-accent-blue) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '24px'
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
          <form onSubmit={handleSubscribe} className="glass-card newsletter-form">
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
                color: 'var(--color-text-primary)',
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
            <ShieldCheck size={12} style={{ color: 'var(--color-accent-blue)' }} />
            철벽 보안 데이터 보호 적용 및 스팸 방지 실시간 검증 완료
          </div>

          {/* 🐿️ 배포 서버 기상 상태 인디케이터 */}
          <div className="glass-card no-mobile-padding" style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '20px',
            background: 'var(--bg-secondary)',
            border: '1px solid',
            borderColor: backendWaking ? 'rgba(245, 158, 11, 0.25)' : 'rgba(59, 130, 246, 0.25)',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center',
            color: backendWaking ? 'var(--color-accent-orange)' : 'var(--color-accent-blue)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            boxShadow: backendWaking ? '0 4px 10px rgba(245, 158, 11, 0.05)' : '0 4px 10px rgba(59, 130, 246, 0.05)'
          }}>
            {backendWaking ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>🐿️ 로기가 잠든 배포 서버를 힘껏 깨우고 있어요! (약 15초 소요)</span>
              </>
            ) : (
              <>
                <span>🟢 로기 연구소 서버 활성화 완료! 실시간 데이터 동기화 레이어 작동 중</span>
              </>
            )}
          </div>

          {/* Success/Error Feedbacks */}
          {status.message && (
            <div className="glass-card" style={{
              marginTop: '20px',
              padding: '12px 18px',
              borderRadius: 'var(--border-radius-md)',
              borderLeft: status.type === 'success' ? '4px solid var(--color-accent-blue)' : '4px solid var(--color-accent-orange)',
              background: 'var(--bg-secondary)',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              color: status.type === 'success' ? 'var(--color-accent-blue)' : 'var(--color-accent-orange)'
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
            <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', marginBottom: '6px' }}>
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
            <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', marginBottom: '6px' }}>
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
        borderTop: '1px solid #e2e8f0',
        paddingTop: '60px'
      }}>
        <div className="glass-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ color: 'var(--color-accent-blue)', marginBottom: '12px' }}><Coins size={28} /></div>
          <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>
            글로벌 포트폴리오 다각화
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            원화 자산의 감쇠 위기 속에서, 해외 선물 마켓 및 알트코인 지표를 적절히 병행하여 헷지 수단을 설계할 수 있도록 명료하게 분석합니다.
          </p>
        </div>

        <div className="glass-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ color: 'var(--color-accent-orange)', marginBottom: '12px' }}><Bell size={28} /></div>
          <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>
            매일 아침 7시 이메일 발송
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            바쁜 출근길이나 등교시간에도 3분 내에 글로벌 경제 흐름을 간편하게 스캔하고 시작할 수 있도록 요약된 이메일 뉴스레터를 배달해 드립니다.
          </p>
        </div>

        <div className="glass-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ color: 'var(--color-accent-blue)', marginBottom: '12px' }}><Shield size={28} /></div>
          <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>
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
