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
    const { code } = await req.json();

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

    const upperCode = code.toUpperCase().trim();
    console.log('Validating code:', upperCode);

    // Create Supabase client with service role for backend validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the access code
    const { data: accessCode, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', upperCode)
      .single();

    if (error || !accessCode) {
      console.log('Code not found:', upperCode, error);
      return new Response(
        JSON.stringify({
          code: upperCode,
          isValid: false,
          isExpired: false,
          maxSeats: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is expired
    const isExpired = accessCode.expires_at 
      ? new Date(accessCode.expires_at) < new Date() 
      : false;

    // Check if code is still active and has uses remaining
    const isValid = accessCode.is_active && 
                    !isExpired && 
                    accessCode.current_uses < accessCode.max_uses;

    console.log('Code validation result:', { 
      code: upperCode, 
      isValid, 
      isExpired,
      currentUses: accessCode.current_uses,
      maxUses: accessCode.max_uses 
    });

    return new Response(
      JSON.stringify({
        code: upperCode,
        isValid,
        isExpired,
        maxSeats: isValid ? 1 : 0,
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
