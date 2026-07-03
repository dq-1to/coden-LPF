-- v6roadmap05 M7-1: デイリーチャレンジの正誤と完了の分離（#330）
-- Run this after 006_daily_challenge.sql.
--
-- 背景: 現状 completed のみで管理しており、不正解でも「完了」扱いになり
-- streak / 週間 / 7日連続ボーナスに加算されるバグがある。
-- is_correct を追加し、streak 等の集計を「正解した日」基準に切り替える。
--
-- 互換方針: 既存行は正誤情報を持たないため is_correct は NULL のままにする。
-- アプリ側の集計ロジックで「is_correct = true または is_correct IS NULL」を
-- 正解扱いとして扱い、既存ユーザーの streak を遡って減らさない。

alter table public.daily_challenge_history
  add column if not exists is_correct boolean;

-- 既存の RLS policy（own_data, FOR ALL USING/WITH CHECK auth.uid() = user_id）は
-- 行単位の制御であり、列追加時の追加対応は不要。
