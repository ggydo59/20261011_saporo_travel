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
  orix:       { name: "오릭스렌터카 삿포로역앞점", q: "オリックスレンタカー 札幌駅前店",    lat: 43.0722, lng: 141.3502 },
  daibutsu:   { name: "머리대불 (아타마 다이부츠)", q: "Hill of the Buddha, Makomanai Takino Cemetery", lat: 42.9365, lng: 141.3600 },
  jozankei:   { name: "조잔케이온천",        q: "Jozankei Onsen",                      lat: 42.9680, lng: 141.1660 },
  futami:     { name: "후타미공원·후타미 흔들다리", q: "Futami Suspension Bridge, Jozankei", lat: 42.9665, lng: 141.1610 },
  otaruSta:   { name: "오타루역",            q: "Otaru Station",                       lat: 43.1977, lng: 140.9937 },
  sankaku:    { name: "산카쿠시장",          q: "Sankaku Market, Otaru",               lat: 43.1981, lng: 140.9945 },
  canal:      { name: "오타루운하",          q: "Otaru Canal",                         lat: 43.1985, lng: 141.0005 },
  sakaimachi: { name: "사카이마치거리",      q: "Sakaimachi Street, Otaru",            lat: 43.1925, lng: 141.0055 },
};

// 일정 항목 type: flight | move | see | food | rest | hotel | shop
const DAY_ARRIVE = {
  date: "10/31", dow: "토", title: "도착 · 스스키노 · 오도리 야경",
  mode: "transit",
  route: ["cts", "station", "hotel1", "susukino", "odori", "tvtower"],
  items: [
    { time: "12:25", type: "flight", text: "인천 T1 출발 (제주항공 7C1503)" },
    { time: "15:00", type: "flight", text: "신치토세공항 도착 · 입국심사·수하물", note: "보통 1시간 내외 소요" },
    { time: "16:00", type: "move", text: "JR 쾌속 에어포트로 삿포로역 (약 40분)", note: "신치토세가 시발역이라 자유석도 앉아 갈 수 있음. 삿포로역에서 택시로 숙소까지 약 10분 (짐 때문에 2대)" },
    { time: "17:15", type: "hotel", text: "첫 숙소 체크인 · 짐 풀고 휴식", place: "hotel1" },
    { time: "18:30", type: "food", text: "스스키노 저녁 — 징기스칸(양고기 구이) 추천", place: "susukino", note: "토요일 + 할로윈이라 붐빔. 인기 가게는 대기 각오" },
    { time: "20:00", type: "see", text: "(선택) 오도리공원 · TV타워 야경 산책", place: "tvtower", note: "피곤하면 생략하고 숙소로" },
  ],
  cost: [
    ["JR 공항 → 삿포로 (1,230엔 × 4)", 4920],
    ["택시 삿포로역 → 숙소 2대 (추정)", 3000],
    ["저녁 징기스칸 (음료 포함)", 14000],
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
    { time: "13:00", type: "move", text: "JR 쾌속 에어포트 탑승 (늦어도 13:15)", note: "삿포로역은 시발역이 아니라 자유석이 붐빔 → 4호차 지정석 uSeat 미리 예약" },
    { time: "14:00", type: "flight", text: "신치토세 도착 · 체크인 · 보안검색", place: "cts", note: "국제선 터미널 2층 로이스·기타카로 면세점 구경" },
    { time: "16:00", type: "flight", text: "출발 (7C1504) → 19:25 인천 도착" },
  ],
  cost: [
    ["점심 (역 식당가)", 6000],
    ["JR 삿포로 → 공항 + uSeat (2,030엔 × 4)", 8120],
    ["공항 카페 · 간식", 4000],
  ],
};

