import GlassCard from "./GlassCard";
import { useTopUsers } from "@/hooks/useTopUsers";

export default function TopUsersCard() {
  const {
    data,
    isLoading,
  } = useTopUsers();

  return (
    <GlassCard>
      <h2
        className="
        mb-6
        text-xl
        font-semibold
      "
      >
        Top Users
      </h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {data?.map(
            (
              user: any
            ) => (
              <div
                key={
                  user.userId
                }
                className="
                flex
                items-center
                justify-between
              "
              >
                <span>
                  {
                    user.userId
                  }
                </span>

                <span
                  className="
                  text-blue-400
                "
                >
                  {
                    user.calls
                  }{" "}
                  calls
                </span>
              </div>
            )
          )}
        </div>
      )}
    </GlassCard>
  );
}