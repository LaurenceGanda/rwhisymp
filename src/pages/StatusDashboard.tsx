import { Header } from '@/components/layout/Header';
import { LogsPanel } from '@/components/dashboard/LogsPanel';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { useConsoleLogger } from '@/hooks/useConsoleLogger';
import { useState, useEffect } from 'react';

const StatusDashboard = () => {
  const { logs, isCapturing, clearLogs, toggleCapturing } = useConsoleLogger();
  const [recordingState, setRecordingState] = useState({
    isRecording: false,
    isProcessing: false
  });

  // Listen for recording state changes from localStorage or events
  useEffect(() => {
    const checkRecordingState = () => {
      // This is a simple way to sync state - in a real app you'd use a proper state manager
      const isRecording = localStorage.getItem('isRecording') === 'true';
      const isProcessing = localStorage.getItem('isProcessing') === 'true';
      setRecordingState({ isRecording, isProcessing });
    };

    // Check initially
    checkRecordingState();
    
    // Check periodically
    const interval = setInterval(checkRecordingState, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Header />
        
        <div className="grid gap-6 lg:grid-cols-2">
          <SystemStatus 
            isRecording={recordingState.isRecording}
            isProcessing={recordingState.isProcessing}
          />
          
          <LogsPanel
            logs={logs}
            isCapturing={isCapturing}
            onToggleCapturing={toggleCapturing}
            onClearLogs={clearLogs}
          />
        </div>

        <div className="bg-card/50 border border-border/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Want to see backend logs and enable real-time monitoring? 
            <span className="text-primary font-medium"> Connect to Supabase</span> for full backend integration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusDashboard;