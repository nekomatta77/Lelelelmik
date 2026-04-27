/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Mafia' | 'Detective' | 'Doctor' | 'Civilian' | null;

export type GamePhase = 
  | 'SETUP' 
  | 'REVEAL' 
  | 'NIGHT'
  | 'DAY_STORY' 
  | 'DAY_CHAT'
  | 'DAY_VOTING' 
  | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  ready: boolean;
}

export interface ChatMessage {
  sender: string;
  text: string;
  isSystem: boolean;
}

export interface GameState {
  players: Player[];
  phase: GamePhase;
  round: number;
  deathThisRound: string | null;
  winner: 'Mafia' | 'Civilians' | null;
  messages: ChatMessage[];
  detectiveResult: string | null;
  nightStatus: {
    Mafia: boolean;
    Detective: boolean;
    Doctor: boolean;
  };
  voteCounts: Record<string, number>;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}