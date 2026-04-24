/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, AlertTriangle, Vote, Timer, MessageSquare, Skull } from 'lucide-react';
import { Player } from '../types';

interface DayPhaseProps {
  players: Player[];
  deathId: string | null;
  onVote: (targetId: string | null) => void;
  isVoting: boolean;
  onStartVoting: () => void;
}

export default function DayPhase({ players, deathId, onVote, isVoting, onStartVoting }: DayPhaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const killedPlayer = players.find(p => p.id === deathId);
  const alivePlayers = players.filter(p => p.isAlive);

  if (!isVoting) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center h-full text-center p-8 w-full"
      >
        <span className="text-[10px] font-bold text-rose-mafia uppercase tracking-[0.3em] mb-4">Phase Change</span>
        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-8 border border-white/5 shadow-xl">
          <Sun className="w-8 h-8 text-rose-mafia animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight uppercase">THE CITY AWAKES</h2>
        
        <div className="glass-card p-6 w-full mb-10 border-white/5 bg-slate-900/20">
          {deathId ? (
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-rose-mafia/10 rounded-2xl border border-rose-mafia/10 mb-2">
                <Skull className="w-6 h-6 text-rose-mafia" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">TRAGEDY STRIKES</h3>
              <p className="text-slate-400 text-xs leading-relaxed italic">By order of the syndicate, <span className="text-white font-bold not-italic">{killedPlayer?.name}</span> has been permanently removed from the table.</p>
              <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-mono pt-4 border-t border-white/5">Subject was: {killedPlayer?.role === 'Mafia' ? 'Mafia' : 'Commoner'}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-green-400/10 rounded-2xl border border-green-400/10 mb-2">
                <AlertTriangle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">QUIET NIGHT</h3>
              <p className="text-slate-400 text-xs leading-relaxed italic">The city remains intact. No casualties reported this morning.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-2 justify-center text-white/30 text-[10px] uppercase tracking-widest mb-2 font-mono">
                <MessageSquare className="w-3 h-3" />
                Floor open for discussion
            </div>
            <button onClick={onStartVoting} className="btn-primary w-full py-4 text-[10px] tracking-widest uppercase">Start Deliberation</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center h-full p-6 w-full"
    >
      <div className="flex items-center justify-between w-full mb-6 glass-card p-4 border-l-2 border-rose-mafia">
        <div className="flex items-center gap-3">
            <Vote className="w-5 h-5 text-rose-mafia" />
            <h2 className="font-bold text-sm tracking-widest uppercase">Voting Chamber</h2>
        </div>
        <div className="flex items-center gap-2 bg-white/2 px-2.5 py-1 rounded-full border border-white/5">
            <Timer className="w-3 h-3 text-rose-mafia animate-pulse" />
            <span className="text-[9px] font-mono tracking-tighter text-white/40">URGENT</span>
        </div>
      </div>

      <p className="text-white/30 text-[10px] text-center mb-6 italic leading-relaxed">Identify the syndicate infiltrator. Cast your vote or abstain to maintain the current order.</p>

      <div className="grid grid-cols-2 gap-3 w-full overflow-y-auto mb-6 pr-1 flex-1 custom-scrollbar">
        {alivePlayers.map((player) => (
          <motion.button
            key={player.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedId(player.id)}
            className={`p-4 rounded-2xl glass-card border-2 transition-all flex flex-col items-center gap-3 relative ${selectedId === player.id ? 'border-rose-mafia bg-rose-mafia/5' : 'border-white/5 bg-slate-900/10 hover:bg-white/3'}`}
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-sm font-bold shadow-inner">
              {player.name[0]}
            </div>
            <span className="font-semibold text-xs tracking-wide">{player.name}</span>
            {selectedId === player.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 bg-rose-mafia text-white p-1 rounded-full shadow-lg">
                    <Vote className="w-3 h-3" />
                </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
            onClick={() => onVote(selectedId)}
            className={`btn-primary w-full py-4 text-[10px] tracking-widest uppercase ${!selectedId ? 'opacity-30 grayscale cursor-not-allowed shadow-none' : ''}`}
        >
            Cast Verdict
        </button>
        <button
            onClick={() => onVote(null)}
            className="btn-secondary w-full py-4 text-[10px] tracking-widest uppercase"
        >
            Abstain Action
        </button>
      </div>
    </motion.div>
  );
}
