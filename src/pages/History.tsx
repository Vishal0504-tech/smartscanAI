import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { History as HistoryIcon, Trash2, ArrowRight, FileText, Languages, Ticket, Scan, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("scan_history") || "[]");
    setHistory(savedHistory);
  }, []);

  const deleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("scan_history", JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire scan history?")) {
      setHistory([]);
      localStorage.removeItem("scan_history");
    }
  };

  const filteredHistory = history.filter((item) =>
    item.result.toLowerCase().includes(search.toLowerCase()) ||
    item.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Scan History</h1>
          <p className="text-slate-500">Access your previous scans and extracted data.</p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-red-600 text-sm font-bold hover:text-red-700 transition-colors flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search history by text or filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
        />
      </div>

      <AnimatePresence mode="popLayout">
        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHistory.map((item, idx) => {
              const Icon = modeIcons[item.mode] || FileText;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate("/result", { state: { result: item } })}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                      <img src={item.image} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-indigo-600" />
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{item.mode}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 truncate">{item.fileName}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.result}</p>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => deleteEntry(item.id, e)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <HistoryIcon className="w-10 h-10" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-900">No history found</h2>
              <p className="text-slate-500">Your scanned documents will appear here.</p>
            </div>
            <Link
              to="/scanner"
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
            >
              Start Scanning
            </Link>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
