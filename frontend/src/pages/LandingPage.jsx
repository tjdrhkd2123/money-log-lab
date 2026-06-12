import React, { useState, useEffect } from 'react';
import DashboardHome from '../components/DashboardHome.jsx';
import CardNews from '../components/CardNews.jsx';
import { Mail, Shield, ShieldCheck, Bell, Award, Coins, RefreshCw, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config.js';

export default function LandingPage({ onNavigateToAdmin }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [backendWaking, setBackendWaking] = useState(true);
  const [activeView, setActiveView] = useState('home'); // 'home' or 'subscribe'

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
      setStatus({ type: 'error', message: '로기 연구실 서버에 연결할 수 없어. 오류가 발생했어!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Navigation Header */}
      <header className="app-header" style={{ borderBottom: '1px solid var(--color-card-border)', paddingBottom: '20px', marginBottom: '40px' }}>
        <div className="app-header-logo" onClick={() => setActiveView('home')} style={{ cursor: 'pointer' }}>
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

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button 
            onClick={() => setActiveView('home')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeView === 'home' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', 
              fontWeight: '700',
              fontSize: '15px',
              fontFamily: 'var(--font-headers)',
              cursor: 'pointer', 
              borderBottom: activeView === 'home' ? '2px solid var(--color-accent-blue)' : '2px solid transparent', 
              paddingBottom: '4px',
              transition: 'all 0.2s'
            }}
          >
            금융 대시보드
          </button>
          <button 
            onClick={() => setActiveView('subscribe')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeView === 'subscribe' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', 
              fontWeight: '700',
              fontSize: '15px',
              fontFamily: 'var(--font-headers)',
              cursor: 'pointer', 
              borderBottom: activeView === 'subscribe' ? '2px solid var(--color-accent-blue)' : '2px solid transparent', 
              paddingBottom: '4px',
              transition: 'all 0.2s'
            }}
          >
            도토리 구독하기 🌰
          </button>
          <button 
            onClick={onNavigateToAdmin}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-text-secondary)', 
              fontWeight: '600',
              fontSize: '14px',
              fontFamily: 'var(--font-headers)',
              cursor: 'pointer',
              paddingBottom: '4px',
              opacity: 0.8
            }}
          >
            🔐 시크릿 룸
          </button>
        </nav>
      </header>

      {activeView === 'home' ? (
        <>
          {/* Fintech SaaS Style Hero Section (2-Column Hero) */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            marginBottom: '60px',
            textAlign: 'left'
          }}>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--color-accent-blue)',
                fontFamily: 'var(--font-headers)',
                background: 'rgba(37, 99, 235, 0.08)',
                padding: '6px 14px',
                borderRadius: '30px',
                border: '1px solid rgba(37, 99, 235, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '20px'
              }}>
                <Award size={13} />
                매일 아침 07:00 AM 신선한 경제 도토리 무료 배달
              </div>
              
              <h1 className="hero-title" style={{
                fontSize: 'clamp(28px, 4.5vw, 42px)',
                lineHeight: '1.3',
                background: 'linear-gradient(to right, var(--color-text-primary) 60%, var(--color-accent-blue) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px'
              }}>
                경제 뉴스가 어렵니?<br/>
                다람쥐 연구원 로기가<br/>
                쉽고 빠르게 정리해줄게!
              </h1>
              
              <p style={{
                fontSize: '16px',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6',
                marginBottom: '28px',
                fontWeight: '400'
              }}>
                어려운 금융 용어와 복잡한 지표들을 중학생도 바로 이해할 수 있게 요약해 줄게. 매일 3분만 가볍게 읽어봐! 🐿️🌰
              </p>

              <button 
                onClick={() => setActiveView('subscribe')}
                className="btn-primary"
                style={{ padding: '14px 28px', fontSize: '15px' }}
              >
                매일 아침 메일로 도토리 받기
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Visual Callout Container */}
            <div className="glass-card" style={{
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
              padding: '30px',
              borderRadius: '24px',
              borderLeft: '4px solid var(--color-accent-blue)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ fontSize: '50px', marginBottom: '16px' }}>🐿️📈🌰</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>로기 금융 연구소 가동 중!</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: '0 auto 16px auto', maxWidth: '380px' }}>
                로기 비서가 국내 실시간 코스피 마켓과 글로벌 거시 경제 흐름을 쉼 없이 모니터링하고 분석하고 있어.
              </p>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--color-accent-emerald)',
                background: 'rgba(16, 185, 129, 0.08)',
                padding: '4px 12px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent-emerald)' }} />
                실시간 인덱스 피드 가동 중
              </span>
            </div>
          </section>

          {/* Service Grid Layout: 2-Column Dashboard (Left: Indices, Right: CardNews) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            marginTop: '20px'
          }}>
            {/* Left: Financial Indicators & Commentary */}
            <section style={{ width: '100%' }}>
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800' }}>
                  📊 실시간 금융 대시보드
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  수집된 원화 대비 가치 및 주요 코스피 지수를 한눈에 파악해봐!
                </p>
              </div>
              <DashboardHome />
            </section>

            {/* Right: Rogi's Core Card News Slider */}
            <section style={{ width: '100%' }}>
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800' }}>
                  📰 로기의 오늘의 경제 도토리
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  좌우로 가볍게 넘겨보며 오늘의 경제 핵심 꿀팁을 스캔해봐!
                </p>
              </div>
              <CardNews />
            </section>
          </div>

          {/* External Navigation Banners (2-Column Premium Banners) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginTop: '40px',
            marginBottom: '20px'
          }}>
            {/* Crypto Exchange Referral Banner */}
            <a 
              href="https://litt.ly/moneyloglab123" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(245, 158, 11, 0.03) 100%)',
                borderLeft: '4px solid var(--color-accent-orange)',
                transition: 'all 0.3s ease'
              }}
            >
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: 'var(--color-accent-orange)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  🔥 EXCLUSIVE BENEFIT
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  🪙 거래소 혜택 바로가기
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  로기가 챙겨주는 수수료 평생 할인 & 선물 거래 리워드 꿀혜택!
                </p>
              </div>
              <div style={{
                background: 'rgba(217, 119, 6, 0.08)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent-orange)',
                flexShrink: 0,
                marginLeft: '16px'
              }}>
                <ArrowRight size={16} />
              </div>
            </a>

            {/* Naver Blog Link Banner */}
            <a 
              href="https://blog.naver.com/moneyloglab123" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.03) 100%)',
                borderLeft: '4px solid var(--color-accent-emerald)',
                transition: 'all 0.3s ease'
              }}
            >
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: 'var(--color-accent-emerald)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  📝 DETAILED ARTICLES
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  💚 네이버 블로그로 뉴스 자세히 보기
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  5대 분야 AI 매칭 포스팅 원고와 깊이 있는 상세 분석글을 읽어봐!
                </p>
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent-emerald)',
                flexShrink: 0,
                marginLeft: '16px'
              }}>
                <ArrowRight size={16} />
              </div>
            </a>
          </div>
        </>
      ) : (
        /* Subscribe View (Dedicated Page) */
        <section style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '40px auto 60px auto',
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
            <Mail size={14} />
            로기의 스마트 이메일 뉴스레터
          </div>
          
          <h1 className="hero-title" style={{
            background: 'linear-gradient(to right, var(--color-text-primary) 60%, var(--color-accent-blue) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '20px'
          }}>
            매일 아침 7시,<br/>
            금융 도토리를 메일함에 쏙! 🐿️📬
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            marginBottom: '36px',
            lineHeight: '1.6'
          }}>
            귀찮고 어려운 경제 뉴스 읽기 끝! 구독 버튼 하나로<br/>
            세상 편한 이메일 요약본을 매일 공짜로 챙겨줄게!
          </p>

          <form onSubmit={handleSubscribe} className="glass-card newsletter-form" style={{ boxShadow: 'var(--shadow-card)', background: '#ffffff' }}>
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
            marginTop: '12px'
          }}>
            <ShieldCheck size={12} style={{ color: 'var(--color-accent-blue)' }} />
            철벽 보안 데이터 보호 적용 및 스팸 방지 실시간 검증 완료
          </div>

          {/* 🐿️ 배포 서버 기상 상태 인디케이터 */}
          <div className="glass-card no-mobile-padding" style={{
            marginTop: '24px',
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
        </section>
      )}

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
