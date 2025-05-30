#!/usr/bin/env python3
from client import Client
import os
import pytest
from dotenv import load_dotenv
from utils.usertoken import user_token

# If this import is unrecognized, add ../../../sdk/python to PYTHONPATH.
# For VSCode's Pylance extension, you can add this to imports in settings.
from plainflags import PlainFlags


@pytest.fixture(scope="module")
def setup():
    load_dotenv()


@pytest.mark.asyncio
async def test_flag_state_check():

    client = Client(
        base_url=os.getenv("MANAGEMENT_URL", "http://localhost:5000"))

    token = await user_token(client)
    print(f"User token: {token}")

    flags = PlainFlags(
        service_url=os.getenv("STATES_URL", "http://localhost:5001"),
        api_key=os.getenv(
            "APIKEY", "345fg-1r9vu342-0r91uvnm-102394u-v14mj-20951"),
        timeout_ms=10000,
        poll_interval_ms=0)

    await flags.init()

    ison = flags.is_on("Flag001")
    print(f"Flag001 is {'on' if ison else 'off'}")


if __name__ == "__main__":
    # Run the test
    pytest.main([__file__])
