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

// Multi-level booking support
export interface LevelSeatSelection {
  level: string;
  seat: Seat | null;
}

export interface BookingState {
  code: string;
  allowedLevels: string[];
  selectedLevels: string[]; // Levels user wants to book
  selectedLevel: string | null; // Current level being edited
  selectedSeat: Seat | null;
  levelSeats: Record<string, Seat | null>; // Seats selected per level
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

// Analytics types
export interface LevelAnalytics {
  level: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  percentageFilled: number;
  status: 'green' | 'yellow' | 'red';
}

export interface OverallAnalytics {
  totalParticipants: number;
  uniqueParticipants: number;
  multiLevelParticipants: number;
  levelStats: LevelAnalytics[];
}
