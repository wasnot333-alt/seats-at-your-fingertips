import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { SeatLayout } from '@/components/booking/SeatLayout';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useBooking } from '@/contexts/BookingContext';
import { ArrowRight, ArrowLeft, Flower2, Sparkles, Check } from 'lucide-react';

const steps = [
  { number: 1, title: 'Enter Code' },
  { number: 2, title: 'Select Levels' },
  { number: 3, title: 'Select Seats' },
  { number: 4, title: 'Your Details' },
  { number: 5, title: 'Confirmation' },
];

export default function SelectSeat() {
  const navigate = useNavigate();
  const { bookingState, setSelectedLevel, getLevelSeats } = useBooking();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  useEffect(() => {
    if (!bookingState.code) {
      navigate('/');
      return;
    }
    if (bookingState.selectedLevels.length === 0) {
      navigate('/select-level');
      return;
    }
    // Set the first level as selected
    if (bookingState.selectedLevels.length > 0) {
      setSelectedLevel(bookingState.selectedLevels[0]);
    }
  }, [bookingState.code, bookingState.selectedLevels, navigate, setSelectedLevel]);

  const currentLevel = bookingState.selectedLevels[currentLevelIndex];
  const totalLevels = bookingState.selectedLevels.length;
  const isMultiLevel = totalLevels > 1;
  const currentSeat = bookingState.levelSeats[currentLevel];
  const levelSeats = getLevelSeats();

  const handlePreviousLevel = () => {
    if (currentLevelIndex > 0) {
      const newIndex = currentLevelIndex - 1;
      setCurrentLevelIndex(newIndex);
      setSelectedLevel(bookingState.selectedLevels[newIndex]);
    }
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < totalLevels - 1) {
      const newIndex = currentLevelIndex + 1;
      setCurrentLevelIndex(newIndex);
      setSelectedLevel(bookingState.selectedLevels[newIndex]);
    }
  };

  const handleContinue = () => {
    // Check if all levels have seats selected
    const allSeatsSelected = bookingState.selectedLevels.every(
      level => bookingState.levelSeats[level] !== null && bookingState.levelSeats[level] !== undefined
    );

    if (allSeatsSelected) {
      navigate('/user-details');
    }
  };

  const allSeatsSelected = bookingState.selectedLevels.every(
    level => bookingState.levelSeats[level] !== null && bookingState.levelSeats[level] !== undefined
  );

  return (
    <PageContainer>
      <div className="container mx-auto px-6">
        <StepIndicator steps={steps} currentStep={3} />

        {/* Title */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Select Your Meditation Seat
          </h1>
          <p className="text-muted-foreground">
            Choose your sacred space for the divine meditation experience
          </p>
        </div>

        {/* Code & Level Display */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm text-muted-foreground">Invitation Code:</span>
            <span className="font-mono font-semibold text-primary">{bookingState.code}</span>
          </div>
        </div>

        {/* Multi-Level Navigation Tabs */}
        {isMultiLevel && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="glass-card">
              <p className="text-sm text-muted-foreground mb-3 text-center">
                Select a seat for each level you're booking
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {bookingState.selectedLevels.map((level, index) => {
                  const seatForLevel = bookingState.levelSeats[level];
                  const isActive = currentLevelIndex === index;
                  const isCompleted = seatForLevel !== null && seatForLevel !== undefined;

                  return (
                    <button
                      key={level}
                      onClick={() => {
                        setCurrentLevelIndex(index);
                        setSelectedLevel(level);
                      }}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : isCompleted 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {isCompleted && !isActive && (
                        <Check className="w-4 h-4" />
                      )}
                      <span className="font-medium">{level}</span>
                      {isCompleted && seatForLevel && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-primary-foreground/20' : 'bg-green-500/20'
                        }`}>
                          {seatForLevel.id}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Current Level Indicator */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">Selecting for:</span>
            <span className="font-semibold text-purple-500">{currentLevel}</span>
            {isMultiLevel && (
              <span className="text-xs text-muted-foreground">
                ({currentLevelIndex + 1} of {totalLevels})
              </span>
            )}
          </div>
        </div>

        {/* Seat Layout */}
        <div className="glass-card max-w-5xl mx-auto animate-scale-in">
          <SeatLayout key={currentLevel} />
        </div>

        {/* Selected Seat Display & Navigation */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="glass-card flex flex-col gap-6">
            {/* Level Navigation for Multi-Level */}
            {isMultiLevel && (
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <button
                  onClick={handlePreviousLevel}
                  disabled={currentLevelIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentLevelIndex === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Level
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Level Progress</p>
                  <p className="font-semibold">{levelSeats.length} / {totalLevels} seats selected</p>
                </div>

                <button
                  onClick={handleNextLevel}
                  disabled={currentLevelIndex === totalLevels - 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentLevelIndex === totalLevels - 1 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  Next Level
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Current Selection & Continue */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Flower2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isMultiLevel ? `Selected for ${currentLevel}` : 'Selected Meditation Seat'}
                  </p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {currentSeat?.id || '—'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={!allSeatsSelected}
                className="gold-button flex items-center gap-2"
              >
                {allSeatsSelected 
                  ? 'Continue to Your Details' 
                  : `Select seats for all ${totalLevels} levels`
                }
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Summary of all selections */}
            {isMultiLevel && levelSeats.length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Your Selections:</p>
                <div className="flex flex-wrap gap-3">
                  {levelSeats.map(({ level, seat }) => (
                    <div 
                      key={level}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">{level}:</span>
                      <span className="text-sm font-bold text-foreground">{seat.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
