import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, participantName } = await req.json();

    if (!code || typeof code !== 'string') {
      console.log('Invalid code provided:', code);
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          isExpired: false, 
          maxSeats: 0,
          error: 'Invalid code format' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize code: uppercase and trim
    const normalizedCode = code.toUpperCase().trim();
    console.log('Validating invitation code:', normalizedCode);

    // Create Supabase client with service role for backend validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the invitation code (case-insensitive lookup via uppercase index)
    const { data: invitationCode, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .ilike('code', normalizedCode)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching code:', error);
      return new Response(
        JSON.stringify({
          code: normalizedCode,
          isValid: false,
          isExpired: false,
          maxSeats: 0,
          error: 'Database error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!invitationCode) {
      console.log('Code not found:', normalizedCode);
      return new Response(
        JSON.stringify({
          code: normalizedCode,
          isValid: false,
          isExpired: false,
          maxSeats: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code status is active
    if (invitationCode.status !== 'active') {
      console.log('Code is not active:', normalizedCode, 'Status:', invitationCode.status);
      return new Response(
        JSON.stringify({
          code: normalizedCode,
          isValid: false,
          isExpired: invitationCode.status === 'expired',
          maxSeats: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is expired by date
    const isDateExpired = invitationCode.expires_at 
      ? new Date(invitationCode.expires_at) < new Date() 
      : false;

    if (isDateExpired) {
      console.log('Code is date-expired:', normalizedCode);
      // Auto-update status to expired
      await supabase
        .from('invitation_codes')
        .update({ status: 'expired' })
        .eq('id', invitationCode.id);

      return new Response(
        JSON.stringify({
          code: normalizedCode,
          isValid: false,
          isExpired: true,
          maxSeats: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if max usage reached
    const isUsageLimitReached = invitationCode.max_usage !== null && 
                                 invitationCode.current_usage >= invitationCode.max_usage;

    if (isUsageLimitReached) {
      console.log('Code usage limit reached:', normalizedCode);
      // Auto-update status to expired
      await supabase
        .from('invitation_codes')
        .update({ status: 'expired' })
        .eq('id', invitationCode.id);

      return new Response(
        JSON.stringify({
          code: normalizedCode,
          isValid: false,
          isExpired: true,
          maxSeats: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code has participant_name and validate if provided
    const hasParticipantName = invitationCode.participant_name !== null && invitationCode.participant_name.trim() !== '';
    
    if (hasParticipantName && participantName) {
      const normalizedProvidedName = participantName.toUpperCase().trim();
      const normalizedStoredName = invitationCode.participant_name.toUpperCase().trim();
      
      if (normalizedProvidedName !== normalizedStoredName) {
        console.log('Participant name mismatch:', { provided: normalizedProvidedName, stored: normalizedStoredName });
        return new Response(
          JSON.stringify({
            code: normalizedCode,
            isValid: false,
            isExpired: false,
            maxSeats: 0,
            error: 'Participant name does not match the invitation code.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Code is valid!
    console.log('Code validation successful:', { 
      code: normalizedCode, 
      currentUsage: invitationCode.current_usage,
      maxUsage: invitationCode.max_usage,
      participantName: invitationCode.participant_name
    });

    return new Response(
      JSON.stringify({
        code: normalizedCode,
        isValid: true,
        isExpired: false,
        maxSeats: 1,
        participantName: invitationCode.participant_name,
        requiresNameMatch: hasParticipantName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error validating code:', error);
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        isExpired: false, 
        maxSeats: 0,
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
