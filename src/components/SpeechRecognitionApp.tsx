import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Volume2, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import AudioVisualizer from './AudioVisualizer';
import TranscriptionDisplay from './TranscriptionDisplay';
import { ThemeToggle } from './ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
}

interface ProcessingOptions {
  noiseSuppressionEnabled: boolean;
  spellingCorrectionEnabled: boolean;
  confidenceThreshold: number;
}

const SpeechRecognitionApp = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    duration: 0
  });
  
  const [transcription, setTranscription] = useState<string>('');
  const [options, setOptions] = useState<ProcessingOptions>({
    noiseSuppressionEnabled: true,
    spellingCorrectionEnabled: true,
    confidenceThreshold: 0.7
  });
  
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [editorText, setEditorText] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('sans');
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      // Check if speech recognition is supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast({
          title: "Speech Recognition not supported",
          description: "Your browser doesn't support speech recognition",
          variant: "destructive"
        });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            setTranscription(prev => prev + transcript + ' ');
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Recognition error", 
          description: "There was an error with speech recognition",
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        if (recordingState.isRecording) {
          recognition.start();
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
      setRecordingState(prev => ({ ...prev, isRecording: true, duration: 0 }));
      
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Please check your microphone permissions", 
        variant: "destructive"
      });
    }
  }, [toast, recordingState.isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && recordingState.isRecording) {
      recognitionRef.current.stop();
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      toast({
        title: "Recording stopped",
        description: "Speech recognition completed"
      });
    }
  }, [recordingState.isRecording, toast]);

  const exportTranscription = useCallback(() => {
    if (!transcription.trim()) {
      toast({
        title: "Nothing to export",
        description: "Please record some audio first",
        variant: "destructive"
      });
      return;
    }
    
    const blob = new Blob([transcription], { type: 'text/plain' });
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
  }, [transcription, toast]);

  const clearTranscription = useCallback(() => {
    setTranscription('');
    toast({
      title: "Transcription cleared",
      description: "Ready for new recording"
    });
  }, [toast]);

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
                    A Hybrid Speech-to-Text Noise Suppression Model
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
                      variant={recordingState.isRecording ? "destructive" : "secondary"}
                      className={cn(
                        "transition-all duration-300 text-xs",
                        recordingState.isRecording && "animate-pulse shadow-glow"
                      )}
                    >
                      {recordingState.isRecording ? "LIVE" : "READY"}
                    </Badge>
                  </div>
                </div>

                {/* Audio Visualizer */}
                <AudioVisualizer 
                  isRecording={recordingState.isRecording}
                  isProcessing={recordingState.isProcessing}
                />

                {/* Recording Duration */}
                <div className="text-center py-4">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-foreground">
                    {formatDuration(recordingState.duration)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Recording time</p>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={recordingState.isRecording ? stopRecording : startRecording}
                    disabled={recordingState.isProcessing}
                    size="lg"
                    className={cn(
                      "h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full transition-all duration-300",
                      recordingState.isRecording 
                        ? "bg-destructive hover:bg-destructive/90 shadow-glow animate-pulse" 
                        : "bg-gradient-primary hover:shadow-glow"
                    )}
                  >
                    {recordingState.isRecording ? (
                      <MicOff className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    ) : (
                      <Mic className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    )}
                  </Button>
                </div>

              </div>
            </div>
          </Card>

          {/* Transcription Display */}
          <TranscriptionDisplay
            transcription={transcription}
            isProcessing={recordingState.isProcessing}
            onExport={exportTranscription}
            onClear={clearTranscription}
          />
        </div>

        {/* Floating Keyboard Button */}
        <Dialog open={textEditorOpen} onOpenChange={setTextEditorOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="fixed bottom-8 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
            >
              <Keyboard className="h-7 w-7" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Text Editor</DialogTitle>
              <DialogDescription>
                Type your text and customize the font settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger id="fontSize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                      <SelectItem value="24">24px</SelectItem>
                      <SelectItem value="28">28px</SelectItem>
                      <SelectItem value="32">32px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="fontFamily">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans">Sans Serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="mono">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                placeholder="Start typing here..."
                className="min-h-[400px] resize-none"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily === 'sans' ? 'var(--font-sans)' : fontFamily === 'serif' ? 'Georgia, serif' : 'monospace'
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SpeechRecognitionApp;