create table if not exists public.questionnaire_submissions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 40),
  gender text not null,
  age integer not null check (age between 1 and 120),
  visit_type text not null,
  course text not null,
  answers jsonb not null,
  total_score integer not null,
  level text not null,
  tags jsonb not null default '[]'::jsonb
);

create index if not exists questionnaire_created_at_idx
  on public.questionnaire_submissions (created_at desc);

alter table public.questionnaire_submissions enable row level security;

revoke all on table public.questionnaire_submissions from anon, authenticated;
grant all on table public.questionnaire_submissions to service_role;

comment on table public.questionnaire_submissions is
  'Neurology pre-visit questionnaire submissions. Access only from trusted server code.';
