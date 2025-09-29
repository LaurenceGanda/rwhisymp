import { useState, useEffect, useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  source: 'frontend' | 'backend';
}

export const useConsoleLogger = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(true);

  const addLog = useCallback((level: LogEntry['level'], message: string, source: LogEntry['source'] = 'frontend') => {
    if (!isCapturing) return;
    
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      source
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 999)]); // Keep last 1000 logs
  }, [isCapturing]);

  useEffect(() => {
    if (!isCapturing) return;

    // Override console methods to capture logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    console.log = (...args) => {
      addLog('log', args.join(' '));
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warn', args.join(' '));
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args.join(' '));
      originalError.apply(console, args);
    };

    console.info = (...args) => {
      addLog('info', args.join(' '));
      originalInfo.apply(console, args);
    };

    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      addLog('error', `${event.message} at ${event.filename}:${event.lineno}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog('error', `Unhandled Promise Rejection: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      // Restore original console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
      
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isCapturing, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleCapturing = useCallback(() => {
    setIsCapturing(prev => !prev);
  }, []);

  return {
    logs,
    isCapturing,
    clearLogs,
    toggleCapturing,
    addLog
  };
};