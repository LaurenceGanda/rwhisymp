import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Download, Settings, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import AudioVisualizer from './AudioVisualizer';
import TranscriptionDisplay from './TranscriptionDisplay';
import SettingsPanel from './SettingsPanel';
import { ThemeToggle } from './ThemeToggle';

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
  
  const [showSettings, setShowSettings] = useState(false);
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
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent">
                  <Volume2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">AI Speech Recognition</h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced speech-to-text with OpenAI Whisper, noise suppression and spelling correction
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="hidden sm:flex">
                  Whisper AI
                </Badge>
                <Badge variant="secondary" className="hidden sm:flex">
                  RNNoise
                </Badge>
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="border-border/50"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel 
            options={options} 
            onOptionsChange={setOptions}
            onClose={() => setShowSettings(false)}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recording Controls */}
          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Recording</h2>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={recordingState.isRecording ? "destructive" : "secondary"}
                      className={cn(
                        "transition-all duration-300",
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
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-foreground">
                    {formatDuration(recordingState.duration)}
                  </div>
                  <p className="text-sm text-muted-foreground">Recording time</p>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={recordingState.isRecording ? stopRecording : startRecording}
                    disabled={recordingState.isProcessing}
                    size="lg"
                    className={cn(
                      "h-16 w-16 rounded-full transition-all duration-300",
                      recordingState.isRecording 
                        ? "bg-destructive hover:bg-destructive/90 shadow-glow animate-pulse" 
                        : "bg-gradient-primary hover:shadow-glow"
                    )}
                  >
                    {recordingState.isRecording ? (
                      <MicOff className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                {/* Processing Options */}
                <div className="space-y-3">
                  <Separator className="bg-border/50" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="noise-suppression"
                        checked={options.noiseSuppressionEnabled}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, noiseSuppressionEnabled: checked }))
                        }
                      />
                      <Label htmlFor="noise-suppression" className="text-sm">
                        Noise Suppression
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="spelling-correction"
                        checked={options.spellingCorrectionEnabled}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, spellingCorrectionEnabled: checked }))
                        }
                      />
                      <Label htmlFor="spelling-correction" className="text-sm">
                        Spell Check
                      </Label>
                    </div>
                  </div>
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
      </div>
    </div>
  );
};

export default SpeechRecognitionApp;