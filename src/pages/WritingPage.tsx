import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const moodThemes = {
  happy: {
    background: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    card: 'bg-yellow-50/80',
    text: 'text-yellow-900',
    accent: 'border-yellow-200',
  },
  sad: {
    background: 'bg-gradient-to-br from-blue-50 to-slate-100',
    card: 'bg-blue-50/80',
    text: 'text-blue-900',
    accent: 'border-blue-200',
  },
  excited: {
    background: 'bg-gradient-to-br from-pink-50 to-red-50',
    card: 'bg-pink-50/80',
    text: 'text-pink-900',
    accent: 'border-pink-200',
  },
  calm: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    card: 'bg-green-50/80',
    text: 'text-green-900',
    accent: 'border-green-200',
  },
  anxious: {
    background: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    card: 'bg-amber-50/80',
    text: 'text-amber-900',
    accent: 'border-amber-200',
  },
  grateful: {
    background: 'bg-gradient-to-br from-purple-50 to-violet-50',
    card: 'bg-purple-50/80',
    text: 'text-purple-900',
    accent: 'border-purple-200',
  },
  angry: {
    background: 'bg-gradient-to-br from-red-50 to-rose-50',
    card: 'bg-red-50/80',
    text: 'text-red-900',
    accent: 'border-red-200',
  },
  peaceful: {
    background: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    card: 'bg-teal-50/80',
    text: 'text-teal-900',
    accent: 'border-teal-200',
  },
  neutral: {
    background: 'bg-gradient-to-br from-gray-50 to-slate-50',
    card: 'bg-gray-50/80',
    text: 'text-gray-900',
    accent: 'border-gray-200',
  },
};

const commonEmojis = [
  '😊', '😢', '😍', '😂', '🥺', '😘', '😎', '🤗', '😴', '🤔',
  '😤', '😭', '🥰', '😁', '🙃', '😋', '🤩', '😇', '🥴', '🤪',
  '❤️', '💕', '💖', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍',
  '✨', '🌟', '⭐', '🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼',
  '🎉', '🎊', '🎈', '🎂', '🎁', '🏆', '👑', '💎', '🔥', '💯'
];

export default function WritingPage() {
  const { mood } = useParams<{ mood: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [entrySetup, setEntrySetup] = useState<any>(null);
  const [existingEntry, setExistingEntry] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const entryId = searchParams.get('entryId');
  
  const theme = mood && moodThemes[mood as keyof typeof moodThemes] 
    ? moodThemes[mood as keyof typeof moodThemes]
    : moodThemes.neutral;

  useEffect(() => {
    if (entryId) {
      // Load existing entry
      fetchExistingEntry();
    } else {
      // Get the entry setup data from session storage for new entries
      const setupData = sessionStorage.getItem('entrySetup');
      if (setupData) {
        setEntrySetup(JSON.parse(setupData));
      }
    }
  }, [entryId]);

  const fetchExistingEntry = async () => {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('id', entryId)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      
      setExistingEntry(data);
      setContent(data.content);
      setIsEditing(true);
      setEntrySetup({
        title: data.title,
        photo: data.photo_url
      });
    } catch (error) {
      console.error('Error fetching entry:', error);
      toast({
        title: "Error loading entry",
        description: "Failed to load the diary entry.",
        variant: "destructive"
      });
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('diary-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('diary-photos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something in your diary entry.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isEditing && existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('diary_entries')
          .update({
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id)
          .eq('user_id', user!.id);

        if (error) throw error;

        toast({
          title: "Entry updated!",
          description: "Your diary entry has been updated successfully."
        });
      } else {
        // Create new entry
        let photoUrl = null;

        // Upload photo if exists
        if (entrySetup?.photoFile) {
          photoUrl = await uploadPhoto(entrySetup.photoFile);
        }

        const entryData = {
          user_id: user!.id,
          title: entrySetup?.title || null,
          content: content.trim(),
          entry_date: format(new Date(), 'yyyy-MM-dd'),
          mood: (mood || null) as 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful' | 'angry' | 'peaceful' | null,
          photo_url: photoUrl,
        };

        const { error } = await supabase
          .from('diary_entries')
          .insert(entryData);

        if (error) throw error;

        toast({
          title: "Entry saved!",
          description: "Your diary entry has been saved successfully."
        });

        // Clear session storage
        sessionStorage.removeItem('entrySetup');
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Save failed",
        description: "Failed to save your diary entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  return (
    <div className={`min-h-screen ${theme.background} p-4`}>
      {/* Header */}
      <header className={`${theme.card} backdrop-blur-sm border ${theme.accent} rounded-lg mb-6 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className={`${theme.text} hover:bg-white/50`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className={`text-xl font-light ${theme.text}`}>
                Express Your Feelings
              </h1>
              {entrySetup?.title && (
                <p className={`text-sm ${theme.text} opacity-80`}>
                  {entrySetup.title}
                </p>
              )}
            </div>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-xl ${theme.card} backdrop-blur-sm border ${theme.accent} p-6 shadow-lg`}>
          {entrySetup?.photo && (
            <div className="mb-6">
              <img 
                src={entrySetup.photo} 
                alt="Entry photo" 
                className="w-full max-h-64 object-cover rounded-lg border border-border/50"
              />
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className={`text-sm font-medium ${theme.text}`}>
                What's on your mind?
              </Label>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${theme.text} border-border/30 hover:bg-white/50 transition-all duration-200`}
                  >
                    <Smile className="h-4 w-4 mr-1" />
                    Add Emoji
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3">
                  <div className="grid grid-cols-10 gap-1">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => insertEmoji(emoji)}
                        className="w-8 h-8 text-lg hover:bg-accent hover:scale-110 rounded transition-all duration-150 flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Textarea
              id="content"
              placeholder="Dear diary, today was..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className={`border-border/50 focus:border-primary/50 resize-none bg-white/50 ${theme.text}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}