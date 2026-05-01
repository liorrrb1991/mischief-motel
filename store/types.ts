export type GuestType = 'normal' | 'odd' | 'supernatural';
export type RoomType = 'standard' | 'cozy';
export type Lighting = 'dark' | 'bright';

export type Choice = {
  label: string;
  tipMultiplier: number;
};

export type GameEvent = {
  id: string;
  description: string;
  choices: Choice[];
};

export type Guest = {
  id: string;
  name: string;
  emoji: string;
  type: GuestType;
  prefersRoomType: RoomType;
  prefersLighting: Lighting | 'any';
  baseTip: number;
  event: GameEvent;
};

export type RoomStatus = 'empty' | 'occupied' | 'event' | 'ready';

export type Room = {
  id: string;
  type: RoomType;
  lighting: Lighting;
  occupiedBy: Guest | null;
  status: RoomStatus;
  assignedAt: number | null;
  eventDelay: number | null;
  pendingEvent: GameEvent | null;
  chosenMultiplier: number | null;
};
