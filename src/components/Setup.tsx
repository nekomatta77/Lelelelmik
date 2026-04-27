/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, FlaskConical } from 'lucide-react';
import { Player, Role } from '../types';

interface SetupProps {
  onStart: (players: Player[]) => void;
  tgUser: any;
}

export default function GameSetup({ onStart, tgUser }: SetupProps) {
  const [names, setNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://178.217.99.4:8080';

  // НАСТРОЙКИ ПОЗИЦИИ И РАЗМЕРА ДРАКОНА
  const DRAGON_IMG = { scale: 1.0, x: 0, y: 0 };

  useEffect(() => {
    if (tgUser && tgUser.first_name) {
      fetch(`${API_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: tgUser.first_name, action: "join" })
      }).catch(err => console.error("Ошибка при подключении к лобби", err));
    }
  }, [tgUser]);

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

    fetchLobby();
    const interval = setInterval(fetchLobby, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = (isDemo = false) => {
    let currentNames = [...names];
    
    // 🧪 ДЕМО-РЕЖИМ: Если игроков меньше 4, добавляем ботов
    if (isDemo && currentNames.length < 4) {
      const bots = ["Дракон-бот 1", "Дракон-бот 2", "Дракон-бот 3", "Дракон-бот 4"];
      let i = 0;
      while (currentNames.length < 4) {
        if (!currentNames.includes(bots[i])) currentNames.push(bots[i]);
        i++;
      }
    } else if (currentNames.length < 4) {
      setError('Нужно минимум 4 дракона для начала игры');
      return;
    }

    const mafiaCount = Math.max(1, Math.floor(currentNames.length / 4));
    const detectiveCount = 1;
    const doctorCount = 1;
    
    let roles: Role[] = [];
    for (let i = 0; i < mafiaCount; i++) roles.push('Mafia');
    for (let i = 0; i < detectiveCount; i++) roles.push('Detective');
    for (let i = 0; i < doctorCount; i++) roles.push('Doctor');
    while (roles.length < currentNames.length) roles.push('Civilian');

    roles = roles.sort(() => Math.random() - 0.5);

    const players: Player[] = currentNames.map((name, i) => ({
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      // h-[100dvh] и overflow-hidden делают страницу нескроллируемой
      className="flex flex-col items-center justify-between h-[100dvh] w-full p-4 z-10 overflow-hidden"
    >
      {/* ИЗОБРАЖЕНИЕ (Умеет само сжиматься) */}
      <div className="flex-1 min-h-0 flex items-center justify-center w-full relative">
        <motion.img 
          src="/assets/DragonMafia.webp" 
          alt="DragonChat Mafia" 
          className="max-h-[90%] max-w-[80%] object-contain drop-shadow-[0_0_25px_rgba(176,38,255,0.4)]"
          initial={{ opacity: 0, scale: 0.9, x: DRAGON_IMG.x, y: DRAGON_IMG.y }}
          animate={{ opacity: 1, scale: DRAGON_IMG.scale, x: DRAGON_IMG.x, y: DRAGON_IMG.y }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* ИНТЕРФЕЙС ЛОББИ */}
      <motion.div className="w-full flex flex-col shrink-0 max-h-[60vh]">
        <div className="text-center mb-3">
          <span className="text-[9px] uppercase tracking-[0.3em] text-rose-mafia font-bold mb-1 block">
            @caburacasino
          </span>
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            DRAGONCHAT <span className="role-serif text-rose-mafia">Mafia</span>
          </motion.h1>
        </div>

        <div className="glass-card w-full p-4 flex flex-col gap-3 max-h-[30vh] bg-[#110022]/60">
          <div className="flex items-center justify-between border-b border-[#b026ff]/20 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-mafia" />
              <span className="font-semibold text-xs text-[#e0b0ff]">ЛОГОВО ({names.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              <span className="text-[9px] text-white/50 uppercase tracking-widest">В сети</span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-1 space-y-2 custom-scrollbar">
            {names.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#b026ff]/40 text-xs text-center italic">
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
                    className="flex items-center p-2 bg-[#4b0082]/20 rounded-xl border border-[#b026ff]/20 shadow-sm"
                  >
                    <div className="w-6 h-6 shrink-0 rounded-full bg-[#4b0082]/60 flex items-center justify-center text-[9px] font-bold border border-[#b026ff]/50 mr-2 text-[#e0b0ff]">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span className="font-medium text-xs tracking-wide text-white truncate">{name}</span>
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
                className="text-rose-mafia text-[10px] font-bold text-center mt-1 shrink-0"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ПАНЕЛЬ КНОПОК */}
        <div className="flex gap-2 mt-4 shrink-0">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStart(false)}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-[#b026ff]/50"
          >
            <Play className="w-4 h-4 fill-current" />
            Начать
          </motion.button>
          
          {/* КНОПКА ДЕМО-РЕЖИМА */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStart(true)}
            className="btn-secondary flex-none px-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest border border-white/20"
            title="Запустить с ботами для теста"
          >
            <FlaskConical className="w-4 h-4" />
            Демо
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}