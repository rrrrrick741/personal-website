"use client";

import { useEffect, useRef } from "react";

interface Blob {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateBlobs(count: number): Blob[] {
  const blobs: Blob[] = [];
  for (let i = 0; i < count; i++) {
    blobs.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 120 + Math.random() * 280,
      duration: 4 + Math.random() * 8,
      delay: Math.random() * 4,
      opacity: 0.02 + Math.random() * 0.05,
    });
  }
  return blobs;
}

export default function BreathingBackground() {
  const blobsRef = useRef<Blob[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only generate blobs once on mount
    if (blobsRef.current.length === 0) {
      blobsRef.current = generateBlobs(8);
    }

    // Seed with a consistent hash to avoid SSR mismatch
    const style = document.createElement("style");
    let css = "";

    blobsRef.current.forEach((blob, i) => {
      const name = `blob-breathe-${i}`;
      // Each blob has its own breathing keyframe with different scale ranges
      const minScale = 0.6 + Math.random() * 0.3;
      const maxScale = 1.0 + Math.random() * 0.4;
      const moveX = (Math.random() - 0.5) * 8;
      const moveY = (Math.random() - 0.5) * 8;

      css += `
        @keyframes ${name} {
          0%, 100% {
            transform: translate(0, 0) scale(${minScale});
            opacity: ${blob.opacity};
          }
          25% {
            transform: translate(${moveX}px, ${moveY}px) scale(${maxScale});
            opacity: ${blob.opacity * 1.5};
          }
          50% {
            transform: translate(${-moveX * 0.6}px, ${moveY * 0.3}px) scale(${(minScale + maxScale) / 2});
            opacity: ${blob.opacity * 1.2};
          }
          75% {
            transform: translate(${moveX * 0.4}px, ${-moveY * 0.7}px) scale(${maxScale * 0.85});
            opacity: ${blob.opacity * 1.4};
          }
        }
      `;

      blob.duration = 6 + Math.random() * 10;
      blob.delay = -(Math.random() * blob.duration);
    });

    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-blob-container
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {blobsRef.current.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-black"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            marginLeft: `-${blob.size / 2}px`,
            marginTop: `-${blob.size / 2}px`,
            filter: "blur(100px)",
            opacity: blob.opacity,
            animationName: `blob-breathe-${i}`,
            animationDuration: `${blob.duration}s`,
            animationDelay: `${blob.delay}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
