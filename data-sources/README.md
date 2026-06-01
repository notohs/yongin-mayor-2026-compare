# data-sources

선거구별 **원자료(선거공보·공약집 PDF 등)** 를 두는 폴더입니다.

```
data-sources/
  <region-id>/        # 예: yongin-mayor-2026
    *.pdf             # 선거공보, 공약집 등 (커밋되지 않음 — 저작권·용량)
```

## 사용 흐름

1. `npm run new:region <region-id>` — 선거구 모듈 + 이 폴더를 만듭니다.
2. 이 폴더(`data-sources/<region-id>/`)에 PDF를 넣습니다.
3. `npm run ingest <region-id>` — PDF 텍스트를 추출(이미지 PDF는 OCR)해 `_ingest/<region-id>/`에 저장합니다.
4. 추출 텍스트를 보고 `src/data/regions/<region-id>/` 의 데이터 모듈을 채웁니다.

> PDF·이미지 원자료와 `_ingest/` 추출물은 `.gitignore` 로 저장소에 포함되지 않습니다.
> 자세한 작성 방법은 [`../DATA_GUIDE.md`](../DATA_GUIDE.md) 참고.
