import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// High-fidelity fallback content conforming exactly to the Naver Blog Master Prompt 2026.05
const mockGeneratedData = {
  posts: [
    {
      category: 'economic',
      titles: [
        '달러 환율 1,507원 긴급 돌파, 내 지갑 지킬 탈출구는?',
        '지금 환율 모르면 평생 번 돈 절반 날아갑니다!',
        '✅ 1주일 만에 외환 보유고 급락한 배후와 달러 긴급 진단'
      ],
      recommendedTitle: '✅ 1주일 만에 외환 보유고 급락한 배후와 달러 긴급 진단',
      thumbnailText: '환율 폭등 비상 🚨 1,507원',
      aeoSummary: '원달러 환율이 심리적 저항선인 1,507원을 돌파하면서 수입 물가 상승 비상이 걸렸습니다.',
      previewBox: {
        trailerText: '원·달러 환율이 역대급으로 출렁이며 경제연구소 전체가 긴장하고 있어. 단순한 달러 강세 때문인지, 아니면 우리 경제의 숨은 뇌관이 터진 건지 본문에서 그 속사정을 낱낱이 파헤쳐 줄게!',
        todoSteps: [
          '실시간 외환 보유고 변동 추이 모니터링하기',
          '수입 소비재 구매 시점 잠시 미루기',
          '해외 주식 및 자산 환율 헷지 상태 체크하기'
        ]
      },
      body: `[IMAGE_1]
원·달러 환율이 기어코 1,507원 선을 돌파하며 가파르게 치솟고 있어. 수입 기업들은 물론이고 당장 해외 직구나 여행을 계획하던 사람들의 발등에도 불이 떨어진 상황이지.

오늘 아침 우리 머니로그랩 연구실에 수집된 외환 지표를 보고 로기 연구원도 정말 깜짝 놀랐어. 이번 달러 폭등은 단순히 미국 연준의 고금리 장기화 때문만은 아니야. 글로벌 자금이 상대적으로 안전한 미국 채권으로 빠르게 대피하고 있는 데다가, 최근 중동 지역의 긴장이 고조되며 유가 불안까지 겹친 복합적인 현상이지.

이걸 외환 시장에서는 안전자산 선호 심리가 극대화되었다고 불러. 자산가들이 원화나 엔화 같은 아시아 통화를 팔고 초안전 자산인 달러(USD)를 사 모으면서 원화 가치가 뚝 떨어지는 거지. 수입 물가가 치솟으면 결국 우리가 동네 마트에서 사는 식료품 가격까지 줄줄이 올라갈 수밖에 없어.

로기도 요즘 물가가 너무 올라서 도토리 비축량을 줄여야 하나 고민 중이야 😬. 내 월급만 빼고 다 오르는 이런 시대에는, 예적금 이자 2~3%만 쳐다보고 있으면 물가상승률을 절대 따라갈 수 없어. 

[IMAGE_2]

주인장이 하고 있는 것들:
1. 실시간 달러 인덱스 차트 모니터링 및 헤징 전략 수립
2. 수입 소비재 구입 보류 및 현금 비축량 확대
3. 글로벌 위기 헷지 채널 구축: 유가가 오르고 금리가 묶이면 예금·적금으로는 물가를 못 따라가요. 주인장은 이럴 때 코인 시장을 병행 수익 채널로 쓰는데 생각보다 진입 장벽이 낮아요. 거래소 선택만 잘 해도 수수료를 아끼며 안전하게 굴릴 수 있어서 아래에 혜택을 정리해뒀어요. [리틀리 링크]

Q. 오늘 환율 폭등을 보면서 다들 어떤 방어 대책을 세우고 있어? 댓글로 의견을 나눠보자!

----------------------------------
[내부 링크]
- [내부 링크 1] 머니로그랩 이전 환율 분석글 보러가기
- [내부 링크 2] 머니로그랩 추천 경제 정보
- [내부 링크 3] 로기가 물어다 준 경제 도토리`,
      hashtags: ['환율폭등', '원달러환율', '거시경제', '머니로그랩', '재테크', '금융공부', '개인자산방어', '달러강세', '수입물가', '경제공부'],
      imageKeywords: ['dollar bill exchange', 'shopping cart supermarket']
    },
    {
      category: 'stock',
      titles: [
        '엔비디아 H200 중국 승인 임박? 삼성전자·SK하이닉스 수혜주 추적',
        '코스피 외국인 대규모 순매수 전환, 반등 랠리 시작될까?',
        '✅ 삼성전자 30만 원 깨지자 8조 쏟아부은 개인들의 선택'
      ],
      recommendedTitle: '✅ 삼성전자 30만 원 깨지자 8조 쏟아부은 개인들의 선택',
      thumbnailText: '삼전 30만 붕괴 📉 8조 매수',
      aeoSummary: '삼성전자 주가가 30만 원선 아래로 내려앉자 개인 투자자들이 역대 최대 규모인 8조 원의 순매수를 기록했습니다.',
      previewBox: {
        trailerText: '삼성전자와 SK하이닉스가 급락하면서 개인 투자자들이 코스피 역사상 유례없는 사상 최대 매수세를 보였어. 개미들이 상투를 잡고 물린 건지, 아니면 세기의 기회를 잡은 역대급 반전 시나리오인지 날카롭게 파헤쳐 줄게!',
        todoSteps: [
          '엔비디아의 차세대 HBM 승인 여부 공시 모니터링하기',
          'KOSPI 외국인 수급 연속 매도 중단 시점 포착하기',
          '반도체 D-RAM 업황 회복 지표 확인하기'
        ]
      },
      body: `[IMAGE_1]
삼성전자 주가가 심리적 마지노선인 30만 원 아래로 주저앉으며 개미 투자자들의 대격돌이 벌어지고 있어. 공포에 질린 외국인들이 패닉셀을 하며 던진 물량을, 개인 투자자들이 무려 8조 원이라는 사상 초유 of 자금으로 고스란히 받아내며 순매수 1위를 달성했거든.

로기 연구원의 반도체 분석 돋보기로 들여다보니, 핵심 열쇠는 바로 엔비디아(NVIDIA)의 차세대 인공지능 그래픽칩(GPU) H200과 관련이 있어. 엔비디아의 새로운 GPU가 중국 시장으로 납품 승인이 될 조짐이 보이는데, 이 GPU 한 대를 만들기 위해선 엄청난 성능의 메모리인 HBM이 필요해. 현재 세계에서 가장 우수한 HBM을 대량 생산하는 곳이 바로 SK하이닉스이고, 뒤이어 삼성전자도 전력투구를 하고 있지.

이걸 주식 시장에서는 자금이 한 업종으로 몰리고 도는 흐름이라고 해서 '순환매'라고 불러. 대장주가 먼저 길을 열어주면 침체되어 있던 반도체 업종 전체가 뒤따라 반등하는 가장 건강한 신호야. 엔비디아 공급망이 열리는 순간, SK하이닉스와 삼성전자의 고성능 D-RAM 수요는 기하급수적으로 폭발할 수밖에 없는 구조지.

[IMAGE_2]

주인장이 하고 있는 것들:
1. 외국인 및 기관 수급 동향 매일 점검
2. 삼성전자와 SK하이닉스 분할 저점 매수 진행
3. 국내 주식 리스크 분산하기: 환율이 1,500원을 넘나들 때는 주식 하나만 보고 있으면 리스크를 다 짊어지는 셈이에요. 글로벌 자본이 주식 시장에서 빠질 때 일부는 코인 시장으로 이동하거든요. 주인장도 주식이 이렇게 흔들릴 때 코인을 병행하면서 분산하고 있어요. 마침 수수료 아끼면서 시작하기 좋은 거래소 혜택을 정리해뒀으니 참고해보세요. [리틀리 링크]

Q. 과연 이번 8조 매수는 신의 한 수였을까, 아니면 개미 무덤이 될까? 댓글로 자유롭게 남겨줘!

----------------------------------
[내부 링크]
- [내부 링크 1] 머니로그랩 이전 반도체 분석글 보러가기
- [내부 링크 2] 머니로그랩 추천 경제 정보
- [내부 링크 3] 로기가 물어다 준 경제 도토리`,
      hashtags: ['삼성전자', 'SK하이닉스', '코스피', '엔비디아', '반도체수급', '개인순매수', 'HBM3E', '주식초보', '재테크전략', '머니로그랩'],
      imageKeywords: ['green chart arrow up', 'chip semiconductor circuit']
    },
    {
      category: 'bitgetCoin',
      titles: [
        'Bitget 선물 등락률 +24% 폭발한 Notcoin(낫코인) 상장 폐지설의 실체',
        '업비트·빗썸엔 없다! 지금 당장 Bitget에서 노려야 할 알트코인 분석',
        '✅ Bitget 단 24시간 만에 거래량 340% 폭증하며 최고가 돌파한 화제의 코인'
      ],
      recommendedTitle: '✅ Bitget 단 24시간 만에 거래량 340% 폭증하며 최고가 돌파한 화제의 코인',
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
      body: `[IMAGE_1]
글로벌 가상자산 선물 시장에서 청년 실업자들을 순식간에 졸업시킨 엄청난 괴물 코인이 등장했어. 그 주인공은 바로 텔레그램 TON 레이어 기반의 Notcoin(낫코인)이야. 

로기 연구원의 선물 시세 전용 모니터로 확인해 보니, Notcoin(낫코인)은 Bitget 선물 마켓에서 등락률 +24.11%를 기록하며 전 세계 알트코인 거래 대금 2위까지 치고 올라왔어. 거래량 또한 전날 대비 340% 이상 대폭발하며 엄청난 신규 자본 유입을 증명했지.

이 코인은 기존의 복잡한 채굴 방식 대신 텔레그램 메신저 안에서 화면을 터치하는 간단한 방식으로 전 세계 3,500만 명의 커뮤니티 독자층을 끌어모았어. 커뮤니티가 거대해지자 대형 고래들이 선물 시장에서 숏 스퀴즈(선물 시장에서 공매도 포지션이 청산되며 급격히 매수세가 붙어 폭등하는 현상)를 유도하며 기습적인 가격 펌핑을 연출한 상황이야.

[IMAGE_2]

주인장이 하고 있는 것들:
1. Bitget 선물 마켓 실시간 미결제약정(OI) 모니터링
2. 텔레그램 TON 생태계 주요 프로젝트 정보 수집
3. 글로벌 메이저 거래소 100% 활용하기: 어차피 남들보다 빠른 알트코인 급등 정보를 취하고 고수익 파이프라인을 뚫고 싶다면 해외 거래소 활용은 필수적인 선택이에요. 주인장도 가상자산 투자를 병행하며 글로벌 달러 자산을 불리고 있어요. 마침 가입만 해도 수수료 평생 할인 혜택을 챙겨갈 수 있도록 정리해뒀으니 지금 시작해보세요! [리틀리 링크]

Q. 이처럼 전 세계 자금이 몰리는 텔레그램 생태계 코인의 상승은 앞으로도 계속될까? 댓글로 의견을 달아줘!

----------------------------------
[내부 링크]
- [내부 링크 1] 머니로그랩 이전 알트코인 분석글 보러가기
- [내부 링크 2] 머니로그랩 추천 가상자산 정보
- [내부 링크 3] 로기가 물어다 준 경제 도토리`,
      hashtags: ['Notcoin', '낫코인', 'Bitget선물', '해외거래소', '텔레그램코인', '톤코인', '알트코인폭등', '가상자산투자', '수수료할인', '머니로그랩'],
      imageKeywords: ['gold coin stack', 'blockchain network connect']
    },
    {
      category: 'okxCoin',
      titles: [
        'OKX 독점 알트코인 분석과 글로벌 자금 대규모 순유입 트렌드',
        '업비트 빗썸에서 절대 살 수 없는 OKX 독점 탑티어 알트코인 전망',
        '✅ 가상자산 글로벌 거래소 OKX 대규모 기관 자금 순유입과 알트코인 펌핑 분석'
      ],
      recommendedTitle: '✅ 가상자산 글로벌 거래소 OKX 대규모 기관 자금 순유입과 알트코인 펌핑 분석',
      thumbnailText: 'OKX 기관 자금 유입 🚀',
      aeoSummary: 'OKX 거래소로 대규모의 글로벌 자금과 기관 투자자 예치금이 유입되며 신규 알트코인 랠리가 가속화되고 있습니다.',
      previewBox: {
        trailerText: '국내 시장에는 아직 상장되지 않았으나 글로벌 탑 거래소인 OKX에서 엄청난 유동성을 바탕으로 조용히 급등을 준비하고 있는 알트코인의 자금 흐름을 밀착 취재했어. 독점 정보와 자산 포트폴리오 헷징법을 본문에서 전격 공개할게!',
        todoSteps: [
          'OKX 알트코인 실시간 입출금 거래량 점검하기',
          '레이어2 신규 체인 활성화 지표 확인하기',
          '글로벌 고래 투자자 대형 지갑 자금 이동 추적하기'
        ]
      },
      body: `[IMAGE_1]
글로벌 탑티어 거래소인 OKX로 대규모 기관 자금이 대거 순유입되는 역사적인 흐름이 포착되고 있어. 해외 투자 자본들은 이미 금리 인상 리스크를 헷지하기 위해 주식시장에서 자금을 빼내어 OKX 등의 글로벌 가상자산 거래소로 자리를 이동하고 있지.

로기 연구원의 데이터 분석망에 따르면, 최근 OKX는 최신 암호화 보안 기술과 압도적인 거래 유동성 덕분에 글로벌 헤지펀드들의 최선호 거래소로 급부상했어. 특히 이더리움 기반 레이어2(블록체인 거래 처리 속도를 획기적으로 향상시키는 확장 솔루션) 코인들이 강세를 보이며, 기관들이 대규모 예치를 늘리고 있는 상황이지.

해외 고래들의 자금이 이처럼 대규모로 유입될 때는, 그들이 매집하는 알트코인 목록을 추적하여 선점하는 것이 고수익의 비결이야. 국내 원화 마켓만 바라보고 있으면 이러한 글로벌 메이저 자금의 수혜를 입기 어려워.

[IMAGE_2]

주인장이 하고 있는 것들:
1. OKX 탑 트레이더들의 알트코인 매집 지표 실시간 추적
2. 레이어2 유동성 인센티브 프로그램 참여
3. 글로벌 안전 자산 헷지 채널 구축: 유가가 오르고 고금리가 지속될 때는 국내 자산만 들고 있는 건 매우 위험해요. 주인장도 글로벌 탑 거래소인 OKX를 활용해 원화 리스크를 방어하고 추가 머니 파이프라인을 뚫고 있어요. 가입만 해도 수수료 평생 할인 혜택을 챙겨갈 수 있는 기회를 놓치지 마세요! [리틀리 링크]

Q. OKX로 자금이 계속 쏠리는 상황에서 여러분의 코인 투자 전략은 어떠한가요? 댓글로 공유해주세요!

----------------------------------
[내부 링크]
- [내부 링크 1] 머니로그랩 이전 OKX 분석글 보러가기
- [내부 링크 2] 머니로그랩 추천 가상자산 정보
- [내부 링크 3] 로기가 물어다 준 경제 도토리`,
      hashtags: ['OKX코인', '글로벌거래소', '기관자금', '알트코인전망', '레이어2', '가상자산투자', '헤지펀드', '수수료할인', '머니로그랩', '재테크공부'],
      imageKeywords: ['cryptocurrency wallet', 'server server rack tech']
    },
    {
      category: 'realestate',
      titles: [
        '금리 6.5% 보유세 폭탄 영끌 상가 낙찰률 최저 비명',
        '서울 강남 아파트 거래 회복세, 지금 안 사면 낙오될까?',
        '✅ 강남 빌딩 경매 역대 최다 건수 쏟아지는 원인과 전망'
      ],
      recommendedTitle: '✅ 강남 빌딩 경매 역대 최다 건수 쏟아지는 원인과 전망',
      thumbnailText: '강남 빌딩 경매 폭증 ⚠️',
      aeoSummary: '고금리와 보유세 부담 증가로 인해 강남권 상업용 빌딩 경매 낙찰률이 역대 최저치를 경신하고 있습니다.',
      previewBox: {
        trailerText: '부동산 불패 신화의 상징인 서울 강남구의 대형 빌딩들이 법원 경매 법정에 사상 최대 규모로 쏟아져 나오고 있어. 건물주들이 파산 직전에 내몰린 숨겨진 원인과 앞으로 다가올 부동산 시장의 거대한 파도를 예측해 드릴게요!',
        todoSteps: [
          '대법원 법원경매정보 상업용 빌딩 유찰 횟수 확인하기',
          '시중 5대 은행 주택담보 및 시설자금 대출 금리 동향 확인하기',
          '강남 및 도심권역(GBD) 오피스 공실률 통계 추적하기'
        ]
      },
      body: `[IMAGE_1]
대한민국 최고 부의 상징인 강남 한복판의 빌딩들이 헐값에 경매 매물로 쏟아져 나오는 충격적인 일이 발생하고 있어. 낙찰자는 나타나지 않고 3~4회씩 연속 유찰되며 반값 빌딩이 속출하고 있지.

다람쥐 연구원 로기가 부동산 등기부와 금리 현황을 긴급 추적해 보니, 문제의 근원은 역시 무시무시한 고금리 때문이야. 불과 3년 전 연 2%대 저금리로 수십억의 대출을 끌어 빌딩을 샀던 건물주들이, 현재 만기 연장 시 연 6.5%가 넘는 고금리 직격탄을 맞은 거지. 매달 내야 할 이자가 3배 가까이 폭등했는데 상가 임대료는 공실 때문에 오히려 내리고 있으니 현금 흐름이 완전히 말라버린 거야.

이걸 부동산 시장에서는 부채 상환 능력 한계로 인한 '경매 폭증 현상'이라고 불러. 감정가 대비 턱없이 낮은 가격에 처분되어도 금융 비용을 감당하지 못한 매물들이 누적되는 거지. 강남 부동산이 이 지경이라면 지방이나 수도권 외곽의 중소형 상가와 아파트 시장의 충격은 물 보듯 뻔해. 보유세 부담까지 가중되는 연말이 오면 부동산 시장 전체의 빙하기가 더욱 심화될 위험이 커.

[IMAGE_2]

주인장이 하고 있는 것들:
1. 전국 상업용 부동산 유찰률 및 낙찰가율 동향 모니터링
2. 강남 권역 주요 공실률 변화 트렌드 분석
3. 부동산 꽉 막힌 현금 흐름 돌파하기: 금리가 안 내려오는 동안 부동산 하나만 바라보고 있으면 현금흐름이 막혀요. 주인장은 그래서 부동산 외에 코인 시장도 같이 굴려요. 작은 돈부터 시작할 수 있고 수수료 아끼는 방법도 있으니 아래 참고해보세요. [리틀리 링크]

Q. 강남 빌딩마저 유찰되는 지금의 부동산 위기는 과연 언제쯤 바닥을 치고 반등할 수 있을까? 댓글로 자유롭게 의견을 나눠보자!

----------------------------------
[내부 링크]
- [내부 링크 1] 머니로그랩 이전 부동산 분석글 보러가기
- [내부 링크 2] 머니로그랩 추천 부동산 정보
- [내부 링크 3] 로기가 물어다 준 경제 도토리`,
      hashtags: ['강남빌딩경매', '부동산위기', '고금리이자', '상업용부동산', '보유세부담', '공실률폭증', '부동산투자', '자산리스크헷지', '재테크공부', '머니로그랩'],
      imageKeywords: ['apartment building exterior', 'interest rate bank loan']
    }
  ],
  cardNews: [
    {
      slideNumber: 1,
      title: "🚨 원달러 환율 1,507원 긴급 돌파!",
      description: "미국 연준의 긴축 장기화 우려와 중동 리스크 폭발로 환율이 급격히 상승하며 물가 폭등 비상이 걸렸어. 내 지갑을 지킬 방어 대책이 필요해!",
      keyword: "환율 급등"
    },
    {
      slideNumber: 2,
      title: "📈 삼성전자 30만 원 깨지자 8조 순매수!",
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
      title: "🪙 OKX 거래소 글로벌 기관 자금 대유입!",
      description: "주식시장을 이탈한 기관 유동성이 OKX로 유입되고 있어. 독점 수혜를 입을 신규 레이어2 알트코인을 매집하여 분산 투자하자!",
      keyword: "OKX 코인"
    },
    {
      slideNumber: 5,
      title: "🏠 강남 한복판 빌딩 무더기 유찰 비명!",
      description: "연 6%대 주택 대출 금리 부담과 세금 폭탄으로 인해 부동산 불패 강남마저 경매 폭증세가 났어. 자산 다각화가 생존의 핵심이야!",
      keyword: "강남 부동산"
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
          <h3 style="margin: 0 0 10px 0; color: #0d2847; font-size: 16px;">🚨 오늘의 핵심 경제 도토리 5가지</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4a5568; line-height: 1.7;">
            <li><strong>원·달러 환율 1,507원 돌파:</strong> 글로벌 안전 자산 쏠림으로 수입물가 비상!</li>
            <li><strong>삼성전자 30만 원 깨지자 8조 순매수:</strong> 반도체 D-RAM 업황 회복 수혜 및 순환매 포착!</li>
            <li><strong>Bitget 선물 Notcoin +24% 폭등:</strong> 글로벌 거래소 유동성을 통한 알트코인 저점 타기!</li>
            <li><strong>OKX 거래소 대규모 기관 자금 유입:</strong> 헤지펀드들이 매집하는 최신 레이어2 코인 추적!</li>
            <li><strong>부동산 불패 강남 빌딩 경매 폭증:</strong> 연 6.5% 고금리 감당 못한 매물 연속 유찰!</li>
          </ul>
        </div>
        <p style="font-size: 15px; color: #333333; line-height: 1.6;">
          금리 오르고 환율 들썩일 땐 예적금이나 단일 부동산 자산에만 묶여 있으면 리스크가 너무 커. 로기는 이럴 때 글로벌 위기 헷지 수단인 **가상자산 해외 병행 투자(Bitget/OKX)**로 수익 파이프라인을 다각화하고 있어.
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

const callGemini = async (systemPrompt, userPrompt, apiKey, isJsonMime = true) => {
  const geminiModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ];
  
  let lastError = null;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (const modelName of geminiModels) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      let responseText = '';
      
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: isJsonMime ? {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
          } : {
            maxOutputTokens: 8192
          }
        });
        const result = await model.generateContent([systemPrompt, userPrompt]);
        const response = await result.response;
        responseText = response.text();
      } catch (jsonErr) {
        console.warn(`⚠️ Gemini MimeType JSON 설정 에러로 일반 텍스트 모드로 우회 찔러보기...`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { maxOutputTokens: 8192 }
        });
        const result = await model.generateContent([systemPrompt, userPrompt + "\nIMPORTANT: Return RAW, VALID JSON only!"]);
        const response = await result.response;
        responseText = response.text();
      }
      
      if (!responseText || responseText.trim() === '') {
        throw new Error("AI로부터 빈 응답을 받았습니다.");
      }
      
      // Defensively clean potential markdown wrapper text
      let cleanedText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (directParseError) {
        console.warn(`⚠️ Gemini (${modelName}) direct JSON parse failed, trying custom repair...`);
        // Defensive repair loop
        let repaired = "";
        let openQuote = false;
        for (let i = 0; i < cleanedText.length; i++) {
          const char = cleanedText[i];
          if (char === '"') {
            let backslashes = 0;
            let idx = i - 1;
            while (idx >= 0 && cleanedText[idx] === '\\') {
              backslashes++;
              idx--;
            }
            if (backslashes % 2 === 0) {
              const prevChar = cleanedText.slice(0, i).trim().slice(-1);
              const nextChar = cleanedText.slice(i + 1).trim().slice(0, 1);
              
              const isStructural = 
                prevChar === '{' || prevChar === '}' || 
                prevChar === '[' || prevChar === ']' || 
                prevChar === ',' || prevChar === ':' ||
                nextChar === '}' || nextChar === ']' || 
                nextChar === ',' || nextChar === ':';
              
              if (!isStructural && openQuote) {
                repaired += "'";
                continue;
              }
              openQuote = !openQuote;
            }
          }
          if ((char === '\n' || char === '\r') && openQuote) {
            repaired += '\\n';
          } else {
            repaired += char;
          }
        }
        cleanedText = repaired
          .replace(/}\s*"/g, '},\n"')
          .replace(/]\s*"/g, '],\n"')
          .replace(/([^\\]")\s*"([a-zA-Z0-9_]+)"\s*\:/g, '$1,\n"$2":');
          
        parsed = JSON.parse(cleanedText);
      }
      
      parsed.engine = `Gemini (${modelName})`;
      return parsed;
    } catch (err) {
      console.warn(`⚠️ Gemini (${modelName}) 호출 실패:`, err.message);
      lastError = err;
    }
    await sleep(1500); // Cooldown before trying fallback model
  }
  throw lastError || new Error("Gemini models failed to respond.");
};

