'use client';

import { useEffect, useRef } from 'react';

export default function PaintTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    const hero = canvas?.closest('.hero');
    if (prefersReducedMotion || !canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    const colors = ['#E5402B', '#F2B705', '#8E6FD1'];
    let dabs = [];
    let frameId;

    function resizeCanvas() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function handleMove(e) {
      const rect = hero.getBoundingClientRect();
      dabs.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        r: 6 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
      if (dabs.length > 60) dabs.shift();
    }
    hero.addEventListener('mousemove', handleMove);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dabs.forEach((d) => {
        ctx.globalAlpha = d.life * 0.4;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        d.life -= 0.018;
      });
      dabs = dabs.filter((d) => d.life > 0);
      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      hero.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}
