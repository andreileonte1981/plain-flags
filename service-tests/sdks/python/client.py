#!/usr/bin/env python3
from pprint import pprint
import aiohttp


class Response:
    def __init__(self, status, data):
        self.status = status
        self.data = data


class Client:
    def __init__(self, base_url):
        self.base_url = base_url

    async def post(self, url, payload, token=""):
        headers = {
            "Content-Type": "application/json; charset=UTF-8"
        }

        if token:
            headers["Authorization"] = f"Bearer {token}"

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}{url}",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=20)
            ) as response:
                return Response(
                    response.status,
                    await response.json() if response.status == 200 else await response.text()
                )
