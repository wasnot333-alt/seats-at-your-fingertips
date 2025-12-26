import { Booking, BookingCode, Seat, UserDetails, InvitationCode, LevelAnalytics, OverallAnalytics } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';

/**
 * POST /validate-code
 * Validates a booking code via edge function
 */
export async function validateCode(code: string): Promise<BookingCode> {
  try {
    const { data, error } = await supabase.functions.invoke('validate-code', {
      body: { code },
    });

    if (error) {
      console.error('Error validating code:', error);
      return {
        code: code.toUpperCase().trim(),
        isValid: false,
        isExpired: false,
        maxSeats: 0,
        allowedLevels: [],
      };
    }

    return data as BookingCode;
  } catch (error) {
    console.error('Error validating code:', error);
    return {
      code: code.toUpperCase().trim(),
      isValid: false,
      isExpired: false,
      maxSeats: 0,
      allowedLevels: [],
    };
  }
}

/**
 * GET /seats
 * Fetches all seats from the database
 */
export async function getSeats(): Promise<Seat[]> {
  try {
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .order('row')
      .order('number');

    if (error) {
      console.error('Error fetching seats:', error);
      return [];
    }

    return data.map((seat) => ({
      id: seat.seat_id,
      row: seat.row,
      number: seat.number,
      status: seat.status as 'available' | 'booked' | 'selected',
    }));
  } catch (error) {
    console.error('Error fetching seats:', error);
    return [];
  }
}

/**
 * GET seats with availability for a specific session level
 */
export async function getSeatsForLevel(sessionLevel: string): Promise<Seat[]> {
  try {
    // Get all seats
    const { data: seats, error: seatsError } = await supabase
      .from('seats')
      .select('*')
      .order('row')
      .order('number');

    if (seatsError) {
      console.error('Error fetching seats:', seatsError);
      return [];
    }

    // Get bookings for this level
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('seat_id')
      .eq('session_level', sessionLevel)
      .eq('status', 'booked');

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return [];
    }

    const bookedSeatIds = new Set(bookings.map(b => b.seat_id));

    return seats.map((seat) => ({
      id: seat.seat_id,
      row: seat.row,
      number: seat.number,
      status: bookedSeatIds.has(seat.seat_id) ? 'booked' : 'available' as 'available' | 'booked' | 'selected',
    }));
  } catch (error) {
    console.error('Error fetching seats:', error);
    return [];
  }
}

/**
 * POST /confirm-booking
 * Confirms a seat booking via edge function
 */
export async function confirmBooking(
  seatId: string,
  code: string,
  userDetails: UserDetails,
  sessionLevel: string
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('confirm-booking', {
      body: { seatId, code, userDetails, sessionLevel },
    });

    if (error) {
      console.error('Error confirming booking:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Error confirming booking:', error);
    return { success: false, error: 'Failed to confirm booking' };
  }
}

/**
 * POST /confirm-multi-booking
 * Confirms multiple seat bookings in a transaction via edge function
 */
export async function confirmMultiBooking(
  bookings: { seatId: string; sessionLevel: string }[],
  code: string,
  userDetails: UserDetails
): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> {
  const tryReadFunctionError = async (fnError: unknown): Promise<string> => {
    const anyErr = fnError as any;

    // Supabase FunctionsHttpError sometimes carries a Response in context.response
    const res: Response | undefined = anyErr?.context?.response;
    if (res) {
      try {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          return json?.error || json?.message || anyErr?.message || 'Failed to confirm bookings';
        } catch {
          return text || anyErr?.message || 'Failed to confirm bookings';
        }
      } catch {
        // ignore
      }
    }

    return anyErr?.message || 'Failed to confirm bookings';
  };

  try {
    const { data, error } = await supabase.functions.invoke('confirm-multi-booking', {
      body: { bookings, code, userDetails },
    });

    if (error) {
      const msg = await tryReadFunctionError(error);
      console.error('Error confirming multi-booking:', error);
      return { success: false, error: msg };
    }

    return data;
  } catch (error) {
    console.error('Error confirming multi-booking:', error);
    return { success: false, error: await tryReadFunctionError(error) };
  }
}

