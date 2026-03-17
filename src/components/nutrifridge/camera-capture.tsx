"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to scan items.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-muted">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              muted 
              playsInline
            />
            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl" />
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}

        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-4 right-4 rounded-full bg-black/50 text-white border-none"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {hasCameraPermission === false && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access to use the scanner feature.
          </AlertDescription>
        </Alert>
      )}

      <div className="w-full mt-8 flex justify-center items-center gap-6">
        {!capturedImage ? (
          <Button 
            size="lg" 
            className="w-20 h-20 rounded-full bg-white border-4 border-primary/30 p-0 shadow-xl ios-tap-active"
            onClick={handleCapture}
            disabled={hasCameraPermission !== true}
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Camera className="w-7 h-7 text-white" />
            </div>
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-2xl border-white/20 text-white bg-white/10 px-8 h-14 ios-tap-active"
              onClick={handleRetake}
            >
              <RefreshCw className="mr-2 w-5 h-5" /> Retake
            </Button>
            <Button 
              size="lg" 
              className="rounded-2xl px-8 h-14 ios-tap-active"
              onClick={handleConfirm}
            >
              <Check className="mr-2 w-5 h-5" /> Use Photo
            </Button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
