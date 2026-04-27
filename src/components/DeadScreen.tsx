/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Skull } from 'lucide-react';

export default function DeadScreen() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full p-8 text-center" 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="glass-card p-10 w-full border-rose-mafia/40 flex flex-col items-center shadow-lg shadow-rose-mafia/10 bg-black/40">
        <Skull className="w-20 h-20 text-rose-mafia mb-6 drop-shadow-[0_0_15px_rgba(225,29,72,0.8)]" />
        
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-rose-mafia">
          ВЫ МЕРТВЫ
        </h2>
        
        <p className="text-white/60 text-sm mt-4 leading-relaxed font-medium">
          Вас изгнали из города или устранили ночью. <br/> 
          Ваш путь в этой игре окончен.
        </p>

        <div className="mt-8 px-6 py-3 border border-white/10 rounded-xl bg-white/5">
          <span className="text-xs uppercase tracking-widest text-white/30 font-bold">
            Режим наблюдения отключен
          </span>
        </div>
        
        <p className="text-[10px] text-white/30 mt-6 uppercase">
          Ожидайте конца игры...
        </p>
      </div>
    </motion.div>
  );
}