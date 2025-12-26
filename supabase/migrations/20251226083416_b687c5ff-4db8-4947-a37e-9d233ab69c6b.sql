-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy for user_roles - only admins can read
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create access_codes table
CREATE TABLE public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access_codes
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can validate codes (read-only, limited info via edge function)
-- No direct read policy - all validation goes through edge function

-- Create seats table
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id TEXT NOT NULL UNIQUE,
  row TEXT NOT NULL,
  number INTEGER NOT NULL,
  level TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on seats
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

-- Public can view seats (for seat selection display)
CREATE POLICY "Anyone can view seats"
ON public.seats
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can modify seats
CREATE POLICY "Admins can modify seats"
ON public.seats
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id TEXT NOT NULL REFERENCES public.seats(seat_id),
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT NOT NULL,
  access_code_used TEXT NOT NULL,
  booking_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'booked'
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Only admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can modify bookings
CREATE POLICY "Admins can modify bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert sample access codes
INSERT INTO public.access_codes (code, is_active, max_uses) VALUES
('GOLD2024', true, 1),
('VIP2024', true, 1),
('PREMIUM01', true, 1),
('EVENT2024', true, 1),
('CORP100', true, 1),
('TEST123', true, 1);

-- Insert seats (3 rows x 10 seats)
INSERT INTO public.seats (seat_id, row, number, level, status)
SELECT 
  row_letter || seat_num::TEXT as seat_id,
  row_letter as row,
  seat_num as number,
  'standard' as level,
  'available' as status
FROM 
  (SELECT unnest(ARRAY['A', 'B', 'C']) as row_letter) r,
  (SELECT generate_series(1, 10) as seat_num) s;

-- Mark some seats as booked for demo
UPDATE public.seats SET status = 'booked' WHERE seat_id IN ('A3', 'A7', 'B2', 'B5', 'B8', 'C1', 'C4', 'C9');