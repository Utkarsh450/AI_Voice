import asyncio

from services.event_publisher import (
    publish_event,
)


async def main():
    await publish_event(
        "test",
        {
            "hello": "world"
        },
    )

    print("Published")


asyncio.run(main())