export const aiService = {
  generatePosts: async (financialData) => {
    const { indices, news, coinData } = financialData;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Customized mock data as base fallback
    const customizedMock = { ...mockGeneratedData };
    customizedMock.posts = customizedMock.posts.map(post => {
      let body = post.body;
      if (post.category === 'economic' && indices.usdKrw) {
        body = body.replace(/==1,360원==/g, `==${indices.usdKrw.price}원==`);
      }
      if (post.category === 'stock' && indices.kospi) {
        body = body.replace(/==8조 원==/g, `==개인 대규모 순매도세 속 KOSPI ${indices.kospi.price} 변동==`);
      }
      return { ...post, body };
    });

    let lastError = null;
    
    if (config.geminiApiKey) {
      try {
        console.log("🚀 [Gemini Multi-Call Engine] 2,000자 블로그 포스팅 순차 생성 시작!");
        const posts = [];
        const categories = ['economic', 'stock', 'bitgetCoin', 'okxCoin', 'realestate'];
        
        for (const category of categories) {
          console.log(`🔮 [Gemini Multi-Call] "${category}" 카테고리 2,000자 포스팅 집필 중...`);
          try {
            const systemPrompt = `
You are the Squirrel Researcher "Rogi" (다람쥐 연구원 로기) - the official brand mascot of the financial blog "머니로그랩" (Money Log Lab).
Write a premium, SEO-optimized, highly detailed Naver Blog post for the category "${category}".

## 2,000+ CHARACTER SEO REQUIREMENT (CRITICAL):
- The "body" of the post MUST be extremely detailed, verbose, and long, **at least 2,500 to 3,000 Korean characters** (excluding the checklists/links). Use rich explanations, step-by-step reasoning, and deep analysis of the provided data. This is a strict quality requirement for Naver View Search SEO!
- To achieve this length, expand the body into 4 distinct narrative sections:
  1. [도입부] Rogi's warm greeting, current market sentiment, and emotional hook using today's live indices (KOSPI, exchange rates, etc.). (500+ characters)
  2. [원인 분석] Deep dive into the economic/structural reasons behind the event (Fed policy, supply chain, liquidity, whale dynamics). Define key terms natively. (800+ characters)
  3. [시장 영향 및 향후 전망] Direct impact on retail investors/citizens and future predictions for the upcoming weeks. (700+ characters)
  4. [실전 대응 솔루션] Rogi's practical advice, checklist of '주인장이 하고 있는 것들', and the logical transition to the referral link bridge. (700+ characters)
- Write in a rich, highly verbose, storytelling style. Do not summarize or skip details. Expand on every point to guarantee the body exceeds 2,500 characters.

## CRITICAL FORMATTING & HUMAN-WRITING RULES (MUST OBEY):
- Rule 1 (No Unescaped Quotes): NEVER use raw double quotes (") inside JSON string values. Use single quotes (') instead.
- Rule 2 (No Raw Line Breaks): Represent paragraph breaks in "body" with literal escaped "\\n" characters. Do not output literal raw line breaks inside JSON strings.
- Rule 3 (NO MARKDOWN BOLDING ** OR HEADERS #): NEVER use double asterisks (**) anywhere in the titles, recommendedTitle, previewBox.trailerText, or body for bolding. NEVER use hash headings (### or ##). This is for a Naver Blog copy-paste draft where raw markdown wrappers look highly robotic and scream 'AI-generated'. Write clean, plain text and make headings organic and paragraphs flow naturally!

## Tone and Style:
- Persona: Friendly, cute 2D squirrel researcher "Rogi" who gathers financial "acorns" (info).
- Speaking Style: Use 반말 (friendly informal Korean, e.g., "했어", "있어", "대비해야 해!") that is extremely easy for middle schoolers to understand ("중학생도 이해 가능한 쉬운 언어").

## Writing Quality 4 Principles (MUST FOLLOW):
- Principle 1 (No Spoiler Preview): The "previewBox.trailerText" must NOT spoil exact final figures. Write a curiosity-triggering "Trailer" (예고편), and add 3 "지금 할 것 3단계" (3 immediate action steps).
- Principle 2 (Native Term Definitions): Blend definitions natively into Rogi's conversational flow (e.g. "이걸 주식 연구실에서는 자금이 돌고 도는 '순환매'라고 불러!").
- Principle 3 (Keyword Repetition): Repeat target search keywords naturally 2-3 times.
- Principle 4 (Affiliate Link Narrative Bridge): Before rendering the affiliate referral banner ([리틀리 링크]), write a compelling narrative explaining *why* they need a crypto income pipeline now.

## Category Specifications for "${category}":
${category === 'economic' ? '- economic (경제): Hybrid style (SEO optimized first paragraph + Rogi tone body).' : ''}
${category === 'stock' ? '- stock (주식): Hybrid style linking DRAM/HBM server demand trends to Samsung Electronics & SK Hynix.' : ''}
${category === 'bitgetCoin' ? '- bitgetCoin (Bitget 코인): Card block style focusing on Bitget exchange, leverage futures stats, trending coins and benefits.' : ''}
${category === 'okxCoin' ? '- okxCoin (OKX 코인): Narrative style focusing on OKX exchange, dex trends, global altcoin flows.' : ''}
${category === 'realestate' ? '- realestate (부동산): Column format (Phenomenon -> Cause -> Influence -> Outlook).' : ''}

## Post Structure Sequence:
You MUST return raw, valid JSON only. Do not wrap in markdown \`\`\`json blocks.
The JSON must follow this exact structure:
{
  "category": "${category}",
  "titles": ["title1", "title2", "title3"],
  "recommendedTitle": "recommended_title_with_emoji",
  "thumbnailText": "short_thumbnail_phrase",
  "aeoSummary": "one_line_aeo_summary",
  "previewBox": {
    "trailerText": "curiosity_triggering_trailer_text",
    "todoSteps": ["step1", "step2", "step3"]
  },
  "body": "Full body text conforming to SEO 2,000-character requirement. MUST start with [IMAGE_1] immediately on the first line. Blend 💡 Term Definitions organically. Include [IMAGE_2] in the middle. Checklist of '주인장이 하고 있는 것들' where the 3rd step explains the crypto hedging necessity using the specific category's affiliate bridge narrative below: ${
    category === 'economic' ? '유가가 오르고 금리가 묶이면 예금·적금으로는 물가를 못 따라가요. 주인장은 이럴 때 코인 시장을 병행 수익 채널로 쓰는데 생각보다 진입 장벽이 낮아요. 거래소 선택만 잘 해도 수수료를 아킬 수 있어서 정리해뒀어요. [리틀리 링크]' :
    category === 'stock' ? '환율이 1,500원을 넘나들 때는 주식 하나만 보고 있으면 리스크를 다 짊어지는 셈이에요. 글로벌 자본이 주식 시장에서 빠질 때 일부는 코인 시장으로 이동하거든요. 주인장도 주식이 이렇게 흔들릴 때 코인을 병행하면서 분산하고 있어요. 마침 수수료 아끼면서 시작하기 좋은 거래소 혜택을 정리해뒀으니 참고해보세요. [리틀리 링크]' :
    category === 'realestate' ? '금리가 안 내려오는 동안 부동산 하나만 바라보고 있으면 현금흐름이 막혀요. 주인장은 그래서 부동산 외에 코인 시장도 같이 굴려요. 작은 돈부터 시작할 수 있고 수수료 아끼는 방법도 있으니 아래 참고해보세요. [리틀리 링크]' :
    'Blend in a highly persuasive rationale about starting crypto investments now with their specific exchange benefits, concluding with [리틀리 링크].'
  }\\n\\nInclude exactly 1 question at the end.\\n\\nInclude exactly these 3 internal links at the bottom:\\n[내부 링크 1] 머니로그랩 이전 관련 분석글 보러가기\\n[내부 링크 2] 머니로그랩 추천 재테크 정보\\n[내부 링크 3] 로기가 물어다 준 경제 도토리",
  "hashtags": ["tag1", "tag2", "tag3..."],
  "imageKeywords": ["keyword1", "keyword2"]
}
`;

            const userPrompt = `
Here is today's gathered data:
- KOSPI: ${indices.kospi.price} (${indices.kospi.changePercent}%)
- KOSDAQ: ${indices.kosdaq.price} (${indices.kosdaq.changePercent}%)
- USD/KRW Rate: ${indices.usdKrw.price} (${indices.usdKrw.changePercent}%)
- Bitget Hot Coin: ${coinData?.bitget?.formattedName || 'WIF'} (${coinData?.bitget?.changePercent || '12.85'}%) - Price: ${coinData?.bitget?.price || '2.84'}$
- OKX Hot Coin: ${coinData?.okx?.formattedName || 'NOT'} (${coinData?.okx?.changePercent || '24.11'}%) - Price: ${coinData?.okx?.price || '0.018'}$
- News Headlines:
${news.map((n, idx) => `${idx+1}. ${n.title}`).join('\n')}

Generate the detailed, verbose, and comprehensive Naver Blog post for the category "${category}". Ensure the "body" is extremely long, exceeding 2,500 Korean characters!
`;

            const parsedPost = await callGemini(systemPrompt, userPrompt, config.geminiApiKey);
            
            // Post-processing filter to strip out all ugly AI Markdown indicators (like **, ###) to make it look 100% human-written
            const cleanMarkdownText = (txt) => {
              if (typeof txt !== 'string') return txt;
              return txt.replace(/\*\*/g, '').replace(/###\s*/g, '').replace(/##\s*/g, '').replace(/#\s*/g, '').trim();
            };

            if (parsedPost) {
              if (parsedPost.body) parsedPost.body = cleanMarkdownText(parsedPost.body);
              if (parsedPost.recommendedTitle) parsedPost.recommendedTitle = cleanMarkdownText(parsedPost.recommendedTitle);
              if (parsedPost.aeoSummary) parsedPost.aeoSummary = cleanMarkdownText(parsedPost.aeoSummary);
              if (parsedPost.titles && Array.isArray(parsedPost.titles)) {
                parsedPost.titles = parsedPost.titles.map(cleanMarkdownText);
              }
              if (parsedPost.previewBox) {
                if (parsedPost.previewBox.trailerText) {
                  parsedPost.previewBox.trailerText = cleanMarkdownText(parsedPost.previewBox.trailerText);
                }
                if (parsedPost.previewBox.todoSteps && Array.isArray(parsedPost.previewBox.todoSteps)) {
                  parsedPost.previewBox.todoSteps = parsedPost.previewBox.todoSteps.map(cleanMarkdownText);
                }
              }
            }

            posts.push(parsedPost);
            console.log(`✅ [Gemini Multi-Call] "${category}" 집필 및 JSON 파싱 완료 (마크다운 클렌징 완료)!`);
          } catch (postErr) {
            console.warn(`⚠️ [Gemini Multi-Call] "${category}" 생성 실패, 모의 데이터로 대체합니다:`, postErr.message);
            const mockPost = customizedMock.posts.find(p => p.category === category);
            posts.push({ ...mockPost });
          }
          await sleep(1500); // 1.5-second delay between requests to prevent rate limits
        }
        
        console.log("🔮 [Gemini Multi-Call] 카드뉴스 및 뉴스레터 생성 중...");
        let metaData;
        try {
          const systemPromptMeta = `
You are the Squirrel Researcher "Rogi" (다람쥐 연구원 로기) - the official brand mascot of the financial blog "머니로그랩" (Money Log Lab).
Generate a 5-slide Card News series and an Email Newsletter based on the provided live daily financial data.

## Tone and Style:
- Speaking Style: Use 반말 (friendly informal Korean) easy for middle schoolers to understand.

## JSON Output Structure:
You MUST return raw, valid JSON only. Do not wrap in markdown \`\`\`json blocks.
The JSON must follow this exact structure:
{
  "cardNews": [
    {
      "slideNumber": 1,
      "title": "slide_title",
      "description": "slide_desc_exactly_one_sentence",
      "keyword": "slide_keyword"
    },
    {
      "slideNumber": 2,
      "title": "slide_title",
      "description": "slide_desc_exactly_one_sentence",
      "keyword": "slide_keyword"
    },
    {
      "slideNumber": 3,
      "title": "slide_title",
      "description": "slide_desc_exactly_one_sentence",
      "keyword": "slide_keyword"
    },
    {
      "slideNumber": 4,
      "title": "slide_title",
      "description": "slide_desc_exactly_one_sentence",
      "keyword": "slide_keyword"
    },
    {
      "slideNumber": 5,
      "title": "slide_title",
      "description": "slide_desc_exactly_one_sentence",
      "keyword": "slide_keyword"
    }
  ],
  "newsletter": {
    "subject": "newsletter_subject_with_emoji",
    "htmlBody": "beautifully_styled_html_newsletter"
  }
}
`;
          const userPromptMeta = `
Today's indices and headlines:
- KOSPI: ${indices.kospi.price} (${indices.kospi.changePercent}%)
- KOSDAQ: ${indices.kosdaq.price} (${indices.kosdaq.changePercent}%)
- USD/KRW Rate: ${indices.usdKrw.price} (${indices.usdKrw.changePercent}%)
- Bitget Hot Coin: ${coinData?.bitget?.formattedName || 'WIF'} (${coinData?.bitget?.changePercent || '12.85'}%) - Price: ${coinData?.bitget?.price || '2.84'}$
- OKX Hot Coin: ${coinData?.okx?.formattedName || 'NOT'} (${coinData?.okx?.changePercent || '24.11'}%) - Price: ${coinData?.okx?.price || '0.018'}$
- News:
${news.map(n => `- ${n.title}`).join('\n')}

Generate the Card News and Newsletter.
`;
          metaData = await callGemini(systemPromptMeta, userPromptMeta, config.geminiApiKey);
          
          // Post-processing filter to strip out all ugly AI Markdown indicators (like **) from Card News
          const cleanMarkdownText = (txt) => {
            if (typeof txt !== 'string') return txt;
            return txt.replace(/\*\*/g, '').replace(/###\s*/g, '').replace(/##\s*/g, '').replace(/#\s*/g, '').trim();
          };

          if (metaData) {
            if (metaData.cardNews && Array.isArray(metaData.cardNews)) {
              metaData.cardNews = metaData.cardNews.map(slide => ({
                ...slide,
                title: cleanMarkdownText(slide.title),
                description: cleanMarkdownText(slide.description),
                keyword: cleanMarkdownText(slide.keyword)
              }));
            }
          }

          console.log("✅ [Gemini Multi-Call] 카드뉴스 및 뉴스레터 생성 완료 (마크다운 클렌징 완료)!");
        } catch (metaErr) {
          console.warn("⚠️ [Gemini Multi-Call] 카드뉴스/뉴스레터 생성 실패, 모의 데이터로 대체합니다:", metaErr.message);
          metaData = {
            cardNews: customizedMock.cardNews,
            newsletter: customizedMock.newsletter
          };
        }
        
        return {
          posts,
          cardNews: metaData.cardNews,
          newsletter: metaData.newsletter,
          engine: 'Gemini (gemini-2.5-flash - Multi-Call Engine)',
          error: null
        };
      } catch (err) {
        console.error("❌ [Gemini Multi-Call Engine] 완전 실패:", err.message);
        lastError = err.message;
      }
    }
    
    // Ultimate mock fallback
    customizedMock.engine = '시나리오 모의 모드 (API 키 오류 또는 미등록)';
    customizedMock.error = lastError || 'API 키가 설정되어 있지 않습니다.';
    return customizedMock;
  }
};
