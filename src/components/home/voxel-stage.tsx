"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const COLORS = {
  top: ["#3a3a3a", "#2a2a2a", "#4a4a4a", "#222222", "#333333"],
  side: ["#1a1a1a", "#151515", "#202020", "#121212", "#1c1c1c"],
  glow: "255, 255, 255",
};

interface Voxel {
  x: number;
  y: number;
  z: number;
  size: number;
  colorIndex: number;
  speed: number;
  phase: number;
}

function iso(cx: number, cy: number, x: number, y: number, size: number) {
  const sx = cx + (x - y) * (size / 2);
  const sy = cy + (x + y) * (size / 4) - size / 2;
  return { sx, sy };
}

export function VoxelStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;
    const canvasElement = canvas;

    let width = 0;
    let height = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const voxels: Voxel[] = [];

    function resize() {
      const rect = canvasElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvasElement.width = width * dpr;
      canvasElement.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function buildVoxels() {
      voxels.length = 0;
      const size = Math.min(width, height) / 8;
      const startX = Math.floor(width / (size * 0.85));
      const startY = Math.floor(height / (size * 0.65));
      for (let x = 0; x < startX; x += 1) {
        for (let y = 0; y < startY; y += 1) {
          voxels.push({
            x: x * size * 0.85,
            y: y * size * 0.65,
            z: 0,
            size: size * (0.8 + Math.random() * 0.35),
            colorIndex: Math.floor(Math.random() * COLORS.top.length),
            speed: 0.5 + Math.random() * 1.2,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      const count = Math.max(4, Math.floor(width / 90));
      for (let index = 0; index < count; index += 1) {
        voxels.push({
          x: Math.random() * width * 0.9,
          y: Math.random() * height * 0.65,
          z: 1,
          size: size * (0.35 + Math.random() * 0.5),
          colorIndex: Math.floor(Math.random() * COLORS.top.length),
          speed: 0.3 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawCube(voxel: Voxel, time: number, tiltX: number, tiltY: number) {
      const { sx, sy } = iso(width / 2 + tiltX * 12, height * 0.55 + tiltY * 8, voxel.x, voxel.y, voxel.size);
      const bob = voxel.z === 1 ? Math.sin(time * voxel.speed + voxel.phase) * 5 : 0;
      const topY = sy - voxel.size / 2 + bob;
      const size = voxel.size;
      const colorIndex = voxel.colorIndex;

      // top face
      ctx.beginPath();
      ctx.moveTo(sx, topY - size / 2);
      ctx.lineTo(sx + size / 2, topY);
      ctx.lineTo(sx, topY + size / 2);
      ctx.lineTo(sx - size / 2, topY);
      ctx.closePath();
      ctx.fillStyle = COLORS.top[colorIndex];
      ctx.fill();

      // left face
      ctx.beginPath();
      ctx.moveTo(sx - size / 2, topY);
      ctx.lineTo(sx, topY + size / 2);
      ctx.lineTo(sx, topY + size / 2 + size / 2);
      ctx.lineTo(sx - size / 2, topY + size / 2);
      ctx.closePath();
      ctx.fillStyle = COLORS.side[colorIndex];
      ctx.fill();

      // right face
      ctx.beginPath();
      ctx.moveTo(sx + size / 2, topY);
      ctx.lineTo(sx, topY + size / 2);
      ctx.lineTo(sx, topY + size / 2 + size / 2);
      ctx.lineTo(sx + size / 2, topY + size / 2);
      ctx.closePath();
      ctx.fillStyle = COLORS.side[colorIndex];
      ctx.fill();

      if (voxel.z === 0) {
        ctx.fillStyle = "rgba(5,7,15,0.65)";
        ctx.fillRect(0, sy + size * 0.55, width, size * 0.3);
      }
    }

    function drawStars(time: number) {
      for (let index = 0; index < 40; index += 1) {
        const x = (index * 97) % width;
        const y = (index * 53) % (height * 0.7);
        const twinkle = 0.25 + 0.75 * Math.abs(Math.sin(time * 0.6 + index));
        ctx.fillStyle = `rgba(226,232,240,${twinkle * 0.7})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    function drawPortal(time: number) {
      const cx = width * 0.5;
      const cy = height * 0.46;
      const radius = Math.min(width, height) * 0.13;
      const pulse = 1 + Math.sin(time * 1.2) * 0.04;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * pulse);
      gradient.addColorStop(0, "rgba(255,255,255,0.45)");
      gradient.addColorStop(0.55, `rgba(${COLORS.glow},0.28)`);
      gradient.addColorStop(1, "rgba(5,7,15,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw(time: number) {
      ctx.clearRect(0, 0, width, height);
      drawPortal(time);
      drawStars(time);
      for (const voxel of voxels) drawCube(voxel, time, tilt.x, tilt.y);
    }

    function loop(time: number) {
      draw(time / 1000);
      raf = requestAnimationFrame(loop);
    }

    resize();
    buildVoxels();
    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(() => {
      resize();
      buildVoxels();
      if (reduced) draw(0);
    });
    observer.observe(canvasElement);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [reduced, tilt]);

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-night-500/40 sm:h-[440px]">
      <div
        className="absolute inset-0 bg-grid-dense opacity-60"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setTilt({
            x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
            y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
          });
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-40" aria-hidden />
    </div>
  );
}
