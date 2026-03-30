CREATE TABLE IF NOT EXISTS public.code_doctor_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'react',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  solved BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  solved_at TIMESTAMPTZ,
  UNIQUE(user_id, problem_id)
);
ALTER TABLE public.code_doctor_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON public.code_doctor_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
