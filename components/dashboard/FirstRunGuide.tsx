"use client";

import { useState, useEffect } from "react";

const LINES = [
  "> STRATOS_OS v1.0",
  "> BOOTING MISSION CORE...",
  ">",
  "> NO ACTIVE MISSIONS DETECTED.",
  ">",
  "> YOUR MISSION:",
  ">   TELL AI YOUR SITUATION.",
  ">   GET ONE ACTION TO DO TODAY.",
  ">",
  "> TO BEGIN → CLICK [ + NEW ACTION ]",
  ">",
  "> READY",
];

interface Props {
  lineDelay?: number;
  onBegin?: () => void;
}

export default function FirstRunGuide({ lineDelay = 300, onBegin }: Props) {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    if (visibleCount >= LINES.length) return;
    const timeout = setTimeout(() => setVisibleCount((c) => c + 1), lineDelay);
    return () => clearTimeout(timeout);
  }, [visibleCount]);

  const done = visibleCount >= LINES.length;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="font-mono text-sm leading-relaxed text-zinc-500">
        {LINES.slice(0, visibleCount).map((line, i) => {
          const isActionLine = line.includes("+ NEW ACTION");
          const isLast = i === visibleCount - 1;
          return (
            <div key={i}>
              {isActionLine ? (
                <>
                  <span>{"> TO BEGIN → CLICK "}</span>
                  {onBegin ? (
                    <button onClick={onBegin} className="text-neon hover:underline">[ + NEW ACTION ]</button>
                  ) : (
                    <span className="text-neon">[ + NEW ACTION ]</span>
                  )}
                </>
              ) : (
                line
              )}
              {isLast && done && (
                <span className="animate-pulse text-neon">█</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
