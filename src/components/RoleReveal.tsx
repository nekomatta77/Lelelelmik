/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Target, Eye, User, CheckCircle2, Clock } from 'lucide-react';
import { Player } from '../types';

interface RoleRevealProps {
  players: Player[];
  myId?: string;
  onComplete: () => void;
}

export default function RoleReveal({ players, myId, onComplete }: RoleRevealProps) {
  const me = players.find(p => p.id === myId) || players[0];

  // --- ЭКРАН ОЖИДАНИЯ (Если игрок уже нажал кнопку "Готов") ---
  if (me?.ready) {
    return (
      <motion.div className="flex flex-col items-center justify-start h-full p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-center w-full mt-10 mb-8">
          <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Ожидание игроков</h2>
          <p className="text-xs text-white/40 mt-2">Игра начнется, когда все изучат свои роли</p>
        </div>

        <div className="glass-card w-full flex flex-col gap-2 p-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {players.map(p => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5"
              >
                <span className="text-sm font-medium">{p.name}</span>
                {p.ready ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold">Готов</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-white/30">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold">Читает</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // --- КАРТОЧКА РОЛИ ---
  const roleInfo = {
    Mafia: { title: 'МАФИЯ', desc: 'Устраняйте граждан ночью и оставайтесь вне подозрений днем.', icon: Target, color: 'text-rose-mafia' },
    Detective: { title: 'ДЕТЕКТИВ', desc: 'Вы можете проверять роли других игроков каждую ночь.', icon: Eye, color: 'text-blue-400' },
    Doctor: { title: 'ВРАЧ', desc: 'Выбирайте игрока, которого хотите спасти этой ночью.', icon: Shield, color: 'text-green-400' },
    Civilian: { title: 'ГРАЖДАНИН', desc: 'Ваша цель — вычислить мафию и изгнать её из города на голосовании.', icon: User, color: 'text-purple-300' }
  };

  const info = roleInfo[(me?.role as keyof typeof roleInfo) || 'Civilian'];

  return (
    <motion.div className="flex flex-col items-center justify-center h-full p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="glass-card p-10 w-full border-rose-mafia/30">
        <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] mb-4">Твоя роль</p>
        <info.icon className={`w-20 h-20 mx-auto mb-6 ${info.color}`} />
        <h2 className={`text-4xl font-black mb-4 tracking-tighter ${info.color}`}>{info.title}</h2>
        <p className="text-purple-100/70 text-sm leading-relaxed mb-10">{info.desc}</p>
        <button onClick={onComplete} className="btn-primary w-full py-4 text-sm uppercase tracking-widest">
          Я готов
        </button>
      </div>
    </motion.div>
  );
}