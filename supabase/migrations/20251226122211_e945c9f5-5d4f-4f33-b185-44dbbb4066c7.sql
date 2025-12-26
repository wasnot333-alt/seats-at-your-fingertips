-- Add allowed_levels column to invitation_codes table
ALTER TABLE public.invitation_codes 
ADD COLUMN allowed_levels TEXT[] NOT NULL DEFAULT ARRAY['Level 1'];

-- Add session_level column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN session_level TEXT NOT NULL DEFAULT 'Level 1';

-- Update the unique constraint for bookings to include session_level
-- This allows the same seat to be booked for different levels
CREATE UNIQUE INDEX idx_bookings_seat_level ON public.bookings (seat_id, session_level) WHERE status = 'booked';