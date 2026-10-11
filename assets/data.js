// 여행 데이터: 장소 · 공통 일정 · A/B/C안
// 좌표는 지도 표시용 근사값입니다.

const TRIP = {
  title: "삿포로 가족여행",
  start: "2026-10-31",
  end: "2026-11-04",
  members: "30대 2명 · 50대 2명",
  flights: [
    { label: "가는 편", no: "7C1503", from: "인천 ICN T1", to: "신치토세 CTS", dep: "10/31(토) 12:25", arr: "15:00" },
    { label: "오는 편", no: "7C1504", from: "신치토세 CTS", to: "인천 ICN T1", dep: "11/4(수) 16:00", arr: "19:25" },
  ],
  hotels: [
    {
      name: "첫 숙소",
      period: "10/31 ~ 11/3 (3박)",
      address: "札幌市中央区南4条西10丁目1005-4",
      addressKo: "삿포로시 주오구 미나미4조니시 10초메 1005-4",
      note: "스스키노 서쪽 · 나카지마공원·스스키노 도보권",
      place: "hotel1",
    },
    {
      name: "온센 료칸 유엔 삿포로",
      period: "11/3 ~ 11/4 (1박)",
      address: "札幌市中央区北1条西7丁目6",
      addressKo: "삿포로시 주오구 기타1조니시 7초메 6",
      note: "온천·노천탕 · 오도리공원 서쪽, 삿포로역 도보권",
      place: "yuen",
    },
  ],
};

// q: 구글맵 검색어
const PLACES = {
  cts:        { name: "신치토세공항",        q: "New Chitose Airport",                 lat: 42.7752, lng: 141.6923 },
  station:    { name: "삿포로역",            q: "Sapporo Station",                     lat: 43.0687, lng: 141.3508 },
  hotel1:     { name: "첫 숙소",             q: "43.0543,141.3428",                    lat: 43.0543, lng: 141.3428 },
  yuen:       { name: "유엔 삿포로",         q: "Onsen Ryokan Yuen Sapporo",           lat: 43.0605, lng: 141.3460 },
  susukino:   { name: "스스키노",            q: "Susukino, Sapporo",                   lat: 43.0556, lng: 141.3530 },
  odori:      { name: "오도리공원",          q: "Odori Park, Sapporo",                 lat: 43.0598, lng: 141.3480 },
  tvtower:    { name: "삿포로 TV타워",       q: "Sapporo TV Tower",                    lat: 43.0611, lng: 141.3564 },
  maruyama:   { name: "마루야마공원",        q: "Maruyama Park, Sapporo",              lat: 43.0530, lng: 141.3105 },
  shrine:     { name: "홋카이도신궁",        q: "Hokkaido Shrine",                     lat: 43.0544, lng: 141.3074 },
  nakajima:   { name: "나카지마공원",        q: "Nakajima Park, Sapporo",              lat: 43.0455, lng: 141.3536 },
  hokudai:    { name: "홋카이도대 은행나무길", q: "Hokkaido University Ginkgo Avenue",  lat: 43.0790, lng: 141.3440 },
  beer:       { name: "삿포로 맥주박물관",   q: "Sapporo Beer Museum",                 lat: 43.0716, lng: 141.3687 },
  jozankei:   { name: "조잔케이온천",        q: "Jozankei Onsen",                      lat: 42.9680, lng: 141.1660 },
  futami:     { name: "후타미공원·후타미 흔들다리", q: "Futami Suspension Bridge, Jozankei", lat: 42.9665, lng: 141.1610 },
  hoheikyo:   { name: "호헤이교댐",          q: "Hoheikyo Dam",                        lat: 42.9370, lng: 141.1500 },
  otaruSta:   { name: "오타루역",            q: "Otaru Station",                       lat: 43.1977, lng: 140.9937 },
  sankaku:    { name: "산카쿠시장",          q: "Sankaku Market, Otaru",               lat: 43.1981, lng: 140.9945 },
  canal:      { name: "오타루운하",          q: "Otaru Canal",                         lat: 43.1985, lng: 141.0005 },
  sakaimachi: { name: "사카이마치거리",      q: "Sakaimachi Street, Otaru",            lat: 43.1925, lng: 141.0055 },
  shikotsu:   { name: "시코츠호",            q: "Lake Shikotsu Visitor Center",        lat: 42.7740, lng: 141.4040 },
  moiwa:      { name: "모이와야마 로프웨이", q: "Mt. Moiwa Ropeway",                   lat: 43.0360, lng: 141.3220 },
  nijo:       { name: "니조시장",            q: "Nijo Market, Sapporo",                lat: 43.0583, lng: 141.3576 },
  factory:    { name: "삿포로팩토리",        q: "Sapporo Factory",                     lat: 43.0653, lng: 141.3627 },
};

