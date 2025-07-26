import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ArrowLeft, Save, Camera, X, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DiaryEntry {
  id: string;
  title: string | null;
  content: string;
  entry_date: string;
  mood: string | null;
  photo_url: string | null;
}

interface Props {
  entry?: DiaryEntry | null;
  selectedDate: Date;
  onBack: () => void;
  onSaved: () => void;
  preselectedMood?: string;
  hideControls?: boolean;
}

const moodOptions = [
  { value: 'happy', label: '😊 Happy', color: 'hsl(var(--mood-happy))' },
  { value: 'sad', label: '😢 Sad', color: 'hsl(var(--mood-sad))' },
  { value: 'excited', label: '🎉 Excited', color: 'hsl(var(--mood-excited))' },
  { value: 'calm', label: '😌 Calm', color: 'hsl(var(--mood-calm))' },
  { value: 'anxious', label: '😰 Anxious', color: 'hsl(var(--mood-anxious))' },
  { value: 'grateful', label: '🙏 Grateful', color: 'hsl(var(--mood-grateful))' },
  { value: 'angry', label: '😠 Angry', color: 'hsl(var(--mood-angry))' },
  { value: 'peaceful', label: '☮️ Peaceful', color: 'hsl(var(--mood-peaceful))' },
];

export default function DiaryEntryForm({ 
  entry, 
  selectedDate, 
  onBack, 
  onSaved, 
  preselectedMood,
  hideControls = false 
}: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || preselectedMood || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState(entry?.photo_url || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!entry;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a photo smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      setPhoto(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
      toast({
        title: "Photo upload failed",
        description: "Failed to upload your photo. Please try again.",
        variant: "destructive"
      });
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
      let finalPhotoUrl = photoUrl;

      // Upload new photo if selected
      if (photo) {
        const uploadedUrl = await uploadPhoto(photo);
        if (uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
        }
      }

      const entryData = {
        user_id: user!.id,
        title: title.trim() || null,
        content: content.trim(),
        entry_date: format(selectedDate, 'yyyy-MM-dd'),
        mood: (mood || null) as 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful' | 'angry' | 'peaceful' | null,
        photo_url: finalPhotoUrl || null,
      };

      if (entry) {
        // Update existing entry
        const { error } = await supabase
          .from('diary_entries')
          .update(entryData)
          .eq('id', entry.id);

        if (error) throw error;

        toast({
          title: "Entry updated!",
          description: "Your diary entry has been saved successfully."
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('diary_entries')
          .insert(entryData);

        if (error) throw error;

        toast({
          title: "Entry created!",
          description: "Your new diary entry has been saved."
        });
      }

      onSaved();
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

  const removePhoto = () => {
    setPhoto(null);
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedMood = moodOptions.find(m => m.value === mood);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={onBack} 
              variant="ghost" 
              size="sm"
              className="hover:bg-secondary/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-light text-foreground">
                {entry ? 'Edit Entry' : 'New Entry'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, 'EEEE, MMMM do, yyyy')} 
                <Heart className="inline h-3 w-3 ml-1 text-primary fill-current" />
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-light flex items-center">
              Today's Story
              {selectedMood && (
                <span 
                  className="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: selectedMood.color, color: 'white' }}
                >
                  {selectedMood.label}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title (optional)
              </Label>
              <Input
                id="title"
                placeholder="Give your day a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border/50 focus:border-primary/50"
              />
            </div>

            {/* Mood - Hide when editing existing entries */}
            {!isEditing && !hideControls && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">How are you feeling?</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="border-border/50 focus:border-primary/50">
                    <SelectValue placeholder="Select your mood..." />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Photo - Hide when editing existing entries */}
            {!isEditing && !hideControls && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Photo (optional)</Label>
                {photoUrl ? (
                  <div className="relative">
                    <img 
                      src={photoUrl} 
                      alt="Diary entry" 
                      className="w-full max-h-64 object-cover rounded-lg border border-border/50"
                    />
                    <Button
                      onClick={removePhoto}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-dashed border-border/50 hover:bg-secondary/50"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Add a photo to your memory
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                What's on your mind? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Dear diary, today was..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="border-border/50 focus:border-primary/50 resize-none"
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}