/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { GameState } from './types';
import Background from './components/Background';
import GameSetup from './components/Setup';
import RoleReveal from './components/RoleReveal';
import NightPhase from './components/NightPhase';
import DayPhase from './components/DayPhase';
import DeadScreen from './components/DeadScreen'; // ИМПОРТИРУЕМ НОВЫЙ ЭКРАН

const API_URL = import.meta.env.DEV ? 'http://178.217.99.4:8080' : '';

export default function App() {
  const [tgUser, setTgUser] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    phase: 'SETUP',
    round: 1,
    deathThisRound: null,
    winner: null,
    messages: [],
    detectiveResult: null
  });

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setTgUser(tg.initDataUnsafe.user);
        return;
      }
    }
    setTgUser({ id: 111111, first_name: "Админ (ПК)", username: "homienekomatta" });
  }, []);

  // ОПТИМИЗИРОВАННЫЙ ЦИКЛ ЗАПРОСОВ
  useEffect(() => {
    if (!tgUser) return;
    
    const fetchState = async () => {
      try {
        const res = await fetch(`${API_URL}/api/state?user_id=${tgUser.id}`);
        if (!res.ok) return;
        const data = await res.json();
        
        // 🔥 ГЛАВНАЯ ОПТИМИЗАЦИЯ: Обновляем интерфейс ТОЛЬКО если данные изменились.
        // Это полностью уберет лаги и мерцания каждую секунду!
        setGameState(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
      } catch (err) {
        console.error("Ошибка синхронизации:", err);
      }
    };

    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [tgUser]);

  const apiCall = async (endpoint: string, body: any) => {
    await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: tgUser.id, ...body })
    });
  };

  const handleReady = () => apiCall('/api/ready', {});
  const handleNextPhase = () => apiCall('/api/next_phase', {});
  const handleNightAction = (targetId: string | null) => apiCall('/api/action', { target_id: targetId });
  const handleVote = (targetId: string | null) => apiCall('/api/vote', { target_id: targetId });
  const handleSendMessage = (text: string) => apiCall('/api/chat', { text });

  // Логика состояний игрока
  const me = gameState.players.find(p => p.id === tgUser?.id?.toString());
  const isDead = me && !me.isAlive;
  const isGameOver = gameState.phase === 'GAME_OVER';

  return (
    <div className="relative h-[100dvh] w-full bg-[#0a0014] overflow-hidden flex flex-col">
      <Background />
      <div className="game-container flex-1 bg-transparent w-full max-w-md mx-auto relative flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          
          {/* ЛОББИ - Передаем игроков напряму, чтобы не делать лишних запросов в Setup */}
          {gameState.phase === 'SETUP' && (
            <GameSetup key="setup" players={gameState.players} tgUser={tgUser} />
          )}

          {/* ЭКРАН СМЕРТИ - Показываем если игрок мертв, а игра еще идет */}
          {isDead && !isGameOver && gameState.phase !== 'SETUP' && (
            <DeadScreen key="dead" />
          )}

          {/* ВСЕ ОСТАЛЬНЫЕ ФАЗЫ - Показываем ТОЛЬКО живым игрокам (!isDead) */}
          {!isDead && gameState.phase === 'REVEAL' && (
            <RoleReveal 
              key="reveal" 
              players={gameState.players} 
              myId={tgUser?.id?.toString()}
              onComplete={handleReady} 
            />
          )}

          {!isDead && gameState.phase === 'NIGHT' && (
            <NightPhase 
              key="night"
              players={gameState.players}
              myId={tgUser?.id?.toString()}
              onAction={handleNightAction}
              checkedPlayerResult={gameState.detectiveResult}
            />
          )}

          {!isDead && (gameState.phase === 'DAY_STORY' || gameState.phase === 'DAY_CHAT' || gameState.phase === 'DAY_VOTING') && (
            <DayPhase 
              key="day"
              phase={gameState.phase}
              players={gameState.players}
              myId={tgUser?.id?.toString()}
              deathId={gameState.deathThisRound}
              messages={gameState.messages}
              onNextPhase={handleNextPhase}
              onReadyToVote={handleReady}
              onVote={handleVote}
              onSendMessage={handleSendMessage}
            />
          )}

          {isGameOver && (
            <motion.div key="game-over" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center p-8 text-center h-full w-full z-10">
              <div className="glass-card p-8 w-full flex flex-col items-center border-rose-mafia/40">
                <Trophy className="w-16 h-16 text-rose-mafia mb-6 animate-bounce" />
                <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter">ИГРА ОКОНЧЕНА</h2>
                <div className={`text-2xl font-black mb-10 tracking-widest ${gameState.winner === 'Mafia' ? 'text-rose-mafia' : 'text-blue-400'}`}>
                  ПОБЕДА {gameState.winner === 'Mafia' ? 'МАФИИ' : 'ГОРОЖАН'}
                </div>
                <p className="text-white/50 text-sm">Ожидайте, пока Высший Дракон начнет новую игру...</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}