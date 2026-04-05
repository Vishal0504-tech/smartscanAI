import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Scan, History, Home, Info } from "lucide-react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/scanner", icon: Scan, label: "Scanner" },
    { path: "/history", icon: History, label: "History" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar / Topbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-2 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:h-16 md:flex md:items-center md:justify-between">
        <div className="hidden md:flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Scan className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">SmartScan AI</span>
        </div>

        <div className="flex justify-around md:justify-end md:gap-8 items-center w-full md:w-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 rounded-xl transition-all duration-200",
                  isActive 
                    ? "text-indigo-600 md:bg-indigo-50" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon className="w-6 h-6 md:w-5 md:h-5" />
                <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 md:hidden"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pt-20 md:pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer (Desktop) */}
      <footer className="hidden md:block py-8 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-slate-500 text-sm">
          <p>© 2026 SmartScan AI.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-indigo-600">Privacy</Link>
            <Link to="#" className="hover:text-indigo-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