/**
 * GET booking by ID via edge function (for confirmation page)
 */
export async function getBookingById(
  bookingId: string
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('get-booking', {
      body: { bookingId },
    });

    if (error) {
      console.error('Error fetching booking:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return { success: false, error: 'Failed to fetch booking' };
  }
}

/**
 * GET /admin/bookings
 * Fetches all bookings for admin panel (requires admin auth)
 */
export async function getAdminBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_time', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return data.map((booking) => ({
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
      status: booking.status as 'booked' | 'available',
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

/**
 * GET level analytics for admin dashboard
 */
export async function getLevelAnalytics(): Promise<OverallAnalytics> {
  try {
    const levels = ['Level 1', 'Level 2', 'Level 3'];
    
    // Get total seats count (assuming 180 seats per level)
    const { count: totalSeatsCount } = await supabase
      .from('seats')
      .select('*', { count: 'exact', head: true });
    
    const totalSeatsPerLevel = totalSeatsCount || 180;

    // Get all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('seat_id, session_level, customer_name, email')
      .eq('status', 'booked');

    if (bookingsError) {
      console.error('Error fetching bookings for analytics:', bookingsError);
      throw bookingsError;
    }

    // Calculate level stats
    const levelStats: LevelAnalytics[] = levels.map(level => {
      const levelBookings = bookings.filter(b => b.session_level === level);
      const bookedSeats = levelBookings.length;
      const percentageFilled = Math.round((bookedSeats / totalSeatsPerLevel) * 100);
      
      let status: 'green' | 'yellow' | 'red' = 'green';
      if (percentageFilled >= 85) status = 'red';
      else if (percentageFilled >= 60) status = 'yellow';

      return {
        level,
        totalSeats: totalSeatsPerLevel,
        bookedSeats,
        availableSeats: totalSeatsPerLevel - bookedSeats,
        percentageFilled,
        status,
      };
    });

    // Calculate participant stats
    const uniqueEmails = new Set(bookings.map(b => b.email.toLowerCase()));
    const emailBookingCount = new Map<string, number>();
    bookings.forEach(b => {
      const email = b.email.toLowerCase();
      emailBookingCount.set(email, (emailBookingCount.get(email) || 0) + 1);
    });

    const multiLevelParticipants = Array.from(emailBookingCount.values()).filter(count => count > 1).length;

    return {
      totalParticipants: bookings.length,
      uniqueParticipants: uniqueEmails.size,
      multiLevelParticipants,
      levelStats,
    };
  } catch (error) {
    console.error('Error fetching level analytics:', error);
    return {
      totalParticipants: 0,
      uniqueParticipants: 0,
      multiLevelParticipants: 0,
      levelStats: [],
    };
  }
}

/**
 * GET /admin/invitation-codes
 * Fetches all invitation codes for admin panel (requires admin auth)
 */
export async function getInvitationCodes(): Promise<InvitationCode[]> {
  try {
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitation codes:', error);
      return [];
    }

    return data.map((code) => ({
      id: code.id,
      code: code.code,
      status: code.status as 'active' | 'disabled' | 'expired',
      maxUsage: code.max_usage,
      currentUsage: code.current_usage,
      expiresAt: code.expires_at,
      createdBy: code.created_by,
      createdAt: code.created_at,
      updatedAt: code.updated_at,
      participantName: code.participant_name,
      allowedLevels: code.allowed_levels || ['Level 1'],
    }));
  } catch (error) {
    console.error('Error fetching invitation codes:', error);
    return [];
  }
}

/**
 * POST /admin/invitation-codes
 * Creates a new invitation code (requires admin auth)
 */
export async function createInvitationCode(
  codeData: Omit<InvitationCode, 'id' | 'currentUsage' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; code?: InvitationCode; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('invitation_codes')
      .insert({
        code: codeData.code.toUpperCase().trim(),
        status: codeData.status,
        max_usage: codeData.maxUsage,
        expires_at: codeData.expiresAt,
        created_by: user?.id,
        participant_name: codeData.participantName || null,
        allowed_levels: codeData.allowedLevels || ['Level 1'],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation code:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      code: {
        id: data.id,
        code: data.code,
        status: data.status as 'active' | 'disabled' | 'expired',
        maxUsage: data.max_usage,
        currentUsage: data.current_usage,
        expiresAt: data.expires_at,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        participantName: data.participant_name,
        allowedLevels: data.allowed_levels || ['Level 1'],
      },
    };
  } catch (error) {
    console.error('Error creating invitation code:', error);
    return { success: false, error: 'Failed to create invitation code' };
  }
}