// 일정 항목 type: flight | move | see | food | rest | hotel | shop
const DAY_ARRIVE = {
  date: "10/31", dow: "토", title: "도착 · 스스키노 · 오도리 야경",
  mode: "transit",
  route: ["cts", "station", "hotel1", "susukino", "odori", "tvtower"],
  items: [
    { time: "12:25", type: "flight", text: "인천 T1 출발 (제주항공 7C1503)" },
    { time: "15:00", type: "flight", text: "신치토세공항 도착 · 입국심사·수하물", note: "보통 1시간 내외 소요" },
    { time: "16:00", type: "move", text: "JR 쾌속 에어포트로 삿포로역 (약 40분)", note: "짐이 많으면 삿포로역에서 택시로 숙소까지 약 10분" },
    { time: "17:15", type: "hotel", text: "첫 숙소 체크인 · 짐 풀고 휴식", place: "hotel1" },
    { time: "18:30", type: "food", text: "스스키노 저녁 — 징기스칸(양고기 구이) 추천", place: "susukino", note: "토요일 + 할로윈이라 붐빔. 인기 가게는 대기 각오" },
    { time: "20:00", type: "see", text: "(선택) 오도리공원 · TV타워 야경 산책", place: "tvtower", note: "피곤하면 생략하고 숙소로" },
  ],
};

const DAY_DEPART = {
  date: "11/4", dow: "수", title: "유엔 → 쇼핑 → 공항",
  mode: "transit",
  route: ["yuen", "odori", "station", "cts"],
  items: [
    { time: "08:00", type: "food", text: "유엔 조식 · 아침 온천", place: "yuen" },
    { time: "09:30", type: "see", text: "체크아웃 후 오도리공원 산책", place: "odori", note: "짐은 유엔에 맡기거나 삿포로역 코인로커" },
    { time: "10:30", type: "shop", text: "삿포로역 쇼핑 — JR타워·다이마루·빅카메라", place: "station" },
    { time: "12:15", type: "food", text: "점심 · 기념품 마무리 (역 지하 식당가)", place: "station" },
    { time: "13:00", type: "move", text: "JR 쾌속 에어포트 탑승 (늦어도 13:15)", note: "신치토세까지 약 40분" },
    { time: "14:00", type: "flight", text: "신치토세 도착 · 체크인 · 보안검색", place: "cts", note: "국제선 터미널 2층 로이스·기타카로 면세점 구경" },
    { time: "16:00", type: "flight", text: "출발 (7C1504) → 19:25 인천 도착" },
  ],
};

