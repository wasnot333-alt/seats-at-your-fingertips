export function SeatLegend() {
  return (
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
        <span className="text-sm text-muted-foreground">Booked</span>
      </div>
    </div>
  );
}
