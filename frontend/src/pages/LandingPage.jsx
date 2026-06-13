import React, { useState, useEffect } from 'react';
import DashboardHome from '../components/DashboardHome.jsx';
import CardNews from '../components/CardNews.jsx';
import ThreeDHero from '../components/ThreeDHero.jsx';
import { Mail, Shield, ShieldCheck, Bell, Award, Coins, RefreshCw, ArrowRight, Lock, KeyRound, UserPlus, LogIn, LogOut, ChevronRight, FileText, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config.js';

export default function LandingPage({ onNavigateToAdmin }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [backendWaking, setBackendWaking] = useState(true);
  const [activeView, setActiveView] = useState('home'); // 'home', 'login', 'register'
  
  // Game state variables
  const [isEntered, setIsEntered] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null); // 'dashboard', 'news', 'calculators', 'subscribe', 'benefits'

  // NPC Interaction state variables
  const [nearNPC, setNearNPC] = useState(null);
  const [activeNPC, setActiveNPC] = useState(null);
  const [typedText, setTypedText] = useState('');

  const getNPCDialogText = (id) => {
    switch (id) {
      case 'npc_news':
        return '앗, 로기 소장님! 실시간 금융 뉴스를 요약해서 브리핑 파일로 만들고 있었어요. 📰 글로벌 경제 속보를 바로 확인하시겠어요?';
      case 'npc_calc':
        return '소장님 오셨네요! 알려주신 복리 도토리 적금 시뮬레이터와 실시간 원·달러 환율 계산기를 튜닝 중이었어요. 💱 수치를 계산해볼까요?';
      case 'npc_benefit':
        return '안녕! 매일 아침 도토리 소식지를 구독한 패밀리들에게 보낼 꿀맛 파트너 혜택 정보를 정리하고 있어. 🪙 실시간 혜택 채널로 안내해줄까?';
      case 'npc_dashboard':
        return '소장님, 여기 보세요! 실시간 KOSPI 지수와 글로벌 지표 데이터망에 이상 무! 아주 안정적으로 순환매가 돌고 있답니다. 📊 시황판을 열어볼까요?';
      default:
        return '안녕하세요, 로기 소장님! 머니로그 연구소에서 금융 경제 지표를 연구하는 중입니다. 🐿️';
    }
  };

  // Typing effect for NPC speech
  useEffect(() => {
    if (!activeNPC) {
      setTypedText('');
      return;
    }
    const fullText = getNPCDialogText(activeNPC.id);
    setTypedText('');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        setTypedText(fullText.substring(0, idx + 1));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [activeNPC]);

  // Space key interaction for dialogue activation
  useEffect(() => {
    const handleDialogueKeyDown = (e) => {
      if (isEntered && nearNPC && !activeNPC && e.key === ' ') {
        e.preventDefault();
        setActiveNPC(nearNPC);
      }
    };
    window.addEventListener('keydown', handleDialogueKeyDown);
    return () => window.removeEventListener('keydown', handleDialogueKeyDown);
  }, [isEntered, nearNPC, activeNPC]);

  const handleNPCChoice = (type) => {
    if (!activeNPC) return;
    if (type === 'action') {
      if (activeNPC.id === 'npc_news') setActiveOverlay('news');
      else if (activeNPC.id === 'npc_calc') setActiveOverlay('calculators');
      else if (activeNPC.id === 'npc_benefit') setActiveOverlay('benefits');
      else if (activeNPC.id === 'npc_dashboard') setActiveOverlay('dashboard');
    }
    setActiveNPC(null);
  };

  const [news, setNews] = useState([]);
  const [newsTab, setNewsTab] = useState('economy');
  const [indices, setIndices] = useState(null);

  const [currentUser, setCurrentUser] = useState(sessionStorage.getItem('current_user') || null);
  const [isAdmin, setIsAdmin] = useState(!!sessionStorage.getItem('admin_token'));
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [calcTab, setCalcTab] = useState('exchange');
  const [krwInput, setKrwInput] = useState('1000000');
  const [usdInput, setUsdInput] = useState('657.89');
  const [monthlySavings, setMonthlySavings] = useState('300000');
  const [interestRate, setInterestRate] = useState('4.5');
  const [savingsPeriod, setSavingsPeriod] = useState('3');

  useEffect(() => {
    let intervalId;
    const wakeUpBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/indices`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setIndices(data.indices);
            if (data.news) setNews(data.news);
          }
          setBackendWaking(false);
          clearInterval(intervalId);
        }
      } catch (err) {
        console.log("⏳ 배포 서버가 아직 쿨쿨 자고 있어 로기가 흔들어 깨우는 중...");
      }
    };

    wakeUpBackend();
    intervalId = setInterval(wakeUpBackend, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const getActiveRate = () => {
    return indices?.usdKrw?.price ? parseFloat(indices.usdKrw.price.replace(/,/g, '')) : 1370;
  };

  const handleKrwChange = (val) => {
    setKrwInput(val);
    const rate = getActiveRate();
    if (val) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        setUsdInput((parsed / rate).toFixed(2));
      } else {
        setUsdInput('');
      }
    } else {
      setUsdInput('');
    }
  };

  const handleUsdChange = (val) => {
    setUsdInput(val);
    const rate = getActiveRate();
    if (val) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        setKrwInput(Math.round(parsed * rate).toString());
      } else {
        setKrwInput('');
      }
    } else {
      setKrwInput('');
    }
  };

  // Dynamically update USD conversion value once when live exchange rate indices are fetched/updated
  useEffect(() => {
    if (indices) {
      const rate = getActiveRate();
      if (krwInput) {
        const parsed = parseFloat(krwInput);
        if (!isNaN(parsed)) {
          setUsdInput((parsed / rate).toFixed(2));
        }
      }
    }
  }, [indices]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
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

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail || !authPassword || !authName) {
      setAuthError('모든 빈칸을 채워줘!');
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('moneylog_users') || '[]');
      if (users.some(u => u.email === authEmail)) {
        setAuthError('이미 가입된 이메일 주소야!');
        return;
      }

      users.push({ email: authEmail, password: authPassword, name: authName });
      localStorage.setItem('moneylog_users', JSON.stringify(users));

      setAuthSuccess('회원가입이 완료되었어! 로그인 해줘! 🎉');
      setTimeout(() => {
        setActiveView('login');
        setAuthError('');
        setAuthSuccess('');
      }, 1500);
    } catch (err) {
      setAuthError('회원가입 처리 중 오류 발생.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail || !authPassword) {
      setAuthError('이메일과 비밀번호를 입력해줘!');
      return;
    }

    if (authEmail.toLowerCase() === 'tjdrhkd2123') {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: authPassword })
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          sessionStorage.setItem('admin_token', data.token);
          sessionStorage.setItem('current_user', '로기 연구소장 (Admin)');
          setCurrentUser('로기 연구소장 (Admin)');
          setIsAdmin(true);
          setAuthSuccess('어드민 계정 로그인 성공! 🔐');
          setTimeout(() => {
            setActiveView('home');
            setAuthSuccess('');
          }, 1000);
          return;
        }
      } catch (err) {
        console.log("Admin API check skipped or offline.");
      } finally {
        setLoading(false);
      }
    }

    const users = JSON.parse(localStorage.getItem('moneylog_users') || '[]');
    const matchedUser = users.find(u => u.email === authEmail && u.password === authPassword);

    if (matchedUser) {
      sessionStorage.setItem('current_user', matchedUser.name);
      setCurrentUser(matchedUser.name);
      setAuthSuccess(`${matchedUser.name}님, 머니로그랩에 오신 걸 환영해! 🐿️`);
      setTimeout(() => {
        setActiveView('home');
        setAuthSuccess('');
      }, 1200);
    } else {
      setAuthError('이메일 주소 또는 비밀번호가 틀렸어!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('admin_token');
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveView('home');
    setIsEntered(false);
    setActiveOverlay(null);
  };

  const getSavingsResult = () => {
    const p = parseFloat(monthlySavings) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = (parseInt(savingsPeriod) || 0) * 12;
    if (p <= 0 || n <= 0) return { principal: 0, total: 0, interest: 0, acorns: 0 };

    let total = 0;
    for (let i = 1; i <= n; i++) {
      total = (total + p) * (1 + r);
    }
    const principal = p * n;
    return {
      principal: Math.round(principal),
      total: Math.round(total),
      interest: Math.round(total - principal),
      acorns: Math.round(total / 10000)
    };
  };

  const getRogiCommentary = () => {
    if (!indices) return '';
    const usd = Number(indices.usdKrw.price.replace(/,/g, ''));
    const kospiChange = Number(indices.kospi.changePercent);

    if (usd >= 1400) {
      return `🐿️ 로기 분석: 원·달러 환율이 도토리 무게보다 무겁게 ${indices.usdKrw.price}원대를 넘보고 있어! 수입 물가 압박이 크니, 미 2년물 국채나 분산 자산 비중을 꼭 체크해봐!`;
    } else if (kospiChange < 0) {
      return "🐿️ 로기 분석: 코스피 지수가 다소 밀리고 있어. 외국인들이 포지션을 헤징하는 소나기 구간이니, 뇌동매매 하지 말고 차분히 실적 위주 대형주 반등을 기다리자!";
    } else {
      return "🐿️ 로기 분석: 순환매가 활발하게 돌고 있는 시장이야! 이럴 때일수록 로기가 아침마다 모아주는 핵심 지표들을 눈여겨보라구!";
    }
  };

  const savingsRes = getSavingsResult();
  const filteredNews = news.filter(item => item.category === newsTab);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      
      {/* 1. Immersive 3D Space (100vh) */}
      {activeView === 'home' && (
        <section className="hero-splash-screen" style={{ 
          position: 'relative',
          width: '100%',
          height: '100vh',
          background: 'radial-gradient(circle at center, #1e1711 0%, #08090b 100%)',
          overflow: 'hidden'
        }}>
          {/* Fullscreen 3D Canvas */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 1 
          }}>
            <ThreeDHero 
              onItemClick={(id) => setActiveOverlay(id)} 
              onNearNPCChange={(npc) => setNearNPC(npc)}
              isEntered={isEntered} 
            />
          </div>

          {/* Absolute Navigation Header overlayed on Home - Only show when NOT entered */}
          {!isEntered && (
            <header className="app-header" style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0,
              width: '100%',
              zIndex: 100, 
              background: 'linear-gradient(to bottom, rgba(10, 11, 13, 0.72) 0%, transparent 100%)',
              padding: '20px 40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 'none'
            }}>
              <div className="app-header-logo" onClick={() => { setIsEntered(false); setActiveOverlay(null); }} style={{ cursor: 'pointer' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--bg-tertiary) 100%)', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.15)' }}>🐿️</div>
                <div>
                  <h1 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '-0.03em' }}>머니로그랩 <span style={{ color: 'var(--color-accent-blue)', fontWeight: '400' }}>Lab</span></h1>
                  <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em' }}>로기의 금융 도토리</p>
                </div>
              </div>

              <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <button onClick={() => { setIsEntered(true); setActiveOverlay('dashboard'); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-headers)', cursor: 'pointer', paddingBottom: '2px' }}>금융 대시보드</button>
                <button onClick={() => { setIsEntered(true); setActiveOverlay('news'); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-headers)', cursor: 'pointer', paddingBottom: '2px' }}>실시간 뉴스 📰</button>
                <button onClick={() => { setIsEntered(true); setActiveOverlay('calculators'); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-headers)', cursor: 'pointer', paddingBottom: '2px' }}>금융 계산기 💱</button>
                <button onClick={() => { setIsEntered(true); setActiveOverlay('benefits'); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-headers)', cursor: 'pointer', paddingBottom: '2px' }}>파트너 혜택 🪙</button>
                <button onClick={() => { setIsEntered(true); setActiveOverlay('subscribe'); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-headers)', cursor: 'pointer', paddingBottom: '2px' }}>도토리 구독 🌰</button>

                {isAdmin && (
                  <button onClick={onNavigateToAdmin} style={{ background: 'none', border: 'none', color: 'var(--color-accent-orange)', fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-headers)', cursor: 'pointer', paddingBottom: '2px' }}>🔐 시크릿 룸</button>
                )}

                {currentUser ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{currentUser}님 🐿️</span>
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LogOut size={13} /> 로그아웃</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                    <button onClick={() => { setActiveView('login'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LogIn size={13} /> 로그인</button>
                    <button onClick={() => { setActiveView('register'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><UserPlus size={13} /> 회원가입</button>
                  </div>
                )}
              </nav>
            </header>
          )}

          {/* Floating Title Overlay */}
          {!isEntered && (
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 10,
              pointerEvents: 'none',
              width: '90%',
              maxWidth: '600px'
            }}>
              <h1 style={{
                fontSize: 'clamp(44px, 7vw, 68px)',
                fontWeight: '900',
                fontFamily: 'var(--font-headers)',
                letterSpacing: '-0.04em',
                background: 'linear-gradient(to bottom, #ffffff 40%, var(--color-accent-blue) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '6px',
                textShadow: '0 4px 24px rgba(0,0,0,0.85)'
              }}>로기 경제연구소</h1>
            </div>
          )}

          {/* Opaque Acorn state: "연구소 들어가기" Button */}
          {!isEntered ? (
            <div style={{
              position: 'absolute',
              bottom: '18%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              textAlign: 'center',
              animation: 'fadeIn 0.8s ease-out'
            }}>
              <button 
                onClick={() => setIsEntered(true)}
                className="btn-primary tooltip-bounce"
                style={{
                  padding: '16px 44px',
                  fontSize: '18px',
                  fontWeight: '800',
                  boxShadow: '0 10px 30px rgba(197, 168, 128, 0.35)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, #a38d6b 100%)',
                  borderRadius: '30px'
                }}
              >
                연구소 들어가기 🐿️🚪
              </button>
            </div>
          ) : (
            <>
              {/* Entered state: Controls guide and exit button */}
              <button 
                onClick={() => { setIsEntered(false); setActiveOverlay(null); }}
                style={{
                  position: 'absolute',
                  top: '25px',
                  right: '25px',
                  zIndex: 20,
                  background: 'rgba(10, 11, 13, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontWeight: '700',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(10, 11, 13, 0.7)'}
              >
                도토리 밖으로 나가기 🚪
              </button>

              {/* Joystick Keyboard Guide */}
              <div 
                className="tooltip-bounce"
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  background: 'linear-gradient(135deg, rgba(197, 168, 128, 0.9) 0%, rgba(10, 11, 13, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(197, 168, 128, 0.3)',
                  pointerEvents: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                🎮 방향키(↑,↓,←,→ 또는 W,A,S,D)로 로기를 3D 맵 안에서 자유롭게 조종해봐! 🐿️
              </div>

              {/* Game Item Labels */}
              <div 
                className="tooltip-bounce"
                style={{
                  position: 'absolute',
                  top: '32%',
                  left: '12%',
                  zIndex: 10,
                  background: 'rgba(0, 255, 136, 0.12)',
                  color: '#00ff88',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '800',
                  boxShadow: '0 4px 15px rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                🟢 지구본: 금융 대시보드
              </div>

              <div 
                className="tooltip-bounce"
                style={{
                  position: 'absolute',
                  top: '28%',
                  right: '15%',
                  zIndex: 10,
                  background: 'rgba(0, 255, 255, 0.12)',
                  color: '#00ffff',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '800',
                  boxShadow: '0 4px 15px rgba(0, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                🌐 홀로그램: 실시간 뉴스
              </div>

              {/* NPC Proximity Tooltip */}
              {nearNPC && !activeNPC && (
                <div style={{
                  position: 'absolute',
                  bottom: '95px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 100,
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid var(--color-accent-blue)',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.35)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <span>💬 <strong>{nearNPC.name}</strong> ({nearNPC.role})</span>
                  <button 
                    onClick={() => setActiveNPC(nearNPC)}
                    style={{
                      background: 'var(--color-accent-blue)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    대화하기 [Space]
                  </button>
                </div>
              )}

              {/* Animal Crossing Style Dialogue Box */}
              {activeNPC && (
                <div style={{
                  position: 'absolute',
                  bottom: '40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%',
                  maxWidth: '540px',
                  height: '150px',
                  zIndex: 500,
                  background: 'rgba(255, 253, 240, 0.95)',
                  border: '4px solid #8c6d53',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                  borderRadius: '24px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: '#4a2f13',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {/* Name Plate */}
                  <div style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '24px',
                    background: '#e69855',
                    border: '3px solid #8c6d53',
                    borderRadius: '12px',
                    padding: '2px 14px',
                    fontWeight: '900',
                    fontSize: '13px',
                    color: '#ffffff',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  }}>
                    {activeNPC.name}
                  </div>

                  {/* Message Content */}
                  <div style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.6', marginTop: '8px', textAlign: 'left' }}>
                    {typedText}
                  </div>

                  {/* Interaction Buttons (Choices) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                    <button 
                      onClick={() => handleNPCChoice('action')}
                      style={{
                        background: '#8c6d53',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '12px',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.1s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {activeNPC.id === 'npc_news' && '📰 뉴스 확인하기'}
                      {activeNPC.id === 'npc_calc' && '💱 금융 계산기'}
                      {activeNPC.id === 'npc_benefit' && '🪙 혜택 가이드'}
                      {activeNPC.id === 'npc_dashboard' && '📊 대시보드 보기'}
                    </button>
                    <button 
                      onClick={() => handleNPCChoice('close')}
                      style={{
                        background: 'rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.12)',
                        color: '#4a2f13',
                        fontWeight: '800',
                        fontSize: '12px',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                    >
                      그냥 둘러보기 🐿️
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* 2. Standard Views (Login / Register Page) */}
      {activeView !== 'home' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
          {/* Main Navigation Header for Sub-pages */}
          <header className="app-header" style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 100, 
            background: 'rgba(10, 11, 13, 0.85)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--color-card-border)', 
            padding: '16px 0', 
            marginBottom: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div className="app-header-logo" onClick={() => { setActiveView('home'); setIsEntered(false); }} style={{ cursor: 'pointer' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--bg-tertiary) 100%)', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🐿️</div>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '-0.03em' }}>머니로그랩 <span style={{ color: 'var(--color-accent-blue)', fontWeight: '400' }}>Lab</span></h1>
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>로기의 금융 도토리</p>
              </div>
            </div>

            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button onClick={() => { setActiveView('home'); setIsEntered(true); setActiveOverlay('dashboard'); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>금융 대시보드</button>
              <button onClick={() => { setActiveView('home'); setIsEntered(true); setActiveOverlay('news'); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>실시간 뉴스 📰</button>
              <button onClick={() => { setActiveView('home'); setIsEntered(true); setActiveOverlay('calculators'); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>금융 계산기 💱</button>

              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px', borderLeft: '1px solid var(--color-card-border)', paddingLeft: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{currentUser}님 🐿️</span>
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '13px', cursor: 'pointer' }}>로그아웃</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginLeft: '12px', borderLeft: '1px solid var(--color-card-border)', paddingLeft: '16px' }}>
                  <button onClick={() => setActiveView('login')} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>로그인</button>
                  <button onClick={() => setActiveView('register')} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>회원가입</button>
                </div>
              )}
            </nav>
          </header>

          <main>
            {activeView === 'login' && (
              <section style={{ maxWidth: '400px', margin: '60px auto', padding: '0 20px' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '36px' }}>
                  <div style={{ background: 'rgba(45, 130, 255, 0.08)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: 'var(--color-accent-blue)' }}><Lock size={28} /></div>
                  <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', marginBottom: '8px' }}>로그인</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>머니로그랩 금융 멤버십에 입장해줘!</p>
                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)', borderRadius: '30px', padding: '10px 16px' }}><Mail size={16} style={{ color: 'var(--color-text-muted)' }} /><input type="text" placeholder="이메일 주소 입력" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px', flex: '1', fontFamily: 'var(--font-body)' }} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)', borderRadius: '30px', padding: '10px 16px' }}><KeyRound size={16} style={{ color: 'var(--color-text-muted)' }} /><input type="password" placeholder="비밀번호 입력" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px', flex: '1', fontFamily: 'var(--font-body)' }} /></div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>{loading ? '로그인 중...' : '시작하기 🐿️'}</button>
                  </form>
                  {authError && <div style={{ marginTop: '16px', color: 'var(--color-accent-orange)', fontSize: '13px' }}>⚠️ {authError}</div>}
                  {authSuccess && <div style={{ marginTop: '16px', color: 'var(--color-accent-blue)', fontSize: '13px', fontWeight: '700' }}>{authSuccess}</div>}
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '24px' }}>계정이 없으신가요? <span onClick={() => { setActiveView('register'); setAuthError(''); setAuthSuccess(''); }} style={{ color: 'var(--color-accent-blue)', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}>회원가입 하기</span></p>
                </div>
              </section>
            )}

            {activeView === 'register' && (
              <section style={{ maxWidth: '400px', margin: '60px auto', padding: '0 20px' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '36px' }}>
                  <div style={{ background: 'rgba(118, 165, 131, 0.08)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: 'var(--color-accent-emerald)' }}><UserPlus size={28} /></div>
                  <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', marginBottom: '8px' }}>회원가입</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>머니로그랩 패밀리 멤버가 되어 도토리를 키워보세요!</p>
                  <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)', borderRadius: '30px', padding: '10px 16px' }}><Mail size={16} style={{ color: 'var(--color-text-muted)' }} /><input type="email" placeholder="이메일 주소 입력" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px', flex: '1', fontFamily: 'var(--font-body)' }} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)', borderRadius: '30px', padding: '10px 16px' }}><KeyRound size={16} style={{ color: 'var(--color-text-muted)' }} /><input type="password" placeholder="비밀번호 입력 (6자리 이상)" required minLength={6} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px', flex: '1', fontFamily: 'var(--font-body)' }} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)', borderRadius: '30px', padding: '10px 16px' }}><KeyRound size={16} style={{ color: 'var(--color-text-muted)' }} /><input type="text" placeholder="닉네임/이름 입력" required value={authName} onChange={(e) => setAuthName(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px', flex: '1', fontFamily: 'var(--font-body)' }} /></div>
                    <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px', background: 'linear-gradient(135deg, var(--color-accent-emerald) 0%, #5d8f6b 100%)', boxShadow: '0 4px 14px rgba(118, 165, 131, 0.15)' }}>패밀리 등록하기 🌰</button>
                  </form>
                  {authError && <div style={{ marginTop: '16px', color: 'var(--color-accent-orange)', fontSize: '13px' }}>⚠️ {authError}</div>}
                  {authSuccess && <div style={{ marginTop: '16px', color: 'var(--color-accent-emerald)', fontSize: '13px', fontWeight: '700' }}>{authSuccess}</div>}
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '24px' }}>이미 계정이 있으신가요? <span onClick={() => { setActiveView('login'); setAuthError(''); setAuthSuccess(''); }} style={{ color: 'var(--color-accent-blue)', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}>로그인 하기</span></p>
                </div>
              </section>
            )}
          </main>

          <footer style={{ textAlign: 'center', marginTop: '80px', padding: '30px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            <p>© 2026 머니로그랩 (Money Log Lab). All Rights Reserved.</p>
            <p style={{ marginTop: '5px' }}>다람쥐 연구원 로기가 물어오는 똑똑한 금융 도토리 🐿️🌰</p>
          </footer>
        </div>
      )}

      {/* 3. In-Viewport Interactive Overlays (Floating panels centered over Three.js scene) */}
      {activeOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          background: 'rgba(10, 11, 13, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            padding: '40px 30px',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            border: '1px solid var(--color-card-border-glow)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            borderRadius: '28px',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            {/* Close/Return Button */}
            <button 
              onClick={() => setActiveOverlay(null)} 
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                fontWeight: '800',
                padding: '8px 18px',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 10,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              돌아가기 🚪
            </button>

            {activeOverlay === 'dashboard' && (
              <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '24px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800' }}>📊 실시간 금융 대시보드</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>코스피 지수와 글로벌 환율 지표 현황판이야! 🐿️</p>
                </div>
                
                {indices && (
                  <div className="glass-card" style={{ background: 'rgba(197, 168, 128, 0.03)', borderColor: 'rgba(197, 168, 128, 0.12)', padding: '16px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', margin: '0 auto 24px auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-headers)', fontSize: '13px', fontWeight: '700', color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> 로기의 실시간 금융 브리핑
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>수집 기준 시각: {indices.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6', fontWeight: '500', margin: 0, textAlign: 'left' }}>{getRogiCommentary()}</p>
                  </div>
                )}
                
                <DashboardHome onNewsLoaded={setNews} onIndicesLoaded={setIndices} />
              </section>
            )}

            {activeOverlay === 'news' && (
              <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '24px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800' }}>📰 로기의 실시간 핫이슈 뉴스 클립</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>분야별 구글 뉴스 RSS 실시간 요약 헤드라인! 🐿️</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FileText size={16} style={{ color: 'var(--color-accent-blue)' }} /> 뉴스 카테고리 분류</span>
                  <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '10px' }}>
                    {['economy', 'realestate', 'coin'].map(tab => (
                      <button key={tab} onClick={() => setNewsTab(tab)} style={{ background: newsTab === tab ? 'var(--color-card-bg)' : 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '8px', color: newsTab === tab ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', transition: 'all 0.2s' }}>{tab === 'economy' ? '거시 경제' : tab === 'realestate' ? '부동산' : '가상 자산'}</button>
                    ))}
                  </div>
                </div>

                {news.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredNews.map((item, idx) => (
                      <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--color-card-border)', background: 'var(--bg-secondary)', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-blue)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-card-border)'}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', paddingRight: '16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{item.source} • {new Date(item.pubDate).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-accent-blue)' }} />
                    <p style={{ fontSize: '14px' }}>금융 데이터를 로딩하고 있습니다 🐿️</p>
                  </div>
                )}
              </section>
            )}

            {activeOverlay === 'calculators' && (
              <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '24px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800' }}>💱 로기의 스마트 금융 계산기</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>실시간 환율 변환과 미래 도토리 적금 시뮬레이션! 🐿️</p>
                </div>

                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-card-border)', paddingBottom: '14px', marginBottom: '24px' }}>
                  <button onClick={() => setCalcTab('exchange')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '800', color: calcTab === 'exchange' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', borderBottom: calcTab === 'exchange' ? '3px solid var(--color-accent-blue)' : '3px solid transparent', paddingBottom: '8px', transition: 'all 0.2s' }}>💱 실시간 환율 계산기</button>
                  <button onClick={() => setCalcTab('savings')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '800', color: calcTab === 'savings' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', borderBottom: calcTab === 'savings' ? '3px solid var(--color-accent-blue)' : '3px solid transparent', paddingBottom: '8px', transition: 'all 0.2s' }}>🌰 복리 도토리 저금통</button>
                </div>

                {calcTab === 'exchange' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>원화 입력 (KRW)</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '10px 16px', background: 'var(--bg-tertiary)' }}>
                          <input type="number" value={krwInput} onChange={(e) => handleKrwChange(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '16px', color: 'var(--color-text-primary)', fontWeight: '700' }} />
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>원</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '24px', color: 'var(--color-text-muted)', paddingTop: '22px' }}>⇄</div>
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>달러 변환 (USD)</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '10px 16px', background: 'var(--bg-tertiary)' }}>
                          <input type="number" value={usdInput} onChange={(e) => handleUsdChange(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '16px', color: 'var(--color-text-primary)', fontWeight: '700' }} />
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>달러</span>
                        </div>
                      </div>
                    </div>
                    {indices?.usdKrw?.price && (
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                        현재 수집 환율 지표: 1 USD = **{indices.usdKrw.price} KRW** 🐿️
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>월 저축액 (KRW)</label>
                        <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '10px 16px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>연 이자율 (%)</label>
                        <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '10px 16px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>적립 기간 (년)</label>
                        <input type="number" value={savingsPeriod} onChange={(e) => setSavingsPeriod(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '10px 16px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700', outline: 'none' }} />
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-card-border)', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>총 납입 원금:</span>
                        <span style={{ fontWeight: '700' }}>{(Number(monthlySavings) * Number(savingsPeriod) * 12).toLocaleString()} 원</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>예상 세후 복리 이자:</span>
                        <span style={{ fontWeight: '700', color: 'var(--color-accent-emerald)' }}>+ {savingsRes.interest.toLocaleString()} 원</span>
                      </div>
                      <div style={{ borderTop: '1px dashed var(--color-card-border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>최종 수령액 (월복리):</span>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-accent-blue)' }}>{savingsRes.total.toLocaleString()} 원</span>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                        🐿️ 저금통 도토리 환산: **{savingsRes.acorns.toLocaleString()}개 🌰**
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeOverlay === 'subscribe' && (
              <section style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-accent-blue)', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', background: 'rgba(197, 168, 128, 0.08)', padding: '6px 16px', borderRadius: '30px', border: '1px solid rgba(197, 168, 128, 0.15)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}><Mail size={14} />로기의 스마트 이메일 뉴스레터</div>
                <h2 style={{ fontSize: '24px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800', marginBottom: '14px' }}>매일 아침 7시, 금융 도토리를 메일함에 쏙! 🐿️📬</h2>
                <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', marginBottom: '28px', lineHeight: '1.6' }}>어려운 경제 뉴스 읽기 끝! 구독 버튼 하나로<br/>세상 편한 이메일 요약본을 매일 공짜로 챙겨줄게!</p>
                <form onSubmit={handleSubscribe} className="newsletter-form" style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '40px', padding: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ paddingLeft: '16px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><Mail size={18} /></div>
                  <input type="email" placeholder="이메일 주소를 입력해줘!" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '15px', flex: '1', height: '40px', fontFamily: 'var(--font-body)' }} />
                  <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0 24px', height: '42px', borderRadius: '21px', fontSize: '13.5px' }}>경제 도토리 구독하기 🐿️</button>
                </form>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '16px' }}><ShieldCheck size={12} style={{ color: 'var(--color-accent-blue)' }} />철벽 보안 데이터 보호 적용 및 실시간 암호화 적용</div>
                
                {status.message && (<div className="glass-card" style={{ marginTop: '20px', padding: '12px 18px', borderRadius: '12px', borderLeft: status.type === 'success' ? '4px solid var(--color-accent-blue)' : '4px solid var(--color-accent-orange)', background: 'var(--bg-secondary)', fontSize: '14px', fontWeight: '600', color: status.type === 'success' ? 'var(--color-accent-blue)' : 'var(--color-accent-orange)' }}>{status.message}</div>)}
              </section>
            )}

            {activeOverlay === 'benefits' && (
              <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '24px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800' }}>🪙 머니로그랩 파트너 혜택</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>로기가 제공하는 특별 혜택 리워드와 깊이 있는 분석 컬럼 모음! 🐿️</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <a href="https://litt.ly/moneyloglab123" target="_blank" rel="noopener noreferrer" className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', textDecoration: 'none', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(245, 158, 11, 0.05) 100%)', borderLeft: '5px solid var(--color-accent-orange)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-accent-orange)', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>🔥 단독 특별 혜택</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>🪙 거래소 꿀혜택 바로가기</h4>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>수수료 평생 할인 & 파트너 가입 특별 리워드 증정!</p>
                    </div>
                    <div style={{ background: 'rgba(217, 119, 6, 0.08)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-orange)' }}><ArrowRight size={16} /></div>
                  </a>

                  <a href="https://blog.naver.com/moneyloglab123" target="_blank" rel="noopener noreferrer" className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', textDecoration: 'none', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.05) 100%)', borderLeft: '5px solid var(--color-accent-emerald)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-accent-emerald)', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>💚 네이버 공식 블로그</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>💚 네이버 공식 블로그 시황 글 읽기</h4>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>로기가 작성해 둔 핵심 거시 분석 및 시황 칼럼 모음!</p>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-emerald)' }}><ArrowRight size={16} /></div>
                  </a>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
