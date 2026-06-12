import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Calendar, Flame, ChevronRight, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config.js';

export default function DashboardHome() {
  const [indices, setIndices] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fintech interactive states
  const [newsTab, setNewsTab] = useState('economy'); // 'economy', 'realestate', 'coin'
  const [marketTemp, setMarketTemp] = useState(50);
  const [marketVibe, setMarketVibe] = useState({ vibe: '중립 🐿️😐', desc: '시장 상황 분석 대기 중...' });
  const [calcTab, setCalcTab] = useState('exchange'); // 'exchange', 'savings'
  
  // Exchange calculator inputs
  const [krwInput, setKrwInput] = useState('1000000');
  const [usdInput, setUsdInput] = useState('');

  // Savings calculator inputs
  const [monthlySavings, setMonthlySavings] = useState('300000');
  const [interestRate, setInterestRate] = useState('4.5');
  const [savingsPeriod, setSavingsPeriod] = useState('3');

  // Calculates the Fear & Greed index dynamically based on indices changes
  const calculateMarketVibe = (latestIndices) => {
    try {
      const parsePercent = (val) => {
        if (!val) return 0;
        return parseFloat(val.replace(/[+%]/g, '')) || 0;
      };
      
      const kp = parsePercent(latestIndices.kospi.changePercent);
      const kd = parsePercent(latestIndices.kosdaq.changePercent);
      const ex = parsePercent(latestIndices.usdKrw.changePercent);
      
      // Fear & Greed Formula: base 50. Kospi/Kosdaq UP is greed, Exchange rate UP is fear
      let score = 50 + (kp * 10) + (kd * 6) - (ex * 15);
      score = Math.min(100, Math.max(0, score)); // clamp 0-100
      const roundedScore = Math.round(score);

      let vibe = '중립 🐿️😐';
      let desc = '도토리 시장이 잔잔하고 조용해. 관망하며 차분히 추세를 지켜보자구!';
      
      if (roundedScore >= 70) {
        vibe = '극단적 탐욕 🐿️🔥';
        desc = '도토리 시장 온도가 매우 뜨거워! 과열 조짐이 있으니 분할 매도로 익절을 챙길 때야!';
      } else if (roundedScore >= 55) {
        vibe = '탐욕 🐿️😄';
        desc = '도토리 온도가 따뜻하고 활발해! 우량 자산들의 단기 반등 모멘텀이 기대돼!';
      } else if (roundedScore <= 30) {
        vibe = '극단적 공포 🐿️❄️';
        desc = '도토리 시장이 꽁꽁 얼어붙었어! 투매성 소나기가 쏟아지니 저점 분할 매수로 대응해봐!';
      } else if (roundedScore <= 45) {
        vibe = '공포 🐿️😰';
        desc = '시장에 불안감이 감돌고 환율이 요동쳐! 당분간 현금을 쥐고 안전자산 비중을 지켜보자!';
      }

      setMarketTemp(roundedScore);
      setMarketVibe({ vibe, desc });
    } catch (err) {
      console.error('Error calculating market vibe:', err);
    }
  };

  async function loadIndices() {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/indices?t=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        setIndices(data.indices);
        if (data.news) {
          setNews(data.news);
        }
        calculateMarketVibe(data.indices);
      }
    } catch (err) {
      console.error('지표 로딩 오류:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadIndices();
  }, []);

  // Update exchange calculations
  useEffect(() => {
    if (!indices) return;
    const rate = parseFloat(indices.usdKrw.price.replace(/,/g, '')) || 1350;
    if (krwInput) {
      const calculated = parseFloat(krwInput) / rate;
      setUsdInput(calculated.toFixed(2));
    } else {
      setUsdInput('');
    }
  }, [krwInput, indices]);

  const handleUsdChange = (val) => {
    setUsdInput(val);
    if (!indices) return;
    const rate = parseFloat(indices.usdKrw.price.replace(/,/g, '')) || 1350;
    if (val) {
      const calculated = parseFloat(val) * rate;
      setKrwInput(Math.round(calculated).toString());
    } else {
      setKrwInput('');
    }
  };

  // Calculate compound interest savings results
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
    const interest = total - principal;
    const acorns = Math.round(total / 10000); // 1만원당 도토리 1개 🌰

    return {
      principal: Math.round(principal),
      total: Math.round(total),
      interest: Math.round(interest),
      acorns
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

  if (loading || !indices) {
    return (
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card" style={{ width: '200px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>로기가 지표 가져오는 중...</span>
          </div>
        ))}
      </div>
    );
  }

  const savingsRes = getSavingsResult();
  const filteredNews = news.filter(item => item.category === newsTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 🌡️ Rogi's Fear & Greed Market Thermometer */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        borderLeft: `4px solid ${marketTemp >= 55 ? 'var(--color-accent-orange)' : marketTemp <= 45 ? 'var(--color-accent-blue)' : 'var(--color-accent-emerald)'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-headers)' }}>
            <Flame size={16} style={{ color: marketTemp >= 55 ? 'var(--color-accent-orange)' : marketTemp <= 45 ? 'var(--color-accent-blue)' : 'var(--color-accent-emerald)' }} />
            오늘의 도토리 시장 온도 (공포 & 탐욕 지수)
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: '800',
            color: marketTemp >= 55 ? 'var(--color-accent-orange)' : marketTemp <= 45 ? 'var(--color-accent-blue)' : 'var(--color-accent-emerald)',
            background: 'var(--bg-secondary)',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid var(--color-card-border)'
          }}>
            {marketVibe.vibe} ({marketTemp}℃)
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', background: '#cbd5e1', borderRadius: '4px', position: 'relative', marginBottom: '14px' }}>
          <div style={{
            position: 'absolute',
            left: `${marketTemp}%`,
            top: '-5px',
            transform: 'translateX(-50%)',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: marketTemp >= 55 ? 'var(--color-accent-orange)' : marketTemp <= 45 ? 'var(--color-accent-blue)' : 'var(--color-accent-emerald)',
            border: '3px solid #ffffff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            transition: 'all 0.5s ease-out'
          }} />
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #d97706 100%)',
            opacity: 0.15
          }} />
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
          {marketVibe.desc}
        </p>
      </div>

      {/* Real-time Indicator Grid */}
      <div className="indices-grid">
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', borderBottom: indices.kospi.status === 'UP' ? '2px solid var(--color-accent-emerald)' : '2px solid var(--color-accent-orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>KOSPI 지수</span>
            {indices.kospi.status === 'UP' ? <TrendingUp size={20} style={{ color: 'var(--color-accent-emerald)' }} /> : <TrendingDown size={20} style={{ color: 'var(--color-accent-orange)' }} />}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-headers)', marginBottom: '4px' }}>{indices.kospi.price}</h3>
          <div style={{ fontSize: '13px', fontWeight: '600', color: indices.kospi.status === 'UP' ? 'var(--color-accent-emerald)' : 'var(--color-accent-orange)' }}>{indices.kospi.change} ({indices.kospi.changePercent}%)</div>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', borderBottom: indices.kosdaq.status === 'UP' ? '2px solid var(--color-accent-emerald)' : '2px solid var(--color-accent-orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>KOSDAQ 지수</span>
            {indices.kosdaq.status === 'UP' ? <TrendingUp size={20} style={{ color: 'var(--color-accent-emerald)' }} /> : <TrendingDown size={20} style={{ color: 'var(--color-accent-orange)' }} />}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-headers)', marginBottom: '4px' }}>{indices.kosdaq.price}</h3>
          <div style={{ fontSize: '13px', fontWeight: '600', color: indices.kosdaq.status === 'UP' ? 'var(--color-accent-emerald)' : 'var(--color-accent-orange)' }}>{indices.kosdaq.change} ({indices.kosdaq.changePercent}%)</div>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', borderBottom: indices.usdKrw.status === 'UP' ? '2px solid var(--color-accent-orange)' : '2px solid var(--color-accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>원·달러 환율</span>
            {indices.usdKrw.status === 'UP' ? <TrendingUp size={20} style={{ color: 'var(--color-accent-orange)' }} /> : <TrendingDown size={20} style={{ color: 'var(--color-accent-emerald)' }} />}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-headers)', marginBottom: '4px' }}>{indices.usdKrw.price} 원</h3>
          <div style={{ fontSize: '13px', fontWeight: '600', color: indices.usdKrw.status === 'UP' ? 'var(--color-accent-orange)' : 'var(--color-accent-emerald)' }}>{indices.usdKrw.change} ({indices.usdKrw.changePercent}%)</div>
        </div>
      </div>

      {/* Rogi Live Commentary Panel */}
      <div className="glass-card" style={{ background: 'rgba(37, 99, 235, 0.03)', borderColor: 'rgba(37, 99, 235, 0.15)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-headers)', fontSize: '13px', fontWeight: '700', color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> 로기의 실시간 금융 브리핑
          </span>
          <button onClick={loadIndices} disabled={refreshing} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> 새로고침
          </button>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6', fontWeight: '500' }}>{getRogiCommentary()}</p>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'right' }}>수집 기준 시각: {indices.timestamp}</span>
      </div>

      {/* Rogi's Smart Financial Calculators */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--color-card-border)', paddingBottom: '12px', marginBottom: '20px' }}>
          <button onClick={() => setCalcTab('exchange')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: calcTab === 'exchange' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', borderBottom: calcTab === 'exchange' ? '2px solid var(--color-accent-blue)' : '2px solid transparent' }}>💱 간편 환율 계산기</button>
          <button onClick={() => setCalcTab('savings')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: calcTab === 'savings' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)', borderBottom: calcTab === 'savings' ? '2px solid var(--color-accent-blue)' : '2px solid transparent' }}>🌰 복리 도토리 저금통</button>
        </div>
        {calcTab === 'exchange' ? (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>원화 입력 (KRW)</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-card-border)', borderRadius: '10px', padding: '8px 12px', background: 'var(--bg-tertiary)' }}>
                <input type="number" value={krwInput} onChange={(e) => setKrwInput(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '700' }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>원</span>
              </div>
            </div>
            <div style={{ fontSize: '20px', color: 'var(--color-text-muted)', paddingTop: '18px' }}>⇄</div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>달러 변환 (USD)</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-card-border)', borderRadius: '10px', padding: '8px 12px', background: 'var(--bg-tertiary)' }}>
                <input type="number" value={usdInput} onChange={(e) => handleUsdChange(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '700' }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>달러</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>월 납입액</label>
                <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700' }} />
              </div>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>연 이자율 (%)</label>
                <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700' }} />
              </div>
              <div style={{ flex: 1, minWidth: '100px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>기간 (년)</label>
                <select value={savingsPeriod} onChange={(e) => setSavingsPeriod(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-card-border)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', background: 'var(--bg-tertiary)', color: 'var(--color-text-primary)', fontWeight: '700' }}>
                  <option value="1">1년</option><option value="2">2년</option><option value="3">3년</option><option value="5">5년</option><option value="10">10년</option>
                </select>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>총 납입 원금:</span>
                <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{savingsRes.principal.toLocaleString()} 원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>예상 세후 이자:</span>
                <span style={{ fontWeight: '700', color: 'var(--color-accent-emerald)' }}>+ {savingsRes.interest.toLocaleString()} 원</span>
              </div>
              <div style={{ borderTop: '1px dashed var(--color-card-border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)' }}>최종 수령액 (월복리):</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-accent-blue)' }}>{savingsRes.total.toLocaleString()} 원</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'right' }}>🐿️ 로기의 저금통에 모인 도토리: **{savingsRes.acorns.toLocaleString()}개 🌰**</div>
            </div>
          </div>
        )}
      </div>

      {/* Rogi's Real-time Live RSS News Clip */}
      {news.length > 0 && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-headers)' }}>
              <FileText size={16} style={{ color: 'var(--color-accent-blue)' }} />
              로기의 실시간 핫이슈 뉴스 클립
            </h3>
            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '8px' }}>
              {['economy', 'realestate', 'coin'].map(tab => (
                <button key={tab} onClick={() => setNewsTab(tab)} style={{ background: newsTab === tab ? 'var(--color-card-bg)' : 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', padding: '6px 12px', borderRadius: '6px', color: newsTab === tab ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)' }}>
                  {tab === 'economy' ? '금융·경제' : tab === 'realestate' ? '부동산' : '가상자산'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredNews.slice(0, 5).map((item, idx) => (
              <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--color-card-border)', background: 'var(--bg-secondary)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', paddingRight: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>{item.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{item.source} • {new Date(item.pubDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
