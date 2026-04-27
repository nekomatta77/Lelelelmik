import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Target, Shield, Eye } from 'lucide-react';
import { Player } from '../types';

interface NightPhaseProps {
  players: Player[];
  myId: string;
  onAction: (targetId: string | null) => void;
  checkedPlayerResult: string | null;
}

export default function NightPhase({ players, myId, onAction, checkedPlayerResult }: NightPhaseProps) {
  const me = players.find(p => p.id === myId);
  const [hasActed, setHasActed] = useState(false); // Локально прячем кнопки после хода

  const handleAction = (id: string | null) => {
    setHasActed(true);
    onAction(id);
  }

  // Если игрок мертв или его роль Civilian (мирный), он просто спит
  if (!me || !me.isAlive || me.role === 'Civilian' || me.role === null) {
    return (
      <motion.div className="flex flex-col items-center justify-center h-full p-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Moon className="w-16 h-16 text-purple-400 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold uppercase mb-2">Город засыпает</h2>
        <p className="text-white/50 text-sm">Мафия выходит на охоту. Ждите утра...</p>
      </motion.div>
    );
  }

  const getPhaseInfo = () => {
    if (me.role === 'Mafia') return { title: 'Твой ход, Мафия', desc: 'Кого устраним сегодня?', icon: Target, color: 'text-rose-mafia' };
    if (me.role === 'Detective') return { title: 'Твой ход, Детектив', desc: 'Узнай правду о горожанине.', icon: Eye, color: 'text-blue-400' };
    return { title: 'Твой ход, Врач', desc: 'Спаси чью-то жизнь.', icon: Shield, color: 'text-green-400' };
  };

  const info = getPhaseInfo();
  const alivePlayers = players.filter(p => p.isAlive);

  if (hasActed) {
    return (
       <div className="flex flex-col items-center justify-center h-full p-6 text-center">
         <h2 className="text-xl font-bold text-green-400 uppercase mb-4">Выбор сделан</h2>
         {checkedPlayerResult && (
           <div className="glass-card p-4 border-blue-400/30">
              <p className="text-[10px] uppercase text-white/40 mb-1">Результат проверки:</p>
              <p className="text-sm font-bold text-blue-400">{checkedPlayerResult === 'Mafia' ? 'МАФИЯ' : 'ГРАЖДАНИН'}</p>
           </div>
         )}
         <p className="text-white/40 text-xs mt-4">Ожидание других игроков...</p>
       </div>
    );
  }

  return (
    <motion.div className="flex flex-col h-full p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-8 shrink-0">
        <info.icon className={`w-12 h-12 mx-auto mb-3 ${info.color}`} />
        <h2 className="text-2xl font-bold uppercase">{info.title}</h2>
        <p className="text-white/40 text-xs mt-1">{info.desc}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-1 flex-1 pb-4">
        {alivePlayers.map(p => {
          // Мафия не может убить себя (в базовых правилах)
          if (me.role === 'Mafia' && p.role === 'Mafia') return null;
          
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