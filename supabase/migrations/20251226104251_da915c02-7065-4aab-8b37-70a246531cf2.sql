-- Create enum for invitation code status
CREATE TYPE public.invitation_code_status AS ENUM ('active', 'disabled', 'expired');

-- Create invitation_codes table
CREATE TABLE public.invitation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  status invitation_code_status NOT NULL DEFAULT 'active',
  max_usage INTEGER NULL,
  current_usage INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index for case-insensitive code lookup
CREATE UNIQUE INDEX invitation_codes_code_unique ON public.invitation_codes (UPPER(code));

-- Create index for status filtering
CREATE INDEX invitation_codes_status_idx ON public.invitation_codes (status);

-- Enable Row Level Security
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view invitation codes
CREATE POLICY "Admins can view invitation codes"
ON public.invitation_codes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policy: Only admins can insert invitation codes
CREATE POLICY "Admins can create invitation codes"
ON public.invitation_codes
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policy: Only admins can update invitation codes
CREATE POLICY "Admins can update invitation codes"
ON public.invitation_codes
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policy: Only admins can delete invitation codes
CREATE POLICY "Admins can delete invitation codes"
ON public.invitation_codes
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_invitation_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_invitation_codes_updated_at
BEFORE UPDATE ON public.invitation_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_invitation_codes_updated_at();

-- Migrate existing data from access_codes to invitation_codes
INSERT INTO public.invitation_codes (code, status, max_usage, current_usage, expires_at, created_at)
SELECT 
  code,
  CASE 
    WHEN is_active = false THEN 'disabled'::invitation_code_status
    WHEN expires_at IS NOT NULL AND expires_at < now() THEN 'expired'::invitation_code_status
    WHEN current_uses >= max_uses THEN 'expired'::invitation_code_status
    ELSE 'active'::invitation_code_status
  END as status,
  max_uses,
  current_uses,
  expires_at,
  created_at
FROM public.access_codes;

-- Update bookings table to reference new table column name
ALTER TABLE public.bookings 
RENAME COLUMN access_code_used TO invitation_code_used;