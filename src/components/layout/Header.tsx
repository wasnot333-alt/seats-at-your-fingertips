import { Armchair } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <Link to="/" className="flex items-center gap-3 w-fit">
          <div className="p-2 rounded-xl bg-primary/10">
            <Armchair className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              SeatReserve
            </h1>
            <p className="text-xs text-muted-foreground">Premium Booking</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
