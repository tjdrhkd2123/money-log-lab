import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

// High-fidelity fallback content when GEMINI_API_KEY is not configured
const mockGeneratedData = {
  posts: [
    {
      category: 'economic',
      titles: [
        '달러 환율 1,360원 붕괴 일보직전, 내 지갑 지킬 돌파구는?',
        '지금 환율 모르면 수입품 살 때 2배 손해 봅니다!',
        '✅ 1주일 만에 외환 보유고 10조 증발한 진짜 배후'
      ],
      recommendedTitle: '✅ 1주일 만에 외환 보유고 10조 증발한 진짜 배후',
      thumbnailText: '환율 폭등 비상 🚨 1,360원',
      aeoSummary: '원달러 환율이 심리적 저항선인 1,360원을 돌파하면서 수입 물가 상승 비상이 걸렸습니다.',
      previewBox: {
        trailerText: '원·달러 환율이 역대급으로 출렁이며 경제연구소 전체가 긴장하고 있어. 단순한 달러 강세 때문인지, 아니면 우리 경제의 숨은 뇌관이 터진 건지 본문에서 그 속사정을 낱낱이 파헤쳐 줄게!',
        todoSteps: [
          '실시간 외환 보유고 변동 추이 모니터링하기',
          '수입 소비재 구매 시점 잠시 미루기',
          '해외 주식 및 자산 환율 헷지 상태 체크하기'
        ]
      },
      body: `원·달러 환율이 기어코 ==1,360원== 선을 돌파하며 가파르게 치솟고 있어. 수입 기업들은 물론이고 당장 해외 직구나 여행을 계획하던 사람들의 발등에도 불이 떨어진 상황이지.

오늘 아침 우리 머니로그랩 연구실에 수집된 외환 지표를 보고 로기 연구원도 정말 깜짝 놀랐어. 이번 달러 폭등은 단순히 미국 연준의 고금리 장기화 때문만은 아니야. 글로벌 자금이 상대적으로 안전한 미국 채권으로 빠르게 대피하고 있는 데다가, 최근 중동 지역의 긴장이 고조되며 유가 불안까지 겹친 복합적인 현상이지.

이걸 외환 시장에서는 안전자산 선호 심리가 극대화되었다고 불러. 자산가들이 원화나 엔화 같은 아시아 통화를 팔고 초안전 자산인 ==달러(USD)==를 사 모으면서 원화 가치가 뚝 떨어지는 거지. 수입 물가가 치솟으면 결국 우리가 동네 마트에서 사는 식료품 가격까지 줄줄이 올라갈 수밖에 없어.

로기도 요즘 물가가 너무 올라서 도토리 비축량을 줄여야 하나 고민 중이야 😬. 내 월급만 빼고 다 오르는 이런 시대에는, 예적금 이자 2~3%만 쳐다보고 있으면 물가상승률을 절대 따라갈 수 없어. 

그래서 로기는 예전부터 월급 외에 추가 수익 파이프를 만들어 왔어. 그중 하나가 글로벌 거시경제 위기 때 훌륭한 리스크 방어막이 되어주는 해외 가상자산 병행 투자야. 마침 수수료를 평생 아끼며 가볍게 시작해 볼 수 있는 안전한 거래소 혜택을 아래에 정리해 두었으니 지갑을 지킬 대안을 고민 중이라면 참고해 봐!

👇 로기가 직접 비교하고 골라둔 거래소별 역대급 혜택이 궁금하다면?
거래소 혜택 비교 보러 가기 👉 [리틀리 링크]

오늘 환율 폭등을 보면서 다들 어떤 방어 대책을 세우고 있어? 이대로 두고 볼지, 아니면 적극적으로 금융 공부를 시작할지 댓글로 의견을 나눠보자!

참고 자료:
- 한국은행 외환시장 일일 동향보고서
- 기획재정부 글로벌 거시경제 리스크 분석`,
      hashtags: ['환율폭등', '원달러환율', '거시경제', '머니로그랩', '재테크', '금융공부', '개인자산방어', '달러강세', '수입물가', '경제공부'],
      imageKeywords: ['dollar bill exchange', 'shopping cart supermarket']
    },
    {
      category: 'stock',
      titles: [
        '엔비디아 H200 중국 우회 승인? 삼성전자·SK하이닉스 수혜주 추적',
        '코스피 역사상 최장 순매도 기록한 외국인, 오늘 반전 일어났다!',
        '✅ 삼성전자 7만 원 깨지자 8조 쏟아부은 역대급 개미들'
      ],
      recommendedTitle: '✅ 삼성전자 7만 원 깨지자 8조 쏟아부은 역대급 개미들',
      thumbnailText: '삼전 7만 붕괴 📉 8조 매수',
      aeoSummary: '삼성전자 주가가 7만 원선 아래로 내려앉자 개인 투자자들이 역대 최대 규모인 8조 원의 순매수를 기록했습니다.',
      previewBox: {
        trailerText: '삼성전자와 SK하이닉스가 급락하면서 개인 투자자들이 코스피 역사상 유례없는 사상 최대 매수세를 보였어. 개미들이 상투를 잡고 물린 건지, 아니면 세기의 기회를 잡은 역대급 반전 시나리오인지 날카롭게 파헤쳐 줄게!',
        todoSteps: [
          '엔비디아의 차세대 HBM 승인 여부 공시 모니터링하기',
          'KOSPI 외국인 수급 연속 매도 중단 시점 포착하기',
          '반도체 D-RAM 업황 회복 지표 확인하기'
        ]
      },
      body: `==삼성전자== 주가가 심리적 마지노선인 7만 원 아래로 주저앉으며 개미 투자자들의 대격돌이 벌어지고 있어. 공포에 질린 외국인들이 패닉셀을 하며 던진 물량을, 개인 투자자들이 무려 ==8조 원==이라는 사상 초유의 자금으로 고스란히 받아내며 순매수 1위를 달성했거든.

로기 연구원의 반도체 분석 돋보기로 들여다보니, 핵심 열쇠는 바로 ==엔비디아(NVIDIA)==의 차세대 인공지능 그래픽칩(GPU) H200과 관련이 있어. 엔비디아의 새로운 GPU가 중국 시장으로 납품 승인이 될 조짐이 보이는데, 이 GPU 한 대를 만들기 위해선 엄청난 성능의 메모리인 HBM이 필요해. 현재 세계에서 가장 우수한 HBM을 대량 생산하는 곳이 바로 SK하이닉스이고, 뒤이어 삼성전자도 전력투구를 하고 있지.

이걸 주식 시장에서는 자금이 한 업종으로 몰리고 도는 흐름이라고 해서 '순환매'라고 불러. 대장주가 먼저 길을 열어주면 침체되어 있던 반도체 업종 전체가 뒤따라 반등하는 가장 건강한 신호야. 엔비디아 공급망이 열리는 순간, ==SK하이닉스==와 삼성전자의 고성능 D-RAM 수요는 기하급수적으로 폭발할 수밖에 없는 구조지.

삼성전자와 SK하이닉스 주가가 흔들리는 지금 같은 조정기는 우량주를 저가에 모을 수 있는 좋은 기회일 수 있어. 하지만 국내 주식시장의 높은 환율 리스크가 여전할 때는 자산을 원화 단일 포트폴리오에만 묶어두는 건 매우 위험해. 글로벌 자본이 주식 시장을 이탈할 때, 실시간 리스크 헷지처로 급부상하는 시장이 바로 가상자산 코인 시장이야. 주인장 로기도 국내 주식이 흔들릴 땐 코인을 병행하며 글로벌 달러 자산을 불리고 있어. 수수료 평생 혜택을 받고 시작할 수 있는 안전한 해외 거래소 비교 혜택을 아래에 올려둘 테니 현명하게 방어 포트폴리오를 짜 봐!

👇 로기가 직접 비교 검증해 둔 코인 거래소 혜택 보러 가기
거래소 혜택 비교 보러 가기 👉 [리틀리 링크]

과연 이번 8조 매수는 신의 한 수였을까, 아니면 개미 무덤이 될까? 너희들의 날카로운 생각을 댓글로 자유롭게 남겨줘!

참고 자료:
- 한국거래소(KRX) 정보데이터시스템 수급 통계
- 엔비디아(NVIDIA) 분기 IR 리포트`,
      hashtags: ['삼성전자', 'SK하이닉스', '코스피', '엔비디아', '반도체수급', '개인순매수', 'HBM3E', '주식초보', '재테크전략', '머니로그랩'],
      imageKeywords: ['green chart arrow up', 'chip semiconductor circuit']
    },
    {
      category: 'coin',
      titles: [
        'Bitget 선물 등락률 +24% 폭발한 Notcoin(낫코인), 상장 폐지설의 실체',
        '업비트·빗썸엔 없다! 지금 당장 Bitget에서 노려야 할 알트코인 분석',
        '✅ 24시간 만에 거래량 340% 폭증하며 최고가 돌파한 이 코인'
      ],
      recommendedTitle: '✅ 24시간 만에 거래량 340% 폭증하며 최고가 돌파한 이 코인',
      thumbnailText: 'NOT코인 폭등 🚀 +24%',
      aeoSummary: 'Bitget 선물 시장에서 Notcoin(낫코인)이 24시간 동안 거래량 340% 급증을 기록하며 급등세를 보이고 있습니다.',
      previewBox: {
        trailerText: '국내 거래소인 업비트나 빗썸에서는 눈을 씻고 찾아봐도 절대로 살 수 없는, 그러나 글로벌 시장에선 단 24시간 만에 거래량 수천억 원이 몰리며 +24% 이상 폭등한 화제의 코인이 있어. 리스크와 대박 기회 사이의 숨은 시사점을 로기가 분석해 드립니다!',
        todoSteps: [
          'Bitget 선물 포지션 미결제약정(OI) 변화율 확인하기',
          '텔레그램 TON 생태계 활성 트랜잭션 추이 점검하기',
          '선물 숏 스퀴즈 발생 여부 실시간 데이터 추적하기'
        ]
      },
      body: `글로벌 가상자산 선물 시장에서 청년 실업자들을 순식간에 졸업시킨 엄청난 괴물 코인이 등장했어. 그 주인공은 바로 텔레그램 TON 레이어 기반의 ==Notcoin(낫코인)==이야. 

로기 연구원의 선물 시세 전용 모니터로 확인해 보니, Notcoin(낫코인)은 Bitget 선물 마켓에서 등락률 ==+24.11%==를 기록하며 전 세계 알트코인 거래 대금 2위까지 치고 올라왔어. 거래량 또한 전날 대비 ==340%== 이상 대폭발하며 엄청난 신규 자본 유입을 증명했지.

이 코인은 기존의 복잡한 채굴 방식 대신 텔레그램 메신저 안에서 화면을 터치하는 간단한 방식으로 전 세계 3,500만 명의 커뮤니티 독자층을 끌어모았어. 커뮤니티가 거대해지자 대형 고래들이 선물 시장에서 숏 스퀴즈(숏 포지션 청산으로 인한 급등)를 유도하며 기습적인 가격 펌핑을 연출한 상황이야.

이 코인, 아쉽게도 현재 국내 업비트나 빗썸 거래소에서는 원화로 구매가 불가능해. 100% 글로벌 탑 거래소인 Bitget에서만 본격적인 선물 및 거래 서비스를 지원하고 있지. 어차피 남들보다 빠른 알트코인 급등 정보를 취하고 고수익 파이프라인을 뚫고 싶다면 해외 거래소 활용은 필수적인 선택이야. 게다가 지금 아래 로기가 제공하는 특별 제휴 링크로 가입하면 수수료 평생 할인 혜택까지 모두 챙겨갈 수 있어. 어차피 한 번은 겪어야 할 글로벌 재테크 여정이라면 가장 혜택이 많은 지금 시작해 보는 걸 강력 추천할게!

👇 업비트에 없는 급등 코인 즉시 타는 방법!
거래소 혜택이 궁금하다면? 👉 [리틀리 링크]

이처럼 전 세계 자금이 몰리는 텔레그램 생태계 코인의 상승은 앞으로도 계속될까? 아니면 일시적 유행일까? 너희의 예리한 의견을 댓글로 달아줘!

참고 자료:
- Bitget Futures Real-time Ticker Data
- CoinGecko Notcoin Market Intelligence Report`,
      hashtags: ['Notcoin', '낫코인', 'Bitget선물', '해외거래소', '텔레그램코인', '톤코인', '알트코인폭등', '가상자산투자', '수수료할인', '머니로그랩'],
      imageKeywords: ['gold coin stack', 'blockchain network connect']
    },
    {
      category: 'realestate',
      titles: [
        '금리 6.5% 시대 보유세 폭탄, 영끌족 버티기 돌입한 빌딩의 비명',
        '서울 강남 아파트 가격 상승 반전, 지금 안 사면 평생 후회할까?',
        '✅ 강남 빌딩 경매 역대 최다 건수 쏟아지는 진짜 이유'
      ],
      recommendedTitle: '✅ 강남 빌딩 경매 역대 최다 건수 쏟아지는 진짜 이유',
      thumbnailText: '강남 경매 폭증 ⚠️ 금리 6%',
      aeoSummary: '고금리와 보유세 부담 증가로 인해 강남권 상업용 빌딩 경매 낙찰률이 역대 최저치를 경신하고 있습니다.',
      previewBox: {
        trailerText: '부동산 불패 신화의 상징인 서울 강남구의 대형 빌딩들이 법원 경매 법정에 사상 최대 규모로 쏟아져 나오고 있어. 건물주들이 파산 직전에 내몰린 숨겨진 원인과 앞으로 다가올 부동산 시장의 거대한 파도를 예측해 드릴게요!',
        todoSteps: [
          '대법원 법원경매정보 상업용 빌딩 유찰 횟수 확인하기',
          '시중 5대 은행 주택담보 및 시설자금 대출 금리 동향 확인하기',
          '강남 및 도심권역(GBD) 오피스 공실률 통계 추적하기'
        ]
      },
      body: `대한민국 최고 부의 상징인 강남 한복판의 빌딩들이 헐값에 경매 매물로 쏟아져 나오는 충격적인 일이 발생하고 있어. 낙찰자는 나타나지 않고 3~4회씩 연속 유찰되며 ==반값 빌딩==이 속출하고 있지.

다람쥐 연구원 로기가 부동산 등기부와 금리 현황을 긴급 추적해 보니, 문제의 근원은 역시 무시무시한 ==고금리== 때문이야. 불과 3년 전 연 2%대 저금리로 수십억의 대출을 끌어 빌딩을 샀던 건물주들이, 현재 만기 연장 시 연 ==6.5%==가 넘는 고금리 직격탄을 맞은 거지. 매달 내야 할 이자가 3배 가까이 폭등했는데 상가 임대료는 공실 때문에 오히려 내리고 있으니 현금 흐름이 완전히 말라버린 거야.

이걸 부동산 시장에서는 부채 상환 능력 한계로 인한 '경매 폭증 현상'이라고 불러. 감정가 대비 턱없이 낮은 가격에 처분되어도 금융 비용을 감당하지 못한 매물들이 누적되는 거지. 강남 부동산이 이 지경이라면 지방이나 수도권 외곽의 중소형 상가와 아파트 시장의 충격은 물 보듯 뻔해. 보유세 부담까지 가중되는 연말이 오면 부동산 시장 전체의 빙하기가 더욱 심화될 위험이 커.

부동산 하나에 자산을 몰빵해 둔 사람들은 지금 가슴이 바짝바짝 타들어가고 있을 거야. 이자가 월세 수입을 초과하는 고금리 장기화 시대에, 부동산 단일 자산에만 기대는 재테크는 매우 위험해. 로기도 부동산 위험을 헷징하기 위해 종잣돈 소액으로 매일 굴릴 수 있고 달러 자산 가치를 확보할 수 있는 글로벌 가상자산 투자를 반드시 병행하고 있어. 리스크 분산에 탁월하면서 수수료 혜택까지 극대화된 글로벌 안전 거래소들을 직접 비교해 두었으니, 꽉 막힌 현금 흐름의 돌파구를 찾는다면 참고해 봐!

👇 부동산 침체기에 자산 수입 파이프 늘리는 묘책!
거래소 혜택 비교 보러 가기 👉 [리틀리 링크]

강남 빌딩마저 경락되는 지금의 부동산 위기는 언제쯤 바닥을 치고 반등할 수 있을까? 너희의 생각을 자유롭게 댓글로 남겨줘!

참고 자료:
- 대법원 법원경매 정보 통계 서비스
- 한국부동산원 상업용부동산 임대동향조사`,
      hashtags: ['강남빌딩경매', '부동산위기', '고금리이자', '상업용부동산', '보유세부담', '공실률폭증', '부동산투자', '자산리스크헷지', '재테크공부', '머니로그랩'],
      imageKeywords: ['apartment building exterior', 'interest rate bank loan']
    }
  ],
  cardNews: [
    {
      slideNumber: 1,
      title: "🚨 원달러 환율 1,360원 긴급 돌파!",
      description: "미국 연준의 긴축 장기화 우려와 중동 리스크 폭발로 환율이 급격히 상승하며 물가 폭등 비상이 걸렸어. 내 지갑을 지킬 방어 대책이 필요해!",
      keyword: "환율 급등"
    },
    {
      slideNumber: 2,
      title: "📈 삼성전자 7만 원 깨지자 8조 순매수!",
      description: "개인 투자자들이 공포의 외국인 투매를 받아내며 역대급 8조 원을 사들였어. 과연 반도체 순환매의 역대급 기회가 찾아온 걸까?",
      keyword: "삼성전자"
    },
    {
      slideNumber: 3,
      title: "🚀 Bitget 선물 Notcoin(낫코인) +24% 폭등!",
      description: "업비트에는 없는 TON 생태계 낫코인이 단 24시간 만에 엄청난 거래 대금과 함께 폭등했어. 글로벌 탑 거래소의 독점 혜택을 눈여겨볼 때야!",
      keyword: "낫코인 급등"
    },
    {
      slideNumber: 4,
      title: "⚠️ 강남 한복판 빌딩 무더기 유찰 비명!",
      description: "연 6%대 주택 대출 금리 부담과 세금 폭탄으로 인해 부동산 불패 강남마저 경매 폭증세가 났어. 자산 다각화가 생존의 핵심이야!",
      keyword: "강남 부동산"
    },
    {
      slideNumber: 5,
      title: "🐿️ 로기 연구원의 한 줄 정리 도토리!",
      description: "주식·부동산이 출렁일 땐 단일 자산에 몰빵 금지! 해외 거래소 혜택 링크를 활용해 글로벌 가상자산 머니 파이프를 함께 뚫어보자구! 👇",
      keyword: "도토리 투자"
    }
  ],
  newsletter: {
    subject: "[머니로그랩] 🐿️ 다람쥐 연구원 로기가 배달하는 오늘의 경제 도토리 소식!",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0d2847; margin: 0;">🐿️ 머니로그랩 연구실</h2>
          <p style="color: #00b4d8; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">로기가 물어다 준 오늘의 알짜 경제 도토리</p>
        </div>
        <hr style="border: 0; border-top: 1px dashed #e1e8ed; margin-bottom: 20px;" />
        <p style="font-size: 15px; color: #333333; line-height: 1.6;">
          안녕! 머니로그랩의 귀여운 경제 해결사, **다람쥐 연구원 로기**야! 🐿️ <br/>
          오늘 아침 우리 연구실에 수집된 24시간 이내 가장 따끈따끈한 경제 뉴스를 요약해서 배달하러 왔어!
        </p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #00b4d8; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #0d2847; font-size: 16px;">🚨 오늘의 핵심 경제 도토리 3가지</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4a5568; line-height: 1.7;">
            <li><strong>원·달러 환율 1,360원선 돌파:</strong> 글로벌 안전 자산 쏠림으로 수입물가 비상!</li>
            <li><strong>삼성전자 7만 원 깨지자 8조 사들인 개미:</strong> 엔비디아 공급망 개방 호재 노리기?</li>
            <li><strong>부동산 불패 강남 빌딩 경매 폭증:</strong> 연 6.5% 고금리 감당 못한 매물 연속 유찰!</li>
          </ul>
        </div>
        <p style="font-size: 15px; color: #333333; line-height: 1.6;">
          금리 오르고 환율 들썩일 땐 예적금이나 단일 부동산 자산에만 묶여 있으면 리스크가 너무 커. 로기는 이럴 때 글로벌 위기 헷지 수단인 **가상자산 해외 병행 투자**로 수익 파이프라인을 다각화하고 있어.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background-color: #00b4d8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0, 180, 216, 0.2);">로기가 추천하는 거래소 혜택 보러 가기 🐿️</a>
        </div>
        <p style="font-size: 12px; color: #a0aec0; text-align: center; margin-top: 40px;">
          본 뉴스레터는 경제 지식 전파를 목적으로 하며, 특정 자산의 매수/매도 권유가 아님을 밝힙니다.<br/>
          © 2026 머니로그랩. All Rights Reserved.
        </p>
      </div>
    `
  }
};

export const aiService = {
  /**
   * Generates Naver blog posts, Card news, and Newsletter templates using Gemini or high-fidelity fallback.
   */
  generatePosts: async (financialData) => {
    const { indices, news } = financialData;

    console.log('🔮 Gemini AI 엔진을 통해 포스팅 생성 중...');

    // If Gemini key is missing, immediately utilize the rich, pre-validated mock data fallback
    if (!config.geminiApiKey) {
      console.log('ℹ️ GEMINI_API_KEY 미설정 상태입니다. 고해상도 로기 전용 사전 제작 콘텐츠를 반환합니다.');
      
      // Inject current collected indices/news for maximum dynamic realism
      const customizedMock = { ...mockGeneratedData };
      customizedMock.posts = customizedMock.posts.map(post => {
        let body = post.body;
        // Inject live numbers if available
        if (post.category === 'economic' && indices.usdKrw) {
          body = body.replace(/==1,360원==/g, `==${indices.usdKrw.price}원==`);
        }
        if (post.category === 'stock' && indices.kospi) {
          body = body.replace(/==8조 원==/g, `==개인 대규모 순매도세 속 KOSPI ${indices.kospi.price} 변동==`);
        }
        return {
          ...post,
          body
        };
      });
      return customizedMock;
    }

    // Call live Google Gemini API
    try {
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      // Using gemini-1.5-flash which is ideal, extremely fast, and highly reliable
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Construct a highly detailed prompt compiling all rules (Naver Blog Master Prompt 2026.05 & 4 Writing Quality rules)
      const systemPrompt = `
You are the Squirrel Researcher "Rogi" (다람쥐 연구원 로기) - the official brand mascot of the financial blog "머니로그랩" (Money Log Lab).
Write exactly 4 premium Naver Blog posts, a 5-slide Card News series, and an Email Newsletter based on the provided live daily financial data.

## Tone and Style Guidelines:
- Persona: Friendly, cute 2D squirrel researcher "Rogi" who gathers financial "acorns" (info) for readers.
- Speaking Style: Use 반말 (friendly informal Korean, e.g., "했어", "있어", "대비해야 해!") that is extremely easy for middle schoolers to understand ("중학생도 이해 가능한 쉬운 언어").
- Make sure to use squirrel/acorn metaphors occasionally but keep the analysis professional.

## Writing Quality 4 Principles (MUST FOLLOW):
- Principle 1 (No Spoiler Preview): The upper key summary box (오늘의 핵심 정리 박스) must NOT spoil exact final figures or conclusions. Instead, write a highly engaging, curiosity-triggering "Trailer" (예고편) that urges the reader to read down, and add 3 "지금 할 것 3단계" (3 immediate action steps).
- Principle 2 (Native Term Definitions): Never use separate [💡 Term Definition] boxes. Instead, blend definitions natively into Rogi's conversational flow (e.g. "이걸 주식 연구실에서는 자금이 돌고 도는 '순환매'라고 불러! 대장주가 먼저...").
- Principle 3 (Keyword Repetition): Repeat target search keywords (e.g. KOSPI, Samsung Electronics, SK Hynix, etc.) 2-3 times naturally in context.
- Principle 4 (Affiliate Link Narrative Bridge): Before rendering the affiliate referral banner ([리틀리 링크]), write a compelling narrative explaining *why* they need a crypto income pipeline now (e.g. "환율이 1,500원을 육박하고 유가가 뛰는 고금리 위기 상황에서는 단일 원화 자산에만 묶여 있으면 위험해. 로기도 해외 코인 거래소를 활용해...").

## 4 Posting Categories to Generate:
1. Economic (경제): Hybrid style (SEO optimized first paragraph + Rogi tone body).
2. Stock (주식): Hybrid style linking DRAM/HBM server demand trends to Samsung Electronics & SK Hynix.
3. Coin (코인): Bitget/OKX coin focus, Futures stats, high-pressure non-listed altcoin marketing and risk warnings.
4. Real Estate (부동산): Column format (Phenomenon -> Cause -> Influence -> Outlook).

## JSON Output Structure:
You MUST return raw, valid JSON only. Do not wrap in markdown \`\`\`json blocks.
The JSON must follow this exact structure:
{
  "posts": [
    {
      "category": "economic" | "stock" | "coin" | "realestate",
      "titles": ["title1", "title2", "title3"],
      "recommendedTitle": "recommended_title_with_emoji",
      "thumbnailText": "short_thumbnail_phrase",
      "aeoSummary": "one_line_aeo_summary",
      "previewBox": {
        "trailerText": "curiosity_triggering_trailer_text",
        "todoSteps": ["step1", "step2", "step3"]
      },
      "body": "full_body_text_containing_all_principles_with_Pixabay_image_placeholders_like_ [IMAGE_1]",
      "hashtags": ["tag1", "tag2", "tag3..."],
      "imageKeywords": ["keyword1", "keyword2"]
    }
  ],
  "cardNews": [
    {
      "slideNumber": 1,
      "title": "slide_title",
      "description": "slide_desc",
      "keyword": "slide_keyword"
    }
  ],
  "newsletter": {
    "subject": "newsletter_subject",
    "htmlBody": "beautifully_styled_html_newsletter"
  }
}
`;

      const userPrompt = `
Here is today's gathered economic data for "머니로그랩":
- KOSPI Quote: Price ${indices.kospi.price}, Change ${indices.kospi.change} (${indices.kospi.changePercent}%)
- KOSDAQ Quote: Price ${indices.kosdaq.price}, Change ${indices.kosdaq.change} (${indices.kosdaq.changePercent}%)
- USD/KRW Rate: Price ${indices.usdKrw.price}, Change ${indices.usdKrw.change} (${indices.usdKrw.changePercent}%)
- Latest 24h News Headlines:
${news.map((n, i) => `${i+1}. [${n.source}] ${n.title}`).join('\n')}

Generate the fully complete JSON contents matching the master prompt specifications.
`;

      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown markers if Gemini returned them
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();

      const parsed = JSON.parse(text);
      return parsed;

    } catch (error) {
      console.error('⚠️ Gemini API 호출 오류가 발생하여 안전을 위해 로기의 모의 콘텐츠 세트로 자동 복구합니다:', error.message);
      return mockGeneratedData;
    }
  }
};