const PLANS = {
  B: {
    name: "B안",
    title: "오타루·단풍 감성형",
    summary: "평일 조잔케이·머리대불 드라이브 + 공휴일엔 JR로 오타루",
    fatigue: 3,
    car: "11/2(월) 하루 렌터카 (오릭스 CX-5급 예약 완료)",
    highlight: "오타루 운하 · 은행나무길 · 머리대불",
    pros: ["단풍·은행·바다·온천 골고루", "공휴일 정체는 JR로 피함"],
    cons: ["11/2 운전 합계 약 2시간 15분", "11/3은 짐 옮기고 오타루라 바쁜 편"],
    costNote: "항공·숙박·쇼핑 제외. 식비는 1인 점심 1,500~3,500엔, 저녁 3,000~4,000엔 기준 추정",
    days: [
      DAY_ARRIVE,
      {
        date: "11/1", dow: "일", title: "마루야마 · 홋카이도신궁 · 홋카이도대",
        mode: "transit",
        route: ["hotel1", "maruyama", "shrine", "hokudai", "hotel1", "susukino"],
        items: [
          { time: "09:30", type: "move", text: "지하철 도자이선 니시11초메역 → 마루야마코엔역 (2정거장)", note: "숙소에서 니시11초메역까지 도보 약 10분" },
          { time: "10:00", type: "see", text: "마루야마공원 단풍 산책", place: "maruyama", note: "평지 위주라 걷기 편함" },
          { time: "10:45", type: "see", text: "홋카이도신궁 참배 (공원과 바로 연결)", place: "shrine", note: "경내 롯카테이 찻집에서 '한텐 모찌' 간식" },
          { time: "12:00", type: "food", text: "점심 — 마루야마 주변 수프카레 또는 카페", place: "maruyama" },
          { time: "13:15", type: "move", text: "택시로 홋카이도대 (약 15~20분)", note: "4명이면 지하철 환승보다 택시가 편하고 비용도 비슷" },
          { time: "13:45", type: "see", text: "홋카이도대 은행나무길 · 포플러 가로수 · 클라크 흉상", place: "hokudai", note: "노란 은행 절정기 + 일요일이라 붐빔. 캠퍼스는 평지" },
          { time: "15:00", type: "rest", text: "캠퍼스 카페 또는 숙소 복귀 후 휴식", place: "hotel1", note: "기타12조역 → 스스키노역 (난보쿠선)" },
          { time: "18:00", type: "food", text: "스스키노 저녁 — 라멘요코초 또는 이자카야", place: "susukino" },
        ],
        cost: [
          ["지하철 (주말 하루 상한 520엔 × 4, 카드 터치 결제)", 2080],
          ["택시 마루야마 → 홋카이도대 (추정)", 2500],
          ["점심 수프카레", 7200],
          ["카페 · 간식 (한텐 모찌 등)", 4000],
          ["저녁 라멘 · 이자카야", 12000],
        ],
      },
      {
        date: "11/2", dow: "월", title: "머리대불 · 조잔케이 드라이브",
        mode: "driving",
        route: ["hotel1", "orix", "daibutsu", "futami", "jozankei", "orix", "hotel1", "susukino"],
        items: [
          { time: "08:10", type: "move", text: "택시로 오릭스렌터카 삿포로역앞점 (약 15분)", place: "orix", note: "札幌市北区北9条西3丁目10-1 小田ビル1F · JR 삿포로역 북쪽 출구(東通り北口) 도보 3분" },
          { time: "08:30", type: "move", text: "렌터카 픽업 — 오릭스 CX-5급 · 금연차 (예약 완료)", place: "orix", note: "운전자 국제면허증 + 한국 면허증 + 여권, 운전자·동승자 명의 신용카드로 현장결제. 스터드리스 타이어 장착 여부 확인" },
          { time: "09:00", type: "move", text: "머리대불로 출발 (약 45분)" },
          { time: "10:00", type: "see", text: "머리대불 (아타마 다이부츠) — 안도 다다오 설계", place: "daibutsu", note: "11월 관람 10:00~15:00(공식). 관람료 500엔(2026년 1,000엔 인상 정보도 있음 — 현장 확인). 물 정원은 11/3까지" },
          { time: "11:15", type: "move", text: "조잔케이로 이동 (차로 약 45분)" },
          { time: "12:00", type: "food", text: "점심 — 조잔케이 소바·온천마을 식당", place: "jozankei" },
          { time: "13:00", type: "see", text: "조잔케이 산책 · 후타미 흔들다리 · 갓파 족욕", place: "futami", note: "올해 단풍이 예년보다 일러 낙엽이 진행됐을 수 있음" },
          { time: "14:30", type: "move", text: "오릭스 삿포로역앞점으로 복귀 (약 1시간)", place: "orix", note: "반납 예약 16:00 · 반납 전 근처 주유소에서 가득 주유" },
          { time: "15:40", type: "move", text: "렌터카 반납 → 택시로 숙소 (약 15분)", place: "orix" },
          { time: "16:00", type: "rest", text: "숙소에서 휴식", place: "hotel1" },
          { time: "18:30", type: "food", text: "스스키노 저녁", place: "susukino" },
        ],
        cost: [
          ["렌터카 오릭스 CX-5급 (면책보상·안심팩 포함, 현장결제)", 11924],
          ["택시 숙소 ↔ 렌터카 지점 왕복 (추정)", 3000],
          ["주유 · 주차 (추정)", 2500],
          ["머리대불 관람료 (500~1,000엔 × 4)", 4000],
          ["점심 조잔케이 소바", 6000],
          ["저녁 스스키노", 14000],
        ],
      },
      {
        date: "11/3", dow: "화·공휴일", title: "오타루 당일치기 · 유엔 온천",
        mode: "transit",
        route: ["hotel1", "yuen", "station", "otaruSta", "sankaku", "canal", "sakaimachi", "otaruSta", "station", "yuen", "nakajima"],
        items: [
          { time: "09:00", type: "hotel", text: "체크아웃 · 택시로 유엔에 짐 맡기기 (약 10분)", place: "yuen", note: "11/3 문화의 날(공휴일) — 도로는 막혀도 JR은 상관없음" },
          { time: "09:30", type: "move", text: "유엔 → 삿포로역 (도보 약 10분) → JR 오타루역 (약 35~45분)", place: "station", note: "공휴일이라 붐빔 → 쾌속 에어포트 4호차 uSeat 미리 예약. 진행방향 오른쪽이 바다 뷰" },
          { time: "10:30", type: "food", text: "산카쿠시장 구경 · 이른 점심 해산물덮밥", place: "sankaku", note: "공휴일이라 11시 넘으면 대기 길어짐" },
          { time: "11:45", type: "see", text: "오타루운하 산책 · 아사쿠사바시 기념사진", place: "canal" },
          { time: "12:45", type: "shop", text: "사카이마치거리 — 오르골당·유리공방·르타오", place: "sakaimachi" },
          { time: "14:15", type: "rest", text: "카페 휴식 (르타오 본점 디저트)", place: "sakaimachi" },
          { time: "15:15", type: "move", text: "JR로 삿포로 복귀", place: "otaruSta", note: "운하 가스등(16:30경)까지 보려면 17:00 기차로 미루기" },
          { time: "16:15", type: "hotel", text: "유엔 체크인 · 온천·노천탕", place: "yuen" },
          { time: "18:30", type: "food", text: "유엔 내 저녁 또는 스스키노", place: "yuen" },
          { time: "19:30", type: "see", text: "(선택) 나카지마공원 라이트업 마지막 날", place: "nakajima", note: "온천 후 피곤하면 생략" },
        ],
        cost: [
          ["택시 숙소 → 유엔 짐 맡기기 (추정)", 1500],
          ["JR 삿포로 ↔ 오타루 왕복 (800엔 × 2 × 4)", 6400],
          ["uSeat 오타루행 (800엔 × 4)", 3200],
          ["점심 해산물덮밥", 14000],
          ["카페 (르타오)", 4800],
          ["저녁 (유엔 석식 포함 플랜이면 0)", 16000],
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
  { title: "교통카드", text: "지하철은 신용카드 터치 결제 가능 — 토·일·공휴일 하루 520엔, 평일 830엔이 상한이라 자동으로 1일권이 됨. JR은 Suica/Kitaca 또는 승차권." },
  { title: "기차 예약", text: "JR-EAST Train Reservation(한국어 지원)에서 쾌속 에어포트 4호차 지정석 uSeat를 1인 800엔에 예약. 승차일 1개월 전 10시부터 열림. 승차권(운임)은 별도로 IC카드나 매표기로." },
  { title: "11/3 공휴일", text: "문화의 날. 도로 정체가 심해 이날은 JR로만 이동. 관광지·식당이 붐비니 인기 식당은 예약 권장." },
  { title: "렌터카", text: "오릭스렌터카 삿포로역앞점 (08:00~19:00, ☎ 011-726-0543) · 11/2 08:30~16:00 CX-5급 예약 완료, 현장 카드결제. 운전자는 국제운전면허증 + 한국 면허증 + 여권 지참. 10/26까지 무료 취소, 이후 기본요금의 20~50%." },
  { title: "숙소 이동", text: "11/3 아침 체크아웃 후 택시로 짐만 먼저 유엔에 맡기고 가볍게 오타루로 출발." },
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
  "국제운전면허증 발급 (운전자)",
  "렌터카 예약 완료 — 오릭스 삿포로역앞점 11/2 08:30~16:00 CX-5급 (현장결제)",
  "JR uSeat 예약 — 11/3 삿포로→오타루, 11/4 삿포로→공항",
  "유엔 체크인 시간 · 온천 이용 시간 확인",
  "11/4 13:00~13:15 삿포로역 JR 출발",
];
