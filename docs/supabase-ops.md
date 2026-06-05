# Coden Supabase 運用手順

**目的**: Supabase SQL の追加・適用・型生成・RLS確認を、Coden v1.0 以降も再現できる形でそろえる。

このドキュメントは公開しても問題ない運用手順として扱う。APIキー、パスワード、接続文字列、個人アカウントの認証情報、実ユーザーの個人情報は書かない。

---

## 1. 対象ファイル

| 種別 | パス |
|---|---|
| SQL | `apps/web/supabase/sql/*.sql` |
| ローカル用SQL例 | `apps/web/supabase/sql/local/*.example` |
| 生成型 | `apps/web/src/shared/types/database.types.ts` |
| Supabase client | `apps/web/src/lib/supabaseClient.ts` |
| DB利用サービス | `apps/web/src/services/*.ts` |

`apps/web/supabase/sql/local/*.sql` は実パスワードを含む可能性があるためGit管理外。`.example` だけを管理する。

---

## 2. SQLファイル命名ルール

SQLファイルは `apps/web/supabase/sql/` に番号順で置く。

形式:

```text
NNN_short_description.sql
```

例:

```text
022_learning_events.sql
```

ルール:

- `NNN` は3桁の連番にする
- 既存の最大番号の次を使う
- ファイル名は snake_case にする
- 1ファイル1目的を基本にする
- RLS対象テーブルを作る場合、同じファイル内に RLS 有効化と policy を含める
- RPCを追加する場合、権限、`security definer`、`search_path`、admin判定の有無を明記する

2026-06-05 時点の最新は `022_learning_events.sql`。次の新規SQLは `023_*.sql` から始める。

---

## 3. 現在のSQL一覧

| # | ファイル | 主な内容 |
|---|---|---|
| 001 | `001_schema_and_rls.sql` | 初期スキーマ / RLS |
| 002 | `002_seed_test_users.sql` | テストユーザー |
| 003 | `003_gamification.sql` | ポイント / 実績 |
| 004 | `004_award_points_rpc.sql` | ポイント付与RPC |
| 005 | `005_seed_test_progress.sql` | テスト用進捗 |
| 006 | `006_daily_challenge.sql` | Daily Challenge |
| 007 | `007_code_doctor.sql` | Code Doctor |
| 008 | `008_mini_projects.sql` | Mini Projects |
| 009 | `009_code_reading.sql` | Code Reading |
| 010 | `010_record_study_activity_rpc.sql` | 学習活動記録RPC |
| 011 | `011_base_nook.sql` | Base Nook |
| 012 | `012_base_nook_timestamp_trigger.sql` | Base Nook timestamp trigger |
| 013 | `013_admin_and_feedback.sql` | admin / feedback |
| 014 | `014_admin_stats_rpc.sql` | admin stats RPC |
| 015 | `015_admin_ops_rpc.sql` | admin ops RPC |
| 016 | `016_admin_user_basic_rpc.sql` | admin user basic RPC |
| 017 | `017_fix_profile_rls.sql` | profiles RLS修正 |
| 018 | `018_auto_create_profile_trigger.sql` | profile自動作成trigger |
| 019 | `019_feedback_images.sql` | feedback画像 |
| 020 | `020_review_items.sql` | 復習キュー |
| 021 | `021_admin_select_review_items.sql` | review_items admin横断SELECT |
| 022 | `022_learning_events.sql` | 学習イベントログ |

READMEのSQL一覧よりこの表を優先する。READMEを更新するタイミングでは、この表と差分が出ないようにする。

---

## 4. SQL追加時の実装手順

1. 最新のSQL番号を確認する。
   ```powershell
   rg --files apps/web/supabase/sql
   ```

2. 次番号でSQLファイルを作る。
   ```text
   apps/web/supabase/sql/022_example.sql
   ```

3. テーブル作成時は以下を確認する。
   - primary key がある
   - `user_id` を持つユーザーデータは `auth.users(id)` と対応している
   - 必要な `created_at` / `updated_at` がある
   - 検索・集計で使う列に index がある
   - RLSを有効化している
   - own行 policy と admin policy の両方が必要か判断している

4. RPC作成時は以下を確認する。
   - `security definer` が本当に必要か
   - `set search_path = public` を設定しているか
   - admin限定RPCは `public.is_admin()` で制限しているか
   - 戻り値の型がフロントエンドで扱いやすいか

5. SQLを適用する。
   - 本番適用はSupabase SQL Editorで手動実行する
   - 複数ファイルを一度に流す場合も、番号順に実行する
   - 失敗した場合は途中から再実行できるよう、`create policy` などは必要に応じて `drop policy if exists` を使う

