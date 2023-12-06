import type { uuid } from '@/type';

export type FeedbackTable = {
  id: number;
  rating: number;
  text: string | null;
  share: boolean;
  author: uuid | null;
  inserted_at: string;
};
