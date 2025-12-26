import { useState, useEffect, useMemo } from 'react';
import { getLevelAnalytics } from '@/services/api';
import { OverallAnalytics } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, UserCheck, Layers, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function LevelAnalytics() {
  const [analytics, setAnalytics] = useState<OverallAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const data = await getLevelAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('analytics-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center py-10 text-muted-foreground">Failed to load analytics</div>;
  }

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
    }
  };

  const getStatusBg = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-green-500/10 border-green-500/20';
      case 'yellow': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'red': return 'bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="glass-card flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-500/10">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-3xl font-display font-bold text-foreground">{analytics.totalParticipants}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-4 rounded-xl bg-green-500/10">
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Participants</p>
            <p className="text-3xl font-display font-bold text-foreground">{analytics.uniqueParticipants}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-4 rounded-xl bg-purple-500/10">
            <Layers className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Multi-Level Attendees</p>
            <p className="text-3xl font-display font-bold text-foreground">{analytics.multiLevelParticipants}</p>
          </div>
        </div>
      </div>

      {/* Level-wise Analytics */}
      <div className="glass-card">
        <h3 className="text-lg font-display font-bold text-foreground mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Level-wise Analytics
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {analytics.levelStats.map((level) => (
            <div 
              key={level.level}
              className={`p-6 rounded-xl border ${getStatusBg(level.status)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display font-bold text-foreground">{level.level}</h4>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(level.status)}`} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booked</span>
                  <span className="font-semibold text-foreground">{level.bookedSeats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-semibold text-foreground">{level.availableSeats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-foreground">{level.totalSeats}</span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-bold">{level.percentageFilled}%</span>
                  </div>
                  <Progress value={level.percentageFilled} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Below 60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">60-85%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Above 85%</span>
        </div>
      </div>
    </div>
  );
}
