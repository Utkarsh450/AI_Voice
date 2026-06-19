import {api} from "./api";

export const recordingService = {
  async getRecording(
    sessionId: number
  ) {
    const { data } =
      await api.get(
        `/recordings/session/${sessionId}`
      );

    return data;
  },
};