import { Guest, Room } from './types';

export const GUEST_TEMPLATES: Guest[] = [
  {
    id: 'marge',
    name: 'Marge',
    emoji: '😌',
    type: 'normal',
    prefersRoomType: 'standard',
    prefersLighting: 'bright',
    baseTip: 20,
    event: {
      id: 'marge_event',
      description: "Marge can't sleep — the neon sign hums.",
      choices: [
        { label: 'Kill the neon', tipMultiplier: 1.5 },
        { label: 'Apologize and offer earplugs', tipMultiplier: 1.0 },
      ],
    },
  },
  {
    id: 'carl',
    name: 'Conspiracy Carl',
    emoji: '👀',
    type: 'odd',
    prefersRoomType: 'standard',
    prefersLighting: 'dark',
    baseTip: 35,
    event: {
      id: 'carl_event',
      description: 'Carl wants the windows lined with foil.',
      choices: [
        { label: 'Bring the foil', tipMultiplier: 1.5 },
        { label: 'Insist there are no cameras', tipMultiplier: 1.0 },
      ],
    },
  },
  {
    id: 'whiskers',
    name: 'Mrs. Whiskers',
    emoji: '🐱',
    type: 'odd',
    prefersRoomType: 'cozy',
    prefersLighting: 'any',
    baseTip: 30,
    event: {
      id: 'whiskers_event',
      description: 'A cat got into the vents.',
      choices: [
        { label: 'Send Clyde the handyman', tipMultiplier: 1.5 },
        { label: 'Offer a refund discount', tipMultiplier: 1.0 },
      ],
    },
  },
  {
    id: 'vlad',
    name: 'Vlad',
    emoji: '🧛',
    type: 'supernatural',
    prefersRoomType: 'cozy',
    prefersLighting: 'dark',
    baseTip: 80,
    event: {
      id: 'vlad_event',
      description: 'Sunlight is leaking around the curtains.',
      choices: [
        { label: 'Hang blackout curtains', tipMultiplier: 1.5 },
        { label: 'Check him out early', tipMultiplier: 1.0 },
      ],
    },
  },
  {
    id: 'cloud',
    name: 'Mr. Cloud',
    emoji: '👻',
    type: 'supernatural',
    prefersRoomType: 'cozy',
    prefersLighting: 'any',
    baseTip: 70,
    event: {
      id: 'cloud_event',
      description: 'Cloud is leaking under the door into the hallway.',
      choices: [
        { label: 'Weatherstrip the door', tipMultiplier: 1.5 },
        { label: 'Open windows and disperse him', tipMultiplier: 1.0 },
      ],
    },
  },
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'r1', type: 'standard', lighting: 'bright', occupiedBy: null, status: 'empty', assignedAt: null, eventDelay: null, pendingEvent: null, chosenMultiplier: null },
  { id: 'r2', type: 'standard', lighting: 'bright', occupiedBy: null, status: 'empty', assignedAt: null, eventDelay: null, pendingEvent: null, chosenMultiplier: null },
  { id: 'r3', type: 'standard', lighting: 'bright', occupiedBy: null, status: 'empty', assignedAt: null, eventDelay: null, pendingEvent: null, chosenMultiplier: null },
  { id: 'r4', type: 'standard', lighting: 'bright', occupiedBy: null, status: 'empty', assignedAt: null, eventDelay: null, pendingEvent: null, chosenMultiplier: null },
];
