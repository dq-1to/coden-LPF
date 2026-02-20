-- M1-1: test users seed for MVP
-- Note: email_change related columns must be empty strings to avoid GoTrue 500 errors.

with upsert_users as (
  insert into auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  )
  values
  (
    gen_random_uuid(),
    'test01@coden.dev',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ),
  (
    gen_random_uuid(),
    'test02@coden.dev',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  )
  on conflict (email) do update set
    updated_at = now(),
    encrypted_password = excluded.encrypted_password
  returning id, email
)
insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1)
from upsert_users
on conflict (id) do update set
  display_name = excluded.display_name;
