export type SeatStatus = 'available' | 'booked' | 'selected';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface BookingCode {
  code: string;
  isValid: boolean;
  isExpired: boolean;
  maxSeats: number;
}

export interface UserDetails {
  fullName: string;
  mobileNumber: string;
  email: string;
}

export interface Booking {
  id: string;
  seatId: string;
  seatNumber: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  codeUsed: string;
  bookingTime: string;
  status: 'booked' | 'available';
}

export interface BookingState {
  code: string;
  selectedSeat: Seat | null;
  userDetails: UserDetails | null;
}
