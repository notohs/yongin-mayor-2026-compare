# 선거구 추가 가이드

새 선거구(시·구) 자료를 넣으면 **종합비교·공약비교·인물검증·공약퀴즈** 4개 화면이 동일한 방식으로
자동 생성됩니다. 데이터는 **선거구별 모듈**(`src/data/regions/<id>/`)로 격리되며,
`src/data/regions/index.ts` 가 폴더를 자동 수집(`import.meta.glob`)해 앱에 등록합니다.
지역이 둘 이상이면 헤더에 **지역 선택기**가 자동으로 나타납니다.

## 빠른 시작

```bash
cd web

# 1) 선거구 스캐폴딩 (소문자/숫자/하이픈 id)
npm run new:region seongnam-mayor-2026

# 2) data-sources/seongnam-mayor-2026/ 에 선거공보·공약집 PDF를 넣는다

# 3) PDF 텍스트 추출 (이미지 PDF는 OCR)
npm run ingest seongnam-mayor-2026
#  → _ingest/seongnam-mayor-2026/*.txt 생성

# 4) 추출 텍스트를 보고 src/data/regions/seongnam-mayor-2026/ 모듈을 채운다 (아래 참고)

# 5) 확인 / 빌드 / 포터블 데이터 생성
npm run dev          # 로컬 확인
npm run build        # 타입체크 + 빌드
npm run gen:data     # candidates.json 재생성(선택)
```

후보(`candidates`)가 1명 이상 채워지면 그 선거구가 앱에 자동으로 나타납니다.

## 채워야 할 파일 (src/data/regions/&lt;id&gt;/)

| 파일 | 내용 | 화면 |
|------|------|------|
| `meta.ts` | 지역명·제목·출처 | 헤더/푸터/선택기 |
| `candidates.ts` | 후보 인적사항 + 5대 공약(분야 `category` 포함) | 종합비교·인물검증·공약비교·퀴즈 |
| `bulletinPolicies.ts` | 선거공보 세부 공약(분야별) | 공약비교(분야별)·상세 모달 |
| `quizThemes.ts` | 공약 퀴즈 정책 문항 | 공약 퀴즈 |
| `index.ts` | 위 4개를 묶어 `election` export | (자동 등록) |

형식과 작성 예시는 각 파일의 주석과 [`src/data/types.ts`](src/data/types.ts), 그리고 기존
`src/data/regions/yongin-mayor-2026/` 를 참고하세요.

### 어떤 화면이 무엇으로 만들어지나

- **종합비교**: `candidates`(나이·직업·학력·비전·재산·전과 칩)
- **공약비교**: `candidates.pledges`(분야 `category`) + `bulletinPolicies`(분야별 정면 비교)
- **인물검증**: `candidates`의 학력·경력·재산·납세·체납·병역·전과
- **공약퀴즈**:
  - 정책 문항 = `quizThemes`(직접 작성, 후보별 접근 차이를 익명 요약)
  - 검증 문항 = `candidates`의 병역 미이행·체납 이력·전과에서 **자동 생성**
  - 전체 문항 수는 **최소 10 ~ 최대 20**(공약이 많아도 20개 상한, `quizEngine.MAX_QUIZ_QUESTIONS`)

## 분야 카테고리

5대 공약·공보 공약·퀴즈는 공통 분야 키를 씁니다(아이콘·집계 기준).

`transport`(교통) · `semiconductor`(반도체·미래산업) · `economy`(경제·일자리) ·
`welfare`(복지·생활) · `urban`(도시·개발) · `education`(교육) · `culture`(문화·관광) ·
`housing`(주거·환경) — 메타데이터는 [`src/data/categories.ts`](src/data/categories.ts).

## 한계 (정직한 안내)

- PDF → 최종 데이터는 **완전 자동이 아닙니다.** `ingest` 가 텍스트/OCR 추출까지 자동화하지만,
  - 어떤 항목이 학력/경력/전과인지 정리,
  - 공약의 분야 분류,
  - 퀴즈용 **중립적 익명 요약(blurb)** 작성
  은 사람이 검수·작성해야 합니다(특히 이미지 OCR은 오탈자가 있습니다).
- 후보가 제출 자료가 적으면(예: 공보가 표지뿐) 일부 분야가 비거나, 공보 기반 퀴즈 문항이
  2지선다가 될 수 있습니다 — 데이터 그대로 표시하며 결과 화면에 명시됩니다.
