import { supabase } from '../lib/supabase';

export type FeedbackType = 'bug' | 'improvement';

export interface FeedbackPayload {
  type: FeedbackType;
  location: string;
  description: string;
  expected_behavior?: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  const { error } = await supabase.from('feedback').insert(payload);
  if (error) throw new Error(error.message);
}