const DAY_MARUYAMA = (date, dow) => ({
  date, dow, title: "마루야마 · 홋카이도신궁 · 나카지마공원",
  mode: "transit",
  route: ["hotel1", "maruyama", "shrine", "hotel1", "nakajima", "susukino"],
  items: [
    { time: "09:30", type: "move", text: "지하철 도자이선 니시11초메역 → 마루야마코엔역 (2정거장)", note: "숙소에서 니시11초메역까지 도보 약 10분" },
    { time: "10:00", type: "see", text: "마루야마공원 단풍 산책", place: "maruyama", note: "평지 위주라 걷기 편함" },
    { time: "10:45", type: "see", text: "홋카이도신궁 참배 (공원과 바로 연결)", place: "shrine", note: "경내 롯카테이 찻집에서 '한텐 모찌' 간식" },
    { time: "12:00", type: "food", text: "점심 — 마루야마 주변 수프카레 또는 카페", place: "maruyama" },
    { time: "13:30", type: "rest", text: "숙소 복귀 · 낮잠·휴식", place: "hotel1" },
    { time: "15:30", type: "see", text: "나카지마공원 단풍 · 호헤이칸 외관", place: "nakajima", note: "숙소에서 도보 약 15분. 일몰 16:30경" },
    { time: "17:00", type: "see", text: "(운영 시) 나카지마공원 단풍 라이트업", place: "nakajima", note: "11/3까지 운영 예정 — 현지에서 확인" },
    { time: "18:00", type: "food", text: "스스키노 저녁 — 라멘요코초 또는 이자카야", place: "susukino" },
  ],
});