6. 型を生成する。
   ```powershell
   cmd /c npm --workspace @coden/web run types:supabase
   ```

7. 生成された `apps/web/src/shared/types/database.types.ts` を確認する。

8. サービス層やテストを更新する。

9. 共通チェックを通す。
   ```powershell
   cmd /c npm run typecheck
   cmd /c npm run lint
   cmd /c npm run test
   cmd /c npm run build
   ```

---

## 5. 本番適用手順

本番DBへのSQL適用は、ユーザーまたは管理者がSupabase SQL Editorで手動実行する。

手順:

1. PR上でSQLファイルの内容を確認する
2. 適用対象が本番プロジェクトであることを確認する
3. SQL Editorに対象SQLを貼り付ける
4. 番号順に実行する
5. エラーがないことを確認する
6. テーブル / policy / RPC が作成されたことを確認する
7. 必要なら `types:supabase` を実行し、型差分をPRに含める

注意:

- 本番適用後にSQLファイルを変更しない。修正が必要な場合は次番号のSQLを追加する
- 手動適用済みかどうかはPR本文や作業メモで明記する
- secret、service role key、ユーザーパスワードはPR本文・docs・SQLコメントに書かない

---

## 6. ローカル適用手順

ローカルSupabaseを使う場合は、SQLを番号順に適用する。

プロジェクトでローカルSupabase CLI運用を行う場合の基本方針:

- 本番と同じSQLファイルを使う
- local専用seedは `apps/web/supabase/sql/local/` に置く
- 実パスワード入りの `.sql` はGit管理しない
- 共有したい形だけ `.example` にする

ローカルseed例:

```text
apps/web/supabase/sql/local/seed_admin_user.sql.example
```

---

## 7. RLS確認観点

RLSは「自分」「他人」「admin」の3視点で確認する。

| 視点 | 確認すること |
|---|---|
| 自分 | 自分の行をSELECT/INSERT/UPDATE/DELETEできるか |
| 他人 | 他人の行を読めない、変更できないか |
| admin | 管理画面や集計に必要な横断SELECT/RPCが通るか |
| anonymous | 認証なしで不要なデータが読めないか |

review_items のように管理画面の集計に使うテーブルでは、own行policyだけでは足りない場合がある。admin横断集計が必要なときは、以下のようなadmin SELECT policyを追加する。

```sql
create policy admin_select_example on public.example_table
  for select using (public.is_admin());
```

---

## 8. 型生成とフロントエンド更新

型生成コマンド:

```powershell
cmd /c npm --workspace @coden/web run types:supabase
```

生成先:

```text
apps/web/src/shared/types/database.types.ts
```

型生成後の確認:

- 新しいテーブルが `Database['public']['Tables']` にある
- `Tables<'table_name'>` / `TablesInsert<'table_name'>` / `TablesUpdate<'table_name'>` が使える
- RPCを追加した場合、`Database['public']['Functions']` に反映されている
- 既存サービスの型エラーが出ていない

---

## 9. PR本文に書くこと

Supabase関連PRでは、最低限以下を書く。

```md
## Summary
- 追加したSQL / テーブル / RPC / policy
- フロントエンド側の利用箇所
- 型生成の有無

## Test plan
- cmd /c npm run typecheck
- cmd /c npm run lint
- cmd /c npm run test
- cmd /c npm run build

## Supabase
- SQL手動適用: 未適用 / 適用済み
- 適用対象: local / production
- RLS確認: 自分 / 他人 / admin
```

SQLの手動適用をユーザーが行う場合は、PR本文に「DB適用は手動」と明記する。

---

## 10. よくある事故と予防

| 事故 | 予防 |
|---|---|
| SQL番号が重複する | `rg --files apps/web/supabase/sql` で最新番号を確認する |
| own行policyだけでadmin集計が欠ける | admin画面で横断SELECTが必要か確認する |
| 本番適用後に同じSQLを修正する | 次番号の修正SQLを追加する |
| 型生成を忘れる | SQL追加PRのTest planに `types:supabase` の有無を書く |
| secretをdocsに書く | `.env.local` や local seed の実ファイルにだけ置き、Git管理しない |
| RLSが広すぎる | anonymous / 他人視点のSELECTを必ず確認する |

---

## 11. 変更時の更新ルール

以下の場合は、このドキュメントを更新する。

- 新しいSQL番号が追加された
- SQL適用方法が変わった
- 型生成コマンドが変わった
- RLS確認観点が増えた
- admin集計に必要なpolicyが追加された

SQL追加PRでは、必要に応じて「`docs/supabase-ops.md` の更新が必要か」を確認する。
