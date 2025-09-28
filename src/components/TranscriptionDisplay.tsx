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
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Transcription</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!transcription.trim()}
                className="border-border/50 flex-1 sm:flex-none"
              >
                <Copy className="h-4 w-4 mr-2" />
                <span className="sm:hidden">Copy</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!transcription.trim()}
                className="border-border/50 flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="sm:hidden">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                disabled={!transcription.trim()}
                className="border-border/50 hover:border-destructive/50 hover:text-destructive flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </div>

          {/* Transcription Content */}
          <div className="relative">
            <ScrollArea className="h-60 sm:h-80 w-full rounded-lg border border-border/50 bg-card/50 p-3 sm:p-4">
              {isProcessing && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Processing audio with AI...
                    </p>
                  </div>
                </div>
              )}
              
              {!isProcessing && !transcription.trim() && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3 opacity-50">
                    <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your transcription will appear here
                    </p>
                  </div>
                </div>
              )}
              
              {!isProcessing && transcription.trim() && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
            
            {transcription.trim() && (
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--success-glow))] animate-pulse"></div>
                <span>Ready</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </Card>
  );
};

export default TranscriptionDisplay;