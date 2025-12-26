import { Booking, BookingCode, Seat, UserDetails } from '@/types/booking';
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
      codeUsed: booking.access_code_used,
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
