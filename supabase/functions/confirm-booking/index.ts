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
    const { seatId, code, userDetails } = await req.json();

    console.log('Confirming booking:', { seatId, code, userDetails: { ...userDetails, email: '***' } });

    // Validate required fields
    if (!seatId || !code || !userDetails?.fullName || !userDetails?.mobileNumber || !userDetails?.email) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize code: uppercase and trim
    const normalizedCode = code.toUpperCase().trim();

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

    if (seat.status === 'booked') {
      console.log('Seat already booked:', seatId);
      return new Response(
        JSON.stringify({ success: false, error: 'Seat is already booked' }),
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

    // Update seat status
    const { error: updateSeatError } = await supabase
      .from('seats')
      .update({ status: 'booked' })
      .eq('seat_id', seatId);

    if (updateSeatError) {
      console.error('Failed to update seat status:', updateSeatError);
      // Don't fail the whole request, booking is created
    }

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