/**
 * PUT /admin/invitation-codes/:id
 * Updates an invitation code (requires admin auth)
 */
export async function updateInvitationCode(
  id: string,
  codeData: Partial<Omit<InvitationCode, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>
): Promise<{ success: boolean; code?: InvitationCode; error?: string }> {
  try {
    const updatePayload: Record<string, unknown> = {};
    
    if (codeData.code !== undefined) updatePayload.code = codeData.code.toUpperCase().trim();
    if (codeData.status !== undefined) updatePayload.status = codeData.status;
    if (codeData.maxUsage !== undefined) updatePayload.max_usage = codeData.maxUsage;
    if (codeData.currentUsage !== undefined) updatePayload.current_usage = codeData.currentUsage;
    if (codeData.expiresAt !== undefined) updatePayload.expires_at = codeData.expiresAt;
    if (codeData.participantName !== undefined) updatePayload.participant_name = codeData.participantName;
    if (codeData.allowedLevels !== undefined) updatePayload.allowed_levels = codeData.allowedLevels;

    const { data, error } = await supabase
      .from('invitation_codes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invitation code:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      code: {
        id: data.id,
        code: data.code,
        status: data.status as 'active' | 'disabled' | 'expired',
        maxUsage: data.max_usage,
        currentUsage: data.current_usage,
        expiresAt: data.expires_at,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        participantName: data.participant_name,
        allowedLevels: data.allowed_levels || ['Level 1'],
      },
    };
  } catch (error) {
    console.error('Error updating invitation code:', error);
    return { success: false, error: 'Failed to update invitation code' };
  }
}

/**
 * DELETE /admin/invitation-codes/:id
 * Deletes an invitation code (requires admin auth)
 */
export async function deleteInvitationCode(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invitation_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invitation code:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting invitation code:', error);
    return { success: false, error: 'Failed to delete invitation code' };
  }
}

/**
 * Export bookings to Excel file
 */
export async function exportToExcel(bookings: Booking[]): Promise<void> {
  const XLSX = await import('xlsx');
  
  const worksheetData = bookings.map((booking, index) => ({
    'S.No': index + 1,
    'Booking ID': booking.id,
    'Seat Number': booking.seatNumber,
    'Session Level': booking.sessionLevel || 'Level 1',
    'Customer Name': booking.customerName,
    'Mobile Number': booking.mobileNumber,
    'Email': booking.email,
    'Invitation Code': booking.codeUsed,
    'Booking Time': booking.bookingTime,
    'Status': booking.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
  
  // Auto-size columns
  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 38 }, // Booking ID
    { wch: 12 }, // Seat Number
    { wch: 12 }, // Session Level
    { wch: 25 }, // Customer Name
    { wch: 15 }, // Mobile Number
    { wch: 30 }, // Email
    { wch: 15 }, // Invitation Code
    { wch: 22 }, // Booking Time
    { wch: 10 }, // Status
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `bookings_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export invitation codes to Excel file
 */
export async function exportCodesToExcel(codes: InvitationCode[]): Promise<void> {
  const XLSX = await import('xlsx');
  
  const worksheetData = codes.map((code, index) => ({
    'S.No': index + 1,
    'Code': code.code,
    'Participant Name': code.participantName || 'Not assigned',
    'Allowed Levels': code.allowedLevels.join(', '),
    'Status': code.status,
    'Usage': `${code.currentUsage}${code.maxUsage !== null ? ` / ${code.maxUsage}` : ' / ∞'}`,
    'Expires At': code.expiresAt ? new Date(code.expiresAt).toLocaleString() : 'Never',
    'Created At': new Date(code.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitation Codes');
  
  XLSX.writeFile(workbook, `invitation_codes_${new Date().toISOString().split('T')[0]}.xlsx`);
}
