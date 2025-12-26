import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { validateCode } from '@/services/api';
import { useBooking } from '@/contexts/BookingContext';
import { Sparkles, Loader2, AlertCircle, Clock } from 'lucide-react';

export default function EnterCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();
  const { setCode: saveCode } = useBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your invitation access code');
      return;
    }

    setLoading(true);
    setError(null);
    setIsExpired(false);

    try {
      const result = await validateCode(code);

      if (result.isExpired) {
        setIsExpired(true);
        setError('This invitation code has expired. Please contact the ashram for a new code.');
      } else if (!result.isValid) {
        setError('Invalid invitation code. Please verify and try again.');
      } else {
        saveCode(result.code);
        navigate('/select-seat');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto px-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md animate-fade-up">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="p-6 rounded-full bg-primary/10 animate-float spiritual-glow">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Enter Your Invitation Code
            </h1>
            <p className="text-muted-foreground">
              Only invited Sadhaks can reserve their meditation seat. Please enter your Invitation Access Code to proceed.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card">
            <div className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
                  Invitation Access Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                    setIsExpired(false);
                  }}
                  placeholder="e.g., SHAKTI2024"
                  className="input-premium text-center text-xl tracking-widest uppercase"
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  isExpired 
                    ? 'bg-amber-500/10 border border-amber-500/20' 
                    : 'bg-destructive/10 border border-destructive/20'
                }`}>
                  {isExpired ? (
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  )}
                  <p className={`text-sm ${isExpired ? 'text-amber-500' : 'text-destructive'}`}>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="gold-button w-full flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Proceed to Seat Selection'
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an invitation code?{' '}
            <a href="#" className="text-primary hover:underline">
              Contact the Ashram
            </a>
          </p>

          {/* Demo codes hint */}
          <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-semibold text-foreground">Demo codes:</span>{' '}
              TEST123, VIP2024, GOLD2024
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}