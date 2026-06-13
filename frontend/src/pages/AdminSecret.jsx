import { API_BASE_URL } from '../config.js';
import React, { useState, useEffect } from 'react';
import { 
  Lock, KeyRound, ArrowLeft, RefreshCw, Copy, Check, Users, 
  FileText, Activity, AlertCircle, FileCheck, ExternalLink, Image, Video
} from 'lucide-react';

export default function AdminSecret({ onNavigateHome }) {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(sessionStorage.getItem('admin_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard states
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('economic');
  const [harvesting, setHarvesting] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [harvestMessage, setHarvestMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  // Video generation states
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const [videoSuccessMsg, setVideoSuccessMsg] = useState('');
  const [videoLog, setVideoLog] = useState('');
  const logEndRef = React.useRef(null);

  // Auto-scroll video generation log console
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [videoLog]);

  // Auto load data if already authenticated
  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        sessionStorage.setItem('admin_token', data.token);
        setToken(data.token);
      } else {
        setError(data.message || '패스워드가 올바르지 않아!');
      }
    } catch (err) {
      setError('서버 연결에 실패했어. 백엔드가 켜져있는지 확인해줘!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setToken('');
    setDashboardData(null);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/daily-acorns`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setDashboardData(data);
        
        // --- Dual Synchronization Layer ---
        try {
          const localBackups = JSON.parse(localStorage.getItem('moneyloglab_backup_subscribers') || '[]');
          const serverSubscribers = data.subscribers || [];
          
          // 1. Sync server subscribers to local backup (Server -> Local)
          let updatedLocalBackups = [...localBackups];
          let localChanged = false;
          for (const sEmail of serverSubscribers) {
            if (!updatedLocalBackups.includes(sEmail)) {
              updatedLocalBackups.push(sEmail);
              localChanged = true;
            }
          }
          if (localChanged) {
            localStorage.setItem('moneyloglab_backup_subscribers', JSON.stringify(updatedLocalBackups));
          }
          
          // 2. Identify missing subscribers on server (Local -> Server)
          const missingOnServer = localBackups.filter(email => !serverSubscribers.includes(email));
          if (missingOnServer.length > 0) {
            console.log(`🔄 서버에서 누락된 구독자 ${missingOnServer.length}명 감지. 자동 복원 중...`);
            const syncResponse = await fetch(`${API_BASE_URL}/api/admin/sync-subscribers`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ subscribers: missingOnServer })
            });
            const syncData = await syncResponse.json();
            if (syncResponse.ok && syncData.success) {
              console.log('🔄 구독자 복원 완료!');
              setDashboardData(prev => ({
                ...prev,
                subscribersCount: syncData.subscribersCount,
                subscribers: syncData.subscribers,
                diagnostics: syncData.diagnostics
              }));
            }
          }
        } catch (syncErr) {
          console.error('Dual Sync layer error:', syncErr);
        }
        // ----------------------------------
        
      } else {
        // Token might be expired
        handleLogout();
        setError('세션이 만료되었어. 다시 로그인해줘!');
      }
    } catch (err) {
      setError('서버 데이터를 불러오는 중 오류가 발생했어.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualHarvest = async () => {
    setHarvesting(true);
    setHarvestMessage('');
    setProgress(0);
    setProgressStatus('로기가 수집 도토리를 챙기고 있어요... 🐿️');

    // Simulate smooth progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      
      if (currentProgress < 15) {
        setProgress(currentProgress);
        setProgressStatus('국내 및 글로벌 실시간 금융 지표 수집 중... (KOSPI, 환율 등) 📊');
      } else if (currentProgress < 35) {
        setProgress(currentProgress);
        setProgressStatus('Bitget & OKX 해외 거래소 급등 코인 탐색 및 검증 중... 🪙');
      } else if (currentProgress < 85) {
        setProgress(currentProgress);
        setProgressStatus('다람쥐 AI 작가 가동! 5개 분야 네이버 포스팅 원고 작성 중... ✍️ (약 15초 소요)');
      } else if (currentProgress < 98) {
        setProgress(currentProgress);
        setProgressStatus('오늘의 이메일 뉴스레터 및 넘겨보는 카드뉴스 초안 구성 중... 🎨');
      } else if (currentProgress === 98) {
        setProgressStatus('AI 최종 응답을 대기하며 결과를 꼼꼼히 정리 중입니다... ⏳');
      }
    }, 250); // 98% reached in ~25 seconds

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/trigger-harvest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      clearInterval(interval);
      setProgress(100);
      setProgressStatus('데이터 수집 및 5대 블로그 포스팅 작성이 완료되었습니다! 🎉');

      if (response.ok && data.success) {
        // Keep existing subscribers metrics when merging manual harvest data
        setDashboardData(prev => ({
          ...prev,
          ...data,
          subscribersCount: prev?.subscribersCount ?? 0,
          subscribers: prev?.subscribers ?? []
        }));
        setHarvestMessage('⚡ 수집 완료! 5대 포스팅 및 독자 뉴스레터 발송이 완료되었습니다!');
      } else {
        setHarvestMessage(`⚠️ 수집 중 오류: ${data.message}`);
      }
    } catch (err) {
      clearInterval(interval);
      setProgress(100);
      setHarvestMessage('⚠️ 서버 응답 오류가 발생했습니다.');
    } finally {
      setHarvesting(false);
      // Clear progress states after 5 seconds
      setTimeout(() => {
        setHarvestMessage('');
        setProgress(0);
        setProgressStatus('');
      }, 5000);
    }
  };

  // Asynchronously requests the backend to render the shorts mp4 using moviepy & edge-tts (Asynchronous Polling Architecture)
  const handleGenerateVideo = async () => {
    setGeneratingVideo(true);
    setVideoError('');
    setVideoSuccessMsg('');
    setVideoUrl('');
    setVideoLog('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/generate-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setVideoError(data.message || '비디오 렌더링 시작 실패!');
        setGeneratingVideo(false);
        return;
      }

      // Start Polling Loop for both status & real-time log stream
      console.log('🎬 비디오 생성 작업 시작됨. 상태 및 로그 실시간 폴링 시작...');
      const pollInterval = setInterval(async () => {
        try {
          // 1. Fetch rendering log
          const logRes = await fetch(`${API_BASE_URL}/api/public/debug-video`);
          if (logRes.ok) {
            const logText = await logRes.text();
            setVideoLog(logText);
          }

          // 2. Fetch video status
          const statusRes = await fetch(`${API_BASE_URL}/api/admin/video-status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const statusData = await statusRes.json();
          
          if (statusRes.ok && statusData.success) {
            const { status, error, videoUrl } = statusData.state;
            
            if (status === 'completed') {
              clearInterval(pollInterval);
              setGeneratingVideo(false);
              setVideoUrl(`${API_BASE_URL}${videoUrl}`);
              setVideoSuccessMsg('🐿️ 로기의 경제 도토리 유튜브 쇼츠 비디오 렌더링에 성공했습니다!');
            } else if (status === 'failed') {
              clearInterval(pollInterval);
              setGeneratingVideo(false);
              setVideoError(error || '비디오 렌더링 중 오류가 발생했습니다.');
            }
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 1500); // Poll status & logs every 1.5 seconds for extremely fluid visual experience

    } catch (err) {
      setVideoError('서버 연결 중 치명적인 오류가 발생했습니다. 파이썬 환경을 점검해 주세요!');
      setGeneratingVideo(false);
    }
  };

  // Prepares the formatted text for Naver Blog copy-paste (Rule 3 & 4 structure layout)
  const handleCopyPost = (post) => {
    const formattedText = `[추천 제목]
${post.recommendedTitle}

[💡 한 줄 요약]
${post.aeoSummary}

[✅ 오늘의 핵심 정리 - 예고편]
${post.previewBox.trailerText}

지금 할 것:
${post.previewBox.todoSteps.map((step, i) => `${i+1}. ${step}`).join('\n')}

--------------------------------------------------
[본문 내용]

${post.body}

--------------------------------------------------
[참고 키워드 이미지 추천]
👉 Pixabay 검색어: ${post.imageKeywords.join(', ')}

[해시태그]
${post.hashtags.map(tag => `#${tag}`).join(' ')}
`;

    navigator.clipboard.writeText(formattedText);
    setCopiedId(post.category);
    setTimeout(() => setCopiedId(''), 2000);
  };

  // ==========================================
  // RENDER: PASSWORD PROTECTION ROUTE (Security Rule 3)
  // ==========================================
  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
        <button 
          onClick={onNavigateHome}
          style={{
            background: 'none', border: 'none', color: 'var(--color-text-secondary)',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '13px', marginBottom: '20px'
          }}
        >
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </button>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(0, 245, 212, 0.1)',
            width: '60px', height: '60px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContext: 'center',
            margin: '0 auto 20px auto', color: 'var(--color-accent-emerald)',
            justifyContent: 'center'
          }}>
            <Lock size={28} />
          </div>
          
          <h2 style={{ fontSize: '20px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-headers)', marginBottom: '8px' }}>
            로기 연구소 시크릿 룸
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            비밀번호를 입력해야 입장할 수 있습니다.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)',
              borderRadius: '30px', padding: '10px 16px'
            }}>
              <KeyRound size={16} style={{ color: 'var(--color-text-muted)' }} />
              <input 
                type="password"
                placeholder="비밀 비밀번호 입력"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: 'var(--color-text-primary)', fontSize: '14px', flex: '1', fontFamily: 'var(--font-body)'
                }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center' }}>
              {loading ? '인증 확인 중...' : '시크릿 룸 입장 🔐'}
            </button>
          </form>

          {error && (
            <div style={{
              marginTop: '16px', color: 'var(--color-accent-orange)',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
              justifyContent: 'center'
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SECURE ADMIN DASHBOARD
  // ==========================================
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Header Controls */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onNavigateHome}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--color-card-border)',
              color: 'var(--color-text-primary)', borderRadius: '50%', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-headers)', color: 'var(--color-text-primary)' }}>
              🐿️ 로기의 시크릿 연구 대시보드
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              머니로그랩 네이버 블로그 복사 붙여넣기 및 수집 관리룸
            </p>
          </div>
        </div>

        <div className="admin-buttons-container">
          <button 
            onClick={handleManualHarvest} 
            disabled={harvesting}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '8px 18px' }}
          >
            <RefreshCw size={14} className={harvesting ? 'animate-spin' : ''} />
            {harvesting ? '로기가 수집하는 중...' : '즉시 뉴스 수집하기 (ㄱㄱ) ⚡'}
          </button>
          
          <button 
            onClick={handleLogout}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 18px', color: 'var(--color-accent-orange)', borderColor: 'rgba(255,159,28,0.2)' }}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Quick Statistics Banner */}
      {dashboardData && (
        <div className="stats-grid">
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
            <div style={{ color: 'var(--color-accent-emerald)' }}><Users size={24} /></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>총 구독 이메일 수</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{dashboardData.subscribersCount ?? 0} 명</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
            <div style={{ color: 'var(--color-accent-orange)' }}><FileText size={24} /></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>자동화 대기 포스팅</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{dashboardData.dailyAcorns?.generated?.posts?.length || 5} 개 완료</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
            <div style={{ color: 'var(--color-accent-emerald)' }}><KeyRound size={24} /></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>최근 사용된 AI 엔진</div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: dashboardData.dailyAcorns?.generated?.error ? 'var(--color-accent-orange)' : 'var(--color-accent-emerald)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '180px'
              }} title={dashboardData.dailyAcorns?.generated?.engine}>
                {dashboardData.dailyAcorns?.generated?.engine || '분석 대기 중'}
              </h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
            <div style={{ color: 'var(--color-accent-blue)' }}><Activity size={24} /></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>자동 수집 주기</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-accent-emerald)' }}>매일 아침 07:00 AM</h3>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 로기 연구소 API & 주소록 정밀 진단 패널 */}
      {dashboardData && dashboardData.diagnostics && (
        <div className="glass-card" style={{
          marginBottom: '30px',
          padding: '24px',
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--color-card-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{
            fontSize: '15px',
            color: 'var(--color-text-primary)',
            fontWeight: '800',
            fontFamily: 'var(--font-headers)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚙️ 로기 연구소 API & 클라우드 연동 상태 정밀 진단
          </h3>
          
          <div className="diagnostics-grid">
            {/* Resend API Key Status */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--color-card-border)',
              padding: '14px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)' }}>RESEND API KEY (이메일 발송/연동)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}>
                {dashboardData.diagnostics.resendApiKeyLoaded ? (
                  <span style={{ color: 'var(--color-accent-emerald)' }}>🟢 정상 탑재됨</span>
                ) : (
                  <span style={{ color: 'var(--color-accent-orange)' }}>🔴 미설정 (로컬 시뮬레이션)</span>
                )}
              </div>
            </div>

            {/* Resend Audience Status */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--color-card-border)',
              padding: '14px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)' }}>클라우드 주소록 (Audience)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}>
                {dashboardData.diagnostics.audienceId ? (
                  <span style={{ color: 'var(--color-accent-emerald)', fontSize: '12px', wordBreak: 'break-all' }} title={dashboardData.diagnostics.audienceId}>
                    🟢 자동 연동됨 ({dashboardData.diagnostics.audienceId.substring(0, 8)}...)
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-accent-orange)' }}>🔴 감지 실패 (Render 연동 확인 필요)</span>
                )}
              </div>
            </div>

            {/* AI Engine Status */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--color-card-border)',
              padding: '14px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)' }}>AI 엔진 연동 상태 (Gemini / Claude)</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontWeight: '700' }}>
                <span style={{ color: dashboardData.diagnostics.geminiApiKeyLoaded ? 'var(--color-accent-emerald)' : 'var(--color-accent-orange)' }}>
                  Gemini: {dashboardData.diagnostics.geminiApiKeyLoaded ? '🟢' : '🔴'}
                </span>
                <span style={{ color: dashboardData.diagnostics.claudeApiKeyLoaded ? 'var(--color-accent-emerald)' : 'var(--color-accent-orange)' }}>
                  Claude: {dashboardData.diagnostics.claudeApiKeyLoaded ? '🟢' : '🔴'}
                </span>
              </div>
            </div>

            {/* Sender Email Status */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--color-card-border)',
              padding: '14px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)' }}>발신자 이메일 (Sender Email)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                ✉️ {dashboardData.diagnostics.senderEmail || '미설정'}
              </div>
            </div>
          </div>

          {/* 💡 API 연동 에러 메시지 노출 */}
          {dashboardData.diagnostics.resendError && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(255, 159, 28, 0.08)',
              border: '1px solid rgba(255, 159, 28, 0.2)',
              fontSize: '13px',
              color: 'var(--color-accent-orange)',
              lineHeight: '1.6'
            }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Resend 클라우드 연동 실시간 에러 감지:</strong>
              {dashboardData.diagnostics.resendError}
            </div>
          )}

          {/* 💡 API 연동 정상 가이드 */}
          {(!dashboardData.diagnostics.resendApiKeyLoaded || !dashboardData.diagnostics.geminiApiKeyLoaded || !dashboardData.diagnostics.audienceId) && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(255, 159, 28, 0.04)',
              border: '1px solid rgba(255, 159, 28, 0.12)',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: 'var(--color-accent-orange)', display: 'block', marginBottom: '4px' }}>🐿️ 로기의 긴급 연동 도우미 가이드!</strong>
              이메일이 초기화되거나 AI 수집 경고가 뜬다면 <strong>Render.com 시크릿 환경변수(Environment Variables)</strong>에 아래 변수들이 정상 등록되었는지 꼭 체크해줘!
              <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <li><code>RESEND_API_KEY</code> : Resend.com에서 생성한 <code>re_...</code> 형태의 API 키 값</li>
                <li><code>GEMINI_API_KEY</code> : Google AI Studio에서 생성한 <code>AIzaSy...</code> 형태의 API 키 값</li>
                <li><code>SENDER_EMAIL</code> : Resend에 도메인을 연동하지 않았다면 반드시 기본 발신용 주소인 <code>onboarding@resend.dev</code> 로 설정해 줘야 해! (도메인을 연동했다면 본인 도메인 메일 가능)</li>
              </ul>
              <span style={{ fontSize: '11px', display: 'block', marginTop: '6px', color: 'var(--color-accent-blue)' }}>
                * 환경변수를 수정 및 저장하면 Render 서버가 자동으로 다시 빌드되며, 약 1~2분 뒤 적용 완료된 상태(초록불)로 확인할 수 있어!
              </span>
            </div>
          )}
        </div>
      )}

      {/* 🎬 유튜브 쇼츠 비디오 자동 생성 패널 */}
      {dashboardData && dashboardData.dailyAcorns && (
        <div className="glass-card" style={{
          marginBottom: '30px',
          padding: '24px',
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.05)'
        }}>
          <h3 style={{
            fontSize: '16px',
            color: 'var(--color-text-primary)',
            fontWeight: '800',
            fontFamily: 'var(--font-headers)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Video size={20} style={{ color: 'var(--color-accent-blue)' }} />
            로기의 유튜브 쇼츠(Shorts) AI 비디오 오토메이션
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            오늘 아침 AI가 도출해 낸 최신 경제 요약 데이터를 대본 삼아, 다람쥐 로기의 귀여운 친근한 목소리(TTS)와 
            카드뉴스를 결합한 **유튜브 쇼츠 세로형(9:16) 동영상**을 서버에서 완전 자동으로 빌드하고 렌더링합니다!
          </p>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button
              onClick={handleGenerateVideo}
              disabled={generatingVideo || harvesting}
              className="btn-primary"
              style={{
                fontSize: '13px',
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderColor: 'transparent',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)'
              }}
            >
              <RefreshCw size={14} className={generatingVideo ? 'animate-spin' : ''} />
              {generatingVideo ? '서버에서 쇼츠 비디오 렌더링 중... (1~2분 소요)' : '🐿️ 오늘의 경제 쇼츠 영상 제작하기 🎬'}
            </button>

            {generatingVideo && (
              <span style={{ fontSize: '13px', color: 'var(--color-accent-blue)', fontWeight: '600' }} className="pulse-glowing">
                ⚙️ 로기가 대본을 다듬고 배경을 합성해 영화를 굽고 있어요...
              </span>
            )}
          </div>

          {/* Real-time Video Render Terminal Console */}
          {generatingVideo && (
            <div style={{
              background: '#0b0f19',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '8px',
              padding: '14px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-accent-blue)', fontFamily: 'monospace' }}>
                  LOGI-SHORTS-MAKER@SERVER-SHELL:~# tail -f debug_video_render.txt
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-blue)' }} className="pulse-glowing" />
              </div>
              <pre style={{
                margin: 0,
                maxHeight: '220px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#a9b2c3',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                textAlign: 'left'
              }}>
                {videoLog || '서버 로그 버퍼 로딩 중... 로기 비서가 렌더링 콘솔을 연결하고 있어요! 🐿️'}
                <div ref={logEndRef} />
              </pre>
            </div>
          )}

          {videoSuccessMsg && (
            <div style={{ marginTop: '16px', color: 'var(--color-accent-blue)', fontSize: '13px', fontWeight: '700' }}>
              🎉 {videoSuccessMsg}
            </div>
          )}

          {videoError && (
            <div style={{ marginTop: '16px', color: 'var(--color-accent-orange)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              {videoError}
            </div>
          )}

          {/* Video Player Display */}
          {videoUrl && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--color-card-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700' }}>🎬 완성된 쇼츠 미리보기 (세로형)</span>
              
              <video
                src={videoUrl}
                controls
                style={{
                  width: '280px',
                  height: '497px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '2px solid rgba(59, 130, 246, 0.2)'
                }}
              />

              <a
                href={videoUrl}
                download
                className="btn-secondary"
                style={{
                  textDecoration: 'none',
                  fontSize: '13px',
                  padding: '8px 20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-accent-blue)',
                  borderColor: 'rgba(59, 130, 246, 0.3)'
                }}
              >
                📥 내 컴퓨터로 비디오 다운로드 받기
              </a>
            </div>
          )}
        </div>
      )}

      {/* ⏰ 아침 7시 정시 수집 보장! 크론(Wakeup) 연동 가이드 */}
      {dashboardData && (
        <div className="glass-card" style={{
          marginBottom: '30px',
          padding: '24px',
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.03)'
        }}>
          <h3 style={{
            fontSize: '15px',
            color: 'var(--color-text-primary)',
            fontWeight: '800',
            fontFamily: 'var(--font-headers)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⏰ 매일 아침 7시 경제 도토리 자동 수집 & 뉴스레터 100% 보장하는 비법
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: '1.6' }}>
            Render.com의 무료 플랜 서버는 15분간 요청이 없으면 깊은 잠에 빠져듭니다. 
            아래 **1분 가이드**를 설정해 두시면, 매일 아침 7시 정각에 서버가 자고 있더라도 **외부 무료 기상 비서가 서버를 알아서 깨워 정시 수집을 완벽하게 수행**합니다!
          </p>

          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--color-card-border)',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: '1.7',
            color: 'var(--color-text-secondary)'
          }}>
            <strong style={{ color: 'var(--color-accent-orange)', display: 'block', marginBottom: '8px' }}>🛠️ 초간단 2단계 정시 기상 예약법 (GET 지원):</strong>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
              <li>
                무료 크론 서비스 웹사이트 <strong><a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-blue)', textDecoration: 'underline' }}>cron-job.org (여기를 클릭)</a></strong> 에 가입해 주세요.
              </li>
              <li>
                <strong>Create Cronjob</strong> 버튼을 누르고 아래와 같이 설정해 주면 완료!
                <ul style={{ paddingLeft: '20px', marginTop: '4px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <li>• Title: <code>머니로그랩 서버 깨우기 (14분 주기)</code></li>
                  <li>• URL: <code style={{ color: 'var(--color-accent-blue)', wordBreak: 'break-all' }}>{`${API_BASE_URL}/api/public/indices`}</code> (로그인 토큰이 필요 없는 공개 주소로, 인증 에러가 발생하지 않습니다!)</li>
                  <li>• Schedule: **Every 14 minutes** (14분마다 한 번씩 신호를 보내 서버를 상시 활성화 상태로 유지합니다.)</li>
                  <li style={{ fontSize: '11px', color: 'var(--color-accent-blue)' }}>* 이렇게 14분 주기로 설정해 두시면 서버가 절대 잠들지 않으며, 매일 아침 7시(KST)에 서버 내부 스케줄러가 알아서 뉴스 수집을 100% 정상 작동시킵니다.</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* API Error Warning Badge */}
      {dashboardData?.dailyAcorns?.generated?.error && (
        <div className="glass-card" style={{
          marginBottom: '30px', padding: '14px 20px', borderRadius: 'var(--border-radius-md)',
          background: 'rgba(255, 159, 28, 0.05)', borderColor: 'var(--color-accent-orange)',
          color: 'var(--color-accent-orange)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>⚠️ AI 엔진 호출 오류 감지:</strong> {dashboardData.dailyAcorns.generated.error}
            <br />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              (API 키가 만료/오류 상태이거나 요금이 청구되지 않아 사전 제작된 모의 시나리오 데이터로 로딩되었습니다. Render 환경변수의 API 키 설정을 점검해 주세요!)
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Progress Bar for Manual Harvesting */}
      {harvesting && (
        <div className="glass-card" style={{
          marginBottom: '30px', padding: '24px', borderRadius: 'var(--border-radius-md)',
          background: 'rgba(59, 130, 246, 0.03)', borderColor: 'var(--color-accent-blue)',
          display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Neon animated background pulse */}
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '3px',
            width: `${progress}%`, background: 'linear-gradient(90deg, var(--color-accent-blue), var(--bg-tertiary))',
            transition: 'width 0.3s ease-out'
          }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--color-accent-blue)' }} />
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {progressStatus}
              </span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-accent-blue)', fontFamily: 'var(--font-headers)' }}>
              {progress}%
            </span>
          </div>
          
          {/* Progress track */}
          <div style={{
            width: '100%', height: '10px', background: 'var(--bg-tertiary)',
            borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--color-card-border)'
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '5px', transition: 'width 0.3s ease-out',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
            }} />
          </div>
          
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: progress >= 15 ? 'var(--color-accent-blue)' : 'var(--color-text-muted)', transition: 'background 0.3s' }} />
              지표 수집 (15%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: progress >= 35 ? 'var(--color-accent-blue)' : 'var(--color-text-muted)', transition: 'background 0.3s' }} />
              코인 탐색 (35%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: progress >= 85 ? 'var(--color-accent-blue)' : 'var(--color-text-muted)', transition: 'background 0.3s' }} />
              AI 포스팅 작성 (85%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: progress >= 95 ? 'var(--color-accent-blue)' : 'var(--color-text-muted)', transition: 'background 0.3s' }} />
              뉴스레터 디자인 (95%)
            </div>
          </div>
        </div>
      )}

      {/* Status Notice Feedbacks */}
      {harvestMessage && (
        <div className="glass-card pulse-glowing" style={{
          marginBottom: '30px', padding: '14px 20px', borderRadius: 'var(--border-radius-md)',
          background: 'rgba(0, 245, 212, 0.05)', borderColor: 'var(--color-accent-emerald)',
          color: 'var(--color-accent-emerald)', fontSize: '14px', fontWeight: '600',
          textAlign: 'center'
        }}>
          {harvestMessage}
        </div>
      )}

      {/* Main Board Panel */}
      {dashboardData && dashboardData.dailyAcorns && dashboardData.dailyAcorns.generated ? (
        <div className="admin-grid">
          
          {/* Post Tabs list (Left column) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', paddingLeft: '8px' }}>
              오늘의 로기 수집 포스팅 리스트
            </span>
            
            {dashboardData.dailyAcorns.generated.posts.map(post => (
              <button
                key={post.category}
                onClick={() => setActiveTab(post.category)}
                style={{
                  background: activeTab === post.category ? 'rgba(197, 168, 128, 0.08)' : 'var(--bg-secondary)',
                  border: '1px solid',
                  borderColor: activeTab === post.category ? 'var(--color-accent-blue)' : 'var(--color-card-border)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '16px',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-headers)',
                    textTransform: 'uppercase', color: 'var(--color-accent-blue)', letterSpacing: '0.05em'
                  }}>
                    {post.category === 'economic' ? 'MACRO' : 
                     post.category === 'stock' ? 'STOCKS' :
                     post.category === 'bitgetCoin' ? 'CRYPTO (BITGET)' :
                     post.category === 'okxCoin' ? 'CRYPTO (OKX)' : 'REAL ESTATE'}
                  </span>
                  <FileCheck size={14} style={{ color: 'var(--color-accent-emerald)' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>
                  {post.recommendedTitle.replace('✅ ', '')}
                </div>
              </button>
            ))}
          </div>

          {/* Active Post Details & Copy (Right column) */}
          <div className="glass-card" style={{ padding: '30px' }}>
            {(() => {
              const activePost = dashboardData.dailyAcorns.generated.posts.find(p => p.category === activeTab);
              if (!activePost) return <p>포스팅을 로딩할 수 없습니다.</p>;

              return (
                <div>
                  
                  {/* Category & Copy Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid var(--color-card-border)', paddingBottom: '20px',
                    marginBottom: '24px'
                  }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-accent-emerald)', textTransform: 'uppercase' }}>
                        로기의 맞춤형 SEO 포스팅 초안
                      </span>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '4px', fontFamily: 'var(--font-headers)' }}>
                        {activeTab === 'economic' ? 'MACRO' :
                         activeTab === 'stock' ? 'STOCKS' :
                         activeTab === 'bitgetCoin' ? 'CRYPTO (BITGET)' :
                         activeTab === 'okxCoin' ? 'CRYPTO (OKX)' : 'REAL ESTATE'}
                      </h2>
                    </div>

                    <button
                      onClick={() => handleCopyPost(activePost)}
                      className="btn-primary"
                      style={{ padding: '10px 20px', fontSize: '13px' }}
                    >
                      {copiedId === activePost.category ? (
                        <>
                          <Check size={14} />
                          복사 완료! ✅
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          네이버 블로그용 전체 복사
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title Recommendations */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--color-accent-orange)', marginBottom: '10px', fontFamily: 'var(--font-headers)' }}>
                      💡 로기의 추천 블로그 제목 (후보 3개)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activePost.titles.map((title, idx) => (
                        <div key={idx} style={{
                          background: title.startsWith('✅') ? 'rgba(197, 168, 128, 0.04)' : 'var(--bg-tertiary)',
                          border: '1px solid',
                          borderColor: title.startsWith('✅') ? 'rgba(197, 168, 128, 0.15)' : 'var(--color-card-border)',
                          padding: '10px 16px', borderRadius: '8px', fontSize: '14px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          color: 'var(--color-text-primary)'
                        }}>
                          <span>{title}</span>
                          {title.startsWith('✅') && (
                            <span style={{ fontSize: '11px', color: 'var(--color-accent-emerald)', fontWeight: '700' }}>강력 추천</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upper Trailer box (스포일러 방지 오늘의 핵심 정리) */}
                  <div style={{
                    background: 'rgba(197, 168, 128, 0.03)', border: '1px solid rgba(197, 168, 128, 0.15)',
                    padding: '20px', borderRadius: 'var(--border-radius-md)', marginBottom: '24px'
                  }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--color-accent-blue)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🎬 오늘의 핵심 정리 예고편 (상단 박스)
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6', marginBottom: '12px', fontWeight: '500' }}>
                      {activePost.previewBox.trailerText}
                    </p>
                    <div style={{ borderTop: '1px dashed var(--color-card-border)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>지금 바로 할 것:</span>
                      <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {activePost.previewBox.todoSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '10px' }}>📄 본문 초안 내용 (주인장 톤앤매너)</h4>
                    <div style={{
                      background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)',
                      padding: '20px', borderRadius: 'var(--border-radius-md)', maxHeight: '350px',
                      overflowY: 'auto', fontSize: '14px', color: 'var(--color-text-secondary)',
                      lineHeight: '1.8', whiteSpace: 'pre-wrap'
                    }}>
                      {/* Highlight raw double equal signs visually for user edit review */}
                      {activePost.body.split(/(==.*?==)/g).map((chunk, index) => {
                        if (chunk.startsWith('==') && chunk.endsWith('==')) {
                          return (
                            <mark key={index} style={{
                              background: 'rgba(0, 245, 212, 0.15)', color: 'var(--color-accent-emerald)',
                              padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0,245,212,0.3)',
                              fontWeight: '600'
                            }}>
                              {chunk.replace(/==/g, '')}
                            </mark>
                          );
                        }
                        return chunk;
                      })}
                    </div>
                  </div>

                  {/* Pixabay Images keywords helper & hashtags */}
                  <div className="helper-grid">
                    <div style={{
                      background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)',
                      padding: '16px', borderRadius: 'var(--border-radius-md)'
                    }}>
                      <h5 style={{ fontSize: '13px', color: 'var(--color-accent-orange)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Image size={14} /> Pixabay 이미지 추천 키워드
                      </h5>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                        로기가 매칭해 둔 영문 키워드로 픽사베이에서 검색해 봐!
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {activePost.imageKeywords.map((kw, i) => (
                          <a 
                            key={i}
                            href={`https://pixabay.com/images/search/${encodeURIComponent(kw)}/`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              background: 'rgba(255, 159, 28, 0.08)', color: 'var(--color-accent-orange)',
                              fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '4px',
                              display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none'
                            }}
                          >
                            {kw}
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--bg-tertiary)', border: '1px solid var(--color-card-border)',
                      padding: '16px', borderRadius: 'var(--border-radius-md)'
                    }}>
                      <h5 style={{ fontSize: '13px', color: 'var(--color-accent-blue)', marginBottom: '8px' }}>
                        # 태그 목록
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {activePost.hashtags.map((tag, i) => (
                          <span key={i} style={{
                            background: 'rgba(37, 99, 235, 0.08)', color: 'var(--color-accent-blue)',
                            fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px'
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>

        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            아직 아침 7시 자동 데이터 수집이 동작하지 않았거나 데이터베이스가 비어있습니다.
          </p>
          <button onClick={handleManualHarvest} className="btn-primary">
            지금 즉시 경제 데이터 수집 & AI 글쓰기 실행하기 (ㄱㄱ) ⚡
          </button>
        </div>
      )}

    </div>
  );
}
