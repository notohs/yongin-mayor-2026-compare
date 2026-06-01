import type { Election } from '../../types';
import { meta } from './meta';
import { candidates } from './candidates';
import { bulletinPolicies } from './bulletinPolicies';
import { quizThemes } from './quizThemes';

export const election: Election = {
  id: '__REGION_ID__',
  order: 99,
  meta,
  candidates,
  bulletinPolicies,
  quizThemes,
};
