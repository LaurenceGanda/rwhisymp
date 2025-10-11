import { useState, useRef, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';
import { useToast } from '@/hooks/use-toast';

export const useWhisperTranscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriberRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  const loadModel = useCallback(async () => {
    if (transcriberRef.current) return;
    
    try {
      setIsLoading(true);
      toast({
        title: "Loading AI model",
        description: "Downloading Whisper model (first time only)..."
      });
      
      transcriberRef.current = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny.en',
        { device: 'webgpu' }
      );
      
      toast({
        title: "Model loaded",
        description: "Ready to transcribe"
      });
    } catch (error) {
      console.error('Error loading model:', error);
      toast({
        title: "Model loading failed",
        description: "Falling back to CPU mode...",
        variant: "destructive"
      });
      
      // Fallback to CPU if WebGPU fails
      try {
        transcriberRef.current = await pipeline(
          'automatic-speech-recognition',
          'onnx-community/whisper-tiny.en'
        );
      } catch (cpuError) {
        console.error('CPU fallback failed:', cpuError);
        toast({
          title: "Error",
          description: "Could not load transcription model",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startRecording = useCallback(async () => {
    try {
      await loadModel();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        await processAudio();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
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
  }, [loadModel, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const processAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0 || !transcriberRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      toast({
        title: "Transcribing",
        description: "Processing audio with Whisper..."
      });

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Convert to format Whisper expects
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0);

      const result = await transcriberRef.current(audioData);
      
      if (result && result.text) {
        setTranscription(prev => prev + result.text + ' ');
        toast({
          title: "Transcription complete",
          description: "Audio has been transcribed"
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Transcription failed",
        description: "Could not process audio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      audioChunksRef.current = [];
    }
  }, [toast]);

  const translateText = useCallback(async (targetLanguage: string) => {
    if (!transcription.trim()) {
      toast({
        title: "Nothing to translate",
        description: "Please transcribe some audio first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      toast({
        title: "Translating",
        description: `Translating to ${targetLanguage}...`
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({
            text: transcription,
            targetLanguage
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Translation failed');
      }

      const data = await response.json();
      setTranslation(data.translatedText);
      
      toast({
        title: "Translation complete",
        description: `Translated to ${targetLanguage}`
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "Could not translate text",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [transcription, toast]);

  const clearAll = useCallback(() => {
    setTranscription('');
    setTranslation('');
    audioChunksRef.current = [];
  }, []);

  return {
    isLoading,
    isRecording,
    transcription,
    translation,
    startRecording,
    stopRecording,
    translateText,
    clearAll,
    setTranscription
  };
};
