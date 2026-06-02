import type { Election } from '../../types';
import { meta } from './meta';
import { candidates } from './candidates';
import { bulletinPolicies } from './bulletinPolicies';
import { quizThemes } from './quizThemes';

export const election: Election = {
  id: 'gyeonggi-governor-2026',
  order: 2,
  meta,
  candidates,
  bulletinPolicies,
  quizThemes,
};
