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

  // НАСТРОЙКИ ДРАКОНА (Позиция под названием)
  const DRAGON_IMG = {
    scale: 1.1, // Масштаб дракона
    x: 0,
    y: 0
  };

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
    
    if (isDemo && currentNames.length < 4) {
      const bots = ["Беззубик (Бот)", "Дневная Фурия", "Громгильда", "Сарделька"];
      let i = 0;
      while (currentNames.length < 4) {
        if (!currentNames.includes(bots[i])) currentNames.push(bots[i]);
        i++;
        if (i >= bots.length) i = 0;
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
      // Главный контейнер на весь экран, flex-col
      className="flex flex-col items-center justify-start h-[100dvh] w-full p-4 z-10 overflow-hidden"
    >
      {/* 1. ЗАГОЛОВОК (СВЕРХУ) */}
      <div className="text-center w-full pt-2 shrink-0">
        <span className="text-[10px] uppercase tracking-[0.3em] text-rose-mafia font-bold mb-1 block">
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

      {/* 2. КОНТЕЙНЕР ДЛЯ ДРАКОНА (ТЕПЕРЬ СРАЗУ ПОД НАЗВАНИЕМ) */}
      {/* Мы уменьшили его высоту до 22vh, чтобы освободить место для списка */}
      <div className="w-full flex items-center justify-center relative h-[22vh] mb-4 shrink-0">
        <motion.img 
          src="/assets/DragonMafia.webp" 
          alt="DragonChat Mafia" 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_35px_rgba(176,38,255,0.5)]"
          initial={{ opacity: 0, scale: 0.9, x: DRAGON_IMG.x, y: DRAGON_IMG.y }}
          animate={{ opacity: 1, scale: DRAGON_IMG.scale, x: DRAGON_IMG.x, y: DRAGON_IMG.y }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* 3. ИНТЕРФЕЙС ЛОББИ И КНОПКИ (ТЕПЕРЬ flex-1, ЗАНИМАЕТ ВСЁ МЕСТО) */}
      <motion.div className="w-full flex flex-col flex-1 min-h-0 pb-2">
        {/* glass-card теперь flex-1, чтобы растягиваться */}
        <div className="glass-card w-full p-4 flex flex-col gap-3 flex-1 min-h-0 bg-[#110022]/70">
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

          {/* Список участников flex-1, overflow-y-auto */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-2 custom-scrollbar">
            {names.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#b026ff]/40 text-xs text-center italic py-2">
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

        {/* ПАНЕЛЬ КНОПОК (ВНИЗУ) */}
        <div className="flex gap-2 mt-4 shrink-0 pb-1">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStart(false)}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-[#b026ff]/50 py-4"
          >
            <Play className="w-4 h-4 fill-current" />
            Начать игру
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStart(true)}
            className="btn-secondary flex-none px-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest border border-white/20 py-4"
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