import type { Election } from '../../types';
import { meta } from './meta';
import { candidates } from './candidates';
import { bulletinPolicies } from './bulletinPolicies';
import { quizThemes } from './quizThemes';

/** 2026 용인특례시장 선거 데이터 묶음 */
export const election: Election = {
  id: 'yongin-mayor-2026',
  order: 1,
  meta,
  candidates,
  bulletinPolicies,
  quizThemes,
};
