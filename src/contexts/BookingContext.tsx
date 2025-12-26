import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookingState, Seat, UserDetails, Booking } from '@/types/booking';

interface BookingContextType {
  bookingState: BookingState;
  setCode: (code: string, allowedLevels?: string[], maxSeats?: number) => void;
  setSelectedLevels: (levels: string[]) => void;
  setSelectedLevel: (level: string) => void;
  selectSeat: (seat: Seat | null) => void;
  setSeatForLevel: (level: string, seat: Seat | null) => void;
  setUserDetails: (details: UserDetails) => void;
  confirmedBookings: Booking[];
  setConfirmedBookings: (bookings: Booking[]) => void;
  confirmedBooking: Booking | null; // Legacy support
  setConfirmedBooking: (booking: Booking | null) => void;
  resetBooking: () => void;
  getLevelSeats: () => { level: string; seat: Seat }[];
}

const initialState: BookingState = {
  code: '',
  allowedLevels: [],
  maxSeats: 1,
  selectedLevels: [],
  selectedLevel: null,
  selectedSeat: null,
  levelSeats: {},
  userDetails: null,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingState, setBookingState] = useState<BookingState>(initialState);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const setCode = (code: string, allowedLevels?: string[], maxSeats?: number) => {
    const levels = allowedLevels || ['Level 1'];
    const allowedCount = levels.length;
    const computedMaxSeats = typeof maxSeats === 'number' && Number.isFinite(maxSeats)
      ? Math.max(0, Math.min(maxSeats, allowedCount))
      : allowedCount;

    const initialSelectedLevels = levels.slice(0, Math.max(1, computedMaxSeats));

    setBookingState((prev) => ({
      ...prev,
      code,
      allowedLevels: levels,
      maxSeats: computedMaxSeats,
      // Auto-select up to maxSeats levels (at least 1)
      selectedLevels: initialSelectedLevels,
      // Auto-select first level for editing
      selectedLevel: initialSelectedLevels[0] || null,
      levelSeats: {},
    }));
  };

  const setSelectedLevels = (levels: string[]) => {
    setBookingState((prev) => {
      // Clean up seats for deselected levels
      const newLevelSeats = { ...prev.levelSeats };
      Object.keys(newLevelSeats).forEach((level) => {
        if (!levels.includes(level)) {
          delete newLevelSeats[level];
        }
      });
      return {
        ...prev,
        selectedLevels: levels,
        levelSeats: newLevelSeats,
        selectedLevel: levels[0] || null,
        // Ensure maxSeats never exceeds current allowedLevels length
        maxSeats: Math.min(prev.maxSeats || 1, prev.allowedLevels.length || 1),
      };
    });
  };

  const setSelectedLevel = (level: string) => {
    setBookingState(prev => ({ 
      ...prev, 
      selectedLevel: level,
      selectedSeat: prev.levelSeats[level] || null,
    }));
  };

  const selectSeat = (seat: Seat | null) => {
    setBookingState(prev => {
      if (!prev.selectedLevel) return prev;
      return { 
        ...prev, 
        selectedSeat: seat,
        levelSeats: {
          ...prev.levelSeats,
          [prev.selectedLevel]: seat,
        }
      };
    });
  };

  const setSeatForLevel = (level: string, seat: Seat | null) => {
    setBookingState(prev => ({
      ...prev,
      levelSeats: {
        ...prev.levelSeats,
        [level]: seat,
      },
      selectedSeat: prev.selectedLevel === level ? seat : prev.selectedSeat,
    }));
  };

  const setUserDetails = (details: UserDetails) => {
    setBookingState(prev => ({ ...prev, userDetails: details }));
  };

  const resetBooking = () => {
    setBookingState(initialState);
    setConfirmedBookings([]);
    setConfirmedBooking(null);
  };

  const getLevelSeats = () => {
    return Object.entries(bookingState.levelSeats)
      .filter(([_, seat]) => seat !== null)
      .map(([level, seat]) => ({ level, seat: seat! }));
  };

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        setCode,
        setSelectedLevels,
        setSelectedLevel,
        selectSeat,
        setSeatForLevel,
        setUserDetails,
        confirmedBookings,
        setConfirmedBookings,
        confirmedBooking,
        setConfirmedBooking,
        resetBooking,
        getLevelSeats,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
