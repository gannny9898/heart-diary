import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Heart, BookOpen } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've been signed in successfully."
          });
          navigate('/');
        }
      } else {
        if (!name.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your name to continue.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, name);
        if (error) {
          toast({
            title: "Error creating account",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to your personal diary!"
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent))_0%,transparent_50%)] opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <Card className="w-full max-w-md relative z-10 border-border/20 shadow-2xl backdrop-blur-md bg-card/90 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 animate-fade-in">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex items-center justify-center space-x-3 group">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <Heart className="h-5 w-5 text-primary fill-current animate-pulse" />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl font-light bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {isLogin ? 'Welcome Back' : 'Create Your Diary'}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base leading-relaxed">
              {isLogin 
                ? 'Sign in to continue your journaling journey' 
                : 'Start your personal diary today'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-3 group">
                <Label htmlFor="name" className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 border-border/30 bg-background/50 backdrop-blur-sm focus:border-primary/60 focus:bg-background/80 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 placeholder:text-muted-foreground/60"
                  required
                />
              </div>
            )}
            
            <div className="space-y-3 group">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-border/30 bg-background/50 backdrop-blur-sm focus:border-primary/60 focus:bg-background/80 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 placeholder:text-muted-foreground/60"
                required
              />
            </div>
            
            <div className="space-y-3 group">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-border/30 bg-background/50 backdrop-blur-sm focus:border-primary/60 focus:bg-background/80 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 placeholder:text-muted-foreground/60"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 mt-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] text-primary-foreground font-medium text-base transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">or</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="mt-4 text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}