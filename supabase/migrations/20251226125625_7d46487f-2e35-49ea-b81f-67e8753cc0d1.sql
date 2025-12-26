-- Add unique constraint for seat_id + level combination
-- First, let's add a level column to seats if it doesn't exist properly
-- and ensure uniqueness per level

-- Add unique constraint on seat_id and level
ALTER TABLE public.seats 
ADD CONSTRAINT seats_seat_id_level_unique UNIQUE (seat_id, level);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_seats_level ON public.seats(level);

-- Create index on bookings for level-based queries
CREATE INDEX IF NOT EXISTS idx_bookings_session_level ON public.bookings(session_level);
CREATE INDEX IF NOT EXISTS idx_bookings_seat_level ON public.bookings(seat_id, session_level);

-- Enable realtime for bookings table for live analytics
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;