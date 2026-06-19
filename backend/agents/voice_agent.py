class VoiceAgent:

    def __init__(self, room_name: str):
        self.room_name = room_name
        self.session_id = None
        self.persona = "general"

        print(
            f"Agent initialized for {room_name}"
        )

    def attach_session(
        self,
        session_id: int
    ):
        self.session_id = session_id