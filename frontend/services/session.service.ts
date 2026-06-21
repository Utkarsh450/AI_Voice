import { api } from "./api";

export const sessionService = {
  getSessions: async () => {
    const { data } =
      await api.get("/sessions");

    return data;
  },

  getSession: async (
    id: number
  ) => {
    const { data } =
      await api.get(
        `/sessions/${id}`
      );

    return data;
  },

  getMessages: async (
    sessionId: number
  ) => {
    const { data } =
      await api.get(
        `/sessions/${sessionId}/messages`
      );

    return data;
  },

  getSummary: async (
    id: number
  ) => {
    const { data } =
      await api.get(
        `/sessions/${id}/summary`
      );

    return data;
  },
  createSession: async (participantIdentity?: string, persona?: string) => {
    const { data } =
      await api.post(
        "/sessions",
        {
          participant_identity: participantIdentity,
          persona: persona
        }
      );

    return data;
  },
};