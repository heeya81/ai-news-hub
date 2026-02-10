# Supabase Database Schema

This document outlines the database schema required for the AI News Hub application.

## Tables

### profiles
User profile information and preferences.

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  keywords text[] default '{}',
  notification_time integer default 9 check (notification_time >= 0 and notification_time <= 23),
  last_notified_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
```

### subscriptions
Push notification subscription endpoints.

```sql
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table subscriptions enable row level security;

-- Policies
create policy "Users can view own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can create own subscriptions"
  on subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on subscriptions for delete
  using (auth.uid() = user_id);

-- Index for faster lookups
create index subscriptions_user_id_idx on subscriptions(user_id);
```

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands above to create the tables
4. The Row Level Security (RLS) policies will automatically be applied

## Environment Variables

After setting up Supabase, copy the following values to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For cron job
```

## VAPID Keys

Generate VAPID keys for Web Push:

```bash
npx web-push generate-vapid-keys
```

Add the generated keys to `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=mailto:your-email@example.com
```

## Cron Secret

Generate a random secret for the cron endpoint:

```bash
CRON_SECRET=your-random-secret-string
```
