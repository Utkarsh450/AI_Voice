import asyncio
from prisma import Prisma

class PrismaProxy:
    def __init__(self):
        # Maps event loop IDs to their respective Prisma client instances
        self._clients = {}

    def _get_client(self) -> Prisma:
        try:
            loop = asyncio.get_running_loop()
            loop_id = id(loop)
        except RuntimeError:
            loop_id = 0

        if loop_id not in self._clients:
            self._clients[loop_id] = Prisma()
        return self._clients[loop_id]

    def __getattr__(self, name):
        return getattr(self._get_client(), name)

    async def disconnect(self):
        try:
            loop = asyncio.get_running_loop()
            loop_id = id(loop)
        except RuntimeError:
            loop_id = 0

        if loop_id in self._clients:
            client = self._clients.pop(loop_id)
            try:
                if client.is_connected():
                    await client.disconnect()
            except Exception:
                pass

db = PrismaProxy()