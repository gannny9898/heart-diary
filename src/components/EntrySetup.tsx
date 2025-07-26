import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Camera, X, PenTool } from 'lucide-react';

const moodOptions = [
  { value: 'happy', label: '😊 Happy' },
  { value: 'sad', label: '😢 Sad' },
  { value: 'excited', label: '🎉 Excited' },
  { value: 'calm', label: '😌 Calm' },
  { value: 'anxious', label: '😰 Anxious' },
  { value: 'grateful', label: '🙏 Grateful' },
  { value: 'angry', label: '😠 Angry' },
  { value: 'peaceful', label: '☮️ Peaceful' },
];

interface Props {
  onBack: () => void;
}

export default function EntrySetup({ onBack }: Props) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartWriting = () => {
    // Store the setup data in session storage to pass to writing page
    const entrySetup = {
      title: title.trim(),
      mood,
      photo: photoUrl,
      photoFile: photo
    };
    
    sessionStorage.setItem('entrySetup', JSON.stringify(entrySetup));
    navigate(`/write/${mood || 'neutral'}`);
  };

  const canStartWriting = mood.length > 0; // At minimum, mood is required

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
              <h1 className="text-xl font-light text-foreground">New Entry</h1>
              <p className="text-sm text-muted-foreground">
                Let's set up your diary entry
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-light">
              Tell us about your day
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

            {/* Mood */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                How are you feeling? <span className="text-destructive">*</span>
              </Label>
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

            {/* Photo */}
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

            {/* Start Writing Button */}
            <div className="pt-4">
              <Button 
                onClick={handleStartWriting}
                disabled={!canStartWriting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Start Writing
              </Button>
              {!canStartWriting && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Please select your mood to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}