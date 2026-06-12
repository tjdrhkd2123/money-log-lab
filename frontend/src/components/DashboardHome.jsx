import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Calendar, Flame } from 'lucide-react';
import { API_BASE_URL } from '../config.js';

export default function DashboardHome({ onNewsLoaded, onIndicesLoaded }) {
  const [indices, setIndices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fear & Greed index states
  const [marketTemp, setMarketTemp] = useState(50);
  const [marketVibe, setMarketVibe] = useState({ vibe: '중립 🐿️😐', desc: '시장 상황 분석 대기 중...' });

  const calculateMarketVibe = (latestIndices) => {
    try {
      const parsePercent = (val) => {
        if (!val) return 0;
        return parseFloat(val.replace(/[+%]/g, '')) || 0;
      };
      
      const kp = parsePercent(latestIndices.kospi.changePercent);
      const kd = parsePercent(latestIndices.kosdaq.changePercent);
      const ex = parsePercent(latestIndices.usdKrw.changePercent);
      
      let score = 50 + (kp * 10) + (kd * 6) - (ex * 15);
      score = Math.min(100, Math.max(0, score));
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
        if (data.news && onNewsLoaded) {
          onNewsLoaded(data.news);
        }
        if (onIndicesLoaded) {
          onIndicesLoaded(data.indices);
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
    </div>
  );
}
