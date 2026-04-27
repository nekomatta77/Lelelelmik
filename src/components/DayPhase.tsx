/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, MessageSquare, Vote, Send } from 'lucide-react';
import { Player, ChatMessage, GamePhase } from '../types';

interface DayPhaseProps {
  phase: GamePhase;
  players: Player[];
  myId: string;
  deathId: string | null;
  messages: ChatMessage[];
  voteCounts: Record<string, number>;
  onNextPhase: () => void;
  onReadyToVote: () => void;
  onVote: (targetId: string | null) => void;
  onSendMessage: (text: string) => void;
}

export default function DayPhase({ phase, players, myId, deathId, messages, voteCounts, onNextPhase, onReadyToVote, onVote, onSendMessage }: DayPhaseProps) {
  const victim = players.find(p => p.id === deathId);
  const me = players.find(p => p.id === myId);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const formatVotes = (count: number) => {
    if (count === 1) return `${count} голос`;
    if (count > 1 && count < 5) return `${count} голоса`;
    return `${count} голосов`;
  };

  return (
    <motion.div className="flex flex-col h-full p-4 pb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-4 shrink-0 mt-4">
        {phase === 'DAY_VOTING' ? <Vote className="w-10 h-10 mx-auto mb-2 text-rose-mafia" /> : <Sun className="w-10 h-10 mx-auto mb-2 text-yellow-400" />}
        <h2 className="text-xl font-bold uppercase">
          {phase === 'DAY_STORY' ? 'Наступило утро' : phase === 'DAY_CHAT' ? 'Дневное обсуждение' : 'Голосование'}
        </h2>
      </div>

      {/* --- ЭКРАН ИСТОРИИ (УТРО) --- */}
      {phase === 'DAY_STORY' && (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="glass-card p-8 text-center border-white/10 w-full mb-6">
            {victim ? (
              <>
                <p className="text-white/60 text-xs uppercase mb-2">Этой ночью город потерял:</p>
                <p className="text-2xl font-black text-rose-mafia mb-4">{victim.name}</p>
                <p className="text-[10px] text-white/40">Его роль навсегда останется тайной.</p>
              </>
            ) : (
              <p className="text-lg font-bold text-green-400 uppercase">Ночь прошла спокойно.<br/>Погибших нет.</p>
            )}
          </div>
          <button onClick={onNextPhase} className="btn-primary w-full py-4 uppercase tracking-widest text-sm">
            Перейти к обсуждению
          </button>
        </div>
      )}

      {/* --- ЭКРАН ЧАТА И СИНХРОНИЗАЦИИ --- */}
      {phase === 'DAY_CHAT' && (
        <div className="flex flex-col flex-1 min-h-0 bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.length === 0 ? (
              <p className="text-center text-white/30 text-xs italic mt-10">Чат синхронизирован с Telegram.<br/>Напишите что-нибудь!</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.sender === me?.name ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-white/40 mb-1 px-1">{m.sender}</span>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${m.sender === me?.name ? 'bg-rose-mafia/80 text-white rounded-br-sm' : 'bg-[#4b0082]/60 text-white rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-3 bg-white/5 border-t border-white/10 flex gap-2 shrink-0">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Введите сообщение..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-mafia/50 transition-colors"
            />
            <button onClick={handleSend} className="bg-rose-mafia text-white p-2 rounded-xl active:scale-95 transition-transform flex items-center justify-center">
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
          
          <div className="p-2 shrink-0">
            <button onClick={onReadyToVote} disabled={me?.ready || !me?.isAlive} className={`w-full py-3 rounded-xl uppercase tracking-widest text-[10px] font-bold transition-all ${me?.ready ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/60 hover:bg-white/20 active:scale-95'}`}>
              {me?.ready ? 'Ожидание других игроков...' : me?.isAlive ? 'Готов голосовать' : 'Вы мертвы (наблюдение)'}
            </button>
          </div>
        </div>
      )}

      {/* --- ЭКРАН ГОЛОСОВАНИЯ --- */}
      {phase === 'DAY_VOTING' && (
        <div className="flex-1 flex flex-col overflow-hidden">
           <p className="text-center text-xs text-white/40 uppercase mb-4 shrink-0">Кто мафия? Голосуйте.</p>
           <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
             {players.filter(p => p.isAlive).map(p => {
               const votes = voteCounts[p.id] || 0;
               return (
                 <button 
                   key={p.id} 
                   onClick={() => onVote(p.id)} 
                   disabled={!me?.isAlive || me?.ready} 
                   className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between ${p.id === myId ? 'hidden' : ''} ${me?.ready ? 'opacity-70 border-white/5 bg-white/5 cursor-not-allowed' : 'border-white/10 bg-black/20 hover:bg-rose-mafia/20 active:scale-[0.98]'}`}
                 >
                   <span className="text-sm font-bold">{p.name}</span>
                   
                   {/* ЖИВОЙ БЕЙДЖ ГОЛОСОВ */}
                   <AnimatePresence>
                     {votes > 0 && (
                       <motion.span 
                         initial={{ opacity: 0, scale: 0.8 }} 
                         animate={{ opacity: 1, scale: 1 }} 
                         className="bg-rose-mafia/80 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                       >
                         {formatVotes(votes)}
                       </motion.span>
                     )}
                   </AnimatePresence>
                 </button>
               )
             })}
             <button 
               onClick={() => onVote(null)} 
               disabled={!me?.isAlive || me?.ready}
               className="w-full p-3 text-[10px] uppercase text-white/30 border border-white/5 rounded-xl mt-4"
             >
               Пропустить голосование
             </button>
           </div>
        </div>
      )}
    </motion.div>
  );
}