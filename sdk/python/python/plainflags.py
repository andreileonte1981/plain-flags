from pprint import pprint
import aiohttp
import asyncio


class Constraint:
    def __init__(self, raw_data: dict):
        self.key = raw_data.get("key", "")
        self.values = raw_data.get("values", [])


class FlagState:
    def __init__(self, raw_data: dict):
        self.is_on = raw_data.get("isOn", False)
        constraints = raw_data.get("constraints", [])
        self.constraints = [Constraint(c)
                            for c in constraints] if constraints else []


class PlainFlags():
    def __init__(self, service_url: str, api_key: str, timeout_ms: int, poll_interval_ms: int = 0):
        self.__service_url = service_url
        self.__api_key = api_key
        self.__timeout_ms = timeout_ms
        self.__poll_interval_ms = poll_interval_ms
        self.__flag_states = {}

    async def init(self):
        if self.__poll_interval_ms <= 0:
            await self.update_state()
            return
        await self._start_polling()

    async def _start_polling(self):
        pass

    async def update_state(self):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.__service_url}/api/sdk",
                    headers={"x-api-key": self.__api_key},
                    timeout=aiohttp.ClientTimeout(self.__timeout_ms / 1000.0)
                ) as response:
                    if response.status == 200:
                        data = await response.json()

                        self.__flag_states = dict((key, FlagState(value))
                                                  for key, value in data.items())

                    else:
                        raise Exception(
                            f"Failed to fetch flags: {response.status}")
        except Exception as e:
            print(f"Error fetching flags: {e}")

    def is_on(self, flag_name: str, default: bool = False) -> bool:
        if flag_name in self.__flag_states:
            return self.__flag_states[flag_name].is_on
        else:
            print(
                f"Flag '{flag_name}' not found, returning default: {default}")
        return default


# REMOVE
if __name__ == "__main__":
    pf = PlainFlags(service_url="http://localhost:5001",
                    api_key="345fg-1r9vu342-0r91uvnm-102394u-v14mj-20951",
                    timeout_ms=20000,
                    poll_interval_ms=0)

    async def f(pf):
        await pf.init()
        on = pf.is_on("Flag001", default=False)
        print(on)

    asyncio.run(f(pf))
