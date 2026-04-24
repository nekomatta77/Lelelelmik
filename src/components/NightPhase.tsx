/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Eye, Shield, CheckCircle2, ChevronRight, Moon } from 'lucide-react';
import { Player, Role, GamePhase } from '../types';

interface NightPhaseProps {
  players: Player[];
  phase: GamePhase;
  onAction: (targetId: string) => void;
  checkedPlayer?: { id: string; role: Role } | null;
}

export default function NightPhase({ players, phase, onAction, checkedPlayer }: NightPhaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const alivePlayers = players.filter(p => p.isAlive);
  
  const getPhaseConfig = () => {
    switch (phase) {
      case 'NIGHT_MAFIA':
        return {
          icon: <Skull className="w-6 h-6 text-rose-mafia" />,
          title: 'Underworld Move',
          subtitle: 'IDENTIFY TARGET',
          color: 'border-rose-mafia/50 text-rose-mafia',
          accent: 'bg-rose-mafia/5',
          actionText: 'Execute'
        };
      case 'NIGHT_DETECTIVE':
        return {
          icon: <Eye className="w-6 h-6 text-blue-400" />,
          title: 'Intelligence',
          subtitle: 'INSPECT AGENT',
          color: 'border-blue-400/50 text-blue-400',
          accent: 'bg-blue-400/5',
          actionText: 'Investigate'
        };
      case 'NIGHT_DOCTOR':
        return {
          icon: <Shield className="w-6 h-6 text-green-400" />,
          title: 'Emergency Care',
          subtitle: 'PROTECT TARGET',
          color: 'border-green-400/50 text-green-400',
          accent: 'bg-green-400/5',
          actionText: 'Preserve'
        };
      default:
        return {
          icon: <Moon className="w-6 h-6 text-white/30" />,
          title: 'City in Silence',
          subtitle: 'PHASE PENDING',
          color: 'border-white/5 text-white/30',
          accent: 'bg-white/2',
          actionText: 'Proceed'
        };
    }
  };

  const config = getPhaseConfig();

  if (phase === 'NIGHT_START') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center h-full text-center p-8"
      >
        <span className="text-rose-mafia font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Phase Change</span>
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} 
          transition={{ duration: 4, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-white/3 border border-white/8 flex items-center justify-center mb-10 shadow-[0_0_60px_rgba(225,29,72,0.05)]"
        >
          <Moon className="w-10 h-10 text-white/10" />
        </motion.div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">THE CITY SLEEPS</h2>
        <p className="text-white/30 text-[11px] leading-relaxed max-w-[200px] italic">Close your eyes and await instructions. The underworld is waking up.</p>
        <button onClick={() => onAction('')} className="btn-secondary mt-12 py-3 text-[10px] tracking-widest uppercase">Acknowledge</button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col items-center h-full p-6 w-full"
    >
      <div className={`w-full glass-card p-5 border-b-2 ${config.color} mb-6 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${config.accent}`}>
            {config.icon}
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight">{config.title}</h2>
            <p className="text-white/30 text-[9px] uppercase tracking-wider">{config.subtitle}</p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-white/20">00:15</div>
      </div>

      {checkedPlayer && phase === 'NIGHT_DETECTIVE' ? (
        <div className="w-full glass-card p-10 text-center flex flex-col items-center justify-center h-[350px] border-blue-400/20 bg-blue-400/5">
            <span className="text-[10px] uppercase tracking-widest text-blue-400/60 mb-4">Observation Record</span>
            <h3 className="text-xs text-white/30 uppercase mb-2">{players.find(p => p.id === checkedPlayer.id)?.name} is identified as:</h3>
            <div className={`text-4xl role-serif tracking-tight ${checkedPlayer.role === 'Mafia' ? 'text-rose-mafia' : 'text-blue-400'}`}>
                {checkedPlayer.role === 'Mafia' ? 'Mafia Don' : 'Commoner'}
            </div>
            <button onClick={() => onAction('')} className="btn-primary mt-12 w-full text-[10px] uppercase tracking-widest">Destroy File</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 w-full overflow-y-auto mb-6 pr-1 custom-scrollbar">
            {alivePlayers.map((player) => (
              <motion.button
                key={player.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedId(player.id)}
                className={`p-4 rounded-2xl glass-card border-2 transition-all flex flex-col items-center gap-3 relative ${selectedId === player.id ? config.color + ' ' + config.accent : 'border-white/5 bg-slate-900/10 hover:bg-white/3'}`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-white/5">
                  {player.name[0]}
                </div>
                <span className="font-semibold text-[11px] truncate w-full text-center tracking-wide">{player.name}</span>
                {selectedId === player.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 bg-current p-1 rounded-full text-white">
                    <CheckCircle2 className="w-3 h-3" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <button
            disabled={!selectedId}
            onClick={() => selectedId && onAction(selectedId)}
            className={`w-full btn-primary py-5 text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 ${!selectedId ? 'opacity-30 grayscale cursor-not-allowed shadow-none' : ''}`}
          >
            {config.actionText}
            <ChevronRight className="w-3 h-3" />
          </button>
        </>
      )}
    </motion.div>
  );
}
