import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';
import { API_BASE_URL } from '../config.js';

export default function DashboardHome() {
  const [indices, setIndices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadIndices() {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/indices?t=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        setIndices(data.indices);
      }
    } catch (err) {
      console.error('지표 로딩 오률:', err);
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

    if (usd >= 1500) {
      return `🐿️ 로기 분석: 원·달러 환율이 도토리 무게보다 무겁게 ${indices.usdKrw.price}원을 긴급 돌파하며 치솟고 있어! 수입 물가가 비상이니, 글로벌 위험 헷지를 위해 안전자산과 가상자산 병행을 꼭 살펴봐야 해!`;
    } else if (usd >= 1360) {
      return `🐿️ 로기 분석: 원·달러 환율이 도토리 무게보다 무겁게 ${indices.usdKrw.price}원을 돌파하며 치솟고 있어! 수입 물가가 비상이니, 글로벌 위험 헷지를 위해 안전자산과 가상자산 병행을 꼭 살펴봐야 해!`;
    } else if (kospiChange < 0) {
      return "🐿️ 로기 분석: 코스피 지수가 조금 주저앉고 있어. 외인들이 물량을 던지고 있는 소나기 구간이니, 조급히 상투 잡지 말고 반도체 D-RAM 업황 회복 시기를 여유롭게 기다려 봐!";
    } else {
      return "🐿️ 로기 분석: 금융 시장 수급이 돌고 도는 순환매 장세야! 로기가 매일 아침 7시 수집하는 최신 급등 신호 포스팅들을 눈여겨보라구!";
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
    <div>
      {/* Real-time Indicator Grid */}
      <div className="indices-grid">
        {/* KOSPI CARD */}
        <div className="glass-card" style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: indices.kospi.status === 'UP' ? '2px solid var(--color-accent-emerald)' : '2px solid var(--color-accent-orange)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>KOSPI 지수</span>
            {indices.kospi.status === 'UP' ? (
              <TrendingUp size={20} style={{ color: 'var(--color-accent-emerald)', filter: 'drop-shadow(var(--shadow-neon-emerald))' }} />
            ) : (
              <TrendingDown size={20} style={{ color: 'var(--color-accent-orange)' }} />
            )}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-headers)', marginBottom: '4px' }}>
            {indices.kospi.price}
          </h3>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'var(--font-headers)',
            color: indices.kospi.status === 'UP' ? 'var(--color-accent-emerald)' : 'var(--color-accent-orange)'
          }}>
            {indices.kospi.change} ({indices.kospi.changePercent}%)
          </div>
        </div>

        {/* KOSDAQ CARD */}
        <div className="glass-card" style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: indices.kosdaq.status === 'UP' ? '2px solid var(--color-accent-emerald)' : '2px solid var(--color-accent-orange)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>KOSDAQ 지수</span>
            {indices.kosdaq.status === 'UP' ? (
              <TrendingUp size={20} style={{ color: 'var(--color-accent-emerald)', filter: 'drop-shadow(var(--shadow-neon-emerald))' }} />
            ) : (
              <TrendingDown size={20} style={{ color: 'var(--color-accent-orange)' }} />
            )}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-headers)', marginBottom: '4px' }}>
            {indices.kosdaq.price}
          </h3>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'var(--font-headers)',
            color: indices.kosdaq.status === 'UP' ? 'var(--color-accent-emerald)' : 'var(--color-accent-orange)'
          }}>
            {indices.kosdaq.change} ({indices.kosdaq.changePercent}%)
          </div>
        </div>

        {/* USD/KRW Exchange Rate CARD */}
        <div className="glass-card" style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: indices.usdKrw.status === 'UP' ? '2px solid var(--color-accent-orange)' : '2px solid var(--color-accent-emerald)' // Exchange rate UP is usually bad (orange), DOWN is good
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>원·달러 환율</span>
            {indices.usdKrw.status === 'UP' ? (
              <TrendingUp size={20} style={{ color: 'var(--color-accent-orange)', filter: 'drop-shadow(var(--shadow-neon-orange))' }} />
            ) : (
              <TrendingDown size={20} style={{ color: 'var(--color-accent-emerald)' }} />
            )}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-headers)', marginBottom: '4px' }}>
            {indices.usdKrw.price} 원
          </h3>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'var(--font-headers)',
            color: indices.usdKrw.status === 'UP' ? 'var(--color-accent-orange)' : 'var(--color-accent-emerald)'
          }}>
            {indices.usdKrw.change} ({indices.usdKrw.changePercent}%)
          </div>
        </div>
      </div>

      {/* Rogi Live Commentary Panel */}
      <div className="glass-card" style={{
        background: 'rgba(0, 180, 216, 0.05)',
        borderColor: 'rgba(0, 180, 216, 0.15)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-headers)',
            fontSize: '13px',
            fontWeight: '700',
            color: 'var(--color-accent-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Calendar size={14} />
            로기의 실시간 금융 브리핑
          </span>
          <button 
            onClick={loadIndices} 
            disabled={refreshing}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6', fontWeight: '500' }}>
          {getRogiCommentary()}
        </p>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'right' }}>
          수집 기준 시각: {indices.timestamp}
        </span>
      </div>
    </div>
  );
}
