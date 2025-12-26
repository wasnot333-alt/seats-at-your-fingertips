import { useRef } from 'react';
import { format } from 'date-fns';
import { Booking } from '@/types/booking';
import { User, Sparkles, Calendar, Armchair, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import guruImage from '@/assets/guru-bhaiyaji.jpg';

interface BookingTicketProps {
  booking: Booking;
}

// Helper to safely display values
const displayValue = (value: string | null | undefined, fallback = 'Not Available'): string => {
  if (value === null || value === undefined || value.trim() === '') {
    return fallback;
  }
  return value;
};

export default function BookingTicket({ booking }: BookingTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

// Format booking time
  const formatBookingTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not Available';
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy – hh:mm a");
    } catch {
      return 'Not Available';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !ticketRef.current) return;

    const ticketHtml = ticketRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Meditation Seat Ticket - ${displayValue(booking.seatNumber)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
              padding: 20px;
            }
            .ticket-container {
              background: linear-gradient(135deg, #fef7cd 0%, #fff7ed 100%);
              border-radius: 16px;
              padding: 32px;
              max-width: 420px;
              width: 100%;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              border: 2px solid #d4af37;
            }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 2px dashed #d4af37; padding-bottom: 20px; }
            .header h1 { font-size: 18px; color: #92400e; margin-bottom: 4px; }
            .header p { font-size: 12px; color: #a3a3a3; }
            .guru-image { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px; border: 3px solid #d4af37; display: block; }
            .seat-section { text-align: center; margin: 24px 0; }
            .seat-number { font-size: 48px; font-weight: bold; color: #92400e; }
            .seat-label { font-size: 12px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 2px; }
            .details { margin: 24px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-size: 12px; color: #737373; }
            .detail-value { font-size: 14px; font-weight: 500; color: #171717; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #92400e; }
            @media print {
              body { background: white; }
              .ticket-container { box-shadow: none; border: 2px solid #d4af37; }
            }
          </style>
        </head>
        <body>
          ${ticketHtml}
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

  return (
    <div className="space-y-4">
      {/* Printable Ticket */}
      <div 
        ref={ticketRef}
        className="ticket-container bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-primary rounded-2xl p-6 max-w-md mx-auto"
      >
        {/* Header */}
        <div className="header text-center border-b-2 border-dashed border-primary/30 pb-4 mb-4">
          <img 
            src={guruImage} 
            alt="Guru Bhaiyaji" 
            className="guru-image w-20 h-20 rounded-full object-cover mx-auto mb-3 border-3 border-primary"
          />
          <h1 className="text-lg font-bold text-amber-800">Sacred Meditation Session</h1>
          <p className="text-xs text-muted-foreground">Guru Bhaiyaji Ashram</p>
        </div>

        {/* Seat Number */}
        <div className="seat-section text-center my-6">
          <p className="seat-label text-xs text-muted-foreground uppercase tracking-widest">Seat Number</p>
          <p className="seat-number text-5xl font-display font-bold text-amber-800">
            {displayValue(booking.seatNumber)}
          </p>
        </div>

        {/* Details */}
        <div className="details space-y-3 mb-6">
          <div className="detail-row flex justify-between items-center py-2 border-b border-border/50">
            <span className="detail-label text-xs text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Name
            </span>
            <span className="detail-value text-sm font-bold text-amber-900">
              {displayValue(booking.customerName)}
            </span>
          </div>
          <div className="detail-row flex justify-between items-center py-2 border-b border-border/50">
            <span className="detail-label text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Invitation Code
            </span>
            <span className="detail-value text-sm font-mono font-bold text-amber-900">
              {displayValue(booking.codeUsed)}
            </span>
          </div>
          <div className="detail-row flex justify-between items-center py-2 border-b border-border/50">
            <span className="detail-label text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Booked On
            </span>
            <span className="detail-value text-sm font-bold text-amber-900">
              {formatBookingTime(booking.bookingTime)}
            </span>
          </div>
          <div className="detail-row flex justify-between items-center py-2">
            <span className="detail-label text-xs text-muted-foreground flex items-center gap-2">
              <Armchair className="w-4 h-4" /> Booking ID
            </span>
            <span className="detail-value text-xs font-mono font-semibold text-amber-800">
              {displayValue(booking.id)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="footer text-center mt-4 text-sm text-amber-800">
          🙏 Om Namah Shivay 🙏
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Ticket
        </Button>
      </div>
    </div>
  );
}
