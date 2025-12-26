import { Booking, BookingCode, Seat, UserDetails } from '@/types/booking';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for demonstration
const mockBookedSeats = ['A3', 'A7', 'B2', 'B5', 'B8', 'C1', 'C4', 'C9'];

const mockBookings: Booking[] = [
  {
    id: '1',
    seatId: 'A3',
    seatNumber: 'A3',
    customerName: 'John Smith',
    mobileNumber: '+1 234 567 8901',
    email: 'john.smith@email.com',
    codeUsed: 'GOLD2024',
    bookingTime: '2024-01-15 10:30 AM',
    status: 'booked',
  },
  {
    id: '2',
    seatId: 'A7',
    seatNumber: 'A7',
    customerName: 'Sarah Johnson',
    mobileNumber: '+1 234 567 8902',
    email: 'sarah.j@email.com',
    codeUsed: 'VIP2024',
    bookingTime: '2024-01-15 11:45 AM',
    status: 'booked',
  },
  {
    id: '3',
    seatId: 'B2',
    seatNumber: 'B2',
    customerName: 'Michael Brown',
    mobileNumber: '+1 234 567 8903',
    email: 'm.brown@email.com',
    codeUsed: 'PREMIUM01',
    bookingTime: '2024-01-15 02:15 PM',
    status: 'booked',
  },
  {
    id: '4',
    seatId: 'B5',
    seatNumber: 'B5',
    customerName: 'Emily Davis',
    mobileNumber: '+1 234 567 8904',
    email: 'emily.d@email.com',
    codeUsed: 'EVENT2024',
    bookingTime: '2024-01-15 03:00 PM',
    status: 'booked',
  },
  {
    id: '5',
    seatId: 'B8',
    seatNumber: 'B8',
    customerName: 'David Wilson',
    mobileNumber: '+1 234 567 8905',
    email: 'd.wilson@email.com',
    codeUsed: 'CORP100',
    bookingTime: '2024-01-15 04:30 PM',
    status: 'booked',
  },
];

// Valid codes for testing
const validCodes = ['GOLD2024', 'VIP2024', 'PREMIUM01', 'EVENT2024', 'CORP100', 'TEST123'];
const expiredCodes = ['EXPIRED01', 'OLD2023'];

/**
 * POST /validate-code
 * Validates a booking code
 */
export async function validateCode(code: string): Promise<BookingCode> {
  await delay(800); // Simulate network delay

  const upperCode = code.toUpperCase().trim();

  if (expiredCodes.includes(upperCode)) {
    return {
      code: upperCode,
      isValid: false,
      isExpired: true,
      maxSeats: 0,
    };
  }

  if (validCodes.includes(upperCode)) {
    return {
      code: upperCode,
      isValid: true,
      isExpired: false,
      maxSeats: 1,
    };
  }

  return {
    code: upperCode,
    isValid: false,
    isExpired: false,
    maxSeats: 0,
  };
}

/**
 * GET /seats
 * Fetches all seats with their current status
 */
export async function getSeats(): Promise<Seat[]> {
  await delay(500);

  const rows = ['A', 'B', 'C'];
  const seatsPerSide = 5;
  const seats: Seat[] = [];

  rows.forEach(row => {
    // Left side seats (1-5)
    for (let i = 1; i <= seatsPerSide; i++) {
      const seatId = `${row}${i}`;
      seats.push({
        id: seatId,
        row,
        number: i,
        status: mockBookedSeats.includes(seatId) ? 'booked' : 'available',
      });
    }

    // Right side seats (6-10)
    for (let i = seatsPerSide + 1; i <= seatsPerSide * 2; i++) {
      const seatId = `${row}${i}`;
      seats.push({
        id: seatId,
        row,
        number: i,
        status: mockBookedSeats.includes(seatId) ? 'booked' : 'available',
      });
    }
  });

  return seats;
}

/**
 * POST /confirm-booking
 * Confirms a seat booking
 */
export async function confirmBooking(
  seatId: string,
  code: string,
  userDetails: UserDetails
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  await delay(1000);

  // Simulate successful booking
  const newBooking: Booking = {
    id: `booking-${Date.now()}`,
    seatId,
    seatNumber: seatId,
    customerName: userDetails.fullName,
    mobileNumber: userDetails.mobileNumber,
    email: userDetails.email,
    codeUsed: code,
    bookingTime: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'booked',
  };

  return {
    success: true,
    booking: newBooking,
  };
}

/**
 * GET /admin/bookings
 * Fetches all bookings for admin panel
 */
export async function getAdminBookings(): Promise<Booking[]> {
  await delay(600);
  return mockBookings;
}

/**
 * Export to Excel placeholder
 */
export async function exportToExcel(bookings: Booking[]): Promise<void> {
  await delay(500);
  console.log('Export to Excel:', bookings);
  // In real implementation, this would generate and download an Excel file
  alert('Export to Excel functionality will be connected to backend');
}

/**
 * Export to PDF placeholder
 */
export async function exportToPdf(bookings: Booking[]): Promise<void> {
  await delay(500);
  console.log('Export to PDF:', bookings);
  // In real implementation, this would generate and download a PDF file
  alert('Export to PDF functionality will be connected to backend');
}
