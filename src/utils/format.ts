// 금액·수치 표시용 포맷 유틸. 데이터의 금액 단위는 모두 '천원'.

const WON_PER_THOUSAND = 1000;
const WON_PER_EOK = 100_000_000; // 1억
const WON_PER_MAN = 10_000; // 1만

/**
 * 천원 단위 금액을 '억/만원' 형태의 읽기 쉬운 문자열로 변환.
 * 음수(채무 초과)는 앞에 − 를 붙인다. 만원 단위로 반올림.
 */
export function formatMoney(thousandWon: number): string {
  const won = thousandWon * WON_PER_THOUSAND;
  const isNegative = won < 0;
  const absWon = Math.abs(won);

  let eok = Math.floor(absWon / WON_PER_EOK);
  let man = Math.round((absWon - eok * WON_PER_EOK) / WON_PER_MAN);

  // 반올림으로 만원이 1억이 되는 경계 보정
  if (man >= WON_PER_EOK / WON_PER_MAN) {
    eok += 1;
    man = 0;
  }

  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만원`);
  if (parts.length === 0) parts.push('0원');
  else if (eok > 0 && man === 0) parts[0] = `${eok}억원`;

  return `${isNegative ? '−' : ''}${parts.join(' ')}`;
}

/** 천원 단위 원본 수치를 '12,345천원' 형태로 표시 */
export function formatThousandWon(thousandWon: number): string {
  const sign = thousandWon < 0 ? '△' : '';
  return `${sign}${Math.abs(thousandWon).toLocaleString('ko-KR')}천원`;
}

/** 점수를 정수면 그대로, 소수면 한 자리로 표시 (예: 3, 2.4, −1) */
export function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return text.replace('-', '−');
}

/** ISO 문자열을 'YYYY.MM.DD HH:mm' 형태로 표시 */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (value: number) => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
