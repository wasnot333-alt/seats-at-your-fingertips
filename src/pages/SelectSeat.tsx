import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { SeatLayout } from '@/components/booking/SeatLayout';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useBooking } from '@/contexts/BookingContext';
import { ArrowRight, Armchair } from 'lucide-react';

const steps = [
  { number: 1, title: 'Validate Code' },
  { number: 2, title: 'Select Seat' },
  { number: 3, title: 'Your Details' },
  { number: 4, title: 'Confirmation' },
];

export default function SelectSeat() {
  const navigate = useNavigate();
  const { bookingState } = useBooking();

  useEffect(() => {
    if (!bookingState.code) {
      navigate('/');
    }
  }, [bookingState.code, navigate]);

  const handleContinue = () => {
    if (bookingState.selectedSeat) {
      navigate('/user-details');
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto px-6">
        <StepIndicator steps={steps} currentStep={2} />

        {/* Title */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Select Your Seat
          </h1>
          <p className="text-muted-foreground">
            Choose your preferred seat from the available options
          </p>
        </div>

        {/* Code Display */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm text-muted-foreground">Code:</span>
            <span className="font-mono font-semibold text-primary">{bookingState.code}</span>
          </div>
        </div>

        {/* Seat Layout */}
        <div className="glass-card max-w-5xl mx-auto animate-scale-in">
          <SeatLayout />
        </div>

        {/* Selected Seat Display & Continue Button */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="glass-card flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Armchair className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Seat</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {bookingState.selectedSeat?.id || '—'}
                </p>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!bookingState.selectedSeat}
              className="gold-button flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
