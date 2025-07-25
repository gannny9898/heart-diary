import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Calendar, Edit3, Camera, Heart } from 'lucide-react';

interface DiaryEntry {
  id: string;
  title: string | null;
  content: string;
  entry_date: string;
  mood: string | null;
  photo_url: string | null;
  created_at: string;
}

interface Props {
  entries: DiaryEntry[];
  onEntryClick: (entry: DiaryEntry) => void;
}

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  excited: '🎉',
  calm: '😌',
  anxious: '😰',
  grateful: '🙏',
  angry: '😠',
  peaceful: '☮️',
};

export default function DiaryTimeline({ entries, onEntryClick }: Props) {
  if (entries.length === 0) {
    return (
      <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-light text-foreground mb-2">No entries yet</h3>
            <p className="text-muted-foreground">
              Start your journaling journey by writing your first entry!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-light text-foreground">Your Journal Timeline</h2>
        <Heart className="h-4 w-4 text-primary fill-current" />
      </div>
      
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card 
            key={entry.id}
            className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:bg-card/90"
            onClick={() => onEntryClick(entry)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-light">
                    {entry.title || format(parseISO(entry.entry_date), 'EEEE, MMMM do')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(entry.entry_date), 'yyyy')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {entry.mood && (
                    <span className="text-lg">
                      {moodEmojis[entry.mood]}
                    </span>
                  )}
                  {entry.photo_url && (
                    <Camera className="h-4 w-4 text-primary" />
                  )}
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {entry.photo_url && (
                <img 
                  src={entry.photo_url} 
                  alt="Diary entry" 
                  className="w-full h-32 object-cover rounded-lg mb-3 border border-border/50"
                />
              )}
              <p className="text-foreground/80 text-sm leading-relaxed line-clamp-3">
                {entry.content}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                {format(parseISO(entry.created_at), 'h:mm a')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}