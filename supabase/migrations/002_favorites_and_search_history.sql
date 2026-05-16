-- User Favorites table
create table if not exists user_favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, business_id)
);

alter table user_favorites enable row level security;

create policy "Users can view their own favorites"
  on user_favorites for select
  using (auth.uid() = user_id);

create policy "Users can add their own favorites"
  on user_favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on user_favorites for delete
  using (auth.uid() = user_id);

-- Search History table
create table if not exists search_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  location text,
  category text,
  results_count integer default 0,
  created_at timestamp with time zone default now()
);

alter table search_history enable row level security;

create policy "Users can view their own search history"
  on search_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own search history"
  on search_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own search history"
  on search_history for delete
  using (auth.uid() = user_id);

-- Business owner reply to reviews
alter table reviews add column if not exists owner_reply text;
alter table reviews add column if not exists owner_reply_at timestamp with time zone;

create index if not exists idx_user_favorites_user_id on user_favorites(user_id);
create index if not exists idx_user_favorites_business_id on user_favorites(business_id);
create index if not exists idx_search_history_user_id on search_history(user_id);
create index if not exists idx_search_history_created_at on search_history(created_at desc);
