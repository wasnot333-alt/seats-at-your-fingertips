import { useState, useEffect } from 'react';
import { Seat } from './Seat';
import { Seat as SeatType } from '@/types/booking';
import { getSeatsForLevel } from '@/services/api';
import { useBooking } from '@/contexts/BookingContext';
import { Loader2 } from 'lucide-react';

export function SeatLayout() {
  const [seats, setSeats] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);
  const { bookingState, selectSeat } = useBooking();

  const currentLevel = bookingState.selectedLevel || 'Level 1';
  // Get the selected seat for the CURRENT level from levelSeats
  const selectedSeatForLevel = bookingState.levelSeats[currentLevel];

  useEffect(() => {
    let isMounted = true;
    
    const loadSeats = async () => {
      try {
        setLoading(true);
        const fetchedSeats = await getSeatsForLevel(currentLevel);
        if (isMounted) {
          setSeats(fetchedSeats);
        }
      } catch (error) {
        console.error('Failed to load seats:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSeats();
    
    return () => {
      isMounted = false;
    };
  }, [currentLevel]);

  const handleSeatSelect = (seat: SeatType) => {
    // Toggle: if same seat clicked, deselect; otherwise select
    if (selectedSeatForLevel?.id === seat.id) {
      selectSeat(null);
    } else {
      selectSeat(seat);
    }
  };

  // 18 rows: A to R
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

  const getSeatsForRow = (row: string, side: 'left' | 'right') => {
    return seats.filter(seat => {
      if (seat.row !== row) return false;
      if (side === 'left') return seat.number <= 5;
      return seat.number > 5;
    }).sort((a, b) => a.number - b.number);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Guru/Stage Area */}
      <div className="mb-12 animate-fade-up">
        <div className="stage-banner animate-glow">
          🙏 GURU AASAN 🙏
        </div>
        <p className="text-center text-muted-foreground text-sm mt-3">Front - Facing the Divine</p>
      </div>

      {/* Seat Grid */}
      <div className="space-y-6">
        {rows.map((row, rowIndex) => (
          <div 
            key={row} 
            className="flex items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: `${(rowIndex + 1) * 100}ms` }}
          >
            {/* Row Label */}
            <div className="w-10 text-center">
              <span className="text-lg font-display font-semibold text-primary">
                {row}
              </span>
            </div>

            {/* Left Section */}
            <div className="flex gap-2">
              {getSeatsForRow(row, 'left').map(seat => (
                <Seat
                  key={seat.id}
                  seat={seat}
                  isSelected={selectedSeatForLevel?.id === seat.id}
                  onSelect={handleSeatSelect}
                />
              ))}
            </div>

            {/* Center Pathway */}
            <div className="pathway">
              <span className="text-xs uppercase tracking-wider opacity-50">Path</span>
            </div>

            {/* Right Section */}
            <div className="flex gap-2">
              {getSeatsForRow(row, 'right').map(seat => (
                <Seat
                  key={seat.id}
                  seat={seat}
                  isSelected={selectedSeatForLevel?.id === seat.id}
                  onSelect={handleSeatSelect}
                />
              ))}
            </div>

            {/* Row Label (Right) */}
            <div className="w-10 text-center">
              <span className="text-lg font-display font-semibold text-primary">
                {row}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Back Label */}
      <p className="text-center text-muted-foreground text-sm mt-8">Back Side - Entry</p>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-10 pt-8 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-seat-available" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-seat-selected" />
          <span className="text-sm text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-seat-booked opacity-60" />
          <span className="text-sm text-muted-foreground">Reserved</span>
        </div>
      </div>
    </div>
  );
}
