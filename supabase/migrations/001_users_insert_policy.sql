-- Allow users to insert their own profile row on registration
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);
