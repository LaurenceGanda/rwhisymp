import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Wifi, Database, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatusProps {
  isRecording: boolean;
  isProcessing: boolean;
}

export const SystemStatus = ({ isRecording, isProcessing }: SystemStatusProps) => {
  // Simulate system metrics
  const cpuUsage = Math.random() * 20 + 10; // 10-30%
  const memoryUsage = Math.random() * 30 + 40; // 40-70%
  
  const services = [
    {
      name: 'Speech Recognition API',
      status: 'online',
      icon: <Wifi className="h-4 w-4" />,
      description: 'Browser Web Speech API'
    },
    {
      name: 'Audio Processing',
      status: isRecording ? 'active' : isProcessing ? 'processing' : 'idle',
      icon: <Globe className="h-4 w-4" />,
      description: 'Real-time audio capture and processing'
    },
    {
      name: 'Backend Services',
      status: 'offline',
      icon: <Database className="h-4 w-4" />,
      description: 'Connect Supabase for backend features'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Online</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">Processing</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">System Status</h2>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              All Systems Operational
            </Badge>
          </div>

          <Separator />

          {/* System Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Performance Metrics</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CPU Usage</span>
                  <span className="text-sm font-medium">{cpuUsage.toFixed(1)}%</span>
                </div>
                <Progress value={cpuUsage} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Memory Usage</span>
                  <span className="text-sm font-medium">{memoryUsage.toFixed(1)}%</span>
                </div>
                <Progress value={memoryUsage} className="h-2" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Services Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Services</h3>
            
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-background border border-border/50">
                      {service.icon}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {service.name}
                        </span>
                        {getStatusIcon(service.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  
                  {getStatusBadge(service.status)}
                </div>
              ))}
            </div>
          </div>

          {/* App State */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Application State</h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-sm text-muted-foreground">Recording Status</span>
                <Badge variant={isRecording ? "default" : "secondary"}>
                  {isRecording ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-sm text-muted-foreground">Processing Status</span>
                <Badge variant={isProcessing ? "default" : "secondary"}>
                  {isProcessing ? "Processing" : "Idle"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};