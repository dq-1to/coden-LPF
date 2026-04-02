CREATE TABLE IF NOT EXISTS public.code_reading_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id    TEXT NOT NULL,
  correct_count INT DEFAULT 0,
  total_count   INT DEFAULT 0,
  completed     BOOLEAN DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  UNIQUE(user_id, problem_id)
);
ALTER TABLE public.code_reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON public.code_reading_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
