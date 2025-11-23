'use client';

import { useEffect, useRef } from 'react';

interface VoiceBubbleProps {
  isActive: boolean;
  isSpeaking: boolean;
  audioLevel: number;
}

export default function VoiceBubble({ isActive, isSpeaking, audioLevel }: VoiceBubbleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 80;

    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isActive) {
        // Create pulsating effect based on audio level
        const scale = 1 + (audioLevel * 0.5);
        const radius = baseRadius * scale;

        // Draw outer glow layers
        for (let i = 3; i >= 0; i--) {
          const glowRadius = radius + (i * 15);
          const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.5,
            centerX, centerY, glowRadius
          );
          
          gradient.addColorStop(0, `rgba(59, 130, 246, ${0.4 - i * 0.1})`);
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw main bubble with wave effect
        const waveCount = 6;
        ctx.beginPath();
        for (let i = 0; i <= 360; i++) {
          const angle = (i * Math.PI) / 180;
          const waveOffset = Math.sin(angle * waveCount + phase) * (audioLevel * 10 + 5);
          const r = radius + waveOffset;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        // Gradient fill for main bubble
        const mainGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        
        if (isSpeaking) {
          mainGradient.addColorStop(0, 'rgba(96, 165, 250, 0.9)');
          mainGradient.addColorStop(1, 'rgba(59, 130, 246, 0.7)');
        } else {
          mainGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
          mainGradient.addColorStop(1, 'rgba(30, 58, 138, 0.6)');
        }
        
        ctx.fillStyle = mainGradient;
        ctx.fill();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(centerX - 20, centerY - 20, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        phase += 0.05;
      } else {
        // Static bubble when inactive
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, baseRadius
        );
        
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
        gradient.addColorStop(1, 'rgba(30, 58, 138, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking, audioLevel]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="drop-shadow-2xl"
      />
    </div>
  );
}
