import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { useBooking } from '@/contexts/BookingContext';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Sparkles, Zap, Sun } from 'lucide-react';

const steps = [
  { number: 1, title: 'Enter Code' },
  { number: 2, title: 'Select Level' },
  { number: 3, title: 'Select Seat' },
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
  const { bookingState, setSelectedLevel } = useBooking();

  // Redirect if no code is set
  useEffect(() => {
    if (!bookingState.code) {
      navigate('/enter-code');
      return;
    }
    
    // If only one level is allowed, auto-proceed to seat selection
    if (bookingState.allowedLevels.length === 1) {
      setSelectedLevel(bookingState.allowedLevels[0]);
      navigate('/select-seat');
    }
  }, [bookingState.code, bookingState.allowedLevels, navigate, setSelectedLevel]);

  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    navigate('/select-seat');
  };

  // Don't render if we're going to redirect
  if (!bookingState.code || bookingState.allowedLevels.length <= 1) {
    return null;
  }

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
            Select Meditation Level
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your invitation code allows access to multiple meditation levels. 
            Please select the level you wish to attend.
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

            return (
              <button
                key={level}
                onClick={() => handleSelectLevel(level)}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 text-left animate-fade-up hover:shadow-xl hover:shadow-primary/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${details.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
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

                {/* Arrow indicator */}
                <div className="absolute bottom-6 right-6 text-muted-foreground group-hover:text-primary transition-colors">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
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
