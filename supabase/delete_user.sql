-- Function to allow a user to delete their own account
create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
declare
  requesting_user_id uuid;
begin
  -- Get the ID of the user executing the function
  requesting_user_id := auth.uid();

  -- Verify the user is authenticated
  if requesting_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Delete user's data from public tables (optional if cascading, but good for safety)
  delete from public.events where user_id = requesting_user_id;
  delete from public.categories where user_id = requesting_user_id;

  -- 2. Delete the user from auth.users
  delete from auth.users where id = requesting_user_id;
end;
$$;
