import React from "react";
import { Link } from "react-router-dom";
import { Scan, FileText, Languages, Ticket, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: FileText,
    title: "General OCR",
    description: "Extract text from printed documents, books, and reports with high accuracy.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Scan,
    title: "Handwriting Recognition",
    description: "Digitize handwritten notes, letters, and sketches into clean, editable text.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Languages,
    title: "Instant Translation",
    description: "Scan and translate text into multiple languages in seconds.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Ticket,
    title: "Smart Ticket Parsing",
    description: "Extract structured data from receipts, tickets, and invoices automatically.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Next-Gen AI OCR
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Turn your images into <span className="text-indigo-600">structured data</span>
        </h1>
        
         

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/scanner"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
          >
            Start Scanning
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/history"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            View History
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Why SmartScan? */}
      <section className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Why choose SmartScan AI?</h2>
            <div className="space-y-4">
              {[
                "Handles complex handwriting with ease",
                "Preserves original document formatting",
                "Multilingual support (100+ languages)",
                "Fast processing with Gemini 1.5 Flash",
                "Privacy-first: No permanent storage of images"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-indigo-400 w-5 h-5 flex-shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
