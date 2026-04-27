/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, Settings, Plus, Minus } from 'lucide-react';
import { Player } from '../types';

interface SetupProps {
  players: Player[];
  tgUser: any;
}

export default function GameSetup({ players, tgUser }: SetupProps) {
  const [admins, setAdmins] = useState<string[]>([]);
  const [roleSettings, setRoleSettings] = useState<Record<string, number>>({
    Mafia: 1,
    Detective: 1,
    Doctor: 1
  });
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.DEV ? 'http://178.217.99.4:8080' : '';

  useEffect(() => {
    if (tgUser) {
      const displayName = tgUser.username ? `@${tgUser.username}` : tgUser.first_name;
      fetch(`${API_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: tgUser.id, 
          user_name: displayName, 
          username: tgUser.username || ""
        })
      }).catch(err => console.error(err));
    }
  }, [tgUser, API_URL]);

  // Получаем админов и текущие настройки с сервера
  useEffect(() => {
    fetch(`${API_URL}/api/lobby`)
      .then(res => res.json())
      .then(data => {
        if (data.admins) setAdmins(data.admins);
        if (data.settings?.roles) setRoleSettings(data.settings.roles);
      })
      .catch(err => console.error(err));
  }, [API_URL]);

  const updateRoleCount = async (role: string, delta: number) => {
    const newVal = Math.max(0, (roleSettings[role] || 0) + delta);
    const newSettings = { ...roleSettings, [role]: newVal };
    setRoleSettings(newSettings);

    // Сразу сохраняем на сервер
    await fetch(`${API_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: tgUser.username, roles: newSettings })
    });
  };

  const handleStart = async () => {
    const totalActiveRoles = Object.values(roleSettings).reduce((a, b) => a + b, 0);
    if (players.length < 4) {
      setError('Нужно минимум 4 игрока');
      return;
    }
    if (totalActiveRoles >= players.length) {
      setError('Слишком много ролей для такого числа игроков');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: tgUser.username })
      });
      const data = await res.json();
      if (data.status === 'error') setError(data.message);
    } catch (e: any) {
      setError(`Ошибка: ${e.message}`);
    }
  };

  const myUsername = tgUser?.username?.replace("@", "").toLowerCase();
  const isAdmin = myUsername && admins.map(a => a.toLowerCase()).includes(myUsername);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-start h-[100dvh] w-full p-4 z-10 overflow-hidden">
      <div className="text-center w-full pt-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">DRAGONCHAT <span className="role-serif text-rose-mafia">Mafia</span></h1>
      </div>

      <motion.div className="w-full flex flex-col flex-1 min-h-0 pb-2 mt-4 space-y-4">
        
        {/* СПИСОК ИГРОКОВ */}
        <div className="glass-card w-full p-4 flex flex-col gap-3 h-1/2 bg-[#110022]/70">
          <div className="flex items-center justify-between border-b border-[#b026ff]/20 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-mafia" />
              <span className="font-semibold text-xs text-[#e0b0ff]">УЧАСТНИКИ ({players.length})</span>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-1 space-y-2 custom-scrollbar">
            {players.map((p, i) => (
              <div key={p.id} className="flex items-center p-2 bg-[#4b0082]/20 rounded-xl border border-[#b026ff]/20">
                <span className="text-xs text-white truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* НАСТРОЙКИ (Только для админа) */}
        {isAdmin && (
          <div className="glass-card w-full p-4 flex flex-col gap-3 bg-[#110022]/70 border-blue-500/30">
            <div className="flex items-center gap-2 border-b border-blue-500/20 pb-2">
              <Settings className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-xs text-blue-100 uppercase">Настройка ролей</span>
            </div>
            <div className="space-y-3">
              {Object.entries(roleSettings).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/80">{role === 'Mafia' ? 'Мафия' : role === 'Detective' ? 'Детектив' : 'Врач'}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateRoleCount(role, -1)} className="p-1 rounded-lg bg-white/5 border border-white/10 active:scale-90"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-bold w-4 text-center">{count}</span>
                    <button onClick={() => updateRoleCount(role, 1)} className="p-1 rounded-lg bg-white/5 border border-white/10 active:scale-90"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 shrink-0">
          <AnimatePresence>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-mafia text-[10px] font-bold text-center">{error}</motion.p>}
          </AnimatePresence>
          
          {isAdmin ? (
            <button onClick={handleStart} className="btn-primary w-full flex items-center justify-center gap-2 text-xs uppercase py-4">
              <Play className="w-4 h-4 fill-current" /> Начать битву
            </button>
          ) : (
            <div className="text-[#b026ff]/60 text-xs text-center w-full py-4 border border-[#b026ff]/20 rounded-xl bg-[#4b0082]/10 italic">
              Ожидание Высшего Дракона...
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}