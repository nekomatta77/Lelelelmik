/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Moon, Target, Shield, Eye, CheckCircle2, Clock } from 'lucide-react';
import { Player } from '../types';

interface NightPhaseProps {
  players: Player[];
  myId: string;
  onAction: (targetId: string | null) => void;
  checkedPlayerResult: string | null;
  nightStatus: { Mafia: boolean; Detective: boolean; Doctor: boolean };
}

export default function NightPhase({ players, myId, onAction, checkedPlayerResult, nightStatus }: NightPhaseProps) {
  const me = players.find(p => p.id === myId);
  const [hasActed, setHasActed] = useState(false);

  // Синхронизируем локальный стейт с сервером (чтобы при рефреше кнопки не возвращались)
  useEffect(() => {
    if (me?.role && me.role !== 'Civilian' && nightStatus[me.role as keyof typeof nightStatus]) {
      setHasActed(true);
    }
  }, [me, nightStatus]);

  const handleAction = (id: string | null) => {
    setHasActed(true);
    onAction(id);
  }

  // --- ЭКРАН ОЖИДАНИЯ / НАБЛЮДЕНИЯ (Live Status Feed) ---
  if (!me || !me.isAlive || me.role === 'Civilian' || me.role === null || hasActed) {
    return (
      <motion.div className="flex flex-col items-center justify-start h-full p-6 pt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Moon className="w-16 h-16 text-purple-400 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold uppercase mb-2">Город спит</h2>
        <p className="text-white/50 text-sm mb-10 text-center">Происходят ночные действия...</p>

        {/* ЖИВАЯ ЛЕНТА СТАТУСОВ */}
        <div className="w-full space-y-3">
          
          <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${nightStatus.Mafia ? 'bg-green-500/10 border-green-500/20' : 'bg-black/30 border-white/5'}`}>
            <div className="flex items-center gap-3">
               <Target className={`w-5 h-5 ${nightStatus.Mafia ? 'text-green-400' : 'text-rose-mafia animate-pulse'}`} />
               <div>
                 <p className="text-xs font-bold text-white uppercase">Мафия</p>
                 <p className="text-[10px] text-white/50">{nightStatus.Mafia ? 'Сделала свой выбор' : 'Выходит на охоту...'}</p>
               </div>
            </div>
            {nightStatus.Mafia ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-white/30" />}
          </div>

          <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${nightStatus.Detective ? 'bg-green-500/10 border-green-500/20' : 'bg-black/30 border-white/5'}`}>
            <div className="flex items-center gap-3">
               <Eye className={`w-5 h-5 ${nightStatus.Detective ? 'text-green-400' : 'text-blue-400 animate-pulse'}`} />
               <div>
                 <p className="text-xs font-bold text-white uppercase">Детектив</p>
                 <p className="text-[10px] text-white/50">{nightStatus.Detective ? 'Закончил осмотр' : 'Ищет зацепки...'}</p>
               </div>
            </div>
            {nightStatus.Detective ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-white/30" />}
          </div>

          <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${nightStatus.Doctor ? 'bg-green-500/10 border-green-500/20' : 'bg-black/30 border-white/5'}`}>
            <div className="flex items-center gap-3">
               <Shield className={`w-5 h-5 ${nightStatus.Doctor ? 'text-green-400' : 'text-green-400 animate-pulse'}`} />
               <div>
                 <p className="text-xs font-bold text-white uppercase">Врач</p>
                 <p className="text-[10px] text-white/50">{nightStatus.Doctor ? 'Использовал медикаменты' : 'Спешит на помощь...'}</p>
               </div>
            </div>
            {nightStatus.Doctor ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-white/30" />}
          </div>

        </div>

        {checkedPlayerResult && (
           <div className="mt-8 glass-card p-4 border-blue-400/30 w-full text-center">
              <p className="text-[10px] uppercase text-white/40 mb-1">Результат вашей проверки:</p>
              <p className="text-sm font-bold text-blue-400">{checkedPlayerResult === 'Mafia' ? 'МАФИЯ' : 'ГРАЖДАНИН'}</p>
           </div>
        )}
      </motion.div>
    );
  }

  // --- ЭКРАН ВЫБОРА ДЕЙСТВИЯ (Только для активной роли) ---
  const getPhaseInfo = () => {
    if (me.role === 'Mafia') return { title: 'Твой ход, Мафия', desc: 'Кого устраним сегодня?', icon: Target, color: 'text-rose-mafia' };
    if (me.role === 'Detective') return { title: 'Твой ход, Детектив', desc: 'Узнай правду о горожанине.', icon: Eye, color: 'text-blue-400' };
    return { title: 'Твой ход, Врач', desc: 'Спаси чью-то жизнь.', icon: Shield, color: 'text-green-400' };
  };

  const info = getPhaseInfo();
  const alivePlayers = players.filter(p => p.isAlive);

  return (
    <motion.div className="flex flex-col h-full p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-8 shrink-0">
        <info.icon className={`w-12 h-12 mx-auto mb-3 ${info.color}`} />
        <h2 className="text-2xl font-bold uppercase">{info.title}</h2>
        <p className="text-white/40 text-xs mt-1">{info.desc}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-1 flex-1 pb-4">
        {alivePlayers.map(p => {
          if (me.role === 'Mafia' && p.role === 'Mafia') return null; // Мафия не бьет своих
          return (
            <button key={p.id} onClick={() => handleAction(p.id)} className="glass-card p-4 text-left border-white/10 hover:bg-white/5 active:scale-[0.98]">
              <span className="text-sm font-bold">{p.name}</span>
            </button>
          )
        })}
        <button onClick={() => handleAction(null)} className="p-4 text-center text-[10px] uppercase tracking-widest text-white/20 mt-2">
          Пропустить ход
        </button>
      </div>
    </motion.div>
  );
}