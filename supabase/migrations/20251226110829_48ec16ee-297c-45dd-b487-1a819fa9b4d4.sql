-- Add participant_name to invitation_codes table
ALTER TABLE public.invitation_codes
ADD COLUMN participant_name text;

-- Add index for participant name lookup
CREATE INDEX idx_invitation_codes_participant_name ON public.invitation_codes USING btree (UPPER(participant_name));