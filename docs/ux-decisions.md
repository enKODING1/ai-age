# UI/UX 설계 근거

이 사이트(사진 한 장 또는 카메라 → 예상 나이를 보는 재미용 테스트)에 적용한 결정과 근거를 정리합니다.

| 결정 | 근거 |
| --- | --- |
| 햄버거 메뉴를 없애고 3개 메뉴를 항상 노출 (모바일은 헤더 아래 탭 줄) | NN/g 정량 연구(179명, 6개 사이트): 숨긴 내비게이션은 보이는 내비게이션보다 발견성이 약 20% 낮고 작업 시간이 길다 — [Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/) |
| 핵심 행동(사진 올리기 / 카메라)을 첫 화면 안에 두고 히어로를 짧게 | 사용자의 시선은 첫 화면에 가장 오래 머문다 — [NN/g, Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/) |
| 주요 버튼을 화면 폭 가득, 높이 52px 이상으로 카드 하단에 배치 | 휴대폰 터치의 약 75%가 엄지로 이뤄진다(관찰 1,333건) — [Hoober, How Do Users Really Hold Mobile Devices?](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php) / WCAG 2.2 2.5.8 터치 영역 |
| 카메라 권한은 '카메라 켜기'를 누른 뒤에만 요청하고, 그 전에 용도와 저장하지 않는다는 점을 먼저 설명. 거부되면 사진 올리기로 안내 | 사용자 행동 없이 뜬 권한 요청은 허용률이 약 12%, 사용자 행동 뒤에는 약 30% — [web.dev, Permissions best practices](https://web.dev/articles/permissions-best-practices) / [NN/g, Permission Requests](https://www.nngroup.com/articles/permission-requests/) |
| 분석 단계(모델 로드 → 얼굴 찾기 → 분석)를 문구와 스캔 애니메이션으로 표시, 얼굴을 찾으면 프레임으로 표시 | 닐슨 휴리스틱 1번 '시스템 상태의 가시성', 작업 과정을 보여주면 결과의 가치를 더 높게 평가한다(Buell & Norton, *The Labor Illusion*, 2011) |
| 결과는 예상 나이 → 설명 → 연령대별 확률 순, FAQ 는 접이식 | 점진적 공개(progressive disclosure)로 핵심부터 보여준다 |
| 언어 선택에 국기 대신 각 언어의 고유 이름(한국어, English, 日本語…) | 국기는 나라를 뜻하지 언어가 아니다 — W3C 국제화 Q&A 권고 |
| 광고 영역 크기(320×50)를 미리 확보 | 늦게 로드되는 광고가 본문을 밀어내는 레이아웃 이동(CLS)을 막는다 — [web.dev, Loading ads without impacting page speed](https://web.dev/loading-ads-page-speed) |
| 브루탈리즘 스타일 유지, 단 내비게이션 위치·링크 밑줄·버튼 모양 같은 관례는 지킴 | 브루탈리즘은 관례를 깨는 '안티디자인'과 다르며, 관례를 지키면 사용성을 해치지 않는다(NN/g) |
| 결과 공유 버튼(Web Share API, 미지원 시 링크 복사) | 테스트형 서비스의 주된 유입 경로. 모바일에서는 OS 공유 시트를 그대로 쓴다 — [web.dev, Web Share API](https://web.dev/articles/web-share) |
| 모든 애니메이션은 `prefers-reduced-motion` 을 따르고, 첫 방문 애니메이션은 세션당 1번, 1초 이내 | 접근성(WCAG 2.3.3) · 콘텐츠를 가리는 스플래시 화면 대신 실제 요소를 등장시켜 LCP 를 늦추지 않음 |
