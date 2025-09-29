import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Download, AlertCircle, Info, AlertTriangle, Terminal } from 'lucide-react';
import { LogEntry } from '@/hooks/useConsoleLogger';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LogsPanelProps {
  logs: LogEntry[];
  isCapturing: boolean;
  onToggleCapturing: () => void;
  onClearLogs: () => void;
}

export const LogsPanel = ({ logs, isCapturing, onToggleCapturing, onClearLogs }: LogsPanelProps) => {
  const { toast } = useToast();

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Terminal className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLogBadgeVariant = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const exportLogs = () => {
    const logsText = logs
      .map(log => `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()} (${log.source}): ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Logs exported",
      description: "Log file has been downloaded"
    });
  };

  const errorCount = logs.filter(log => log.level === 'error').length;
  const warningCount = logs.filter(log => log.level === 'warn').length;

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">System Logs</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Total: {logs.length}
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Errors: {errorCount}
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Warnings: {warningCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="capture-logs"
                  checked={isCapturing}
                  onCheckedChange={onToggleCapturing}
                />
                <Label htmlFor="capture-logs" className="text-sm">
                  Live capture
                </Label>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onClearLogs}
                disabled={logs.length === 0}
                className="hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <Separator />

          {/* Logs Display */}
          <div className="relative">
            <ScrollArea className="h-96 w-full">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center opacity-50">
                    <Terminal className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isCapturing ? "No logs captured yet" : "Log capturing is disabled"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        log.level === 'error' && "bg-destructive/10 border-destructive/20",
                        log.level === 'warn' && "bg-yellow-500/10 border-yellow-500/20",
                        log.level === 'info' && "bg-blue-500/10 border-blue-500/20",
                        log.level === 'log' && "bg-muted/50 border-border"
                      )}
                    >
                      {getLogIcon(log.level)}
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getLogBadgeVariant(log.level)} className="text-xs">
                            {log.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-foreground break-words font-mono">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {isCapturing && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};