import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookingState, Seat, UserDetails, Booking } from '@/types/booking';

interface BookingContextType {
  bookingState: BookingState;
  setCode: (code: string, allowedLevels?: string[]) => void;
  setSelectedLevel: (level: string) => void;
  selectSeat: (seat: Seat | null) => void;
  setUserDetails: (details: UserDetails) => void;
  confirmedBooking: Booking | null;
  setConfirmedBooking: (booking: Booking | null) => void;
  resetBooking: () => void;
}

const initialState: BookingState = {
  code: '',
  allowedLevels: [],
  selectedLevel: null,
  selectedSeat: null,
  userDetails: null,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingState, setBookingState] = useState<BookingState>(initialState);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const setCode = (code: string, allowedLevels?: string[]) => {
    setBookingState(prev => ({ 
      ...prev, 
      code,
      allowedLevels: allowedLevels || ['Level 1'],
      // Auto-select level if only one is allowed
      selectedLevel: allowedLevels && allowedLevels.length === 1 ? allowedLevels[0] : null
    }));
  };

  const setSelectedLevel = (level: string) => {
    setBookingState(prev => ({ ...prev, selectedLevel: level }));
  };

  const selectSeat = (seat: Seat | null) => {
    setBookingState(prev => ({ ...prev, selectedSeat: seat }));
  };

  const setUserDetails = (details: UserDetails) => {
    setBookingState(prev => ({ ...prev, userDetails: details }));
  };

  const resetBooking = () => {
    setBookingState(initialState);
    setConfirmedBooking(null);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        setCode,
        setSelectedLevel,
        selectSeat,
        setUserDetails,
        confirmedBooking,
        setConfirmedBooking,
        resetBooking,
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
