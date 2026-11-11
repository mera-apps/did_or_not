export type Answer = 'YES' | 'NO';

export interface Profile {
  id: string;
  name: string;
  username: string;
  created_at: string;
}

export interface DailyResponse {
  id: string;
  user_id: string;
  response_date: string; // yyyy-MM-dd
  answer: Answer | null;
  is_finalized: boolean;
  saved_at: string | null;
  finalized_at: string | null;
  created_at: string;
}

/** date -> final answer (null = no answer). Only finalized days are present. */
export type History = Record<string, Answer | null>;
