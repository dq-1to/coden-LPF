-- Base Nook: 基礎概念クイズの進捗記録
CREATE TABLE IF NOT EXISTS public.base_nook_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id    TEXT NOT NULL,
  question_id TEXT NOT NULL,
  correct     BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.base_nook_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON public.base_nook_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
