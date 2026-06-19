active_sessions = {}


def register_session(
    room_name: str,
    session_id: int
):
    active_sessions[room_name] = session_id