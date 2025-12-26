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
    const { seatId, code, userDetails } = await req.json();

    console.log('Confirming booking:', { seatId, code, userDetails: { ...userDetails, email: '***' } });

    if (!seatId || !code || !userDetails?.fullName || !userDetails?.mobileNumber || !userDetails?.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const normalizedCode = code.toUpperCase().trim();

    const { data: invitationCode, error: codeError } = await supabase
      .from('invitation_codes')
      .select('*')
      .ilike('code', normalizedCode)
      .maybeSingle();

    if (codeError || !invitationCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid invitation code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (invitationCode.status !== 'active') {
      return new Response(
        JSON.stringify({ success: false, error: 'This invitation code is no longer valid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (invitationCode.current_usage >= 1) {
      await supabase.from('invitation_codes').update({ status: 'expired' }).eq('id', invitationCode.id);
      return new Response(
        JSON.stringify({ success: false, error: 'This code has already been used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasParticipantName = invitationCode.participant_name !== null && invitationCode.participant_name.trim() !== '';
    if (hasParticipantName) {
      const normalizedProvidedName = userDetails.fullName.toUpperCase().trim();
      const normalizedStoredName = invitationCode.participant_name.toUpperCase().trim();
      if (normalizedProvidedName !== normalizedStoredName) {
        return new Response(
          JSON.stringify({ success: false, error: 'Your name does not match the invitation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if seat is already booked
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('seat_id', seatId)
      .eq('status', 'booked')
      .maybeSingle();

    if (existingBooking) {
      return new Response(
        JSON.stringify({ success: false, error: 'This seat is already booked' }),
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

    // Mark code as used
    await supabase
      .from('invitation_codes')
      .update({ current_usage: 1, status: 'expired' })
      .eq('id', invitationCode.id);

    console.log('Booking confirmed:', booking.id);

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
