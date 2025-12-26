import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useBooking } from '@/contexts/BookingContext';
import { confirmBooking, confirmMultiBooking } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Flower2, Loader2, Mail, Phone, Sparkles, User } from 'lucide-react';

const steps = [
  { number: 1, title: 'Enter Code' },
  { number: 2, title: 'Select Level' },
  { number: 3, title: 'Select Seat' },
  { number: 4, title: 'Your Details' },
  { number: 5, title: 'Confirmation' },
];

export default function UserDetails() {
  const navigate = useNavigate();
  const { bookingState, setUserDetails, setConfirmedBooking, setConfirmedBookings } = useBooking();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedLevels = bookingState.selectedLevels?.length
    ? bookingState.selectedLevels
    : bookingState.selectedLevel
      ? [bookingState.selectedLevel]
      : [];

  const isMultiLevel = selectedLevels.length > 1;

  const selectionsForSummary = useMemo(() => {
    return selectedLevels
      .map((level) => ({ level, seat: bookingState.levelSeats[level] || null }))
      .filter((x) => x.seat);
  }, [bookingState.levelSeats, selectedLevels]);

  useEffect(() => {
    if (!bookingState.code || selectedLevels.length === 0) {
      navigate('/');
    }
  }, [bookingState.code, navigate, selectedLevels.length]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Ensure each selected level has a seat
    const selectedSeatsCount = selectedLevels.filter((lvl) => bookingState.levelSeats[lvl]).length;
    if (selectedSeatsCount !== selectedLevels.length) {
      toast({
        title: 'Select seats for all levels',
        description: 'Please choose one seat for each selected level before confirming.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isMultiLevel) {
        const bookingsPayload = selectedLevels.map((level) => ({
          sessionLevel: level,
          seatId: bookingState.levelSeats[level]!.id,
        }));

        const result = await confirmMultiBooking(bookingsPayload, bookingState.code, formData);

        if (result.success && result.bookings) {
          setUserDetails(formData);
          setConfirmedBookings(result.bookings);
          setConfirmedBooking(null);
          navigate('/success');
        } else {
          toast({
            title: 'Booking failed',
            description: result.error || 'Failed to confirm bookings',
            variant: 'destructive',
          });
        }
      } else {
        const level = selectedLevels[0] || 'Level 1';
        const seat = bookingState.levelSeats[level] || bookingState.selectedSeat;

        if (!seat) {
          toast({
            title: 'Seat not selected',
            description: 'Please select a seat before confirming.',
            variant: 'destructive',
          });
          return;
        }

        const result = await confirmBooking(seat.id, bookingState.code, formData, level);

        if (result.success && result.booking) {
          setUserDetails(formData);
          setConfirmedBooking(result.booking);
          setConfirmedBookings([]);
          navigate('/success');
        } else {
          toast({
            title: 'Booking failed',
            description: result.error || 'Failed to confirm booking',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Reservation failed:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto px-6">
        <StepIndicator steps={steps} currentStep={4} />

        {/* Title */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Sadhak Details</h1>
          <p className="text-muted-foreground">Please provide your contact information to complete the seat reservation</p>
        </div>

        <div className="max-w-2xl mx-auto grid gap-8">
          {/* Reservation Summary Card */}
          <div className="glass-card animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Reservation Summary</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Flower2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Meditation Seat</p>
                  <p className="text-lg font-bold text-foreground">
                    {isMultiLevel ? `${selectionsForSummary.length} seats` : selectionsForSummary[0]?.seat?.id}
                  </p>
                  {isMultiLevel && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectionsForSummary
                        .map((s) => `${s.level.replace('Level ', 'L')}: ${s.seat!.id}`)
                        .join(' • ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Session Level</p>
                  <p className="text-lg font-bold text-purple-600">
                    {isMultiLevel ? selectedLevels.join(' + ') : selectedLevels[0] || 'Level 1'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invitation Code</p>
                  <p className="text-lg font-bold font-mono text-foreground">{bookingState.code}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card animate-fade-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-semibold text-foreground mb-6">Contact Information</h2>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Full Name (as per records)
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className={`input-premium pl-12 ${errors.fullName ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-foreground mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleChange('mobileNumber', e.target.value)}
                    placeholder="Enter your mobile number"
                    className={`input-premium pl-12 ${errors.mobileNumber ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.mobileNumber}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className={`input-premium pl-12 ${errors.email ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/select-seat')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button type="submit" disabled={loading} className="gold-button flex-1 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming Reservation...
                  </>
                ) : (
                  'Confirm Seat Reservation'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
