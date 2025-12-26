-- Remove level-related columns from database

-- First, drop the default value on session_level and then the column itself
ALTER TABLE public.bookings DROP COLUMN IF EXISTS session_level;

-- Remove allowed_levels from invitation_codes
ALTER TABLE public.invitation_codes DROP COLUMN IF EXISTS allowed_levels;

-- Remove level column from seats (if exists)
ALTER TABLE public.seats DROP COLUMN IF EXISTS level;

-- Clean up any existing bookings data - keep the bookings but without level info
-- (This is already handled by dropping the column)