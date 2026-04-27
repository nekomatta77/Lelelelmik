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
  const [names, setNames] = useState<any[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Определяем URL API: на компьютере (DEV) используем IP сервера, на Vercel — прокси
  const API_URL = import.meta.env.DEV ? 'http://178.217.99.4:8080' : '';

  const DRAGON_IMG = { scale: 1.1, x: 0, y: 0 };

  // 1. Автоматическое добавление игрока в лобби при входе
  useEffect(() => {
    if (tgUser) {
      const displayName = tgUser.username ? `@${tgUser.username}` : tgUser.first_name;
      
      fetch(`${API_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: tgUser.id, 
          user_name: displayName, 
          username: tgUser.username || "",
          action: "join" 
        })
      }).catch(err => console.error("Ошибка при входе в лобби:", err));
    }
  }, [tgUser, API_URL]);

  // 2. Постоянное обновление списка игроков (раз в 2 секунды)
  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const res = await fetch(`${API_URL}/api/lobby`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        if (data.players) setNames(data.players);
        if (data.admins) setAdmins(data.admins);

        // Если сервер перевел фазу в REVEAL (игра началась)
        if (data.phase === 'REVEAL' && data.players.length > 0) {
          const formattedPlayers: Player[] = data.players.map((p: any) => ({
            id: p.id,
            name: p.name,
            role: p.role || 'Civilian',
            isAlive: true,
            isRevealed: false
          }));
          onStart(formattedPlayers);
        }
      } catch (err: any) {
        console.error("Ошибка обновления лобби:", err);
      }
    };
    
    fetchLobby();
    const interval = setInterval(fetchLobby, 2000);
    return () => clearInterval(interval);
  }, [onStart, API_URL]);

  const handleStart = async (isDemo = false) => {
    let currentNames = [...names];
    
    if (isDemo && currentNames.length < 4) {
      const bots = [
        { id: "b1", name: "Игрок 1", username: "" },
        { id: "b2", name: "Игрок 2", username: "" },
        { id: "b3", name: "Игрок 3", username: "" },
        { id: "b4", name: "Игрок 4", username: "" }
      ];
      let i = 0;
      while (currentNames.length < 4) {
        if (!currentNames.some(p => p.name === bots[i].name)) currentNames.push(bots[i]);
        i++;
      }
    } else if (currentNames.length < 4) {
      setError('Нужно минимум 4 игрока для начала игры');
      return;
    }

    if (!isDemo && tgUser?.username) {
      try {
        const res = await fetch(`${API_URL}/api/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: tgUser.username })
        });
        const data = await res.json();
        if (data.status === 'error') {
          setError(data.message);
          return;
        }
      } catch (e: any) {
        setError(`Ошибка запуска: ${e.message}`);
        return;
      }
    }

    // Если это демо-режим, раздаем роли локально
    if (isDemo) {
        const mafiaCount = Math.max(1, Math.floor(currentNames.length / 4));
        let roles: Role[] = [];
        for (let i = 0; i < mafiaCount; i++) roles.push('Mafia');
        roles.push('Detective');
        roles.push('Doctor');
        while (roles.length < currentNames.length) roles.push('Civilian');
        roles = roles.sort(() => Math.random() - 0.5);

        const players: Player[] = currentNames.map((p, i) => ({
          id: p.id || Math.random().toString(36).substr(2, 9),
          name: p.name,
          role: roles[i],
          isAlive: true,
          isRevealed: false,
        }));
        onStart(players);
    }
  };

  const myUsername = tgUser?.username?.replace("@", "").toLowerCase();
  const isAdmin = myUsername && admins.map(a => a.toLowerCase()).includes(myUsername);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      className="flex flex-col items-center justify-start h-[100dvh] w-full p-4 z-10 overflow-hidden"
    >
      <div className="text-center w-full pt-4 shrink-0">
        <span className="text-[10px] uppercase tracking-[0.3em] text-rose-mafia font-bold mb-1 block">
          @caburacasino
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          DRAGONCHAT <span className="role-serif text-rose-mafia">Mafia</span>
        </h1>
      </div>

      <div className="w-full flex items-center justify-center relative h-[20vh] mb-4 shrink-0">
        <motion.img 
          src="/assets/DragonMafia.webp" 
          alt="DragonChat Mafia" 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_35px_rgba(176,38,255,0.5)]" 
          initial={{ opacity: 0, scale: 0.9, x: DRAGON_IMG.x, y: DRAGON_IMG.y }} 
          animate={{ opacity: 1, scale: DRAGON_IMG.scale, x: DRAGON_IMG.x, y: DRAGON_IMG.y }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
        />
      </div>

      <motion.div className="w-full flex flex-col flex-1 min-h-0 pb-2">
        <div className="glass-card w-full p-4 flex flex-col gap-3 flex-1 min-h-0 bg-[#110022]/70">
          <div className="flex items-center justify-between border-b border-[#b026ff]/20 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-mafia" />
              <span className="font-semibold text-xs text-[#e0b0ff]">УЧАСТНИКИ ({names.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">LOBBY</span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-1 space-y-2 custom-scrollbar">
            {names.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#b026ff]/40 text-xs text-center italic py-2">
                Ожидание игроков...
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {names.map((p, i) => (
                  <motion.div 
                    key={p.id || i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 10 }} 
                    className="flex items-center p-2 bg-[#4b0082]/20 rounded-xl border border-[#b026ff]/20 shadow-sm"
                  >
                    <div className="w-6 h-6 shrink-0 rounded-full bg-[#4b0082]/60 flex items-center justify-center text-[9px] font-bold border border-[#b026ff]/50 mr-2 text-[#e0b0ff]">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span className="font-medium text-xs tracking-wide text-white truncate">{p.name}</span>
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

        <div className="flex gap-2 mt-4 shrink-0 pb-1">
          {isAdmin ? (
            <>
              <motion.button 
                whileTap={{ scale: 0.95 }} 
                onClick={() => handleStart(false)} 
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-[#b026ff]/50 py-4"
              >
                <Play className="w-4 h-4 fill-current" /> Начать игру
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }} 
                onClick={() => handleStart(true)} 
                className="btn-secondary flex-none px-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest border border-white/20 py-4"
              >
                <FlaskConical className="w-4 h-4" /> Демо
              </motion.button>
            </>
          ) : (
            <div className="text-[#b026ff]/60 text-xs text-center w-full py-4 border border-[#b026ff]/20 rounded-xl bg-[#4b0082]/10 italic">
              Ожидаем запуск игры администратором...
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}