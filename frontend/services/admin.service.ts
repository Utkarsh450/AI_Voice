import { api } from "./api";

export const adminService = {
  getStats: async () => {
    const { data } =
      await api.get(
        "/admin/stats"
      );

    return data;
  },

  getCallsTrend: async () => {
    const { data } =
      await api.get(
        "/admin/calls-trend"
      );

    return data;
  },

  getRecentSessions:
    async () => {
      const { data } =
        await api.get(
          "/admin/recent-sessions"
        );

      return data;
    },

  getTopUsers:
    async () => {
      const { data } =
        await api.get(
          "/admin/top-users"
        );

      return data;
    },

  getPersonaDistribution:
    async () => {
      const { data } =
        await api.get(
          "/admin/persona-distribution"
        );

      return data;
    },

  getHealth:
    async () => {
      const { data } =
        await api.get(
          "/admin/health"
        );

      return data;
    },

  getUsers:
    async () => {
      const { data } =
        await api.get(
          "/admin/users"
        );

      return data;
    },

  getUser:
    async (
      userId: string
    ) => {
      const { data } =
        await api.get(
          `/admin/users/${userId}`
        );

      return data;
    },

  getDocuments:
    async () => {
      const { data } =
        await api.get(
          "/admin/documents"
        );

      return data;
    },

  getPersonas:
    async () => {
      const { data } =
        await api.get(
          "/admin/personas"
        );

      return data;
    },
};