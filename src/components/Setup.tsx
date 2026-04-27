/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play } from 'lucide-react';
import { Player, Role } from '../types';

interface SetupProps {
  onStart: (players: Player[]) => void;
  tgUser: any;
}

export default function GameSetup({ onStart, tgUser }: SetupProps) {
  const [names, setNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ТВОЙ НАСТОЯЩИЙ IP АДРЕС СЕРВЕРА
  const API_URL = 'http://178.217.99.4:8080';

  // Автоматическое добавление игрока в лобби при заходе
  useEffect(() => {
    if (tgUser && tgUser.first_name) {
      fetch(`${API_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: tgUser.first_name, action: "join" })
      }).catch(err => console.error("Ошибка при подключении к лобби", err));
    }
  }, [tgUser]);

  // Запрос списка игроков с сервера каждые 2 секунды
  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const res = await fetch(`${API_URL}/api/lobby`);
        const data = await res.json();
        if (data.players) {
          setNames(data.players);
        }
      } catch (err) {
        console.error("Не удалось получить список лобби", err);
      }
    };

    fetchLobby(); // Вызываем сразу
    const interval = setInterval(fetchLobby, 2000); // И затем каждые 2 сек
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (names.length < 4) {
      setError('Нужно минимум 4 дракона для начала игры');
      return;
    }

    const mafiaCount = Math.max(1, Math.floor(names.length / 4));
    const detectiveCount = 1;
    const doctorCount = 1;
    
    let roles: Role[] = [];
    for (let i = 0; i < mafiaCount; i++) roles.push('Mafia');
    for (let i = 0; i < detectiveCount; i++) roles.push('Detective');
    for (let i = 0; i < doctorCount; i++) roles.push('Doctor');
    while (roles.length < names.length) roles.push('Civilian');

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
      className="flex flex-col items-center justify-center h-full p-8 w-full z-10"
    >
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-rose-mafia font-bold mb-2 block">Shadow Syndicate</span>
        <motion.h1 
          className="text-4xl font-bold tracking-tight mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          DRAGONCHAT <span className="role-serif text-rose-mafia">Mafia</span>
        </motion.h1>
      </div>

      <div className="glass-card w-full p-5 flex flex-col gap-4 max-h-[50vh]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-mafia" />
            <span className="font-semibold text-sm">ЛОГОВО ДРАКОНОВ ({names.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">В сети</span>
          </div>
        </div>

        <div className="overflow-y-auto pr-1 space-y-2 custom-scrollbar min-h-[150px]">
          {names.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/30 text-xs text-center italic">
              Ждем первых драконов...
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {names.map((name, i) => (
                <motion.div
                  key={i + name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center p-3 bg-white/5 rounded-2xl border border-white/10 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-[#4b0082]/50 flex items-center justify-center text-[10px] font-bold border border-[#b026ff]/30 mr-3">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <span className="font-medium text-xs tracking-wide">{name}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
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
        Начать игру
      </motion.button>
    </motion.div>
  );
}