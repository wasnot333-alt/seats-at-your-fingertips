import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { useBooking } from '@/contexts/BookingContext';
import { StepIndicator } from '@/components/ui/step-indicator';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, Zap, Sun, Check, ArrowRight } from 'lucide-react';

const steps = [
  { number: 1, title: 'Enter Code' },
  { number: 2, title: 'Select Levels' },
  { number: 3, title: 'Select Seats' },
  { number: 4, title: 'Your Details' },
  { number: 5, title: 'Confirmation' },
];

const levelDetails: Record<string, { title: string; description: string; icon: React.ReactNode; color: string }> = {
  'Level 1': {
    title: 'Level 1 – Foundation',
    description: 'Begin your journey with foundational meditation practices and breathing techniques.',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-600',
  },
  'Level 2': {
    title: 'Level 2 – Awakening',
    description: 'Deepen your practice with advanced meditation and energy work.',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-600',
  },
  'Level 3': {
    title: 'Level 3 – Higher Consciousness',
    description: 'Experience profound states of awareness and spiritual transformation.',
    icon: <Sun className="w-8 h-8" />,
    color: 'from-amber-500 to-orange-600',
  },
};

export default function SelectLevel() {
  const navigate = useNavigate();
  const { bookingState, setSelectedLevels, setSelectedLevel } = useBooking();
  const [localSelectedLevels, setLocalSelectedLevels] = useState<string[]>([]);

  const maxSelectable = useMemo(() => {
    // maxSeats comes from backend as remaining usage; clamp to allowedLevels.
    const allowedCount = bookingState.allowedLevels.length || 1;
    const raw = bookingState.maxSeats ?? allowedCount;
    const clamped = Math.max(1, Math.min(raw, allowedCount));
    return clamped;
  }, [bookingState.allowedLevels.length, bookingState.maxSeats]);

  // Redirect if no code is set
  useEffect(() => {
    if (!bookingState.code) {
      navigate('/enter-code');
      return;
    }

    // Initialize selection (up to maxSelectable)
    if (bookingState.allowedLevels.length > 0 && localSelectedLevels.length === 0) {
      setLocalSelectedLevels(bookingState.allowedLevels.slice(0, maxSelectable));
    }
  }, [bookingState.code, bookingState.allowedLevels, navigate, localSelectedLevels.length, maxSelectable]);

  const handleToggleLevel = (level: string) => {
    setLocalSelectedLevels((prev) => {
      if (prev.includes(level)) {
        return prev.filter((l) => l !== level);
      }

      if (prev.length >= maxSelectable) {
        toast({
          title: 'Limit reached',
          description: `This code allows booking up to ${maxSelectable} level(s).`,
          variant: 'destructive',
        });
        return prev;
      }

      return [...prev, level];
    });
  };

  const handleContinue = () => {
    if (localSelectedLevels.length === 0) return;

    // Sort levels to ensure consistent order
    const sortedLevels = [...localSelectedLevels].sort();
    setSelectedLevels(sortedLevels);
    setSelectedLevel(sortedLevels[0]);
    navigate('/select-seat');
  };

  if (!bookingState.code) {
    return null;
  }

  const hasMultipleLevels = bookingState.allowedLevels.length > 1;

  return (
    <PageContainer>
      <div className="container mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="max-w-3xl mx-auto mb-12">
          <StepIndicator steps={steps} currentStep={2} />
        </div>

        {/* Title Section */}
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {hasMultipleLevels ? 'Select Meditation Levels' : 'Your Meditation Level'}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {hasMultipleLevels 
              ? 'Your invitation code allows access to multiple meditation levels. Select all levels you wish to book seats for.'
              : 'Your invitation grants access to the following meditation level.'
            }
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <span className="font-mono font-bold">{bookingState.code}</span>
          </div>
        </div>

        {/* Level Selection Cards */}
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookingState.allowedLevels.map((level, index) => {
            const details = levelDetails[level] || {
              title: level,
              description: 'Meditation session',
              icon: <Sparkles className="w-8 h-8" />,
              color: 'from-primary to-accent',
            };
            const isSelected = localSelectedLevels.includes(level);

            return (
              <button
                key={level}
                onClick={() => handleToggleLevel(level)}
                className={`group relative p-6 rounded-2xl bg-card border-2 transition-all duration-300 text-left animate-fade-up hover:shadow-xl ${
                  isSelected 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Selection Indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary'
                }`}>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>

                {/* Gradient Background */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${details.color} transition-opacity duration-300 ${
                  isSelected ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'
                }`} />
                
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${details.color} text-white mb-4`}>
                  {details.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  {details.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {details.description}
                </p>

                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary & Continue */}
        <div className="max-w-4xl mx-auto mt-10">
          <div className="glass-card flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Selected Levels</p>
              <p className="text-xs text-muted-foreground mb-3">You can select up to {maxSelectable} level(s) with this code.</p>
              <div className="flex flex-wrap gap-2">
                {localSelectedLevels.length === 0 ? (
                  <span className="text-muted-foreground">No levels selected</span>
                ) : (
                  [...localSelectedLevels].sort().map((level) => (
                    <span key={level} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {level}
                    </span>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={handleContinue}
              disabled={localSelectedLevels.length === 0}
              className="gold-button flex items-center gap-2"
            >
              Continue to Seat Selection
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/enter-code')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Enter a different code
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
