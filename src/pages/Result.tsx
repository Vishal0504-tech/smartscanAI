import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Copy, Download, ArrowLeft, Check, Share2, FileText, Languages, Ticket, Scan } from "lucide-react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const modeIcons: Record<string, any> = {
  general: FileText,
  notes: Scan,
  translate: Languages,
  ticket: Ticket,
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <FileText className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">No result found</h2>
          <p className="text-slate-500">Please scan an image first to see the results.</p>
        </div>
        <Link
          to="/scanner"
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
        >
          Go to Scanner
        </Link>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([result.result], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `SmartScan_${result.mode}_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const Icon = modeIcons[result.mode] || FileText;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/scanner")}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Scan Results</h1>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-indigo-100">
                {result.mode}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Processed on {new Date(result.timestamp).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Side-by-Side View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Image */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Original Image</h3>
            <span className="text-xs text-slate-400">{result.fileName}</span>
          </div>
          <div className="aspect-[4/3] bg-slate-100 rounded-[2rem] border border-slate-200 overflow-hidden shadow-inner">
            <img src={result.image} alt="Original" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Extracted Text */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Extracted Text</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Icon className="w-3 h-3" />
              <span>AI Processed</span>
            </div>
          </div>
          <div className="aspect-[4/3] bg-white rounded-[2rem] border border-slate-200 p-8 overflow-y-auto shadow-sm prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
              {result.result}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold">Need another scan?</h3>
          <p className="text-indigo-100 text-sm">Upload a new image to continue extracting data.</p>
        </div>
        <Link
          to="/scanner"
          className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg"
        >
          Start New Scan
        </Link>
      </div>
    </div>
  );
}
