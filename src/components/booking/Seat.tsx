import { Seat as SeatType } from '@/types/booking';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onSelect: (seat: SeatType) => void;
}

export function Seat({ seat, isSelected, onSelect }: SeatProps) {
  const getSeatClass = () => {
    if (isSelected) return 'seat-selected';
    if (seat.status === 'booked') return 'seat-booked';
    return 'seat-available';
  };

  const handleClick = () => {
    if (seat.status !== 'booked') {
      onSelect(seat);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className={getSeatClass()}
          disabled={seat.status === 'booked'}
          aria-label={`Seat ${seat.id} - ${seat.status === 'booked' ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
        >
          {seat.id}
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="bg-card border-border text-foreground px-3 py-2"
      >
        <p className="font-medium">Seat {seat.id}</p>
        <p className="text-xs text-muted-foreground">
          {seat.status === 'booked' ? 'Already Booked' : isSelected ? 'Selected' : 'Available'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
