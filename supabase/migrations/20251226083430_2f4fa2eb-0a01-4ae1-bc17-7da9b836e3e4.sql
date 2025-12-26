-- Add admin-only policy for access_codes table to resolve linter warning
CREATE POLICY "Admins can manage access codes"
ON public.access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));