import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useBooking } from '@/contexts/BookingContext';
import { CheckCircle2, Armchair, Ticket, User, Home, Sparkles } from 'lucide-react';

const steps = [
  { number: 1, title: 'Validate Code' },
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

  const handleNewBooking = () => {
    resetBooking();
    navigate('/');
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
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your seat has been successfully reserved
            </p>
          </div>

          {/* Booking Details Card */}
          <div 
            className="glass-card text-left mb-8 animate-fade-up" 
            style={{ animationDelay: '300ms' }}
          >
            <div className="grid gap-4">
              {/* Seat */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Armchair className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Seat Number</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {confirmedBooking.seatNumber}
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="p-3 rounded-xl bg-secondary">
                  <User className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Booked By</p>
                  <p className="text-lg font-semibold text-foreground">
                    {confirmedBooking.customerName}
                  </p>
                </div>
              </div>

              {/* Code */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="p-3 rounded-xl bg-secondary">
                  <Ticket className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <p className="text-lg font-mono font-semibold text-foreground">
                    {confirmedBooking.codeUsed}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Time */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Booked on {confirmedBooking.bookingTime}
              </p>
            </div>
          </div>

          {/* Confirmation Message */}
          <div 
            className="p-6 rounded-xl bg-seat-available/10 border border-seat-available/20 mb-8 animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            <p className="text-seat-available font-medium">
              ✓ A confirmation email has been sent to {confirmedBooking.email}
            </p>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up"
            style={{ animationDelay: '500ms' }}
          >
            <button
              onClick={handleNewBooking}
              className="gold-button flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Book Another Seat
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
