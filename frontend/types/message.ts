export interface Message {
  id: number;
  speaker: "USER" | "ASSISTANT";
  content: string;
  timestamp: string;
  sessionId: number;
  
}


export interface LiveMessage {
  speaker: "USER" | "ASSISTANT";
  text: string;
}
