import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useBooking } from '@/contexts/BookingContext';
import { CheckCircle2, Sparkles, Home, Printer, Flower2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import logoImage from '@/assets/logo.png';
import guruImage from '@/assets/guru-bhaiyaji.jpg';

const steps = [
  { number: 1, title: 'Enter Code' },
  { number: 2, title: 'Select Seat' },
  { number: 3, title: 'Your Details' },
  { number: 4, title: 'Confirmation' },
];

export default function Success() {
  const navigate = useNavigate();
  const { confirmedBooking, resetBooking } = useBooking();
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirmedBooking) {
      navigate('/');
    }
  }, [confirmedBooking, navigate]);

  if (!confirmedBooking) return null;

  const handleNewReservation = () => {
    resetBooking();
    navigate('/');
  };

  const handlePrint = () => {
    if (!ticketRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const ticketContent = ticketRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Meditation Seat Booking</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
            }
            .ticket {
              border: 2px solid #d4af37;
              border-radius: 16px;
              padding: 24px;
              background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 16px;
              border-bottom: 2px dashed #d4af37;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 12px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              color: #92400e;
              margin-bottom: 4px;
            }
            .subtitle {
              font-size: 12px;
              color: #a16207;
            }
            .seat-section {
              text-align: center;
              padding: 20px;
              margin: 16px 0;
              background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
              border-radius: 12px;
              color: white;
            }
            .seat-number {
              font-size: 48px;
              font-weight: bold;
              letter-spacing: 4px;
            }
            .seat-label {
              font-size: 12px;
              text-transform: uppercase;
              opacity: 0.9;
            }
            .details {
              display: grid;
              gap: 12px;
              margin: 16px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #fde68a;
            }
            .detail-label {
              color: #92400e;
              font-size: 12px;
            }
            .detail-value {
              font-weight: 600;
              color: #78350f;
              font-size: 14px;
            }
            .qr-section {
              text-align: center;
              padding-top: 16px;
              border-top: 2px dashed #d4af37;
            }
            .qr-code {
              margin: 0 auto;
            }
            .blessing {
              text-align: center;
              margin-top: 16px;
              padding: 12px;
              background: rgba(212, 175, 55, 0.1);
              border-radius: 8px;
              font-style: italic;
              color: #92400e;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${ticketContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatBookingTime = (timeStr: string) => {
    try {
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  const displayValue = (value: string | null | undefined, fallback = 'Not Available') => {
    return value && value.trim() !== '' ? value : fallback;
  };

  return (
    <PageContainer>
      <div className="container mx-auto px-6">
        <StepIndicator steps={steps} currentStep={4} />

        <div className="max-w-xl mx-auto text-center">
          {/* Success Icon */}
          <div className="relative inline-block mb-8 animate-scale-in">
            <div className="p-8 rounded-full bg-seat-available/20 animate-pulse">
              <CheckCircle2 className="w-24 h-24 text-seat-available" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-float" />
            <Sparkles className="absolute -bottom-1 -left-3 w-6 h-6 text-primary animate-float" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Title */}
          <div className="mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              🙏 Seat Reserved Successfully!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your meditation seat has been confirmed for the sacred session
            </p>
          </div>

          {/* Booking Ticket */}
          <div 
            className="mb-8 animate-fade-up" 
            style={{ animationDelay: '300ms' }}
          >
            <div 
              ref={ticketRef}
              className="ticket bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-primary rounded-2xl p-6 text-left"
            >
              {/* Ticket Header */}
              <div className="header text-center border-b-2 border-dashed border-primary pb-4 mb-4">
                <div className="flex justify-center gap-4 mb-3">
                  <img src={logoImage} alt="Ashram Logo" className="logo w-16 h-16 rounded-full object-cover" />
                  <img src={guruImage} alt="Guru" className="logo w-16 h-16 rounded-full object-cover" />
                </div>
                <h3 className="title text-lg font-bold text-amber-800">Dhyan Mandir</h3>
                <p className="subtitle text-sm text-amber-600">Meditation Seat Confirmation</p>
              </div>

              {/* Seat Display */}
              <div className="seat-section text-center py-6 mb-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-white">
                <div className="seat-label text-xs uppercase tracking-wider opacity-90 mb-1">Your Seat</div>
                <div className="seat-number text-5xl font-bold tracking-widest">
                  {displayValue(confirmedBooking.seatNumber)}
                </div>
              </div>

              {/* Details */}
              <div className="details space-y-3 mb-4">
                <div className="detail-row flex justify-between items-center py-2 border-b border-amber-200">
                  <span className="detail-label text-xs text-amber-700">Name</span>
                  <span className="detail-value text-sm font-semibold text-amber-900">
                    {displayValue(confirmedBooking.customerName)}
                  </span>
                </div>
                <div className="detail-row flex justify-between items-center py-2 border-b border-amber-200">
                  <span className="detail-label text-xs text-amber-700">Code</span>
                  <span className="detail-value text-sm font-mono font-semibold text-amber-900">
                    {displayValue(confirmedBooking.codeUsed)}
                  </span>
                </div>
                <div className="detail-row flex justify-between items-center py-2 border-b border-amber-200">
                  <span className="detail-label text-xs text-amber-700">Date</span>
                  <span className="detail-value text-sm font-semibold text-amber-900">
                    {displayValue(formatBookingTime(confirmedBooking.bookingTime))}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="qr-section text-center pt-4 border-t-2 border-dashed border-primary">
                <div className="qr-code inline-block p-2 bg-white rounded-lg">
                  <QRCodeSVG 
                    value={`BOOKING:${confirmedBooking.id}|SEAT:${confirmedBooking.seatNumber}|CODE:${confirmedBooking.codeUsed}`}
                    size={80}
                  />
                </div>
                <p className="text-xs text-amber-600 mt-2">Scan for verification</p>
              </div>

              {/* Blessing */}
              <div className="blessing text-center mt-4 p-3 bg-amber-100/50 rounded-lg">
                <p className="text-sm italic text-amber-800">🙏 Om Namah Shivay 🙏</p>
              </div>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all w-full"
            >
              <Printer className="w-5 h-5" />
              Print Ticket
            </button>
          </div>

          {/* Confirmation Message */}
          <div 
            className="p-6 rounded-xl bg-seat-available/10 border border-seat-available/20 mb-8 animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            <p className="text-seat-available font-medium">
              ✓ A confirmation email has been sent to {confirmedBooking.email}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please arrive at the ashram on time for the meditation session.
            </p>
          </div>

          {/* Divine Message */}
          <div 
            className="p-6 rounded-xl bg-primary/5 border border-primary/20 mb-8 animate-fade-up text-center"
            style={{ animationDelay: '450ms' }}
          >
            <p className="text-primary font-display text-lg">
              🙏 Om Namah Shivay 🙏
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              May your spiritual journey be blessed with divine wisdom and inner peace.
            </p>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up"
            style={{ animationDelay: '500ms' }}
          >
            <button
              onClick={handleNewReservation}
              className="gold-button flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
