
-- Delete all user profiles first
DELETE FROM public.user_profiles;

-- Delete all users from the auth system
-- Note: This will also cascade delete related data
DELETE FROM auth.users;

-- Reset any sequences or clean up related tables
DELETE FROM public.travelers;
DELETE FROM public.user_actions;

-- Verify deletions
SELECT COUNT(*) as remaining_profiles FROM public.user_profiles;
SELECT COUNT(*) as remaining_auth_users FROM auth.users;
