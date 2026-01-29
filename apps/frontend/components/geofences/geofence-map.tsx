'use client';

import { useRef, useEffect } from 'react';
import { type CoordinatePoint } from '@/types/common';
import { cn } from '@/lib/utils';

export interface GeofenceMapProps {
  coordinates: CoordinatePoint[];
  width?: number;
  height?: number;
  className?: string;
}

export function GeofenceMap({
  coordinates,
  width = 400,
  height = 300,
  className,
}: GeofenceMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || coordinates.length < 3) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate bounds
    const xs = coordinates.map((c) => c.x);
    const ys = coordinates.map((c) => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Calculate scale and padding
    const padding = 20;
    const scaleX = (width - padding * 2) / (maxX - minX || 1);
    const scaleY = (height - padding * 2) / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);

    // Center the drawing
    const centerX = width / 2;
    const centerY = height / 2;
    const offsetX = centerX - ((minX + maxX) / 2) * scale;
    const offsetY = centerY - ((minY + maxY) / 2) * scale;

    // Draw polygon
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 2;

    coordinates.forEach((coord, index) => {
      const x = coord.x * scale + offsetX;
      const y = coord.y * scale + offsetY;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw coordinate points
    ctx.fillStyle = '#3b82f6';
    coordinates.forEach((coord) => {
      const x = coord.x * scale + offsetX;
      const y = coord.y * scale + offsetY;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('X (meters)', width / 2, height - 5);
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y (meters)', 0, 0);
    ctx.restore();
  }, [coordinates, width, height]);

  if (coordinates.length < 3) {
    return (
      <div
        className={cn('flex items-center justify-center border rounded-lg bg-muted', className)}
        style={{ width, height }}
      >
        <p className="text-sm text-muted-foreground">At least 3 coordinates required</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn('border rounded-lg bg-background', className)}
    />
  );
}