const PLANS = {
  A: {
    name: "A안",
    title: "단풍·자연 우선형",
    summary: "조잔케이 계곡 단풍 드라이브 + 도심 단풍을 균형 있게",
    fatigue: 3,
    car: "11/2 하루 렌터카",
    highlight: "조잔케이 계곡 단풍 · 족욕",
    pros: ["단풍 만족도 최고", "온천 마을 분위기"],
    cons: ["운전 왕복 약 2시간", "첫눈·결빙 시 운전 부담"],
    days: [
      DAY_ARRIVE,
      DAY_MARUYAMA("11/1", "일"),
      {
        date: "11/2", dow: "월", title: "조잔케이 · 호헤이교 단풍 드라이브",
        mode: "driving",
        route: ["station", "jozankei", "futami", "hoheikyo", "station"],
        items: [
          { time: "09:00", type: "move", text: "삿포로역 근처 렌터카 픽업 → 조잔케이 (약 1시간)", place: "station", note: "스터드리스 타이어·면책보험 확인" },
          { time: "10:00", type: "see", text: "조잔케이 온천마을 · 갓파 족욕 · 후타미 흔들다리", place: "futami" },
          { time: "12:00", type: "food", text: "점심 — 조잔케이 소바·온천마을 식당", place: "jozankei" },
          { time: "13:30", type: "see", text: "호헤이교댐 단풍 (차로 약 15분)", place: "hoheikyo", note: "관광 시즌 종료일 확인 필요. 닫혔으면 조잔케이 당일온천으로 대체" },
          { time: "15:00", type: "rest", text: "조잔케이 당일온천 또는 카페 휴식", place: "jozankei" },
          { time: "16:00", type: "move", text: "삿포로 복귀 · 렌터카 반납 (해 지기 전 출발)", place: "station" },
          { time: "18:30", type: "food", text: "저녁 — 숙소 근처 가볍게 (수프카레 등)", place: "susukino" },
        ],
      },
      {
        date: "11/3", dow: "화·공휴일", title: "홋카이도대 · 맥주박물관 → 유엔",
        mode: "transit",
        route: ["hotel1", "hokudai", "beer", "yuen"],
        items: [
          { time: "09:30", type: "hotel", text: "체크아웃 · 택시로 유엔에 짐 맡기기", place: "hotel1", note: "11/3 문화의 날(공휴일) — 관광지 혼잡" },
          { time: "10:30", type: "see", text: "홋카이도대 은행나무길 (노란 단풍 절정기)", place: "hokudai", note: "지하철 난보쿠선 기타12조역 도보" },
          { time: "12:00", type: "food", text: "점심 — 삿포로역 주변", place: "station" },
          { time: "13:30", type: "see", text: "삿포로 맥주박물관 · 시음", place: "beer", note: "유료 투어는 사전예약 권장" },
          { time: "15:30", type: "hotel", text: "유엔 체크인 · 온천·노천탕", place: "yuen" },
          { time: "18:00", type: "food", text: "유엔 내 저녁 또는 스스키노", place: "yuen" },
        ],
      },
      DAY_DEPART,
    ],
  },

  B: {
    name: "B안",
    title: "오타루·해안 감성형",
    summary: "오타루 운하 당일치기 + 11/3 반나절 근교",
    fatigue: 3,
    car: "없음 또는 11/3 반나절",
    highlight: "오타루 운하 · 해안 열차 뷰",
    pros: ["JR로 편하게 이동", "쇼핑·먹거리 풍부"],
    cons: ["오타루는 도보가 많음", "11/3 일정이 다소 빠듯"],
    days: [
      DAY_ARRIVE,
      DAY_MARUYAMA("11/1", "일"),
      {
        date: "11/2", dow: "월", title: "오타루 당일치기",
        mode: "transit",
        route: ["station", "otaruSta", "sankaku", "canal", "sakaimachi", "otaruSta", "station"],
        items: [
          { time: "09:30", type: "move", text: "삿포로역 → JR 오타루역 (약 35~45분)", place: "station", note: "진행방향 오른쪽 좌석이 바다 뷰" },
          { time: "10:30", type: "food", text: "산카쿠시장 구경 · 이른 점심 해산물덮밥", place: "sankaku" },
          { time: "12:00", type: "see", text: "오타루운하 산책 · 아사쿠사바시 기념사진", place: "canal" },
          { time: "13:00", type: "shop", text: "사카이마치거리 — 오르골당·유리공방·르타오", place: "sakaimachi" },
          { time: "15:00", type: "rest", text: "카페 휴식 (르타오 본점 디저트)", place: "sakaimachi" },
          { time: "16:15", type: "see", text: "해질녘 운하 가스등 점등", place: "canal", note: "일몰 16:30경" },
          { time: "17:00", type: "move", text: "JR로 삿포로 복귀", place: "otaruSta" },
          { time: "18:30", type: "food", text: "스스키노 저녁", place: "susukino" },
        ],
      },
      {
        date: "11/3", dow: "화·공휴일", title: "조잔케이(또는 시코츠호) → 유엔",
        mode: "driving",
        route: ["hotel1", "jozankei", "futami", "yuen", "nakajima"],
        items: [
          { time: "09:00", type: "hotel", text: "체크아웃 · 짐 싣고 렌터카 픽업", place: "hotel1", note: "11/3 문화의 날(공휴일) — 도로·관광지 혼잡" },
          { time: "10:00", type: "see", text: "조잔케이 온천마을 · 족욕 · 후타미 흔들다리", place: "futami", note: "날씨·단풍 상태에 따라 시코츠호로 변경 가능" },
          { time: "12:00", type: "food", text: "점심 — 조잔케이", place: "jozankei" },
          { time: "13:30", type: "move", text: "삿포로 복귀 · 렌터카 반납" },
          { time: "15:00", type: "hotel", text: "유엔 체크인 · 온천·노천탕", place: "yuen" },
          { time: "17:00", type: "see", text: "(선택) 나카지마공원 라이트업 마지막 날", place: "nakajima" },
          { time: "18:30", type: "food", text: "유엔 내 저녁 또는 스스키노", place: "yuen" },
        ],
      },
      DAY_DEPART,
    ],
  },

  C: {
    name: "C안",
    title: "삿포로 도심 집중형",
    summary: "이동 최소화 · 도심 단풍·미식·야경·온천",
    fatigue: 1,
    car: "없음",
    highlight: "모이와야마 야경 · 니조시장",
    pros: ["피로도 가장 낮음", "날씨 변화에 유연"],
    cons: ["근교 자연 풍경은 없음"],
    days: [
      DAY_ARRIVE,
      {
        date: "11/1", dow: "일", title: "홋카이도대 · 맥주박물관 · 모이와야마 야경",
        mode: "transit",
        route: ["hotel1", "hokudai", "beer", "hotel1", "moiwa", "susukino"],
        items: [
          { time: "10:00", type: "see", text: "홋카이도대 은행나무길 · 포플러 가로수", place: "hokudai", note: "지하철 난보쿠선 기타12조역 도보" },
          { time: "12:00", type: "food", text: "점심 — 삿포로역 주변", place: "station" },
          { time: "13:30", type: "see", text: "삿포로 맥주박물관 · 시음", place: "beer" },
          { time: "15:00", type: "rest", text: "숙소 복귀 · 휴식", place: "hotel1" },
          { time: "16:00", type: "see", text: "모이와야마 로프웨이 → 노을·야경", place: "moiwa", note: "노면전차 '로프웨이이리구치'역. 정상은 매우 추우니 방한 필수" },
          { time: "18:30", type: "food", text: "스스키노 저녁", place: "susukino" },
        ],
      },
      DAY_MARUYAMA("11/2", "월"),
      {
        date: "11/3", dow: "화·공휴일", title: "니조시장 · 삿포로팩토리 → 유엔",
        mode: "transit",
        route: ["hotel1", "nijo", "hotel1", "factory", "yuen"],
        items: [
          { time: "08:30", type: "food", text: "니조시장 아침 해산물덮밥", place: "nijo" },
          { time: "10:00", type: "hotel", text: "숙소 복귀 · 체크아웃 · 택시로 유엔에 짐 맡기기", place: "hotel1", note: "11/3 문화의 날(공휴일)" },
          { time: "11:00", type: "shop", text: "삿포로팩토리 — 쇼핑·붉은벽돌관", place: "factory" },
          { time: "13:00", type: "food", text: "점심 — 팩토리 내 식당", place: "factory" },
          { time: "14:30", type: "hotel", text: "유엔 체크인 · 온천·노천탕 여유롭게", place: "yuen" },
          { time: "18:00", type: "food", text: "유엔 내 저녁 또는 스스키노", place: "yuen" },
        ],
      },
      DAY_DEPART,
    ],
  },
};

