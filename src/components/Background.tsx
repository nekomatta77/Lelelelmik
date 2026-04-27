/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Background() {
  return (
    // Добавили transform-gpu для всего контейнера
    <div className="fixed inset-0 -z-10 bg-noir overflow-hidden transform-gpu">
      
      {/* Dynamic Gradients - Перешли на чистый CSS + Radial Gradient вместо blur() */}
      <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(176,38,255,0.3)_0%,transparent_40%)] blob-1 pointer-events-none" />
      
      <div className="absolute -bottom-[50%] -right-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(75,0,130,0.4)_0%,transparent_40%)] blob-2 pointer-events-none" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transform-gpu" />
    </div>
  );
}