import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import AudioVisualizer from './AudioVisualizer';
import TranscriptionDisplay from './TranscriptionDisplay';
import { ThemeToggle } from './ThemeToggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useWhisperTranscription } from '@/hooks/useWhisperTranscription';

const LANGUAGES = [
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'russian', label: 'Russian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'arabic', label: 'Arabic' },
];

const RealtimeWhisperApp = () => {
  const [duration, setDuration] = useState(0);
  const [targetLanguage, setTargetLanguage] = useState('spanish');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const {
    isLoading,
    isRecording,
    transcription,
    translation,
    startRecording,
    stopRecording,
    translateText,
    clearAll,
  } = useWhisperTranscription();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = async () => {
    if (isRecording) {
      stopRecording();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      await startRecording();
      setDuration(0);
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const handleTranslate = () => {
    translateText(targetLanguage);
  };

  const exportTranscription = () => {
    const content = translation 
      ? `Original:\n${transcription}\n\nTranslation (${targetLanguage}):\n${translation}`
      : transcription;

    if (!content.trim()) {
      toast({
        title: "Nothing to export",
        description: "Please record some audio first",
        variant: "destructive"
      });
      return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Transcription has been downloaded"
    });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-[90rem] space-y-6 sm:space-y-8">
        {/* Header */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-accent">
                  <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">RWhiSymp</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Real-time Whisper Transcription & Translation
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-1 xl:grid-cols-2">
          {/* Recording Controls */}
          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
            <div className="p-10 sm:p-12 md:p-14 min-h-[600px] sm:min-h-[700px]">
              <div className="space-y-8 sm:space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Recording</h2>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isRecording ? "destructive" : isLoading ? "default" : "secondary"}
                      className={cn(
                        "transition-all duration-300 text-xs",
                        isRecording && "animate-pulse shadow-glow"
                      )}
                    >
                      {isRecording ? "LIVE" : isLoading ? "PROCESSING" : "READY"}
                    </Badge>
                  </div>
                </div>

                {/* Audio Visualizer */}
                <AudioVisualizer 
                  isRecording={isRecording}
                  isProcessing={isLoading}
                />

                {/* Recording Duration */}
                <div className="text-center py-4">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-foreground">
                    {formatDuration(duration)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Recording time</p>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleStartStop}
                    disabled={isLoading}
                    size="lg"
                    className={cn(
                      "h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full transition-all duration-300",
                      isRecording 
                        ? "bg-destructive hover:bg-destructive/90 shadow-glow animate-pulse" 
                        : "bg-gradient-primary hover:shadow-glow"
                    )}
                  >
                    {isRecording ? (
                      <MicOff className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    ) : (
                      <Mic className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    )}
                  </Button>
                </div>

                {/* Translation Controls */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <Label htmlFor="language" className="text-sm font-medium">
                    Translate to:
                  </Label>
                  <div className="flex gap-2">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger id="language" className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleTranslate}
                      disabled={!transcription.trim() || isLoading}
                      variant="outline"
                      className="gap-2"
                    >
                      <Languages className="h-4 w-4" />
                      Translate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Transcription Display */}
          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
            <div className="p-8 sm:p-10 min-h-[600px] sm:min-h-[700px]">
              <TranscriptionDisplay
                transcription={translation || transcription}
                isProcessing={isLoading}
                onExport={exportTranscription}
                onClear={clearAll}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealtimeWhisperApp;
