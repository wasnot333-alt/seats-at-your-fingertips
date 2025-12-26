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
    const { seatId, code, userDetails, sessionLevel } = await req.json();

    console.log('Confirming booking:', { seatId, code, sessionLevel, userDetails: { ...userDetails, email: '***' } });

    // Validate required fields
    if (!seatId || !code || !userDetails?.fullName || !userDetails?.mobileNumber || !userDetails?.email) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate session level
    if (!sessionLevel) {
      console.log('Missing session level');
      return new Response(
        JSON.stringify({ success: false, error: 'Session level is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize code: uppercase and trim
    const normalizedCode = code.toUpperCase().trim();
    // Normalize session level (case-insensitive comparison)
    const normalizedLevel = sessionLevel.trim();

    // Validate the invitation code
    const { data: invitationCode, error: codeError } = await supabase
      .from('invitation_codes')
      .select('*')
      .ilike('code', normalizedCode)
      .maybeSingle();

    if (codeError) {
      console.error('Database error fetching code:', codeError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!invitationCode) {
      console.log('Invalid code:', normalizedCode);
      return new Response(
        JSON.stringify({ success: false, error: 'This invitation code is not valid. Please contact the Ashram.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code status is active
    if (invitationCode.status !== 'active') {
      console.log('Code is not active:', normalizedCode, 'Status:', invitationCode.status);
      return new Response(
        JSON.stringify({ success: false, error: 'This invitation code is not valid. Please contact the Ashram.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ success: false, error: 'This invitation code is not valid. Please contact the Ashram.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ success: false, error: 'This invitation code is not valid. Please contact the Ashram.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate participant name if set on the code
    const hasParticipantName = invitationCode.participant_name !== null && invitationCode.participant_name.trim() !== '';
    
    if (hasParticipantName) {
      const normalizedProvidedName = userDetails.fullName.toUpperCase().trim();
      const normalizedStoredName = invitationCode.participant_name.toUpperCase().trim();
      
      if (normalizedProvidedName !== normalizedStoredName) {
        console.log('Participant name mismatch:', { provided: normalizedProvidedName, stored: normalizedStoredName });
        return new Response(
          JSON.stringify({ success: false, error: 'Your name does not match the invitation. Please ensure you enter the exact name associated with this invitation code.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate session level is allowed for this code
    const allowedLevels = invitationCode.allowed_levels || ['Level 1'];
    const isLevelAllowed = allowedLevels.some(
      (level: string) => level.toLowerCase() === normalizedLevel.toLowerCase()
    );

    if (!isLevelAllowed) {
      console.log('Session level not allowed:', { requested: normalizedLevel, allowed: allowedLevels });
      return new Response(
        JSON.stringify({ success: false, error: `Your invitation code does not allow booking for ${normalizedLevel}. Allowed levels: ${allowedLevels.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if seat is still available
    const { data: seat, error: seatError } = await supabase
      .from('seats')
      .select('*')
      .eq('seat_id', seatId)
      .single();

    if (seatError || !seat) {
      console.log('Seat not found:', seatId);
      return new Response(
        JSON.stringify({ success: false, error: 'Seat not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if seat is already booked for this session level
    const { data: existingBooking, error: existingBookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('seat_id', seatId)
      .eq('session_level', normalizedLevel)
      .eq('status', 'booked')
      .maybeSingle();

    if (existingBookingError) {
      console.error('Error checking existing booking:', existingBookingError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error checking seat availability' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingBooking) {
      console.log('Seat already booked for this level:', { seatId, sessionLevel: normalizedLevel });
      return new Response(
        JSON.stringify({ success: false, error: `This seat is already booked for ${normalizedLevel}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        seat_id: seatId,
        customer_name: userDetails.fullName,
        mobile_number: userDetails.mobileNumber,
        email: userDetails.email,
        invitation_code_used: normalizedCode,
        session_level: normalizedLevel,
        status: 'booked',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Failed to create booking:', bookingError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Note: We don't update the seat status globally anymore since the same seat
    // can be booked for different levels. The booking table with session_level
    // is the source of truth for seat availability per level.

    // Increment code usage
    const newUsage = invitationCode.current_usage + 1;
    const shouldExpire = invitationCode.max_usage !== null && newUsage >= invitationCode.max_usage;
    
    const { error: updateCodeError } = await supabase
      .from('invitation_codes')
      .update({ 
        current_usage: newUsage,
        // Auto-expire if max usage reached
        ...(shouldExpire ? { status: 'expired' } : {})
      })
      .eq('id', invitationCode.id);

    if (updateCodeError) {
      console.error('Failed to update code usage:', updateCodeError);
      // Don't fail the whole request
    }

    console.log('Booking confirmed successfully:', booking.id);

    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          seatId: booking.seat_id,
          seatNumber: booking.seat_id,
          customerName: booking.customer_name,
          mobileNumber: booking.mobile_number,
          email: booking.email,
          codeUsed: booking.invitation_code_used,
          sessionLevel: booking.session_level,
          bookingTime: new Date(booking.booking_time).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: booking.status,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error confirming booking:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
