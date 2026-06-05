/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';

export default function RingCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const targetScale = useRef(1);

  useEffect(() => {
    // 1. Mouse movement tracking
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    // 2. Interactive hover listeners
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'TEXTAREA' || 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('.interactive-card') ||
        target.classList.contains('interactive-hover');

      if (isInteractive) {
        setHovered(true);
        targetScale.current = 1.8;
      } else {
        setHovered(false);
        targetScale.current = 1;
      }
    };

    const handleMouseLeaveWindow = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Precision Inner Dot */}
      <div
        className="fixed pointer-events-none z-[9999] w-1.5 h-1.5 rounded-full bg-accent-blue mix-blend-difference -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      {/* Outer Halo Ring */}
      <div
        className="fixed pointer-events-none z-[9998] rounded-full border border-accent-blue/40 -translate-x-1/2 -translate-y-1/2 mix-blend-soft-light"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: hovered ? '36px' : '22px',
          height: hovered ? '36px' : '22px',
          backgroundColor: hovered ? 'rgba(79, 127, 255, 0.08)' : 'transparent',
          boxShadow: hovered ? '0 0 12px rgba(79, 127, 255, 0.45)' : 'none',
          borderColor: hovered ? '#A78BFA' : '#4F7FFF',
          transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), height 0.22s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.22s, box-shadow 0.22s, border-color 0.22s',
        }}
      />
    </>
  );
}
