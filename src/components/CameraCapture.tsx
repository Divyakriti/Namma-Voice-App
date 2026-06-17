import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Data: string) => void;
  onClose: () => void;
  title?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, title = "Capture Photo Evidence" }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);

  const startStream = async () => {
    setErrorMsg(null);
    setPreviewBase64(null);
    try {
      // First attempt environment (rear) camera, then fallback to user
      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: "environment" } },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsCameraActive(true);
          }).catch(err => {
            setErrorMsg("Playing stream failed.");
          });
        };
      }
    } catch (err: any) {
      console.error("Camera capture access failed:", err);
      // Fallback fallback if environment is blocked
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setIsCameraActive(true);
            }).catch(() => {
              setErrorMsg("Playing standard stream failed.");
            });
          };
        }
      } catch (innerErr) {
        setErrorMsg("Failed to access camera. Please ensure permissions are granted in the browser and frame.");
      }
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const videoId = videoRef.current;
      const width = videoId.videoWidth || 640;
      const height = videoId.videoHeight || 480;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame
        ctx.drawImage(videoId, 0, 0, width, height);
        // Compress as low-weight jpeg (0.7 quality) to save size in local database string
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        setPreviewBase64(base64);
        stopStream();
      }
    }
  };

  const handleApply = () => {
    if (previewBase64) {
      onCapture(previewBase64);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-2xl p-6 flex flex-col text-left space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-purple-50">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-pink-500 animate-pulse" />
            <span className="text-sm font-sans font-black text-purple-950">{title}</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-purple-900 hover:bg-purple-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera Stage */}
        <div className="relative bg-purple-950 rounded-2xl overflow-hidden aspect-video w-full flex items-center justify-center border border-purple-900/10 min-h-[220px]">
          {errorMsg ? (
            <div className="p-4 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
              <p className="text-xs text-rose-200 font-sans font-semibold">{errorMsg}</p>
              <button 
                type="button"
                onClick={startStream}
                className="mt-2 text-[10px] bg-purple-900 hover:bg-purple-800 text-white font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1 mx-auto transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry Permission</span>
              </button>
            </div>
          ) : previewBase64 ? (
            // Captured Preview
            <img 
              src={previewBase64} 
              alt="Snapshot preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            // Live Stream
            <>
              <video 
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-1" 
              />
              <div className="absolute top-2 left-2 bg-pink-600/90 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                <span>LIVE FEED</span>
              </div>
            </>
          )}
        </div>

        {/* Operational Buttons */}
        <div className="flex space-x-3 pt-2">
          {previewBase64 ? (
            <>
              <button
                type="button"
                onClick={startStream}
                className="flex-1 py-2.5 border border-purple-200 hover:bg-purple-50 text-purple-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-2 py-2.5 bg-gradient-to-r from-purple-800 to-pink-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md hover:brightness-110 transition-all"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Attach Snapshot</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 border border-purple-200 hover:bg-purple-100 text-purple-950 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isCameraActive || !!errorMsg}
                onClick={handleCapture}
                className="w-2/3 py-2.5 bg-purple-950 disabled:bg-purple-900/40 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md hover:brightness-110 cursor-copy transition-colors"
              >
                <Camera className="h-4 w-4" />
                <span>Capture Snapshot</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
