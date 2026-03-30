CREATE TABLE IF NOT EXISTS public.daily_challenge_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  challenge_date DATE NOT NULL,
  UNIQUE(user_id, challenge_date)
);
ALTER TABLE public.daily_challenge_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON public.daily_challenge_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
