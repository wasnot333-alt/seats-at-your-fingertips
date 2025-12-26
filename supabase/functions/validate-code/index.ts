import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ isValid: false, isExpired: false, error: 'Invalid code format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedCode = code.toUpperCase().trim();
    console.log('Validating invitation code:', normalizedCode);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: invitationCode, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .ilike('code', normalizedCode)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ code: normalizedCode, isValid: false, isExpired: false, error: 'Database error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!invitationCode) {
      return new Response(
        JSON.stringify({ code: normalizedCode, isValid: false, isExpired: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (invitationCode.status !== 'active') {
      return new Response(
        JSON.stringify({ code: normalizedCode, isValid: false, isExpired: invitationCode.status === 'expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isDateExpired = invitationCode.expires_at ? new Date(invitationCode.expires_at) < new Date() : false;
    if (isDateExpired) {
      await supabase.from('invitation_codes').update({ status: 'expired' }).eq('id', invitationCode.id);
      return new Response(
        JSON.stringify({ code: normalizedCode, isValid: false, isExpired: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // One code = one booking
    if (invitationCode.current_usage >= 1) {
      await supabase.from('invitation_codes').update({ status: 'expired' }).eq('id', invitationCode.id);
      return new Response(
        JSON.stringify({ code: normalizedCode, isValid: false, isExpired: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Code validation successful:', normalizedCode);

    return new Response(
      JSON.stringify({
        code: normalizedCode,
        isValid: true,
        isExpired: false,
        participantName: invitationCode.participant_name,
        requiresNameMatch: invitationCode.participant_name !== null && invitationCode.participant_name.trim() !== '',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error validating code:', error);
    return new Response(
      JSON.stringify({ isValid: false, isExpired: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
