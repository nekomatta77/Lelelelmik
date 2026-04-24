/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Trophy, Skull, Users, RotateCcw } from 'lucide-react';
import { Player, GamePhase, GameState } from './types';
import Background from './components/Background';
import GameSetup from './components/Setup';
import RoleReveal from './components/RoleReveal';
import NightPhase from './components/NightPhase';
import DayPhase from './components/DayPhase';

export default function App() {
  // Добавляем состояние для хранения данных пользователя из Telegram
  const [tgUser, setTgUser] = useState<any>(null);

  const [gameState, setGameState] = useState<GameState>({
    players: [],
    phase: 'SETUP',
    round: 1,
    lastKillAttempt: null,
    lastHealTarget: null,
    lastCheckedPlayer: null,
    deathThisRound: null,
    winner: null,
    history: [],
  });

  // Вызываем Telegram Web App при загрузке
  useEffect(() => {
    // Проверяем, существует ли объект Telegram (на случай запуска в обычном браузере)
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); // Говорим Telegram, что приложение готово
      tg.expand(); // Разворачиваем на весь экран для красоты
      
      // Получаем данные пользователя, если приложение открыто в Telegram
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setTgUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  const checkVictory = (currentPlayers: Player[]) => {
    const aliveMafia = currentPlayers.filter(p => p.isAlive && p.role === 'Mafia').length;
    const aliveCivilians = currentPlayers.filter(p => p.isAlive && p.role !== 'Mafia').length;

    if (aliveMafia === 0) return 'Civilians';
    if (aliveMafia >= aliveCivilians) return 'Mafia';
    return null;
  };

  const handleStartGame = (players: Player[]) => {
    setGameState(prev => ({ ...prev, players, phase: 'REVEAL' }));
  };

  const handleRoleRevealComplete = () => {
    setGameState(prev => ({ ...prev, phase: 'NIGHT_START' }));
  };

  const handleNightAction = (targetId: string) => {
    setGameState(prev => {
      let nextPhase: GamePhase = prev.phase;
      let lastKillAttempt = prev.lastKillAttempt;
      let lastHealTarget = prev.lastHealTarget;
      let lastCheckedPlayer = prev.lastCheckedPlayer;

      const hasDetective = prev.players.some(p => p.isAlive && p.role === 'Detective');
      const hasDoctor = prev.players.some(p => p.isAlive && p.role === 'Doctor');

      if (prev.phase === 'NIGHT_START') {
        nextPhase = 'NIGHT_MAFIA';
      } else if (prev.phase === 'NIGHT_MAFIA') {
        lastKillAttempt = targetId;
        nextPhase = hasDetective ? 'NIGHT_DETECTIVE' : (hasDoctor ? 'NIGHT_DOCTOR' : 'DAY_STORY');
      } else if (prev.phase === 'NIGHT_DETECTIVE') {
        if (!targetId && lastCheckedPlayer) {
          // Clear check result
          lastCheckedPlayer = null;
          nextPhase = hasDoctor ? 'NIGHT_DOCTOR' : 'DAY_STORY';
        } else if (targetId) {
          // Perform check
          const target = prev.players.find(p => p.id === targetId);
          lastCheckedPlayer = target ? { id: target.id, role: target.role } : null;
          // Stay in phase to show result
        } else {
          nextPhase = hasDoctor ? 'NIGHT_DOCTOR' : 'DAY_STORY';
        }
      } else if (prev.phase === 'NIGHT_DOCTOR') {
        lastHealTarget = targetId;
        nextPhase = 'DAY_STORY';
      }

      // Determine death if transitioning to day
      let deathThisRound = null;
      let finalPlayers = prev.players;
      let winner = prev.winner;

      if (nextPhase === 'DAY_STORY') {
        if (lastKillAttempt !== lastHealTarget && lastKillAttempt) {
          deathThisRound = lastKillAttempt;
          finalPlayers = prev.players.map(p => 
            p.id === lastKillAttempt ? { ...p, isAlive: false } : p
          );
        }
        winner = checkVictory(finalPlayers);
        if (winner) nextPhase = 'GAME_OVER';
      }

      return {
        ...prev,
        phase: nextPhase,
        lastKillAttempt,
        lastHealTarget,
        lastCheckedPlayer,
        deathThisRound,
        players: finalPlayers,
        winner,
      };
    });
  };

  const handleVote = (targetId: string | null) => {
    setGameState(prev => {
      let finalPlayers = prev.players;
      let winner = prev.winner;
      let nextPhase: GamePhase = 'NIGHT_START';

      if (targetId) {
        finalPlayers = prev.players.map(p => 
          p.id === targetId ? { ...p, isAlive: false } : p
        );
      }

      winner = checkVictory(finalPlayers);
      if (winner) nextPhase = 'GAME_OVER';

      return {
        ...prev,
        players: finalPlayers,
        phase: nextPhase,
        winner,
        round: prev.round + 1,
        lastKillAttempt: null,
        lastHealTarget: null,
        lastCheckedPlayer: null,
        deathThisRound: null,
      };
    });
  };

  const resetGame = () => {
    setGameState({
      players: [],
      phase: 'SETUP',
      round: 1,
      lastKillAttempt: null,
      lastHealTarget: null,
      lastCheckedPlayer: null,
      deathThisRound: null,
      winner: null,
      history: [],
    });
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      
      <div className="game-container">
        {/* Индикатор того, что Telegram SDK успешно загружен и увидел пользователя */}
        {tgUser && (
          <div className="absolute top-4 left-4 z-50 text-[10px] text-white/50 font-mono bg-black/40 px-2 py-1 rounded-md border border-white/10">
            Игрок: {tgUser.first_name}
          </div>
        )}

        <AnimatePresence mode="wait">
          {gameState.phase === 'SETUP' && (
            <GameSetup key="setup" onStart={handleStartGame} />
          )}

          {gameState.phase === 'REVEAL' && (
            <RoleReveal 
              key="reveal" 
              players={gameState.players} 
              onComplete={handleRoleRevealComplete} 
            />
          )}

          {gameState.phase.startsWith('NIGHT') && (
            <NightPhase 
              key="night"
              players={gameState.players}
              phase={gameState.phase}
              onAction={handleNightAction}
              checkedPlayer={gameState.lastCheckedPlayer}
            />
          )}

          {(gameState.phase === 'DAY_STORY' || gameState.phase === 'DAY_VOTING') && (
            <DayPhase 
              key="day"
              players={gameState.players}
              deathId={gameState.deathThisRound}
              isVoting={gameState.phase === 'DAY_VOTING'}
              onStartVoting={() => setGameState(p => ({ ...p, phase: 'DAY_VOTING' }))}
              onVote={handleVote}
            />
          )}

          {gameState.phase === 'GAME_OVER' && (
            <motion.div 
              key="game-over"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center p-8 text-center flex-1"
            >
              <div className="glass-card p-8 w-full flex flex-col items-center border-rose-mafia/20">
                <Trophy className="w-16 h-16 text-rose-mafia mb-6 animate-bounce" />
                <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter">ПОБЕДА</h2>
                <div className={`text-4xl font-black mb-10 tracking-widest ${gameState.winner === 'Mafia' ? 'text-rose-mafia' : 'text-blue-400'}`}>
                  {gameState.winner === 'Mafia' ? 'МАФИИ' : 'МИРНЫХ'}
                </div>
                
                <div className="w-full space-y-2 mb-10 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="text-white/20 uppercase tracking-widest text-[10px] mb-2">Итоги игры</div>
                  {gameState.players.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 glass-card rounded-xl border-white/5 mb-2">
                      <span className={`text-xs font-semibold ${p.isAlive ? 'text-white' : 'text-white/30'}`}>{p.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${p.role === 'Mafia' ? 'bg-rose-mafia/20 text-rose-mafia' : 'bg-blue-400/20 text-blue-400'}`}>
                        {p.role.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={resetGame} className="btn-primary w-full flex items-center justify-center gap-3">
                  <RotateCcw className="w-5 h-5" />
                  НОВАЯ ИГРА
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}