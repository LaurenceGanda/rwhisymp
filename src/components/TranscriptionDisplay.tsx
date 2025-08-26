import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Download, Trash2, Copy, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TranscriptionDisplayProps {
  transcription: string;
  isProcessing: boolean;
  onExport: () => void;
  onClear: () => void;
}

const TranscriptionDisplay = ({ 
  transcription, 
  isProcessing, 
  onExport, 
  onClear 
}: TranscriptionDisplayProps) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (!transcription.trim()) {
      toast({
        title: "Nothing to copy",
        description: "Please record some audio first",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(transcription);
      toast({
        title: "Copied to clipboard",
        description: "Transcription has been copied"
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const wordCount = transcription.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = transcription.length;

  return (
    <Card className="bg-gradient-secondary border-border/50 shadow-card-custom">
      <div className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Transcription</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!transcription.trim()}
                className="border-border/50"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!transcription.trim()}
                className="border-border/50"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                disabled={!transcription.trim()}
                className="border-border/50 hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Transcription Content */}
          <div className="relative">
            <ScrollArea className="h-80 w-full rounded-lg border border-border/50 bg-card/50 p-4">
              {isProcessing && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-muted-foreground">
                      Processing audio with AI...
                    </p>
                  </div>
                </div>
              )}
              
              {!isProcessing && !transcription.trim() && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3 opacity-50">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Your transcription will appear here
                    </p>
                  </div>
                </div>
              )}
              
              {!isProcessing && transcription.trim() && (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {transcription}
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-gradient-accent rounded-lg border border-[hsl(var(--processing-glow))] shadow-glow animate-pulse" />
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
            
            {transcription.trim() && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--success-glow))] animate-pulse"></div>
                <span>Ready</span>
              </div>
            )}
          </div>

          <Separator className="bg-border/50" />

          {/* Features Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 rounded-lg bg-gradient-accent border border-border/30">
              <div className="font-medium text-foreground">Whisper AI</div>
              <div className="text-muted-foreground">Speech Recognition</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-accent border border-border/30">
              <div className="font-medium text-foreground">RNNoise</div>
              <div className="text-muted-foreground">Noise Suppression</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-accent border border-border/30">
              <div className="font-medium text-foreground">SymSpell</div>
              <div className="text-muted-foreground">Spelling Correction</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TranscriptionDisplay;