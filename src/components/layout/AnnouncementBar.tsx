"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AnnouncementBarProps {
  messages: string[];
}

export function AnnouncementBar({ messages }: AnnouncementBarProps) {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length]);

  if (!messages || messages.length === 0) return null;

  const nextMessage = () => setCurrent((prev) => (prev + 1) % messages.length);
  const prevMessage = () => setCurrent((prev) => (prev - 1 + messages.length) % messages.length);

  return (
    <div className="bg-primary text-primary-foreground py-2 text-center text-xs sm:text-sm font-semibold relative overflow-hidden group px-10 select-none z-45">
      <div className="h-5 relative flex items-center justify-center">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`absolute transition-all duration-500 ease-in-out ${idx === current ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
          >
            {msg}
          </div>
        ))}
      </div>

      {messages.length > 1 && (
        <>
          <button 
            onClick={prevMessage}
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded cursor-pointer text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={nextMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded cursor-pointer text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
