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

    const upperCode = code.toUpperCase().trim();

    // Validate the code again
    const { data: accessCode, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', upperCode)
      .single();

    if (codeError || !accessCode) {
      console.log('Invalid code:', upperCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid booking code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is still valid
    const isExpired = accessCode.expires_at 
      ? new Date(accessCode.expires_at) < new Date() 
      : false;

    if (!accessCode.is_active || isExpired || accessCode.current_uses >= accessCode.max_uses) {
      console.log('Code no longer valid:', { isActive: accessCode.is_active, isExpired, uses: accessCode.current_uses });
      return new Response(
        JSON.stringify({ success: false, error: 'Booking code is no longer valid' }),
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
        access_code_used: upperCode,
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
    const { error: updateCodeError } = await supabase
      .from('access_codes')
      .update({ current_uses: accessCode.current_uses + 1 })
      .eq('code', upperCode);

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
          codeUsed: booking.access_code_used,
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
