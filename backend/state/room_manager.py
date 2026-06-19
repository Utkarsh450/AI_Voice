active_rooms = {}


def create_room(room_name: str):
    if room_name not in active_rooms:
        active_rooms[room_name] = {
            "participants": [],
            "session_id": None,
            "agent": None,
            "transcript": [],
        }


def get_room(room_name: str):
    return active_rooms.get(room_name)