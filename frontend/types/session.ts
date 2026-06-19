export interface Session {
  id: number;
  roomName: string;
  participantIdentity: string;
  status: string;
  persona: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
}

export interface Message {
  id: number;
  speaker: string;
  content: string;
  timestamp: string;
  sessionId: number;
}

export interface Summary {
  id: number;
  summary: string;
  actionItems: string | null;
  sessionId: number;
}