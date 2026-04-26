/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Trash2, Play } from 'lucide-react';
import { Player, Role } from '../types';

interface SetupProps {
  onStart: (players: Player[]) => void;
}

export default function GameSetup({ onStart }: SetupProps) {
  const [names, setNames] = useState<string[]>(() => {
    // Пытаемся получить игроков из URL-ссылки, которую прислал бот
    const params = new URLSearchParams(window.location.search);
    const playersParam = params.get('players');
    if (playersParam) {
      return playersParam.split(',');
    }
    // Если зашли просто так (без бота), показываем дефолтных
    return ['Алексей', 'Мария', 'Иван', 'Елена', 'Дмитрий', 'Анна']; 
});

  const [newName, setNewName] = useState('');

  const [error, setError] = useState<string | null>(null);

  const addPlayer = () => {
    if (newName.trim()) {
      setNames([...names, newName.trim()]);
      setNewName('');
      setError(null);
    }
  };

  const removePlayer = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (names.length < 4) {
      setError('Нужно минимум 4 игрока для начала игры');
      return;
    }

    // Shuffle roles
    // 1 Mafia for 4-6 players, 2 for 7-9, etc.
    const mafiaCount = Math.max(1, Math.floor(names.length / 4));
    const detectiveCount = 1;
    const doctorCount = 1;
    
    let roles: Role[] = [];
    for (let i = 0; i < mafiaCount; i++) roles.push('Mafia');
    for (let i = 0; i < detectiveCount; i++) roles.push('Detective');
    for (let i = 0; i < doctorCount; i++) roles.push('Doctor');
    while (roles.length < names.length) roles.push('Civilian');

    // Shuffle roles array
    roles = roles.sort(() => Math.random() - 0.5);

    const players: Player[] = names.map((name, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      role: roles[i],
      isAlive: true,
      isRevealed: false,
    }));

    onStart(players);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center h-full p-8 w-full"
    >
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-rose-mafia font-bold mb-2 block">Shadow Syndicate</span>
        <motion.h1 
          className="text-4xl font-bold tracking-tight mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          MAFIA <span className="role-serif text-rose-mafia">Lounge</span>
        </motion.h1>
      </div>

      <div className="glass-card w-full p-5 flex flex-col gap-4 max-h-[50vh]">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-mafia" />
            <span className="font-semibold text-sm">ИГРОКИ ({names.length})</span>
          </div>
        </div>

        <div className="overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {names.map((name, i) => (
              <motion.div
                key={i + name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-white/5">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <span className="font-medium text-xs tracking-wide">{name}</span>
                </div>
                <button 
                  onClick={() => removePlayer(i)}
                  className="p-2 text-white/20 hover:text-rose-mafia transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-2 flex gap-2">
          <input 
            type="text" 
            placeholder="Имя..."
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError(null);
            }}
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-xs outline-none focus:border-rose-mafia/30 transition-all font-medium"
          />
          <button 
            onClick={addPlayer}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            <Plus className="w-5 h-5 text-rose-mafia" />
          </button>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-rose-mafia text-[10px] font-bold text-center mt-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        className="btn-primary mt-8 w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
      >
        <Play className="w-4 h-4 fill-current" />
        Начать раздачу
      </motion.button>
    </motion.div>
  );
}
