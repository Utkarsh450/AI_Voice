import json

from services.redis_service import (
    redis_client,
)
from services.websocket_manager import (
    manager,
)


async def start_subscriber():
    pubsub = (
        redis_client.pubsub()
    )

    await pubsub.subscribe(
        "transcript_events"
    )

    await pubsub.subscribe(
        "call_state_events"
    )

    print(
        "Redis Subscriber Started"
    )

    async for message in (
        pubsub.listen()
    ):
        if (
            message["type"]
            != "message"
        ):
            continue

        data = json.loads(
            message["data"]
        )

        print(
            "REDIS EVENT:",
            data
        )

        await manager.broadcast(
            data
        )