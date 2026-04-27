/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Moon, Target, Shield, Eye } from 'lucide-react';
import { Player, GamePhase } from '../types';

interface NightPhaseProps {
  players: Player[];
  phase: GamePhase;
  onAction: (targetId: string) => void;
  checkedPlayer: { id: string; role: string } | null;
}

export default function NightPhase({ players, phase, onAction, checkedPlayer }: NightPhaseProps) {
  const getPhaseInfo = () => {
    switch (phase) {
      case 'NIGHT_MAFIA':
        return { title: 'Ход Мафии', desc: 'Выберите цель для устранения', icon: Target, color: 'text-rose-mafia' };
      case 'NIGHT_DETECTIVE':
        return { title: 'Ход Детектива', desc: 'Выберите игрока для проверки', icon: Eye, color: 'text-blue-400' };
      case 'NIGHT_DOCTOR':
        return { title: 'Ход Врача', desc: 'Выберите, кого спасти этой ночью', icon: Shield, color: 'text-green-400' };
      default:
        return { title: 'Город засыпает', desc: 'Происходят ночные события...', icon: Moon, color: 'text-purple-400' };
    }
  };

  const info = getPhaseInfo();
  const alivePlayers = players.filter(p => p.isAlive);

  return (
    <motion.div 
      className="flex flex-col h-full p-6" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <div className="text-center mb-8 shrink-0">
        <info.icon className={`w-12 h-12 mx-auto mb-3 ${info.color}`} />
        <h2 className="text-2xl font-bold uppercase">{info.title}</h2>
        <p className="text-white/40 text-xs mt-1">{info.desc}</p>
      </div>

      {checkedPlayer && (
        <div className="glass-card p-4 mb-6 text-center border-blue-400/30 shrink-0">
          <p className="text-[10px] uppercase text-white/40 mb-1">Результат проверки:</p>
          <p className="text-sm font-bold text-blue-400">
            {players.find(p => p.id === checkedPlayer.id)?.name} — {checkedPlayer.role === 'Mafia' ? 'МАФИЯ' : 'ГРАЖДАНИН'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-1 flex-1 pb-4">
        {alivePlayers.map(p => (
          <button 
            key={p.id} 
            onClick={() => onAction(p.id)} 
            className="glass-card p-4 text-left hover:bg-white/5 border-white/5 active:scale-[0.98] transition-all"
          >
            <span className="text-sm font-bold">{p.name}</span>
          </button>
        ))}
        {phase !== 'NIGHT_MAFIA' && (
          <button 
            onClick={() => onAction('')} 
            className="p-4 text-center text-[10px] uppercase tracking-widest text-white/20 mt-2"
          >
            Пропустить ход
          </button>
        )}
      </div>
    </motion.div>
  );
}