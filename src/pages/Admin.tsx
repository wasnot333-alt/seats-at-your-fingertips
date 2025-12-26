import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminBookings, exportToExcel, exportToPdf } from '@/services/api';
import { Booking } from '@/types/booking';
import {
  Armchair,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Users,
  Ticket,
  Clock,
  LogOut,
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'booked' | 'available'>('all');
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getAdminBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch =
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.codeUsed.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalSeats = 30; // 3 rows × 10 seats
    const bookedSeats = bookings.length;
    return {
      total: totalSeats,
      booked: bookedSeats,
      available: totalSeats - bookedSeats,
    };
  }, [bookings]);

  const handleExportExcel = async () => {
    setExporting('excel');
    await exportToExcel(filteredBookings);
    setExporting(null);
  };

  const handleExportPdf = async () => {
    setExporting('pdf');
    await exportToPdf(filteredBookings);
    setExporting(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Armchair className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-muted-foreground">Booking Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="glass-card flex items-center gap-4">
            <div className="p-4 rounded-xl bg-accent/10">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Seats</p>
              <p className="text-3xl font-display font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4">
            <div className="p-4 rounded-xl bg-seat-available/10">
              <Ticket className="w-8 h-8 text-seat-available" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booked</p>
              <p className="text-3xl font-display font-bold text-foreground">{stats.booked}</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-3xl font-display font-bold text-foreground">{stats.available}</p>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="glass-card mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, seat, email, code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium pl-12"
                />
              </div>
              <div className="relative sm:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="input-premium pl-12 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="booked">Booked</option>
                  <option value="available">Available</option>
                </select>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleExportExcel}
                disabled={exporting !== null}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 
                         rounded-xl bg-green-600/10 border border-green-600/20 text-green-500
                         hover:bg-green-600/20 transition-all font-medium"
              >
                {exporting === 'excel' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5" />
                )}
                Export Excel
              </button>
              <button
                onClick={handleExportPdf}
                disabled={exporting !== null}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 
                         rounded-xl bg-red-600/10 border border-red-600/20 text-red-500
                         hover:bg-red-600/20 transition-all font-medium"
              >
                {exporting === 'pdf' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="glass-card overflow-hidden p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">No bookings found</p>
              <p className="text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Seat
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Customer Name
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground hidden md:table-cell">
                      Mobile
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground hidden lg:table-cell">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground hidden sm:table-cell">
                      Code
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground hidden xl:table-cell">
                      Booking Time
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 font-display font-bold text-primary">
                          {booking.seatNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">
                          {booking.customerName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                        {booking.mobileNumber}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                        {booking.email}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="font-mono text-sm px-3 py-1 rounded-lg bg-secondary text-foreground">
                          {booking.codeUsed}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm hidden xl:table-cell">
                        {booking.bookingTime}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                            booking.status === 'booked'
                              ? 'bg-seat-available/10 text-seat-available'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {booking.status === 'booked' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {booking.status === 'booked' ? 'Booked' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && filteredBookings.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        )}
      </main>
    </div>
  );
}
