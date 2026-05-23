import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Share2, Sparkles, BookOpen } from 'lucide-react';

export default function CardNews() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch generated card news from the API
  useEffect(() => {
    async function loadCardNews() {
      try {
        const response = await fetch('http://localhost:5000/api/public/card-news');
        const data = await response.json();
        if (data.success && data.cardNews) {
          setSlides(data.cardNews);
        }
      } catch (err) {
        console.error('카드뉴스 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCardNews();
  }, []);

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-400 animate-spin mb-4"></div>
        <p className="font-headers font-semibold animate-pulse">로기가 카드뉴스를 가져오는 중... 🐿️</p>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[activeIndex];

  return (
    <div className="card-news-widget-wrapper" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: 'rgba(0, 245, 212, 0.1)',
            color: 'var(--color-accent-emerald)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            fontFamily: 'var(--font-headers)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={12} />
            로기의 도토리 요약
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>
            {activeIndex + 1} / {slides.length}
          </span>
        </div>
        
        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px'
        }} onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert('🔗 주소가 클립보드에 복사되었습니다! 친구들에게 공유해봐!');
        }}>
          <Share2 size={14} />
          공유하기
        </button>
      </div>

      {/* Main Card Viewport */}
      <div className="glass-card" style={{
        padding: '0',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '4px solid var(--color-accent-emerald)',
        background: 'linear-gradient(145deg, rgba(13, 22, 39, 0.85) 0%, rgba(20, 33, 61, 0.6) 100%)'
      }}>
        
        {/* Animated Background Rogi Mascot watermark */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: '0.05',
          pointerEvents: 'none',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, var(--color-accent-emerald) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>

        {/* Card Content Area */}
        <div style={{ padding: '36px 36px 20px 36px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Tag */}
          <div style={{
            fontFamily: 'var(--font-headers)',
            fontSize: '13px',
            fontWeight: '700',
            color: 'var(--color-accent-orange)',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            # {currentSlide.keyword || '경제 분석'}
          </div>
          
          {/* Slide Title */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#ffffff',
            lineHeight: '1.4',
            marginBottom: '16px',
            fontFamily: 'var(--font-headers)'
          }}>
            {currentSlide.title}
          </h2>
          
          {/* Slide Description */}
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.7',
            fontWeight: '400'
          }}>
            {currentSlide.description}
          </p>
        </div>

        {/* Card Footer Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(5, 10, 20, 0.4)'
        }}>
          {/* Prev Button */}
          <button 
            onClick={handlePrev} 
            disabled={activeIndex === 0}
            style={{
              background: 'none',
              border: 'none',
              color: activeIndex === 0 ? 'var(--color-text-muted)' : '#ffffff',
              cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-headers)',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'opacity 0.2s'
            }}
          >
            <ChevronLeft size={18} />
            이전
          </button>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {slides.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setActiveIndex(i)}
                style={{
                  width: activeIndex === i ? '24px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: activeIndex === i ? 'var(--color-accent-emerald)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Next Button */}
          <button 
            onClick={handleNext} 
            disabled={activeIndex === slides.length - 1}
            style={{
              background: 'none',
              border: 'none',
              color: activeIndex === slides.length - 1 ? 'var(--color-text-muted)' : '#ffffff',
              cursor: activeIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-headers)',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'opacity 0.2s'
            }}
          >
            다음
            <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
