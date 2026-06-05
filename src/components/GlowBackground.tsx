/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function GlowBackground() {
  return (
    <>
      {/* CSS Animated Dot-Grid and Base Canvas Background */}
      <div className="fixed inset-0 bg-imsec-navy bg-dot-grid z-0" id="dot-grid-bg" />

      {/* Three Massive Drifting Soft Glowing Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Blob 1: Accent Blue (hostel/general theme) */}
        <div 
          className="absolute blob-blue w-[45vw] h-[45vw] rounded-full bg-accent-blue/15 mix-blend-screen filter blur-[100px]"
          style={{ top: '10%', left: '-5%', transform: 'translate3d(0,0,0)' }}
        />

        {/* Blob 2: Accent Purple (AI highlight aspect) */}
        <div 
          className="absolute blob-purple w-[48vw] h-[48vw] rounded-full bg-accent-purple/15 mix-blend-screen filter blur-[120px]"
          style={{ bottom: '-10%', right: '5%', transform: 'translate3d(0,0,0)' }}
        />

        {/* Blob 3: Accent Green (resolution/success indicators) */}
        <div 
          className="absolute blob-green w-[38vw] h-[38vw] rounded-full bg-accent-green/12 mix-blend-screen filter blur-[90px]"
          style={{ top: '45%', left: '50%', transform: 'translate3d(0,0,0)' }}
        />
      </div>

      {/* SVG Grain Noise Dynamic Overlay Filter */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.22] z-50 mix-blend-overlay grain-overlay" aria-hidden="true">
        <filter id="campusVoiceNoise">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.80" 
            numOctaves="4" 
            stitchTiles="stitch" 
          />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#campusVoiceNoise)" />
      </svg>
    </>
  );
}
