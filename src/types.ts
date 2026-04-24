/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Mafia' | 'Detective' | 'Doctor' | 'Civilian';

export type GamePhase = 
  | 'SETUP' 
  | 'REVEAL' 
  | 'NIGHT_START'
  | 'NIGHT_MAFIA'
  | 'NIGHT_DETECTIVE'
  | 'NIGHT_DOCTOR'
  | 'DAY_STORY' 
  | 'DAY_VOTING' 
  | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  isRevealed: boolean;
}

export interface GameState {
  players: Player[];
  phase: GamePhase;
  round: number;
  lastKillAttempt: string | null;
  lastHealTarget: string | null;
  lastCheckedPlayer: { id: string; role: Role } | null;
  deathThisRound: string | null;
  winner: 'Mafia' | 'Civilians' | null;
  history: string[];
}

// Расширяем глобальный объект Window для Telegram Web App
declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}