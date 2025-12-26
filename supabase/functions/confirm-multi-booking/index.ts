import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  seatId: string;
  sessionLevel: string;
}

interface UserDetails {
  fullName: string;
  mobileNumber: string;
  email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookings, code, userDetails } = await req.json() as {
      bookings: BookingRequest[];
      code: string;
      userDetails: UserDetails;
    };

    console.log('Confirming multi-booking:', { 
      bookingsCount: bookings?.length, 
      code, 
      userDetails: { ...userDetails, email: '***' } 
    });

    // Validate required fields
    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No bookings provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!code || !userDetails?.fullName || !userDetails?.mobileNumber || !userDetails?.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each booking has required fields
    for (const booking of bookings) {
      if (!booking.seatId || !booking.sessionLevel) {
        return new Response(
          JSON.stringify({ success: false, error: 'Each booking must have seatId and sessionLevel' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize code
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
      return new Response(
        JSON.stringify({ success: false, error: 'This invitation code is not valid.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code status is active
    if (invitationCode.status !== 'active') {
      return new Response(
        JSON.stringify({ success: false, error: 'This invitation code is not valid.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is expired by date
    const isDateExpired = invitationCode.expires_at 
      ? new Date(invitationCode.expires_at) < new Date() 
      : false;

    if (isDateExpired) {
      await supabase
        .from('invitation_codes')
        .update({ status: 'expired' })
        .eq('id', invitationCode.id);

      return new Response(
        JSON.stringify({ success: false, error: 'This invitation code has expired.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check max usage - must have enough for all bookings
    const requiredUsage = bookings.length;
    const remainingUsage = invitationCode.max_usage !== null 
      ? invitationCode.max_usage - invitationCode.current_usage 
      : Infinity;

    if (remainingUsage < requiredUsage) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Insufficient usage remaining. You can book up to ${remainingUsage} level(s) with this code.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate participant name if set
    if (invitationCode.participant_name?.trim()) {
      const normalizedProvidedName = userDetails.fullName.toUpperCase().trim();
      const normalizedStoredName = invitationCode.participant_name.toUpperCase().trim();
      
      if (normalizedProvidedName !== normalizedStoredName) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Your name does not match the invitation.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate all session levels are allowed
    const allowedLevels = invitationCode.allowed_levels || ['Level 1'];
    for (const booking of bookings) {
      const isLevelAllowed = allowedLevels.some(
        (level: string) => level.toLowerCase() === booking.sessionLevel.toLowerCase()
      );
      if (!isLevelAllowed) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Level "${booking.sessionLevel}" is not allowed for this code.` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check all seats exist and are available
    for (const booking of bookings) {
      // Check seat exists
      const { data: seat, error: seatError } = await supabase
        .from('seats')
        .select('*')
        .eq('seat_id', booking.seatId)
        .maybeSingle();

      if (seatError || !seat) {
        return new Response(
          JSON.stringify({ success: false, error: `Seat ${booking.seatId} not found.` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check seat not already booked for this level
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('seat_id', booking.seatId)
        .eq('session_level', booking.sessionLevel)
        .eq('status', 'booked')
        .maybeSingle();

      if (existingBooking) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Seat ${booking.seatId} is already booked for ${booking.sessionLevel}.` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // All validations passed - create all bookings
    const bookingRecords = bookings.map(booking => ({
      seat_id: booking.seatId,
      customer_name: userDetails.fullName,
      mobile_number: userDetails.mobileNumber,
      email: userDetails.email,
      invitation_code_used: normalizedCode,
      session_level: booking.sessionLevel,
      status: 'booked',
    }));

    const { data: createdBookings, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingRecords)
      .select();

    if (bookingError) {
      console.error('Failed to create bookings:', bookingError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create bookings. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update code usage
    const newUsage = invitationCode.current_usage + bookings.length;
    const shouldExpire = invitationCode.max_usage !== null && newUsage >= invitationCode.max_usage;
    
    await supabase
      .from('invitation_codes')
      .update({ 
        current_usage: newUsage,
        ...(shouldExpire ? { status: 'expired' } : {})
      })
      .eq('id', invitationCode.id);

    console.log('Multi-booking confirmed successfully:', createdBookings.map(b => b.id));

    const formattedBookings = createdBookings.map(booking => ({
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
    }));

    return new Response(
      JSON.stringify({ success: true, bookings: formattedBookings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error confirming multi-booking:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
