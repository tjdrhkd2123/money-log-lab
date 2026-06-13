import React, { useState, useEffect } from 'react';
import DashboardHome from '../components/DashboardHome.jsx';
import CardNews from '../components/CardNews.jsx';
import { Mail, Shield, ShieldCheck, Bell, Award, Coins, RefreshCw, ArrowRight, Lock, KeyRound, UserPlus, LogIn, LogOut, ChevronRight, FileText, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config.js';

export default function LandingPage({ onNavigateToAdmin }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [backendWaking, setBackendWaking] = useState(true);
  const [activeView, setActiveView] = useState('home'); // 'home', 'subscribe', 'login', 'register'

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
    return indices?.usdKrw?.price ? parseFloat(indices.usdKrw.price.replace(/,/g, '')) : 1520;
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      <header className="app-header" style={{ borderBottom: '1px solid var(--color-card-border)', paddingBottom: '20px', marginBottom: '40px' }}>
        <div className="app-header-logo" onClick={() => setActiveView('home')} style={{ cursor: 'pointer' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--bg-tertiary) 100%)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.15)' }}>🐿️</div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '-0.03em' }}>머니로그랩 <span style={{ color: 'var(--color-accent-blue)', fontWeight: '400' }}>Lab</span></h1>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em' }}>ROGI'S FINANCIAL ACORNS</p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveView('home')} style={{ background: 'none', border: 'none', color: activeView === 'home' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', fontWeight: '800', fontSize: '13px', fontFamily: 'var(--font-headers)', letterSpacing: '0.08em', cursor: 'pointer', borderBottom: activeView === 'home' ? '2px solid var(--color-accent-blue)' : '2px solid transparent', paddingBottom: '6px', transition: 'all 0.2s' }}>DASHBOARD</button>
          <button onClick={() => setActiveView('news-clip')} style={{ background: 'none', border: 'none', color: activeView === 'news-clip' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', fontWeight: '800', fontSize: '13px', fontFamily: 'var(--font-headers)', letterSpacing: '0.08em', cursor: 'pointer', borderBottom: activeView === 'news-clip' ? '2px solid var(--color-accent-blue)' : '2px solid transparent', paddingBottom: '6px', transition: 'all 0.2s' }}>NEWS CLIPS</button>
          <button onClick={() => setActiveView('calculators')} style={{ background: 'none', border: 'none', color: activeView === 'calculators' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', fontWeight: '800', fontSize: '13px', fontFamily: 'var(--font-headers)', letterSpacing: '0.08em', cursor: 'pointer', borderBottom: activeView === 'calculators' ? '2px solid var(--color-accent-blue)' : '2px solid transparent', paddingBottom: '6px', transition: 'all 0.2s' }}>CALCULATORS</button>
          <button onClick={() => setActiveView('benefits')} style={{ background: 'none', border: 'none', color: activeView === 'benefits' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', fontWeight: '800', fontSize: '13px', fontFamily: 'var(--font-headers)', letterSpacing: '0.08em', cursor: 'pointer', borderBottom: activeView === 'benefits' ? '2px solid var(--color-accent-blue)' : '2px solid transparent', paddingBottom: '6px', transition: 'all 0.2s' }}>BENEFITS</button>
          <button onClick={() => setActiveView('subscribe')} style={{ background: 'none', border: 'none', color: activeView === 'subscribe' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', fontWeight: '800', fontSize: '13px', fontFamily: 'var(--font-headers)', letterSpacing: '0.08em', cursor: 'pointer', borderBottom: activeView === 'subscribe' ? '2px solid var(--color-accent-blue)' : '2px solid transparent', paddingBottom: '6px', transition: 'all 0.2s' }}>SUBSCRIBE</button>

          {isAdmin && (
            <button onClick={onNavigateToAdmin} style={{ background: 'none', border: 'none', color: 'var(--color-accent-orange)', fontWeight: '800', fontSize: '13px', fontFamily: 'var(--font-headers)', letterSpacing: '0.08em', cursor: 'pointer', paddingBottom: '6px', borderBottom: '2px solid transparent' }}>SECRET ROOM</button>
          )}

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '12px', borderLeft: '1px solid var(--color-card-border)', paddingLeft: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em' }}>{currentUser.toUpperCase()}</span>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LogOut size={12} /> LOGOUT</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginLeft: '12px', borderLeft: '1px solid var(--color-card-border)', paddingLeft: '20px' }}>
              <button onClick={() => { setActiveView('login'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '800', fontSize: '11px', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LogIn size={12} /> LOGIN</button>
              <button onClick={() => { setActiveView('register'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '800', fontSize: '11px', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><UserPlus size={12} /> REGISTER</button>
            </div>
          )}
        </nav>
      </header>

      {activeView === 'home' && (
        <>
          <section style={{ maxWidth: '800px', margin: '0 auto 40px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-accent-blue)', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', background: 'rgba(197, 168, 128, 0.08)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(197, 168, 128, 0.15)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}><Award size={13} />DAILY MORNING NEWSLETTER DELIVERED AT 07:00 AM</div>
            <h1 className="hero-title" style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', lineHeight: '1.35', background: 'linear-gradient(to right, var(--color-text-primary) 60%, var(--color-accent-blue) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px', fontWeight: '800' }}>경제 뉴스가 어렵니?<br/>다람쥐 연구원 로기가 쉽고 빠르게 정리해줄게!</h1>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '28px', fontWeight: '400', maxWidth: '800px' }}>어려운 금융 용어와 복잡한 지표들을 중학생도 바로 이해할 수 있게 요약해 줄게. 매일 3분만 가볍게 읽어봐! 🐿️🌰</p>
            <button onClick={() => setActiveView('subscribe')} className="btn-primary" style={{ padding: '14px 28px', fontSize: '15px', marginBottom: '30px' }}>매일 아침 메일로 도토리 받기 <ArrowRight size={16} /></button>
          </section>

          <div className="glass-card" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', padding: '24px 30px', borderRadius: '24px', borderLeft: '4px solid var(--color-accent-blue)', textAlign: 'center', boxShadow: 'var(--shadow-card)', maxWidth: '800px', margin: '0 auto 60px auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '32px' }}>🐿️📈</span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>로기 금융 연구소 가동 중!</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>로기 비서가 국내 실시간 코스피 마켓과 글로벌 거시 경제 흐름을 쉼 없이 모니터링하고 분석하고 있어.</p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-accent-emerald)', background: 'rgba(118, 165, 131, 0.08)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent-emerald)' }} />LIVE FEED ACTIVE</span>
            </div>
          </div>

          {/* 📅 로기의 실시간 금융 브리핑 */}
          {indices && (
            <div className="glass-card" style={{ background: 'rgba(197, 168, 128, 0.03)', borderColor: 'rgba(197, 168, 128, 0.12)', padding: '16px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '800px', margin: '-40px auto 60px auto', animation: 'fadeIn 0.3s ease-in-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-headers)', fontSize: '13px', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> LOGI'S FINANCIAL BRIEFING
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>수집 기준 시각: {indices.timestamp}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6', fontWeight: '500', margin: 0, textAlign: 'left' }}>{getRogiCommentary()}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginTop: '20px' }}>
            <section style={{ width: '100%' }}>
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800' }}>📊 실시간 금융 대시보드</h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>수집된 원화 대비 가치 및 주요 코스피 지수를 한눈에 파악해봐!</p>
              </div>
              <DashboardHome onNewsLoaded={setNews} onIndicesLoaded={setIndices} />
            </section>
            <section style={{ width: '100%' }}>
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800' }}>📰 로기의 오늘의 경제 도토리</h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>좌우로 가볍게 넘겨보며 오늘의 경제 핵심 꿀팁을 스캔해봐!</p>
              </div>
              <CardNews />
            </section>
          </div>
        </>
      )}

      {activeView === 'news-clip' && (
        <section style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '26px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>📰 로기의 실시간 핫이슈 뉴스 클립</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>구글 뉴스 RSS에서 24시간 이내의 실시간 뉴스 헤드라인을 분야별로 수집해왔어! 🐿️</p>
          </div>
          
          <div className="glass-card" style={{ padding: '30px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', boxShadow: 'var(--shadow-card)', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FileText size={16} style={{ color: 'var(--color-accent-blue)' }} /> EDITORIAL CATEGORIES</span>
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '10px' }}>
                {['economy', 'realestate', 'coin'].map(tab => (
                  <button key={tab} onClick={() => setNewsTab(tab)} style={{ background: newsTab === tab ? 'var(--color-card-bg)' : 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '8px', color: newsTab === tab ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', transition: 'all 0.2s' }}>{tab === 'economy' ? 'MACRO' : tab === 'realestate' ? 'REAL ESTATE' : 'CRYPTO'}</button>
                ))}
              </div>
            </div>

            {news.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredNews.map((item, idx) => (
                  <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--color-card-border)', background: 'var(--bg-secondary)', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-blue)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-card-border)'}>
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
                <p style={{ fontSize: '14px' }}>금융 대시보드 지표 갱신을 통해 뉴스를 실시간 로딩하고 있습니다 🐿️</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeView === 'calculators' && (
        <section style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '26px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>💱 로기의 스마트 금융 계산기</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>실시간 환율 계산과 미래 도토리 자산을 불려보는 복리 적금 시뮬레이터야! 🐿️</p>
          </div>

          <div className="glass-card" style={{ padding: '30px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', boxShadow: 'var(--shadow-card)', borderRadius: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-card-border)', paddingBottom: '14px', marginBottom: '24px' }}>
              <button onClick={() => setCalcTab('exchange')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '800', color: calcTab === 'exchange' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', borderBottom: calcTab === 'exchange' ? '3px solid var(--color-accent-blue)' : '3px solid transparent', paddingBottom: '8px', transition: 'all 0.2s' }}>💱 간편 실시간 환율 계산기</button>
              <button onClick={() => setCalcTab('savings')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '800', color: calcTab === 'savings' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', borderBottom: calcTab === 'savings' ? '3px solid var(--color-accent-blue)' : '3px solid transparent', paddingBottom: '8px', transition: 'all 0.2s' }}>🌰 복리 도토리 저금통 (적금 계산기)</button>
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
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, textAlign: 'left' }}>
                  {indices?.usdKrw?.price ? (
                    `* 현재 1달러 기준 실시간 환율은 ${indices.usdKrw.price}원입니다. (실시간 정보 반영 🐿️)`
                  ) : (
                    `* 1달러 기준 환율 1,520원으로 실시간 단순 계산식 기준이 적용되었습니다. 실제 환율과 미세한 오차가 있을 수 있습니다.`
                  )}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>월 납입액 (원)</label>
                    <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>연 이자율 (%)</label>
                    <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>적립 기간</label>
                    <select value={savingsPeriod} onChange={(e) => setSavingsPeriod(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700' }}>
                      <option value="1">1년 (12개월)</option>
                      <option value="2">2년 (24개월)</option>
                      <option value="3">3년 (36개월)</option>
                      <option value="5">5년 (60개월)</option>
                      <option value="10">10년 (120개월)</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-card-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>총 납입 원금:</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{savingsRes.principal.toLocaleString()} 원</span>
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
          </div>
        </section>
      )}

      {activeView === 'benefits' && (
        <section style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '26px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>🪙 머니로그랩 파트너 혜택 & 분석</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>로기가 제공하는 특별 혜택 리워드와 깊이 있는 분석 컬럼을 모아봤어! 🐿️</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '50px' }}>
            <a href="https://litt.ly/moneyloglab123" target="_blank" rel="noopener noreferrer" className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px', textDecoration: 'none', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(245, 158, 11, 0.05) 100%)', borderLeft: '5px solid var(--color-accent-orange)', transition: 'all 0.3s ease', boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-accent-orange)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>🔥 EXCLUSIVE BENEFIT</span>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)' }}>🪙 거래소 혜택 바로가기</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>로기가 챙겨주는 글로벌 선물 거래 수수료 평생 할인 & 리워드 단독 꿀혜택!</p>
              </div>
              <div style={{ background: 'rgba(217, 119, 6, 0.08)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-orange)', flexShrink: 0, marginLeft: '16px' }}><ArrowRight size={18} /></div>
            </a>
            <a href="https://blog.naver.com/moneyloglab123" target="_blank" rel="noopener noreferrer" className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px', textDecoration: 'none', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.05) 100%)', borderLeft: '5px solid var(--color-accent-emerald)', transition: 'all 0.3s ease', boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}> Green NAVER BLOG</span>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)' }}>💚 네이버 블로그로 뉴스 자세히 보기</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>5대 분야 AI 매칭 포스팅 원고와 깊이 있는 시황 상세 분석글을 읽어봐!</p>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-emerald)', flexShrink: 0, marginLeft: '16px' }}><ArrowRight size={18} /></div>
            </a>
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
            <div className="glass-card" style={{ background: 'var(--bg-secondary)', padding: '24px' }}>
              <div style={{ color: 'var(--color-accent-blue)', marginBottom: '12px' }}><Coins size={28} /></div>
              <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>글로벌 포트폴리오 다각화</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>원화 자산의 감쇠 위기 속에서, 해외 선물 마켓 및 알트코인 지표를 적절히 병행하여 헷지 수단을 설계할 수 있도록 명료하게 분석합니다.</p>
            </div>
            <div className="glass-card" style={{ background: 'var(--bg-secondary)', padding: '24px' }}>
              <div style={{ color: 'var(--color-accent-orange)', marginBottom: '12px' }}><Bell size={28} /></div>
              <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>매일 아침 7시 이메일 발송</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>바쁜 출근길이나 등교시간에도 3분 내에 글로벌 경제 흐름을 간편하게 스캔하고 시작할 수 있도록 요약된 이메일 뉴스레터를 배달해 드립니다.</p>
            </div>
            <div className="glass-card" style={{ background: 'var(--bg-secondary)', padding: '24px' }}>
              <div style={{ color: 'var(--color-accent-blue)', marginBottom: '12px' }}><Shield size={28} /></div>
              <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>위협 공격 차단 보안</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>최신 API Rate-Limiter 미들웨어와 철저한 이스케이프 보안 메커니즘을 가동하여 해커의 악의적 위협(XSS/SQL 인젝션)으로부터 구독자 개인정보를 철통 수호합니다.</p>
            </div>
          </section>
        </section>
      )}

      {activeView === 'login' && (
        <section style={{ maxWidth: '400px', margin: '60px auto', padding: '0 20px' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '36px' }}>
            <div style={{ background: 'rgba(197, 168, 128, 0.08)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: 'var(--color-accent-blue)' }}><Lock size={28} /></div>
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

      {activeView === 'subscribe' && (
        <section style={{ textAlign: 'center', maxWidth: '600px', margin: '40px auto 60px auto', position: 'relative' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-accent-blue)', fontFamily: 'var(--font-headers)', letterSpacing: '0.05em', background: 'rgba(197, 168, 128, 0.08)', padding: '6px 16px', borderRadius: '30px', border: '1px solid rgba(197, 168, 128, 0.15)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}><Mail size={14} />LOGI'S INTUITIVE NEWSLETTER SERVICE</div>
          <h1 className="hero-title" style={{ background: 'linear-gradient(to right, var(--color-text-primary) 60%, var(--color-accent-blue) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>매일 아침 7시,<br/>금융 도토리를 메일함에 쏙! 🐿️📬</h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '36px', lineHeight: '1.6' }}>귀찮고 어려운 경제 뉴스 읽기 끝! 구독 버튼 하나로<br/>세상 편한 이메일 요약본을 매일 공짜로 챙겨줄게!</p>
          <form onSubmit={handleSubscribe} className="glass-card newsletter-form" style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)' }}>
            <div style={{ paddingLeft: '16px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><Mail size={18} /></div>
            <input type="email" placeholder="뉴스레터를 받아볼 이메일 주소를 적어줘!" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '15px', flex: '1', height: '40px', fontFamily: 'var(--font-body)' }} />
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0 24px', height: '46px', borderRadius: '23px', fontSize: '14px' }}>경제 도토리 구독하기 🐿️</button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '12px' }}><ShieldCheck size={12} style={{ color: 'var(--color-accent-blue)' }} />철벽 보안 데이터 보호 적용 및 스팸 방지 실시간 검증 완료</div>
          <div className="glass-card no-mobile-padding" style={{ marginTop: '24px', padding: '12px 16px', borderRadius: '20px', background: 'var(--bg-secondary)', border: '1px solid', borderColor: backendWaking ? 'rgba(200, 122, 122, 0.25)' : 'rgba(197, 168, 128, 0.25)', fontSize: '12px', fontWeight: '600', textAlign: 'center', color: backendWaking ? 'var(--color-accent-orange)' : 'var(--color-accent-blue)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', boxShadow: backendWaking ? '0 4px 10px rgba(200, 122, 122, 0.05)' : '0 4px 10px rgba(197, 168, 128, 0.05)' }}>
            {backendWaking ? (<><RefreshCw size={12} className="animate-spin" /><span>🐿️ 로기가 잠든 배포 서버를 힘껏 깨우고 있어요! (약 15초 소요)</span></>) : (<span>🟢 로기 연구소 서버 활성화 완료! 실시간 데이터 동기화 레이어 작동 중</span>)}
          </div>
          {status.message && (<div className="glass-card" style={{ marginTop: '20px', padding: '12px 18px', borderRadius: 'var(--border-radius-md)', borderLeft: status.type === 'success' ? '4px solid var(--color-accent-blue)' : '4px solid var(--color-accent-orange)', background: 'var(--bg-secondary)', fontSize: '14px', fontWeight: '600', textAlign: 'center', color: status.type === 'success' ? 'var(--color-accent-blue)' : 'var(--color-accent-orange)' }}>{status.message}</div>)}
        </section>
      )}

      <section style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '60px' }}>
        <div className="glass-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ color: 'var(--color-accent-blue)', marginBottom: '12px' }}><Coins size={28} /></div>
          <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>글로벌 포트폴리오 다각화</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>원화 자산의 감쇠 위기 속에서, 해외 선물 마켓 및 알트코인 지표를 적절히 병행하여 헷지 수단을 설계할 수 있도록 명료하게 분석합니다.</p>
        </div>
        <div className="glass-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ color: 'var(--color-accent-orange)', marginBottom: '12px' }}><Bell size={28} /></div>
          <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>매일 아침 7시 이메일 발송</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>바쁜 출근길이나 등교시간에도 3분 내에 글로벌 경제 흐름을 간편하게 스캔하고 시작할 수 있도록 요약된 이메일 뉴스레터를 배달해 드립니다.</p>
        </div>
        <div className="glass-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ color: 'var(--color-accent-blue)', marginBottom: '12px' }}><Shield size={28} /></div>
          <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-headers)' }}>위협 공격 차단 보안</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>최신 API Rate-Limiter 미들웨어와 철저한 이스케이프 보안 메커니즘을 가동하여 해커의 악의적 위협(XSS/SQL 인젝션)으로부터 구독자 개인정보를 철통 수호합니다.</p>
        </div>
      </section>

      <footer style={{ textAlign: 'center', marginTop: '80px', padding: '30px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--color-text-muted)', fontSize: '13px' }}>
        <p>© 2026 머니로그랩 (Money Log Lab). All Rights Reserved.</p>
        <p style={{ marginTop: '5px' }}>다람쥐 연구원 로기가 물어오는 똑똑한 금융 도토리 🐿️🌰</p>
      </footer>
    </div>
  );
}
