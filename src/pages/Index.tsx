import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Sparkles, ArrowRight, Shield, MapPin, Calendar, Flower2 } from 'lucide-react';
import logo from '@/assets/logo.png';
import guruImage from '@/assets/guru-bhaiyaji.jpg';

export default function Index() {
  return (
    <PageContainer showHeader={false}>
      <div className="min-h-screen flex flex-col">
        {/* Top bar with admin link */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Shiva Science Meditation" className="h-10 w-auto" />
              <span className="font-display font-bold text-foreground hidden sm:block">Shiva Science</span>
            </div>
            <Link 
              to="/admin-login" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Om Symbol */}
            <div className="inline-flex items-center gap-3 mb-6 animate-fade-up">
              <span className="text-4xl om-symbol animate-pulse-soft">🔔</span>
              <span className="font-display text-2xl text-primary">Namah Shivay!</span>
              <span className="text-4xl om-symbol animate-pulse-soft">🔔</span>
            </div>

            {/* Welcome Message */}
            <h1 
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-up"
              style={{ animationDelay: '100ms' }}
            >
              Welcome, Beloved <span className="text-primary">Sadhaks</span> 🙏
            </h1>

            <p 
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-up leading-relaxed"
              style={{ animationDelay: '200ms' }}
            >
              You are cordially invited to the sacred <span className="text-primary font-semibold">Chakra Meditation Sessions</span> conducted by <span className="text-foreground font-semibold">Param Pujya Bhaiyaji</span> at Shiva Science Ashram, Goa.
            </p>

            {/* Guru Image */}
            <div 
              className="mb-10 animate-fade-up"
              style={{ animationDelay: '250ms' }}
            >
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl" />
                <img 
                  src={guruImage} 
                  alt="Param Pujya Bhaiyaji" 
                  className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-primary/30 shadow-2xl relative z-10 mx-auto"
                />
                <p className="text-sm text-muted-foreground mt-3 font-display">Param Pujya Bhaiyaji</p>
              </div>
            </div>

            {/* Session Details Card */}
            <div 
              className="glass-card max-w-2xl mx-auto mb-10 animate-fade-up text-left"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">Upcoming Session Details</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Flower2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Level 1 – Foundation of Mooladhar Chakra</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Venue</p>
                      <p className="font-medium text-foreground">Shiva Science Ashram, Goa</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dates</p>
                      <p className="font-medium text-foreground">19th Dec – 23rd Dec, 2025</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Session Fees</p>
                  <p className="text-2xl font-bold text-foreground">₹20,000</p>
                  <p className="text-xs text-accent mt-1">(Fees Already Paid — This Website is Only for Meditation Seat Reservation)</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-sm font-semibold text-foreground mb-3">Session Highlights:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    In-depth knowledge of Mooladhar Chakra & its 4 petals
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Sanjeevani Shakti Activation
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Beej Mantra Diksha
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Self-Healing Techniques
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Guided Spiritual Experience
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Peaceful Divine Environment
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div 
              className="flex justify-center mb-12 animate-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              <Link to="/enter-code" className="gold-button inline-flex items-center gap-2 spiritual-glow">
                Reserve Your Meditation Seat
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-6">
          <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2024 Shiva Science Meditation. Sacred Chakra Awakening.
            </p>
            <Link 
              to="/admin-login" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </footer>
      </div>
    </PageContainer>
  );
}