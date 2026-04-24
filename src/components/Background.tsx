/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-noir overflow-hidden">
      {/* Dynamic Gradients */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/4 -left-1/4 w-full h-full bg-rose-mafia/15 blur-[120px] rounded-full"
      />
      <motion.div 
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-rose-mafia-dark/10 blur-[150px] rounded-full"
      />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