// 단풍 · 은행 · 낙엽 · 머루 · 이끼
const DAY_COLORS = ["#b3261e", "#c98a0c", "#8c3b1f", "#7a2e4a", "#5d7a3a"];

const TIPS = [
  { title: "날씨", text: "11월 초 삿포로는 최저 2~3℃ · 최고 10℃ 안팎. 첫눈 가능. 패딩·장갑·미끄럼 방지 신발." },
  { title: "해 지는 시간", text: "16:30경. 야외 일정은 오후 4시 전에 마무리하고, 저녁은 실내 위주로." },
  { title: "교통카드", text: "Suica/Kitaca/모바일 Suica로 지하철·JR·편의점 결제 가능. 4명이면 단거리는 택시도 경제적." },
  { title: "11/3 공휴일", text: "문화의 날. 관광지·식당이 붐비니 인기 식당은 예약 권장." },
  { title: "렌터카", text: "국제운전면허증 + 한국 면허증 + 여권 필수. 스터드리스 타이어·면책보험(NOC 포함) 확인." },
  { title: "숙소 이동", text: "11/3 체크아웃 후 택시로 짐만 먼저 유엔에 맡기면 오후 일정이 가벼워집니다." },
];

const CHECKLIST = [
  "항공편 7C1503 / 7C1504 예약 확인",
  "첫 숙소(10/31~11/3) · 유엔(11/3~11/4) 예약 확인",
  "여권 유효기간 확인",
  "Visit Japan Web 입국 정보 등록",
  "엔화 환전 · 해외결제 카드",
  "데이터 eSIM 또는 포켓와이파이",
  "여행자 보험",
  "방한복 · 장갑 · 미끄럼 방지 신발",
  "상비약 (부모님 복용약 포함)",
  "(렌터카 시) 국제운전면허증 · 스터드리스 타이어 확인",
  "유엔 체크인 시간 · 온천 이용 시간 확인",
  "11/4 13:00~13:15 삿포로역 JR 출발",
];
