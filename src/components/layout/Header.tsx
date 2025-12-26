import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-3">
        <Link to="/" className="flex items-center gap-3 w-fit">
          <img src={logo} alt="Shiva Science Meditation" className="h-12 w-auto" />
          <div className="hidden sm:block">
            <h1 className="font-display text-lg font-bold text-foreground">
              Shiva Science
            </h1>
            <p className="text-xs text-primary">Chakra Meditation</p>
          </div>
        </Link>
      </div>
    </header>
  );
}