from pprint import pprint
import aiohttp
import asyncio


class PlainFlags():
    def __init__(self, service_url: str, api_key: str, timeout_ms: int, poll_interval_ms: int = 0):
        self.service_url = service_url
        self.api_key = api_key
        self.timeout_ms = timeout_ms
        self.poll_interval_ms = poll_interval_ms

    async def init(self):
        if self.poll_interval_ms <= 0:
            await self.update_state()
            return
        await self._start_polling()

    async def _start_polling(self):
        pass

    async def update_state(self):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.service_url}/api/sdk",
                    headers={"x-api-key": self.api_key},
                    timeout=aiohttp.ClientTimeout(self.timeout_ms / 1000.0)
                ) as response:
                    if response.status == 200:
                        data = await response.json()

                        pprint(data, indent=2)
                    else:
                        raise Exception(
                            f"Failed to fetch flags: {response.status}")
        except Exception as e:
            print(f"Error fetching flags: {e}")

    def is_on(self, flag_name: str, default: bool = False) -> bool:
        return default


# REMOVE
if __name__ == "__main__":
    pf = PlainFlags(service_url="http://localhost:5001",
                    api_key="ersafoi89a0ww3n8yrt493ew84yqjwd34y8r09",
                    timeout_ms=20000,
                    poll_interval_ms=0)

    asyncio.run(pf.init())
