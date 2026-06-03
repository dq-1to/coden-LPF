-- 020_review_items.sql
-- 弱点ベース復習基盤: 誤答・未完了・Challenge失敗を復習キューとして保存する。

CREATE TABLE IF NOT EXISTS public.review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'test', 'challenge', 'daily')),
  question_id TEXT,
  expected TEXT,
  user_input TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

COMMENT ON TABLE public.review_items
  IS '誤答・未完了・Challenge失敗を保存する復習キュー。question_id が NULL の場合はステップ単位の復習対象。';

COMMENT ON COLUMN public.review_items.question_id
  IS '問題単位で保存する場合の問題ID。NULL の場合はステップ単位。';

ALTER TABLE public.review_items ENABLE ROW LEVEL SECURITY;

-- question_id が NULL のステップ単位復習も重複登録されないよう、式indexで正規化する。
CREATE UNIQUE INDEX IF NOT EXISTS review_items_unique_target_idx
  ON public.review_items (user_id, step_id, mode, COALESCE(question_id, '__step__'));

CREATE INDEX IF NOT EXISTS review_items_user_status_idx
  ON public.review_items (user_id, status, created_at DESC);

DROP POLICY IF EXISTS "review_items_select_own" ON public.review_items;
CREATE POLICY "review_items_select_own"
  ON public.review_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "review_items_insert_own" ON public.review_items;
CREATE POLICY "review_items_insert_own"
  ON public.review_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "review_items_update_own" ON public.review_items;
CREATE POLICY "review_items_update_own"
  ON public.review_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "review_items_delete_own" ON public.review_items;
CREATE POLICY "review_items_delete_own"
  ON public.review_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
