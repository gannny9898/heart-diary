import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DiaryEntryForm from '@/components/DiaryEntryForm';
import { useEffect } from 'react';

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
};

export default function WritingPage() {
  const { mood } = useParams<{ mood: string }>();
  const navigate = useNavigate();
  
  const theme = mood && moodThemes[mood as keyof typeof moodThemes] 
    ? moodThemes[mood as keyof typeof moodThemes]
    : moodThemes.calm;

  useEffect(() => {
    if (!mood || !moodThemes[mood as keyof typeof moodThemes]) {
      navigate('/');
    }
  }, [mood, navigate]);

  const handleEntryComplete = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${theme.background} p-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className={`${theme.text} hover:bg-white/50`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className={`rounded-xl ${theme.card} backdrop-blur-sm border ${theme.accent} p-6 shadow-lg`}>
          <div className="mb-6">
            <h1 className={`text-2xl font-light ${theme.text} mb-2`}>
              Express Your Feelings
            </h1>
            <p className={`${theme.text} opacity-80`}>
              Write about your {mood} mood and capture this moment
            </p>
          </div>
          
          <DiaryEntryForm
            entry={null}
            selectedDate={new Date()}
            onBack={handleEntryComplete}
            onSaved={handleEntryComplete}
            preselectedMood={mood}
          />
        </div>
      </div>
    </div>
  );
}