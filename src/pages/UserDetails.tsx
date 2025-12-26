import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useBooking } from '@/contexts/BookingContext';
import { confirmBooking } from '@/services/api';
import { User, Phone, Mail, Armchair, Ticket, Loader2, ArrowLeft } from 'lucide-react';

const steps = [
  { number: 1, title: 'Validate Code' },
  { number: 2, title: 'Select Seat' },
  { number: 3, title: 'Your Details' },
  { number: 4, title: 'Confirmation' },
];

export default function UserDetails() {
  const navigate = useNavigate();
  const { bookingState, setUserDetails, setConfirmedBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!bookingState.code || !bookingState.selectedSeat) {
      navigate('/');
    }
  }, [bookingState, navigate]);

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

    setLoading(true);

    try {
      const result = await confirmBooking(
        bookingState.selectedSeat!.id,
        bookingState.code,
        formData
      );

      if (result.success && result.booking) {
        setUserDetails(formData);
        setConfirmedBooking(result.booking);
        navigate('/success');
      }
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto px-6">
        <StepIndicator steps={steps} currentStep={3} />

        {/* Title */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Your Details
          </h1>
          <p className="text-muted-foreground">
            Please provide your contact information to complete the booking
          </p>
        </div>

        <div className="max-w-2xl mx-auto grid gap-8">
          {/* Booking Summary Card */}
          <div className="glass-card animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Armchair className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Selected Seat</p>
                  <p className="text-lg font-bold text-foreground">
                    {bookingState.selectedSeat?.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking Code</p>
                  <p className="text-lg font-bold font-mono text-foreground">
                    {bookingState.code}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form 
            onSubmit={handleSubmit} 
            className="glass-card animate-fade-up" 
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Contact Information</h2>
            
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
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
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
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
                {errors.mobileNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.mobileNumber}</p>
                )}
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
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/select-seat')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold
                         bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="gold-button flex-1 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
