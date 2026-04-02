-- base_nook_progress の answered_at を INSERT/UPDATE 時に自動設定するトリガー
-- クライアント側タイムスタンプを除去し、DB 側で一元管理する

CREATE OR REPLACE FUNCTION public.set_answered_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.answered_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_base_nook_answered_at
  BEFORE INSERT OR UPDATE ON public.base_nook_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_answered_at();
