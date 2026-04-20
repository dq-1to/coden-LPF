-- 019_feedback_images.sql
-- user_feedback にスクリーンショット添付機能を追加する。
-- 1) image_paths jsonb 列を追加
-- 2) feedback-images Storage バケットを作成
-- 3) Storage RLS ポリシーを設定

-- ─── 1. user_feedback.image_paths 列追加 ───────────────────────────
ALTER TABLE public.user_feedback
  ADD COLUMN IF NOT EXISTS image_paths jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.user_feedback.image_paths
  IS '添付画像のパス配列（最大3枚）。形式: ["user_id/feedback_id/filename", ...]';

-- ─── 2. Storage バケット作成 ────────────────────────────────────────
-- private バケット（signed URL 経由でのみアクセス可能）
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-images', 'feedback-images', false)
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Storage RLS ポリシー ───────────────────────────────────────

-- 3a. INSERT: 認証済みユーザーが自分のディレクトリにのみアップロード可能
--     パス構造: {user_id}/{feedback_id}/{filename}
--     → path の先頭セグメントが auth.uid() と一致することを検証
CREATE POLICY "feedback_images_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'feedback-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3b. SELECT: 自分のファイルのみ閲覧可能（一般ユーザー）
CREATE POLICY "feedback_images_select_own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'feedback-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3c. SELECT: admin は全ファイル閲覧可能
CREATE POLICY "feedback_images_select_admin"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'feedback-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- 3d. DELETE: 自分のファイルのみ削除可能（アップロード取り消し用）
CREATE POLICY "feedback_images_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'feedback-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
