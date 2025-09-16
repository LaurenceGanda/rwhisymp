import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isRecording: boolean;
  isProcessing: boolean;
}

const AudioVisualizer = ({ isRecording, isProcessing }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [audioData, setAudioData] = useState<number[]>(new Array(64).fill(0));

  const initializeAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 128;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      return { audioContext, analyser, stream };
    } catch (error) {
      console.error('Error accessing audio:', error);
      return null;
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!isRecording && !isProcessing) {
      // Draw idle state
      const bars = 64;
      const barWidth = width / bars;
      
      for (let i = 0; i < bars; i++) {
        const barHeight = (Math.sin(Date.now() * 0.001 + i * 0.1) * 20 + 30);
        const x = i * barWidth;
        const y = height - barHeight;
        
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, 'hsl(270 100% 65% / 0.3)');
        gradient.addColorStop(1, 'hsl(200 100% 55% / 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }
      return;
    }

    if (isProcessing) {
      // Draw processing state
      const bars = 64;
      const barWidth = width / bars;
      
      for (let i = 0; i < bars; i++) {
        const barHeight = (Math.sin(Date.now() * 0.003 + i * 0.2) * 40 + 50);
        const x = i * barWidth;
        const y = height - barHeight;
        
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, 'hsl(45 100% 65% / 0.8)');
        gradient.addColorStop(1, 'hsl(45 100% 65% / 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }
      return;
    }

    // Draw live audio data
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const bars = dataArrayRef.current.length;
      const barWidth = width / bars;
      
      for (let i = 0; i < bars; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * height * 0.8;
        const x = i * barWidth;
        const y = height - barHeight;
        
        const intensity = dataArrayRef.current[i] / 255;
        const gradient = ctx.createLinearGradient(x, y, x, height);
        
        if (intensity > 0.7) {
          gradient.addColorStop(0, 'hsl(0 84% 60%)');
          gradient.addColorStop(1, 'hsl(0 84% 60% / 0.2)');
        } else if (intensity > 0.4) {
          gradient.addColorStop(0, 'hsl(270 100% 65%)');
          gradient.addColorStop(1, 'hsl(270 100% 65% / 0.2)');
        } else {
          gradient.addColorStop(0, 'hsl(200 100% 55%)');
          gradient.addColorStop(1, 'hsl(200 100% 55% / 0.2)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }
    }
  };

  const animate = () => {
    drawWaveform();
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupAudio = async () => {
      if (isRecording) {
        const result = await initializeAudioContext();
        if (result) {
          stream = result.stream;
        }
      } else {
        // Clean up audio context when not recording
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (analyserRef.current) {
          analyserRef.current = null;
        }
      }
    };

    setupAudio();

    // Start animation
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  const getContainerClass = () => {
    if (isProcessing) {
      return "border-[hsl(var(--processing-glow))] shadow-[0_0_20px_hsl(var(--processing-glow)/0.5)]";
    }
    if (isRecording) {
      return "border-[hsl(var(--recording-pulse))] shadow-[0_0_20px_hsl(var(--recording-pulse)/0.5)]";
    }
    return "border-border/50";
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border-2 bg-gradient-accent transition-all duration-300",
      getContainerClass()
    )}>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="h-20 sm:h-30 w-full"
        style={{ 
          width: '100%', 
          height: '80px',
          imageRendering: 'pixelated'
        }}
      />
      
      {/* Status Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isProcessing && (
          <div className="text-center px-4">
            <div className="text-sm sm:text-lg font-semibold text-foreground animate-pulse">
              Processing Audio...
            </div>
          </div>
        )}
        {!isRecording && !isProcessing && (
          <div className="text-center opacity-50 px-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Click record to start capturing audio
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVisualizer;