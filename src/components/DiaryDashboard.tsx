import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { BookOpen, Plus, LogOut, Calendar as CalendarIcon, Heart, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DiaryEntryForm from './DiaryEntryForm';
import DiaryTimeline from './DiaryTimeline';

interface DiaryEntry {
  id: string;
  title: string | null;
  content: string;
  entry_date: string;
  mood: string | null;
  photo_url: string | null;
  created_at: string;
}

interface Profile {
  name: string;
}

export default function DiaryDashboard() {
  const { user, signOut } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchEntries();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user!.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: "Error loading entries",
        description: "Failed to load your diary entries.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = entries.find(e => e.entry_date === dateStr);
      setSelectedEntry(entry || null);
      if (entry) {
        setShowForm(true);
      }
    }
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setShowForm(true);
  };

  const handleEntryUpdated = () => {
    fetchEntries();
    setShowForm(false);
  };

  const entryDates = entries.map(entry => parseISO(entry.entry_date));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/20">
        <div className="text-center">
          <div className="animate-pulse">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          </div>
          <p className="text-muted-foreground">Loading your diary...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <DiaryEntryForm
        entry={selectedEntry}
        selectedDate={selectedDate}
        onBack={() => setShowForm(false)}
        onSaved={handleEntryUpdated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-light text-foreground">My Diary</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {profile?.name || 'Friend'} <Heart className="inline h-3 w-3 text-primary fill-current" />
              </p>
            </div>
          </div>
          <Button 
            onClick={signOut} 
            variant="ghost" 
            size="sm"
            className="hover:bg-secondary/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar and Quick Actions */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  modifiers={{
                    hasEntry: entryDates
                  }}
                  modifiersStyles={{
                    hasEntry: {
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      borderRadius: '50%'
                    }
                  }}
                  className="rounded-md"
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Button 
                  onClick={handleNewEntry}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Write New Entry
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <DiaryTimeline 
              entries={entries}
              onEntryClick={(entry) => {
                setSelectedEntry(entry);
                setSelectedDate(parseISO(entry.entry_date));
                setShowForm(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}