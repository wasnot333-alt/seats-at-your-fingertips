import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookingState, Seat, UserDetails, Booking } from '@/types/booking';

interface BookingContextType {
  bookingState: BookingState;
  setCode: (code: string) => void;
  selectSeat: (seat: Seat | null) => void;
  setUserDetails: (details: UserDetails) => void;
  confirmedBooking: Booking | null;
  setConfirmedBooking: (booking: Booking | null) => void;
  resetBooking: () => void;
}

const initialState: BookingState = {
  code: '',
  selectedSeat: null,
  userDetails: null,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingState, setBookingState] = useState<BookingState>(initialState);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const setCode = (code: string) => {
    setBookingState(prev => ({ ...prev, code }));
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
