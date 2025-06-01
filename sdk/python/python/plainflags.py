import aiohttp
import asyncio
from flagstate import FlagState
from constrainer import is_turned_on_in_context


class PlainFlags():
    def __init__(self, service_url: str, api_key: str, timeout_ms: int, poll_interval_ms: int = 0):
        self.__service_url = service_url
        self.__api_key = api_key
        self.__timeout_ms = timeout_ms
        self.__poll_interval_ms = poll_interval_ms

        self.__flag_states = {}
        self.__ispolling = False
        self.__polling_task = None

    async def init(self):
        if self.__poll_interval_ms <= 0:
            await self.update_state()
            return

        # Start polling in a background task and store the reference
        self.__polling_task = asyncio.create_task(self.__start_polling())

        # Ensure the task doesn't get garbage collected by adding a done callback
        self.__polling_task.add_done_callback(
            lambda t: t.exception() if t.done() and not t.cancelled() else None)

    async def __start_polling(self):
        if self.__ispolling:
            return

        self.__ispolling = True

        try:
            while self.__ispolling:
                await self.update_state()
                await asyncio.sleep(self.__poll_interval_ms / 1000.0)
        except Exception as e:
            print(f"Error during polling: {e}")
        except asyncio.CancelledError:
            # Handle task cancellation gracefully
            pass

    async def stop_updates(self):
        """Stop the background polling if it is active"""
        self.__ispolling = False
        if self.__polling_task and not self.__polling_task.done():
            self.__polling_task.cancel()
            try:
                await self.__polling_task
            except asyncio.CancelledError:
                pass
        self.__polling_task = None

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

    def is_on(self, flag_name: str, default: bool = False, context: dict[str, str] | None = None) -> bool:
        if not flag_name in self.__flag_states:
            return default

        return is_turned_on_in_context(self.__flag_states[flag_name], context)
