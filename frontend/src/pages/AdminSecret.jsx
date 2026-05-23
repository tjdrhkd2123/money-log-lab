import React, { useState, useEffect } from 'react';
import { 
  Lock, KeyRound, ArrowLeft, RefreshCw, Copy, Check, Users, 
  FileText, Activity, AlertCircle, FileCheck, ExternalLink, Image
} from 'lucide-react';

export default function AdminSecret({ onNavigateHome }) {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard states
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('economic');
  const [harvesting, setHarvesting] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [harvestMessage, setHarvestMessage] = useState('');

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
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
      } else {
        setError(data.message || '패스워드가 유효하지 않아!');
      }
    } catch (err) {
      setError('서버 연결에 실패했어. 백엔드가 켜져있는지 확인해줘!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setDashboardData(null);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/daily-acorns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setDashboardData(data);
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
    try {
      const response = await fetch('http://localhost:5000/api/admin/trigger-harvest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setDashboardData(data);
        setHarvestMessage('⚡ 수집 완료! 4대 포스팅 및 독자 뉴스레터 발송이 완료되었습니다!');
      } else {
        setHarvestMessage(`⚠️ 수집 중 오류: ${data.message}`);
      }
    } catch (err) {
      setHarvestMessage('⚠️ 서버 응답 오류가 발생했습니다.');
    } finally {
      setHarvesting(false);
      // Clear message after 5 seconds
      setTimeout(() => setHarvestMessage(''), 5000);
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
          
          <h2 style={{ fontSize: '20px', color: '#ffffff', fontFamily: 'var(--font-headers)', marginBottom: '8px' }}>
            로기 연구소 시크릿 룸
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            비밀번호를 입력해야 입장할 수 있습니다.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(5, 10, 20, 0.5)', border: '1px solid rgba(255,255,255,0.06)',
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
                  color: '#ffffff', fontSize: '14px', flex: '1', fontFamily: 'var(--font-body)'
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
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onNavigateHome}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#ffffff', borderRadius: '50%', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-headers)', color: '#ffffff' }}>
              🐿️ 로기의 시크릿 연구 대시보드
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              머니로그랩 네이버 블로그 복사 붙여넣기 및 수집 관리룸
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px', marginBottom: '30px'
        }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
            <div style={{ color: 'var(--color-accent-emerald)' }}><Users size={24} /></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>총 구독 이메일 수</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{dashboardData.subscribersCount} 명</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
            <div style={{ color: 'var(--color-accent-orange)' }}><FileText size={24} /></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>자동화 대기 포스팅</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>4 개 완료</h3>
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
        <div style={{
          display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', alignItems: 'start'
        }}>
          
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
                  background: activeTab === post.category ? 'rgba(0, 245, 212, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid',
                  borderColor: activeTab === post.category ? 'var(--color-accent-emerald)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '16px',
                  color: '#ffffff',
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
                    textTransform: 'uppercase', color: 'var(--color-accent-blue)'
                  }}>
                    {post.category === 'economic' ? '경제·글로벌' : 
                     post.category === 'stock' ? '국내 주식' :
                     post.category === 'coin' ? 'Bitget/OKX 코인' : '부동산 칼럼'}
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
                    borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px',
                    marginBottom: '24px'
                  }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-accent-emerald)', textTransform: 'uppercase' }}>
                        로기의 맞춤형 SEO 포스팅 초안
                      </span>
                      <h2 style={{ fontSize: '20px', color: '#ffffff', marginTop: '4px' }}>
                        {activeTab === 'economic' ? '📊 경제·글로벌 포스팅' :
                         activeTab === 'stock' ? '📈 주식 분석 포스팅' :
                         activeTab === 'coin' ? '🪙 가상자산 포스팅' : '🏠 부동산 칼럼'}
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
                          background: title.startsWith('✅') ? 'rgba(0, 245, 212, 0.04)' : 'rgba(255,255,255,0.01)',
                          border: '1px solid',
                          borderColor: title.startsWith('✅') ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255,255,255,0.04)',
                          padding: '10px 16px', borderRadius: '8px', fontSize: '14px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
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
                    background: 'rgba(0, 180, 216, 0.03)', border: '1px solid rgba(0, 180, 216, 0.15)',
                    padding: '20px', borderRadius: 'var(--border-radius-md)', marginBottom: '24px'
                  }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--color-accent-blue)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🎬 오늘의 핵심 정리 예고편 (상단 박스)
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6', marginBottom: '12px', fontWeight: '500' }}>
                      {activePost.previewBox.trailerText}
                    </p>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
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
                    <h4 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '10px' }}>📄 본문 초안 내용 (주인장 톤앤매너)</h4>
                    <div style={{
                      background: 'rgba(5, 10, 20, 0.4)', border: '1px solid rgba(255,255,255,0.04)',
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
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
                      background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
                      padding: '16px', borderRadius: 'var(--border-radius-md)'
                    }}>
                      <h5 style={{ fontSize: '13px', color: 'var(--color-accent-blue)', marginBottom: '8px' }}>
                        # 태그 목록
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {activePost.hashtags.map((tag, i) => (
                          <span key={i} style={{
                            background: 'rgba(0, 180, 216, 0.08)', color: 'var(--color-accent-blue)',
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
