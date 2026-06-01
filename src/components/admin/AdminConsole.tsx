import { useState } from 'react';
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

/** 관리자 콘솔: NEC 자료 링크 → PDF 업로드·추출 → 선거구 초안 → 미리보기·저장 */
function AdminConsole({ customElections, onChange, onExit }: AdminConsoleProps) {
  const [regionName, setRegionName] = useState('');
  const [extracts, setExtracts] = useState<PdfExtractResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [draftJson, setDraftJson] = useState('');
  const [error, setError] = useState('');

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setBusy(true);
    setError('');
    const results: PdfExtractResult[] = [];
    try {
      for (const file of Array.from(fileList)) {
        if (!file.name.toLowerCase().endsWith('.pdf')) continue;
        const result = await extractPdf(file, setProgress);
        results.push(result);
      }
      setExtracts((prev) => [...prev, ...results]);
      setProgress(`완료: ${results.length}개 파일 추출`);
    } catch (e) {
      setError(`추출 실패: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleBuildDraft = () => {
    const draft = buildDraftElection(extracts.map((x) => x.text), regionName);
    setDraftJson(JSON.stringify(draft, null, 2));
    setError('');
  };

  const downloadText = () => {
    const blob = new Blob([extracts.map((x) => x.text).join('\n\n')], { type: 'text/plain' });
    triggerDownload(blob, 'extracted-text.txt');
  };

  const applyPreview = () => {
    try {
      const parsed: unknown = JSON.parse(draftJson);
      const election = normalizeElection(parsed);
      if (election.candidates.length === 0) {
        setError('후보(candidates)가 비어 있습니다. 최소 1명 이상 채워주세요.');
        return;
      }
      const next = saveCustomElection(election);
      setError('');
      onChange(next, election.id); // 앱으로 전환 + 해당 선거구 선택
    } catch (e) {
      setError(`JSON 오류: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const exportElection = (election: Election) => {
    const blob = new Blob([JSON.stringify(election, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `${election.id}.json`);
  };

  const removeElection = (id: string) => {
    onChange(deleteCustomElection(id));
  };

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
          업로드한 PDF는 외부로 전송되지 않고 <strong>브라우저 안에서만</strong> 처리됩니다. 이미지
          PDF는 한국어 OCR로 읽으며(시간이 걸리고 오탈자가 있을 수 있음), 결과는 검토가 필요한
          초안입니다.
        </p>

        {/* STEP 1 */}
        <section className={styles.Step}>
          <h2 className={styles.StepTitle}>1. 선거관리위원회에서 자료 받기</h2>
          <p className={styles.StepDesc}>
            아래에서 선거·지역을 고른 뒤 후보들의 선거공보·공약집·후보자정보공개자료(PDF)를
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
          <h2 className={styles.StepTitle}>2. 선거구명 입력 & 후보 PDF 일괄 업로드</h2>
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
            이 선거구에 출마한 <strong>모든 후보의 선거공보·선거공약서·5대공약 PDF를 한 번에</strong>{' '}
            선택/드롭하세요. 파일들에서 후보(기호·이름·정당)를 함께 인식합니다.
          </p>
          <label className={styles.Upload}>
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              disabled={busy}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <span>{busy ? '처리 중…' : '후보 PDF 여러 개 한 번에 선택/드롭'}</span>
          </label>
          {progress ? <p className={styles.Progress}>{progress}</p> : null}

          {extracts.length > 0 ? (
            <div className={styles.Extracts}>
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
                  추출 텍스트(.txt) 내려받기
                </button>
                <button type="button" className={styles.GhostButton} onClick={() => setExtracts([])}>
                  추출 결과 비우기
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {/* STEP 3 */}
        <section className={styles.Step}>
          <h2 className={styles.StepTitle}>3. 선거구 초안 만들기</h2>
          <p className={styles.StepDesc}>
            추출 텍스트에서 선거명·후보(기호·이름·정당)를 자동 추정해 초안 JSON을 만듭니다. 공약·재산·
            전과 등 상세는 위 추출 텍스트를 보고 JSON을 직접 채워주세요. (형식은 DATA_GUIDE 참고)
          </p>
          <div className={styles.RowActions}>
            <button
              type="button"
              className={styles.Button}
              onClick={handleBuildDraft}
              disabled={extracts.length === 0}
            >
              추출 결과로 초안 생성
            </button>
          </div>
          <textarea
            className={styles.JsonEditor}
            value={draftJson}
            onChange={(e) => setDraftJson(e.target.value)}
            placeholder="여기에 선거구(Election) JSON을 작성하거나, 위 버튼으로 초안을 생성하세요."
            spellCheck={false}
          />
          {error ? <p className={styles.Error}>{error}</p> : null}
        </section>

        {/* STEP 4 */}
        <section className={styles.Step}>
          <h2 className={styles.StepTitle}>4. 미리보기로 분석 시작</h2>
          <p className={styles.StepDesc}>
            저장하면 이 브라우저에 보관되고, 선거구 선택기에 추가되어 종합비교·공약비교·인물검증·
            공약퀴즈 4개 화면에서 바로 분석할 수 있습니다.
          </p>
          <div className={styles.RowActions}>
            <button
              type="button"
              className={styles.PrimaryButton}
              onClick={applyPreview}
              disabled={!draftJson.trim()}
            >
              미리보기 적용 · 저장
            </button>
          </div>
        </section>

        {/* 저장 목록 */}
        {customElections.length > 0 ? (
          <section className={styles.Step}>
            <h2 className={styles.StepTitle}>저장된 선거구 (이 브라우저)</h2>
            <ul className={styles.SavedList}>
              {customElections.map((e) => (
                <li key={e.id} className={styles.SavedItem}>
                  <div className={styles.SavedInfo}>
                    <span className={styles.SavedName}>{e.meta.region}</span>
                    <span className={styles.SavedSub}>
                      {e.id} · 후보 {e.candidates.length}명
                    </span>
                  </div>
                  <div className={styles.RowActions}>
                    <button type="button" className={styles.GhostButton} onClick={() => onChange(customElections, e.id)}>
                      보기
                    </button>
                    <button type="button" className={styles.GhostButton} onClick={() => exportElection(e)}>
                      JSON 내보내기
                    </button>
                    <button type="button" className={styles.DangerButton} onClick={() => removeElection(e.id)}>
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.StepDesc}>
              영구 반영하려면 내보낸 JSON을 <code>src/data/regions/&lt;id&gt;/</code> 모듈로 옮겨
              커밋하세요(README·DATA_GUIDE 참고).
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
