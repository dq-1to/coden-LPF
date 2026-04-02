CREATE TABLE IF NOT EXISTS public.mini_project_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   TEXT NOT NULL,
  status       TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  code         TEXT,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, project_id)
);
ALTER TABLE public.mini_project_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON public.mini_project_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
