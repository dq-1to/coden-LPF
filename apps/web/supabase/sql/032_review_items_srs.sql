-- 032_review_items_srs.sql
-- 復習キューに簡易間隔反復（翌日 → 3日後 → 7日後）を導入する。

ALTER TABLE public.review_items
  ADD COLUMN IF NOT EXISTS review_stage SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ;

-- 既存テーブルが mode / status に CHECK を持つ流儀に合わせる。
-- 4 = 全段階クリア（resolved）を表す終端値。
ALTER TABLE public.review_items
  DROP CONSTRAINT IF EXISTS review_items_review_stage_check;
ALTER TABLE public.review_items
  ADD CONSTRAINT review_items_review_stage_check
  CHECK (review_stage BETWEEN 0 AND 4);

COMMENT ON COLUMN public.review_items.review_stage
  IS '連続正解回数。0=誤答直後（即日）、1=翌日、2=3日後、3=7日後、4=全段階クリア。';
COMMENT ON COLUMN public.review_items.next_review_at
  IS '次回復習予定日時。status=open かつ next_review_at <= now() の行が期日到来。';
COMMENT ON COLUMN public.review_items.last_reviewed_at
  IS '最後に正解／誤答で復習判定された日時。';

-- 期日到来分の取得用。
CREATE INDEX IF NOT EXISTS review_items_user_due_idx
  ON public.review_items (user_id, status, next_review_at);
