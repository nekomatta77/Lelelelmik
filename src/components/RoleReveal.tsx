/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Eye, User } from 'lucide-react';
import { Player } from '../types';

interface RoleRevealProps {
  players: Player[];
  onComplete: () => void;
}

export default function RoleReveal({ players, onComplete }: RoleRevealProps) {
  const me = players[0];

  const roleInfo = {
    Mafia: {
      title: 'МАФИЯ',
      desc: 'Устраняйте граждан ночью и оставайтесь вне подозрений днем.',
      icon: Target,
      color: 'text-rose-mafia'
    },
    Detective: {
      title: 'ДЕТЕКТИВ',
      desc: 'Вы можете проверять роли других игроков каждую ночь.',
      icon: Eye,
      color: 'text-blue-400'
    },
    Doctor: {
      title: 'ВРАЧ',
      desc: 'Выбирайте игрока, которого хотите спасти этой ночью.',
      icon: Shield,
      color: 'text-green-400'
    },
    Civilian: {
      title: 'ГРАЖДАНИН',
      desc: 'Ваша цель — вычислить мафию и изгнать её из города на голосовании.',
      icon: User,
      color: 'text-purple-300'
    }
  };

  const info = roleInfo[me.role as keyof typeof roleInfo];

  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full p-8 text-center" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <div className="glass-card p-10 w-full border-rose-mafia/30">
        <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] mb-4">Твоя роль</p>
        
        <info.icon className={`w-20 h-20 mx-auto mb-6 ${info.color}`} />
        
        <h2 className={`text-4xl font-black mb-4 tracking-tighter ${info.color}`}>
          {info.title}
        </h2>
        
        <p className="text-purple-100/70 text-sm leading-relaxed mb-10">
          {info.desc}
        </p>
        
        <button 
          onClick={onComplete} 
          className="btn-primary w-full py-4 text-sm uppercase tracking-widest"
        >
          Я готов
        </button>
      </div>
    </motion.div>
  );
}