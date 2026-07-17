"use client";

import * as React from "react";

interface AnnouncementBarProps {
  messages: string[];
}

export function AnnouncementBar({ messages }: AnnouncementBarProps) {
  if (!messages || messages.length === 0) return null;

  // Repeat the messages to ensure there is enough horizontal length for small sets
  const repeatCount = messages.length === 1 ? 6 : messages.length < 3 ? 4 : 2;
  const singleHalf = Array(repeatCount).fill(messages).flat();

  return (
    <div className="bg-primary text-primary-foreground py-2 relative overflow-hidden select-none z-45 w-full border-b border-primary-foreground/10">
      <div className="flex w-max whitespace-nowrap animate-marquee pause-marquee">
        {/* First Half */}
        <div className="flex items-center gap-16 px-8">
          {singleHalf.map((msg, idx) => (
            <span key={`first-${idx}`} className="text-xs sm:text-sm font-semibold flex items-center gap-4">
              <span>{msg}</span>
              <span className="text-primary-foreground/30 font-light select-none">/</span>
            </span>
          ))}
        </div>

        {/* Second Half (Clone for seamless loop) */}
        <div className="flex items-center gap-16 px-8">
          {singleHalf.map((msg, idx) => (
            <span key={`second-${idx}`} className="text-xs sm:text-sm font-semibold flex items-center gap-4">
              <span>{msg}</span>
              <span className="text-primary-foreground/30 font-light select-none">/</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

