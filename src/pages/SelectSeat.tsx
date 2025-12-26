import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { SeatLayout } from '@/components/booking/SeatLayout';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useBooking } from '@/contexts/BookingContext';
import { ArrowRight, Flower2, Sparkles } from 'lucide-react';

const steps = [
  { number: 1, title: 'Enter Code' },
  { number: 2, title: 'Select Level' },
  { number: 3, title: 'Select Seat' },
  { number: 4, title: 'Your Details' },
  { number: 5, title: 'Confirmation' },
];

export default function SelectSeat() {
  const navigate = useNavigate();
  const { bookingState } = useBooking();

  useEffect(() => {
    if (!bookingState.code) {
      navigate('/');
      return;
    }
    // Ensure a level is selected
    if (!bookingState.selectedLevel) {
      navigate('/select-level');
    }
  }, [bookingState.code, bookingState.selectedLevel, navigate]);

  const handleContinue = () => {
    if (bookingState.selectedSeat) {
      navigate('/user-details');
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto px-6">
        <StepIndicator steps={steps} currentStep={3} />

        {/* Title */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Select Your Meditation Seat
          </h1>
          <p className="text-muted-foreground">
            Choose your sacred space for the divine meditation experience
          </p>
        </div>

        {/* Code & Level Display */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm text-muted-foreground">Invitation Code:</span>
            <span className="font-mono font-semibold text-primary">{bookingState.code}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">Session:</span>
            <span className="font-semibold text-purple-500">{bookingState.selectedLevel}</span>
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
                <Flower2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Meditation Seat</p>
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
