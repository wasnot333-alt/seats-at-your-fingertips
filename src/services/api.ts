import { Booking, BookingCode, Seat, UserDetails, InvitationCode } from '@/types/booking';
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
 * POST /confirm-booking
 * Confirms a seat booking via edge function
 */
export async function confirmBooking(
  seatId: string,
  code: string,
  userDetails: UserDetails
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('confirm-booking', {
      body: { seatId, code, userDetails },
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
 * Export to Excel placeholder
 */
export async function exportToExcel(bookings: Booking[]): Promise<void> {
  console.log('Export to Excel:', bookings);
  alert('Export to Excel functionality will be implemented');
}

/**
 * Export to PDF placeholder
 */
export async function exportToPdf(bookings: Booking[]): Promise<void> {
  console.log('Export to PDF:', bookings);
  alert('Export to PDF functionality will be implemented');
}
