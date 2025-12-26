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
  participantName?: string | null;
  requiresNameMatch?: boolean;
  allowedLevels?: string[];
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
  sessionLevel?: string;
  bookingTime: string;
  status: 'booked' | 'available';
}

export interface BookingState {
  code: string;
  allowedLevels: string[];
  selectedLevel: string | null;
  selectedSeat: Seat | null;
  userDetails: UserDetails | null;
}

export type InvitationCodeStatus = 'active' | 'disabled' | 'expired';

export interface InvitationCode {
  id: string;
  code: string;
  status: InvitationCodeStatus;
  maxUsage: number | null;
  currentUsage: number;
  expiresAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  participantName: string | null;
  allowedLevels: string[];
}
