import json

from services.redis_service import (
    redis_client,
)


async def publish_event(
    channel: str,
    data: dict,
):
    await redis_client.publish(
        channel,
        json.dumps(data),
    )