// 앱 진입점: 선거구 자동 등록 레지스트리(regions)를 그대로 노출한다.
// 데이터 추가는 src/data/regions/<id>/ 폴더 생성으로 끝난다(이 파일 수정 불필요).
export type { Election } from './types';
export { elections } from './regions';
