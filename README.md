# AI 얼굴나이 테스트

여러분의 얼굴은 몇 살로 보일까요? 인공지능이 분석한 외모 나이를 확인해보세요!
https://aige.netlify.app

## 서비스 소개
Teachable Machine으로 학습한 이미지 분류 모델이 사진을 6개 연령대(애기, 10대~50대)로 분류하고,
각 연령대 대표 나이를 확률로 가중평균해 예상 나이를 보여주는 재미용 서비스입니다.
사진은 브라우저 안에서만(TensorFlow.js) 분석되며 서버로 전송되지 않습니다.

## 기술 스택
- [Astro](https://astro.build) 정적 사이트 + `ClientRouter`(View Transitions)로 SPA처럼 페이지 전환
- AI 모델: Google Teachable Machine + TensorFlow.js (업로드 시점에 지연 로딩)
- 배포: Netlify (`netlify.toml`)

## 다국어 구조
한국어(`/`), English(`/en/`), 中文(`/zh/`), 日本語(`/ja/`), ไทย(`/th/`), Tiếng Việt(`/vi/`), हिन्दी(`/hi/`)

- 번역 텍스트: `src/i18n/locales/{언어}.json` — 페이지 메타, 본문, 결과 문구, FAQ 모두 여기서 관리
- 페이지 템플릿: `src/pages/[...lang]/{index,about,info}.astro` — 템플릿 하나가 7개 언어 페이지를 생성
- 언어 추가: `locales/` 에 JSON 추가 후 `src/i18n/index.ts` 의 `LOCALES`, `LOCALE_INFO` 에 등록

## SEO / GEO
- 언어별 URL·`lang`·canonical·hreflang(+x-default)·Open Graph
- JSON-LD: WebApplication, HowTo, FAQPage, AboutPage, BreadcrumbList
- `/sitemap.xml`(hreflang 대체 링크 포함), `/llms.txt`, AI 크롤러를 허용하는 `robots.txt`
- 기존 `*.html` 주소는 `public/_redirects` 로 새 주소에 301 리다이렉트

## 개발
```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 에 정적 파일 생성
npm run preview
```
Node.js 22.12 이상이 필요합니다.
