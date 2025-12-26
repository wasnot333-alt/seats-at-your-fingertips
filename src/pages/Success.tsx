import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useBooking } from '@/contexts/BookingContext';
import { CheckCircle2, Sparkles, Home } from 'lucide-react';
import BookingTicket from '@/components/booking/BookingTicket';
import { Booking } from '@/types/booking';

const steps = [
  { number: 1, title: 'Enter Code' },
  { number: 2, title: 'Select Seat' },
  { number: 3, title: 'Your Details' },
  { number: 4, title: 'Confirmation' },
];

export default function Success() {
  const navigate = useNavigate();
  const { confirmedBooking, resetBooking } = useBooking();

  useEffect(() => {
    if (!confirmedBooking) {
      navigate('/');
    }
  }, [confirmedBooking, navigate]);

  if (!confirmedBooking) return null;

  const handleNewReservation = () => {
    resetBooking();
    navigate('/');
  };

  // Convert to Booking type for the ticket component
  const booking: Booking = {
    id: confirmedBooking.id || crypto.randomUUID(),
    seatId: confirmedBooking.seatNumber,
    seatNumber: confirmedBooking.seatNumber,
    customerName: confirmedBooking.customerName,
    mobileNumber: '',
    email: confirmedBooking.email,
    codeUsed: confirmedBooking.codeUsed,
    bookingTime: confirmedBooking.bookingTime,
    status: 'booked',
  };

  return (
    <PageContainer>
      <div className="container mx-auto px-6">
        <StepIndicator steps={steps} currentStep={4} />

        <div className="max-w-xl mx-auto text-center">
          {/* Success Icon */}
          <div className="relative inline-block mb-8 animate-scale-in">
            <div className="p-8 rounded-full bg-seat-available/20 animate-pulse">
              <CheckCircle2 className="w-24 h-24 text-seat-available" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-float" />
            <Sparkles className="absolute -bottom-1 -left-3 w-6 h-6 text-primary animate-float" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Title */}
          <div className="mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              🙏 Seat Reserved Successfully!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your meditation seat has been confirmed for the sacred session
            </p>
          </div>

          {/* Booking Ticket with QR Code */}
          <div 
            className="mb-8 animate-fade-up" 
            style={{ animationDelay: '300ms' }}
          >
            <BookingTicket booking={booking} />
          </div>

          {/* Confirmation Message */}
          <div 
            className="p-6 rounded-xl bg-seat-available/10 border border-seat-available/20 mb-8 animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            <p className="text-seat-available font-medium">
              ✓ A confirmation email has been sent to {confirmedBooking.email}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please arrive at the ashram on time for the meditation session.
            </p>
          </div>

          {/* Divine Message */}
          <div 
            className="p-6 rounded-xl bg-primary/5 border border-primary/20 mb-8 animate-fade-up text-center"
            style={{ animationDelay: '450ms' }}
          >
            <p className="text-primary font-display text-lg">
              🙏 Om Namah Shivay 🙏
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              May your spiritual journey be blessed with divine wisdom and inner peace.
            </p>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up"
            style={{ animationDelay: '500ms' }}
          >
            <button
              onClick={handleNewReservation}
              className="gold-button flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
