#!/usr/bin/env python3
import time
from client import Client
import os
import pytest
from dotenv import load_dotenv
from utils.usertoken import user_token
from utils.salt import salt_uniqued

# If this import is unrecognized, add ../../../sdk/python to PYTHONPATH.
# For VSCode's Pylance extension, you can add this to imports in settings.
from plainflags import PlainFlags


@pytest.fixture(scope="module")
def setup():
    load_dotenv()


@pytest.mark.asyncio
async def test_turning_on_a_flag_shows_it_as_on_in_the_sdk_after_initialization():

    client = Client(
        base_url=os.getenv("MANAGEMENT_URL", "http://localhost:5000"))

    token = await user_token(client)

    flag_name = salt_uniqued("tpy-o")

    create_resp = await client.post("/api/flags", {"name": flag_name}, token)

    assert create_resp.status == 201, "Failed to create flag"

    flag_id = create_resp.data["id"]

    activateResp = await client.post("/api/flags/turnon", {"id": flag_id}, token)

    assert activateResp.status == 200, "Failed to activate flag"

    flags = PlainFlags(
        service_url=os.getenv("STATES_URL", "http://localhost:5001"),
        api_key=os.getenv(
            "APIKEY", "345fg-1r9vu342-0r91uvnm-102394u-v14mj-20951"),
        timeout_ms=10000,
        poll_interval_ms=0)

    time.sleep(1.2)  # Allow some time for the flag state to propagate

    await flags.init()

    assert flags.is_on(
        flag_name), "Expected flag to be on in sdk cache after activation"


@pytest.mark.asyncio
async def test_flag_state_shows_differently_after_manual_state_updates():

    client = Client(
        base_url=os.getenv("MANAGEMENT_URL", "http://localhost:5000"))

    token = await user_token(client)

    flag_name = salt_uniqued("tpy-o")

    create_resp = await client.post("/api/flags", {"name": flag_name}, token)

    assert create_resp.status == 201, "Failed to create flag"

    flag_id = create_resp.data["id"]

    flags = PlainFlags(
        service_url=os.getenv("STATES_URL", "http://localhost:5001"),
        api_key=os.getenv(
            "APIKEY", "345fg-1r9vu342-0r91uvnm-102394u-v14mj-20951"),
        timeout_ms=10000,
        poll_interval_ms=0)

    time.sleep(1.2)  # Allow some time for the flag state to propagate

    await flags.init()

    assert not flags.is_on(
        flag_name), "Expected flag to be off in sdk cache before manual update"

    activateResp = await client.post("/api/flags/turnon", {"id": flag_id}, token)

    assert activateResp.status == 200, "Failed to activate flag"

    time.sleep(1.2)  # Allow some time for the flag state to propagate

    await flags.update_state()
    assert flags.is_on(
        flag_name), "Expected flag to be on in sdk cache after manual update"


if __name__ == "__main__":
    # Run the test
    pytest.main([__file__])
