import { api } from "./api";

export const livekitService = {
  getToken: async (sessionId: number) => {
    const { data } =
      await api.get(
         
        `/livekit/token/${sessionId}`
      );

    return data;
  },

  dispatchAgent: async (
  sessionId: number
) => {
  const { data } =
    await api.post(
      "/livekit/dispatch",
      {
        sessionId,
      }
    );

  return data;
},
}