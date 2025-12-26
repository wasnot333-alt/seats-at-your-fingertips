import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Armchair, Ticket, ArrowRight, Star, Shield } from 'lucide-react';

export default function Index() {
  return (
    <PageContainer showHeader={false}>
      <div className="min-h-screen flex flex-col">
        {/* Top bar with admin link */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Armchair className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-foreground">SeatReserve</span>
            </div>
            <Link 
              to="/admin-login" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              Admin Login
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-8 animate-fade-up">
              <div className="p-4 rounded-2xl bg-primary/10 animate-glow">
                <Armchair className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h1 
              className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-up"
              style={{ animationDelay: '100ms' }}
            >
              Premium Seat
              <span className="block text-primary">Reservation</span>
            </h1>

            {/* Subtitle */}
            <p 
              className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto animate-fade-up"
              style={{ animationDelay: '200ms' }}
            >
              Experience seamless booking for your next event. 
              Select your perfect seat in just a few clicks.
            </p>

            {/* CTA Button */}
            <div 
              className="flex justify-center mb-16 animate-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              <Link to="/enter-code" className="gold-button inline-flex items-center gap-2">
                Book Your Seat
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Features */}
            <div 
              className="grid sm:grid-cols-3 gap-6 animate-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              <div className="glass-card text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Unique Code Access
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your exclusive booking code to access seat selection
                </p>
              </div>
              <div className="glass-card text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <Armchair className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Interactive Seat Map
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visual seat selection with real-time availability updates
                </p>
              </div>
              <div className="glass-card text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Instant Confirmation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Receive immediate booking confirmation via email
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-6">
          <div className="container mx-auto px-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 SeatReserve. Premium Event Booking Platform.
            </p>
            <Link 
              to="/admin-login" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          </div>
        </footer>
      </div>
    </PageContainer>
  );
}
