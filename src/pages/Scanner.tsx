import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, FileText, Languages, Ticket, Scan, Loader2, Image as ImageIcon, Camera, CameraOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { processImage } from "../lib/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const modes = [
  { id: "general", icon: FileText, label: "General", description: "Raw text extraction" },
  { id: "notes", icon: Scan, label: "Notes", description: "Clean paragraphs & bullets" },
  { id: "translate", icon: Languages, label: "Translate", description: "To selected language" },
  { id: "ticket", icon: Ticket, label: "Ticket", description: "Structured info" },
];

const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Hindi", "Arabic", "Tamil"];

const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function Scanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState("general");
  const [targetLang, setTargetLang] = useState("English");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not supported by your browser or environment.");
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setError(null);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera access was denied. Please click the camera icon in your browser's address bar to allow access. If you're in a preview window, try opening the app in a new tab.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera found on this device. Please ensure a camera is connected.");
      } else {
        setError(`Could not access camera: ${err.message || "Unknown error"}. Try opening the app in a new tab.`);
      }
      console.error("Camera error:", err);
    }
  };

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  }, [isCameraOpen, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `scan_${Date.now()}.jpg`, { type: "image/jpeg" });
            setFile(capturedFile);
            setPreview(URL.createObjectURL(capturedFile));
            stopCamera();
          }
        }, "image/jpeg", 0.95);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please upload an image file (JPG, PNG)");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const result = await processImage(file, mode, mode === "translate" ? targetLang : undefined);
      
      // Convert image to base64 for persistent history
      const base64Image = await fileToBase64(file);

      // Save to history (localStorage)
      const history = JSON.parse(localStorage.getItem("scan_history") || "[]");
      const newEntry = {
        id: Date.now().toString(),
        image: base64Image,
        result: result.extractedText,
        mode: result.mode,
        timestamp: result.timestamp,
        fileName: file.name,
      };
      localStorage.setItem("scan_history", JSON.stringify([newEntry, ...history].slice(0, 50)));

      // Navigate to result page
      navigate("/result", { state: { result: newEntry } });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Scanner</h1>
        <p className="text-slate-500">Scan hardcopy documents or upload images to extract text.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upload/Camera Area */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              "relative aspect-[4/3] rounded-[2rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden",
              (preview || isCameraOpen) ? "border-indigo-200 bg-slate-50" : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50"
            )}
          >
            {isCameraOpen ? (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => videoRef.current?.play()}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
                  <button
                    onClick={stopCamera}
                    className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                  >
                    <CameraOff className="w-6 h-6" />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    <div className="w-12 h-12 border-4 border-slate-900 rounded-full" />
                  </button>
                  <div className="w-14" /> {/* Spacer for symmetry */}
                </div>
              </div>
            ) : preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={startCamera}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-600 hover:text-indigo-600 shadow-sm transition-colors"
                    title="Retake with Camera"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={clearFile}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-600 hover:text-red-600 shadow-sm transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-6 p-8">
                <div className="flex justify-center gap-4">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Camera className="w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-900">Scan or Upload Image</p>
                  <p className="text-slate-500 text-sm">Capture a photo of your document or drag & drop</p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Note: Camera access requires browser permission.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={startCamera}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Use Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex flex-col gap-3"
            >
              <p>{error}</p>
              {error.includes("Camera access") && (
                <button
                  onClick={startCamera}
                  className="w-fit px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Right: Options */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scan Mode</label>
              <div className="grid grid-cols-1 gap-3">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group",
                      mode === m.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600"
                        : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      mode === m.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                    )}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{m.label}</p>
                      <p className="text-[10px] opacity-70">{m.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {mode === "translate" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Target Language</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </motion.div>
            )}

            <button
              disabled={!file || isProcessing || isCameraOpen}
              onClick={handleScan}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg",
                (!file || isProcessing || isCameraOpen)
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Scan className="w-6 h-6" />
                  Extract Text
                </>
              )}
            </button>
          </div>

         
        </div>
      </div>
    </div>
  );
}
