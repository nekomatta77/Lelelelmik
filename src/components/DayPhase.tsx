/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sun, MessageSquare, Vote } from 'lucide-react';
import { Player } from '../types';

interface DayPhaseProps {
  players: Player[];
  deathId: string | null;
  isVoting: boolean;
  onStartVoting: () => void;
  onVote: (targetId: string | null) => void;
}

export default function DayPhase({ players, deathId, isVoting, onStartVoting, onVote }: DayPhaseProps) {
  const victim = players.find(p => p.id === deathId);

  return (
    <motion.div 
      className="flex flex-col h-full p-6" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <div className="text-center mb-6 shrink-0">
        {isVoting ? (
          <Vote className="w-12 h-12 mx-auto mb-3 text-rose-mafia" />
        ) : (
          <Sun className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
        )}
        <h2 className="text-2xl font-bold uppercase">{isVoting ? 'Голосование' : 'Наступило утро'}</h2>
      </div>

      {!isVoting && (
        <div className="glass-card p-6 mb-6 text-center border-white/10 shrink-0">
          {victim ? (
            <>
              <p className="text-white/40 text-[10px] uppercase mb-2">Этой ночью город потерял:</p>
              <p className="text-xl font-black text-rose-mafia">{victim.name}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-green-400 uppercase text-center">Ночь прошла спокойно. Погибших нет.</p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-6">
        {isVoting ? (
          <div className="space-y-3">
            <p className="text-center text-[10px] text-white/30 uppercase mb-4">Выберите, кого изгнать из города:</p>
            {players.filter(p => p.isAlive).map(p => (
              <button 
                key={p.id} 
                onClick={() => onVote(p.id)} 
                className="glass-card w-full p-4 text-left border-white/5 hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                <span className="text-sm font-bold">{p.name}</span>
              </button>
            ))}
            <button 
              onClick={() => onVote(null)} 
              className="w-full p-4 text-[10px] uppercase text-white/20 mt-2"
            >
              Пропустить голосование
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6 flex flex-col items-center justify-center h-full pb-10">
            <MessageSquare className="w-10 h-10 text-purple-500/50" />
            <p className="text-sm text-purple-100/60 leading-relaxed italic px-4">
              Обсудите события ночи. Кто ведет себя подозрительно? Настало время вычислить мафию.
            </p>
          </div>
        )}
      </div>

      {!isVoting && (
        <button 
          onClick={onStartVoting} 
          className="btn-primary w-full py-4 text-sm uppercase tracking-widest mt-auto shrink-0"
        >
          Перейти к голосованию
        </button>
      )}
    </motion.div>
  );
}