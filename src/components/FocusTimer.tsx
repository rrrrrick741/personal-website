"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  onComplete: (duration: number) => void;
}

export default function FocusTimer({ onComplete }: Props) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = isBreak ? 5 * 60 : minutes * 60 + seconds;
  const elapsed = isRunning ? totalFocusSeconds : 0;
  const displayMin = Math.floor((totalSeconds - elapsed) / 60);
  const displaySec = (totalSeconds - elapsed) % 60;

  const tick = useCallback(() => {
    setTotalFocusSeconds((prev) => {
      const next = prev + 1;
      if (next >= (isBreak ? 5 * 60 : minutes * 60 + seconds)) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        if (!isBreak) {
          onComplete(minutes);
        }
        return 0;
      }
      return next;
    });
  }, [isBreak, minutes, seconds, onComplete]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  function toggleTimer() {
    if (!isRunning && totalFocusSeconds === 0) {
      setTotalFocusSeconds(0);
    }
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    setTotalFocusSeconds(0);
    setIsBreak(false);
  }

  function setPreset(mins: number) {
    setIsRunning(false);
    setTotalFocusSeconds(0);
    setMinutes(mins);
    setSeconds(0);
    setIsBreak(false);
  }

  const progress =
    totalSeconds > 0
      ? ((totalSeconds - (totalSeconds - elapsed)) / totalSeconds) * 100
      : 0;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Ring timer */}
      <div className="relative w-64 h-64 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="4"
          />
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light tracking-tight text-[--color-text] tabular-nums">
            {String(displayMin).padStart(2, "0")}:{String(displaySec).padStart(2, "0")}
          </span>
          <span className="text-xs text-[--color-text-tertiary] mt-1">
            {isBreak ? "休息" : "专注"}
          </span>
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-2 mb-5">
        {[15, 25, 45, 60].map((m) => (
          <button
            key={m}
            onClick={() => setPreset(m)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              minutes === m && !isBreak
                ? "border-[--color-accent] bg-[--color-accent] text-white"
                : "border-[--color-border] text-[--color-text-secondary] hover:border-[--color-text]"
            }`}
          >
            {m} 分钟
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={toggleTimer}
          className="px-8 py-2 rounded-full bg-[--color-accent] text-white text-sm font-medium hover:bg-[--color-accent-hover] transition-colors"
        >
          {isRunning ? "暂停" : "开始专注"}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2 rounded-full border border-[--color-border] text-sm text-[--color-text-secondary] hover:text-[--color-text] transition-colors"
        >
          重置
        </button>
      </div>
    </div>
  );
}
