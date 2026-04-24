/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Eye, Skull, User, ArrowRight, EyeOff } from 'lucide-react';
import { Player } from '../types';

interface RoleRevealProps {
  players: Player[];
  onComplete: () => void;
}

export default function RoleReveal({ players, onComplete }: RoleRevealProps) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = players[currentPlayerIndex];

  const nextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setIsRevealed(false);
    } else {
      onComplete();
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'Mafia':
        return {
          icon: <Skull className="w-16 h-16 text-rose-mafia" />,
          title: 'Mafia Don',
          desc: 'Your objective is clear: eliminate the opposition and remain in the shadows.',
          color: 'text-rose-mafia'
        };
      case 'Detective':
        return {
          icon: <Eye className="w-16 h-16 text-blue-400" />,
          title: 'Special Agent',
          desc: 'Analyze behaviors and uncover the hidden syndicates before dawn breaks.',
          color: 'text-blue-400'
        };
      case 'Doctor':
        return {
          icon: <Shield className="w-16 h-16 text-green-400" />,
          title: 'Chief Medical',
          desc: 'A steady hand can prevent a tragedy. Choose one person to protect tonight.',
          color: 'text-green-400'
        };
      default:
        return {
          icon: <User className="w-16 h-16 text-white/40" />,
          title: 'Commoner',
          desc: 'Vigilance is your only weapon. Spot the inconsistencies in their words.',
          color: 'text-white/80'
        };
    }
  };

  const roleInfo = getRoleInfo(currentPlayer.role);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <div className="mb-10">
        <span className="text-[10px] text-rose-mafia font-bold uppercase tracking-[0.2em] mb-1 block">Secret Dossier</span>
        <h2 className="text-2xl font-bold tracking-tight">{currentPlayer.name}</h2>
        <p className="text-white/30 text-[10px] mt-1 italic">Private information. Eyes only.</p>
      </div>

      <div className="relative w-full max-w-[240px] aspect-[4/5]">
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="hidden"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              className="absolute inset-0 glass-card flex flex-col items-center justify-center cursor-pointer group border-white/5"
              onClick={() => setIsRevealed(true)}
            >
              <div className="w-16 h-16 rounded-full bg-white/3 border border-white/8 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <EyeOff className="w-6 h-6 text-white/10" />
              </div>
              <p className="font-bold tracking-widest text-[10px] text-white/20">REVEAL DOSSIER</p>
              <div className="absolute top-4 left-4 text-[8px] text-rose-mafia/40 font-mono">CLASSIFIED</div>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              className="absolute inset-0 glass-card flex flex-col items-center justify-center p-8 border-rose-mafia/20 shadow-[0_0_40px_rgba(225,29,72,0.08)] bg-rose-mafia/3"
            >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="mb-6"
              >
                {roleInfo.icon}
              </motion.div>
              <h3 className={`text-3xl role-serif mb-3 leading-none ${roleInfo.color}`}>{roleInfo.title}</h3>
              <p className="text-[11px] text-white/40 leading-relaxed italic">{roleInfo.desc}</p>
              <div className="absolute top-4 right-4 text-[8px] text-rose-mafia font-mono font-bold">VERIFIED</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 20 }}
        onClick={nextPlayer}
        disabled={!isRevealed}
        className="mt-12 btn-secondary py-3 px-6 text-[10px] uppercase tracking-widest flex items-center gap-2 group"
      >
        {currentPlayerIndex < players.length - 1 ? 'NEXT AGENT' : 'START OPERATIONS'}
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </motion.button>
      
      <div className="mt-8 flex gap-1.5">
        {players.map((_, i) => (
          <div 
            key={i} 
            className={`h-0.5 rounded-full transition-all duration-500 ${i === currentPlayerIndex ? 'w-6 bg-rose-mafia' : 'w-1.5 bg-white/10'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
