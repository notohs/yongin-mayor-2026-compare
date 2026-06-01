import { useEffect, useRef, useState } from 'react';
import type { Election } from '../../data/types';
import { extractPdf, type PdfExtractResult } from '../../utils/pdfExtract';
import { buildDraftElection } from '../../utils/draftElection';
import {
  deleteCustomElection,
  normalizeElection,
  saveCustomElection,
} from '../../utils/customElections';
import styles from './AdminConsole.module.scss';

interface AdminConsoleProps {
  customElections: Election[];
  onChange: (next: Election[], focusId?: string) => void;
  onExit: () => void;
}

const NEC_LINKS = [
  {
    label: '정책·공약마당 (선거/지역 선택)',
    url: 'https://policy.nec.go.kr/',
    desc: '선거·지역을 골라 후보별 5대 공약·공약집을 내려받습니다.',
  },
  {
    label: '중앙선관위 선거통계시스템',
    url: 'https://info.nec.go.kr/',
    desc: '후보자정보공개자료(학력·재산·병역·전과 등) 확인·내려받기.',
  },
];

/** 관리자 콘솔: NEC 자료 링크 → 선거구명 입력·PDF 일괄 업로드 → 자동 분석 시작 */
function AdminConsole({ customElections, onChange, onExit }: AdminConsoleProps) {
  const [regionName, setRegionName] = useState('');
  const [extracts, setExtracts] = useState<PdfExtractResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [draftJson, setDraftJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 페이지 아무 곳에 파일을 떨어뜨려도 브라우저가 PDF를 새 탭으로 여는 기본 동작 차단
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  const processFiles = async (files: File[]) => {
    const pdfs = files.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length === 0) {
      setError('PDF 파일을 올려주세요.');
      return;
    }
    setBusy(true);
    setError('');
    const results: PdfExtractResult[] = [];
    try {
      for (const file of pdfs) {
        const result = await extractPdf(file, setProgress);
        results.push(result);
      }
      setExtracts((prev) => [...prev, ...results]);
      setProgress(`완료: ${results.length}개 파일에서 텍스트를 읽었습니다.`);
    } catch (e) {
      setError(`추출 실패: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (busy) return;
    void processFiles(Array.from(e.dataTransfer.files));
  };

  const buildDraft = (): Election =>
    buildDraftElection(
      extracts.map((x) => x.text),
      regionName,
    );

  // 원클릭: 업로드한 자료로 바로 분석 시작
  const analyzeNow = () => {
    const draft = buildDraft();
    if (draft.candidates.length === 0) {
      setError(
        '후보를 자동 인식하지 못했습니다. 선거구명을 입력했는지 확인하고, 아래 “데이터 직접 편집(고급)”에서 후보를 추가해 주세요.',
      );
      return;
    }
    setError('');
    const next = saveCustomElection(draft);
    onChange(next, draft.id); // 비교 화면으로 전환 + 해당 선거구 선택
  };

  const loadDraftIntoEditor = () => {
    setDraftJson(JSON.stringify(buildDraft(), null, 2));
    setError('');
  };

  const applyJson = () => {
    try {
      const election = normalizeElection(JSON.parse(draftJson));
      if (election.candidates.length === 0) {
        setError('후보(candidates)가 비어 있습니다. 최소 1명 이상 채워주세요.');
        return;
      }
      setError('');
      onChange(saveCustomElection(election), election.id);
    } catch (e) {
      setError(`JSON 오류: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const downloadText = () =>
    triggerDownload(
      new Blob([extracts.map((x) => x.text).join('\n\n')], { type: 'text/plain' }),
      'extracted-text.txt',
    );

  const exportElection = (election: Election) =>
    triggerDownload(
      new Blob([JSON.stringify(election, null, 2)], { type: 'application/json' }),
      `${election.id}.json`,
    );

  const detectedCount = extracts.length > 0 ? buildDraft().candidates.length : 0;

  return (
    <div className={styles.AdminConsole}>
      <header className={styles.Bar}>
        <h1 className={styles.BarTitle}>🛠 관리자 콘솔</h1>
        <button type="button" className={styles.ExitButton} onClick={onExit}>
          ← 비교 화면으로
        </button>
      </header>

      <div className={styles.Body}>
        <p className={styles.Privacy}>
          한 선거구의 후보 자료(PDF)를 올리면 <strong>브라우저 안에서만</strong> 글자를 읽어
          비교 화면을 만듭니다(외부 전송 없음). 이미지로 된 PDF는 한국어 OCR로 읽어 시간이 걸리고
          오탈자가 있을 수 있어, 결과는 검토가 필요한 초안입니다.
        </p>

        {/* STEP 1 */}
        <section className={styles.Step}>
          <h2 className={styles.StepTitle}>1. 선거관리위원회에서 자료 받기</h2>
          <p className={styles.StepDesc}>
            아래에서 선거·지역을 고른 뒤, 그 선거구 후보들의 선거공보·공약집·후보자정보공개자료(PDF)를
            내려받으세요.
          </p>
          <div className={styles.Links}>
            {NEC_LINKS.map((link) => (
              <a
                key={link.url}
                className={styles.LinkCard}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.LinkLabel}>{link.label} ↗</span>
                <span className={styles.LinkDesc}>{link.desc}</span>
              </a>
            ))}
          </div>
        </section>

        {/* STEP 2 */}
        <section className={styles.Step}>
          <h2 className={styles.StepTitle}>2. 선거구명 입력 & 후보 PDF 올리기</h2>
          <label className={styles.Field}>
            <span className={styles.FieldLabel}>선거구명</span>
            <input
              className={styles.TextInput}
              type="text"
              value={regionName}
              placeholder="예: 경기도지사 선거"
              onChange={(e) => setRegionName(e.target.value)}
            />
          </label>
          <p className={styles.StepDesc}>
            이 선거구에 출마한 <strong>모든 후보의 PDF를 한 번에</strong> 올리세요(여러 개 선택 가능).
          </p>

          <div
            className={`${styles.Drop} ${dragActive ? styles.dropActive : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!busy) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              hidden
              onChange={(e) => {
                void processFiles(Array.from(e.target.files ?? []));
                e.target.value = '';
              }}
            />
            <span className={styles.DropIcon} aria-hidden>
              📄
            </span>
            <span className={styles.DropMain}>
              {busy ? '읽는 중…' : '여기로 PDF를 끌어다 놓거나 클릭해서 선택'}
            </span>
            <span className={styles.DropSub}>PDF 여러 개를 한 번에 올릴 수 있어요</span>
          </div>
          {progress ? <p className={styles.Progress}>{progress}</p> : null}

          {extracts.length > 0 ? (
            <div className={styles.Extracts}>
              <p className={styles.StepDesc}>
                올린 파일 {extracts.length}개 · 자동 인식된 후보 <strong>{detectedCount}명</strong>
              </p>
              {extracts.map((ex, i) => (
                <details key={`${ex.name}-${i}`} className={styles.Extract}>
                  <summary>
                    {ex.name} · {ex.pages.length}쪽 {ex.usedOcr ? '· OCR' : '· 텍스트'}
                  </summary>
                  <textarea className={styles.ExtractText} readOnly value={ex.text} />
                </details>
              ))}
              <div className={styles.RowActions}>
                <button type="button" className={styles.GhostButton} onClick={downloadText}>
                  읽은 텍스트(.txt) 내려받기
                </button>
                <button
                  type="button"
                  className={styles.GhostButton}
                  onClick={() => {
                    setExtracts([]);
                    setProgress('');
                  }}
                >
                  올린 파일 비우기
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {/* STEP 3 — 원클릭 분석 */}
        <section className={styles.Step}>
          <h2 className={styles.StepTitle}>3. 분석 시작</h2>
          <p className={styles.StepDesc}>
            올린 자료에서 <strong>선거구명과 후보(기호·이름·정당)</strong>를 자동으로 읽어
            비교 화면을 만들고, 바로 종합비교·공약비교·인물검증·공약퀴즈로 이동합니다. 공약·재산·전과
            같은 <strong>상세 항목은 자동으로 다 채워지지 않으니</strong>, 필요하면 아래 “데이터 직접
            편집”에서 보완하세요.
          </p>
          <div className={styles.RowActions}>
            <button
              type="button"
              className={styles.PrimaryButton}
              onClick={analyzeNow}
              disabled={extracts.length === 0 || busy}
            >
              업로드한 자료로 분석 시작 →
            </button>
          </div>
          {error ? <p className={styles.Error}>{error}</p> : null}

          {/* 고급(선택): 데이터 직접 편집 */}
          <details
            className={styles.Advanced}
            open={showAdvanced}
            onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
          >
            <summary className={styles.AdvancedSummary}>데이터 직접 편집 (고급, 선택)</summary>
            <div className={styles.AdvancedBody}>
              <p className={styles.StepDesc}>
                공약·전과·재산 등 상세 데이터를 직접 채우거나 고치고 싶을 때 사용합니다. 아래에서
                자동 인식 결과를 불러온 뒤 내용을 보완하고 “이 데이터로 적용”을 누르세요. 형식은
                README의 데이터 가이드를 참고하세요.
              </p>
              <div className={styles.RowActions}>
                <button
                  type="button"
                  className={styles.Button}
                  onClick={loadDraftIntoEditor}
                  disabled={extracts.length === 0 && !regionName}
                >
                  자동 인식 결과 불러오기
                </button>
              </div>
              <textarea
                className={styles.JsonEditor}
                value={draftJson}
                onChange={(e) => setDraftJson(e.target.value)}
                placeholder="‘자동 인식 결과 불러오기’를 누르면 여기에 데이터(JSON)가 채워집니다."
                spellCheck={false}
              />
              <div className={styles.RowActions}>
                <button
                  type="button"
                  className={styles.PrimaryButton}
                  onClick={applyJson}
                  disabled={!draftJson.trim()}
                >
                  이 데이터로 적용 →
                </button>
              </div>
            </div>
          </details>
        </section>

        {/* 저장 목록 */}
        {customElections.length > 0 ? (
          <section className={styles.Step}>
            <h2 className={styles.StepTitle}>이 브라우저에 저장된 선거구</h2>
            <ul className={styles.SavedList}>
              {customElections.map((e) => (
                <li key={e.id} className={styles.SavedItem}>
                  <div className={styles.SavedInfo}>
                    <span className={styles.SavedName}>{e.meta.region}</span>
                    <span className={styles.SavedSub}>후보 {e.candidates.length}명</span>
                  </div>
                  <div className={styles.RowActions}>
                    <button
                      type="button"
                      className={styles.GhostButton}
                      onClick={() => onChange(customElections, e.id)}
                    >
                      비교 화면에서 보기
                    </button>
                    <button
                      type="button"
                      className={styles.GhostButton}
                      onClick={() => exportElection(e)}
                    >
                      JSON 내보내기
                    </button>
                    <button
                      type="button"
                      className={styles.DangerButton}
                      onClick={() => onChange(deleteCustomElection(e.id))}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.StepDesc}>
              저장된 선거구는 이 브라우저에만 보관됩니다. 영구 반영하려면 “JSON 내보내기”로 받은
              파일을 코드 저장소의 선거구 모듈로 옮겨 커밋하세요.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default AdminConsole;
