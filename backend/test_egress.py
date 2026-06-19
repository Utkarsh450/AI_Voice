# test_egress.py

from dotenv import load_dotenv
from livekit import api
import os
import asyncio

load_dotenv()


async def main():
    lkapi = api.LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET"),
    )

    try:
        result = await lkapi.egress.list_egress(
            api.ListEgressRequest()
        )

        print("EGRESS WORKING ✅")
        print(result)

    except Exception as e:
        print("EGRESS ERROR ❌")
        print(e)

    finally:
        await lkapi.aclose()


asyncio.run(main())