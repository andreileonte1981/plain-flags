#!/usr/bin/env python3
import logging
from client import Client
import os
import pytest
from dotenv import load_dotenv
from utils.usertoken import user_token
from utils.salt import salt_uniqued
import asyncio


# If this import is unrecognized, add ../../../sdk/python to PYTHONPATH.
# For VSCode's Pylance extension, you can add this to imports in settings.
from plainflags import PlainFlags, PlainFlagsConfig


@pytest.fixture(scope="module")
def setup():
    load_dotenv()

    logging.basicConfig(level=logging.INFO)


@pytest.mark.asyncio
async def test_turning_on_a_flag_shows_it_as_on_in_the_sdk_after_initialization():

    client = Client(
        base_url=os.getenv("MANAGEMENT_URL", "http://localhost:5000"))

    token = await user_token(client)

    flag_name = salt_uniqued("tpy-o")

    create_resp = await client.post("/api/flags", {"name": flag_name}, token)

    assert create_resp.status == 201, "Failed to create flag"

    flag_id = create_resp.data["id"]

    activate_resp = await client.post("/api/flags/turnon", {"id": flag_id}, token)

    assert activate_resp.status == 200, "Failed to activate flag"

    flags = PlainFlags(PlainFlagsConfig(
        service_url=os.getenv("STATES_URL", "http://localhost:5001"),
        api_key=os.getenv(
            "APIKEY", ""),
        timeout_ms=10000,
        poll_interval_ms=0), logging.info, logging.error)
    logging.info(os.getenv("APIKEY", "no apikey!"))

    await asyncio.sleep(1.2)  # Allow some time for the flag state to propagate

    await flags.init()

    assert flags.is_on(
        flag_name), "Expected flag to be on in sdk cache after activation"


@pytest.mark.asyncio
async def test_flag_state_shows_differently_after_manual_state_updates():

    client = Client(
        base_url=os.getenv("MANAGEMENT_URL", "http://localhost:5000"))

    token = await user_token(client)

    flag_name = salt_uniqued("tpy-m")

    create_resp = await client.post("/api/flags", {"name": flag_name}, token)

    assert create_resp.status == 201, "Failed to create flag"

    flag_id = create_resp.data["id"]

    flags = PlainFlags(PlainFlagsConfig(
        service_url=os.getenv("STATES_URL", "http://localhost:5001"),
        api_key=os.getenv(
            "APIKEY", ""),
        timeout_ms=10000,
        poll_interval_ms=0), None, None)

    await asyncio.sleep(1.2)  # Allow some time for the flag state to propagate

    await flags.init()

    assert not flags.is_on(
        flag_name), "Expected flag to be off in sdk cache before manual update"

    activate_resp = await client.post("/api/flags/turnon", {"id": flag_id}, token)

    assert activate_resp.status == 200, "Failed to activate flag"

    await asyncio.sleep(1.2)  # Allow some time for the flag state to propagate

    await flags.update_state()
    assert flags.is_on(
        flag_name), "Expected flag to be on in sdk cache after manual update"


@pytest.mark.asyncio
async def test_polls_for_updates_at_specified_interval():

    client = Client(
        base_url=os.getenv("MANAGEMENT_URL", "http://localhost:5000"))

    token = await user_token(client)

    flag_name = salt_uniqued("tpy-p")

    create_resp = await client.post("/api/flags", {"name": flag_name}, token)

    assert create_resp.status == 201, "Failed to create flag"

    flag_id = create_resp.data["id"]

    flags = PlainFlags(PlainFlagsConfig(
        service_url=os.getenv("STATES_URL", "http://localhost:5001"),
        api_key=os.getenv(
            "APIKEY", ""),
        timeout_ms=20000,
        poll_interval_ms=1000), None, None)

    await asyncio.sleep(1.2)  # Allow some time for the cache to invalidate

    await flags.init()

    try:
        await asyncio.sleep(.8)

        assert not flags.is_on(
            flag_name), "Expected flag to be on in sdk cache after activation"

        activate_resp = await client.post("/api/flags/turnon", {"id": flag_id}, token)

        assert activate_resp.status == 200, "Failed to activate flag"

        # Allow some time for the flag state to propagate
        await asyncio.sleep(1.2)

        assert flags.is_on(
            flag_name), "Expected flag to be on in sdk cache after poll interval time elapsed"

        desctivate_resp = await client.post("/api/flags/turnoff", {"id": flag_id}, token)
        assert desctivate_resp.status == 200, "Failed to deactivate flag"

        # Allow some time for the flag state to propagate
        await asyncio.sleep(1.2)

        assert not flags.is_on(
            flag_name), "Expected flag to be off in sdk cache after deactivation and time elapsed"
    finally:
        await flags.stop_updates()  # Stop polling to clean up after the test


@pytest.mark.asyncio
async def test_a_constrained_flag_is_on_only_for_the_constrained_context():

    client = Client(
        base_url=os.getenv("MANAGEMENT_URL", "http://localhost:5000"))

    token = await user_token(client)

    flag_name = salt_uniqued("tpy-m")

    create_resp = await client.post("/api/flags", {"name": flag_name}, token)

    assert create_resp.status == 201, "Failed to create flag"

    flag_id = create_resp.data["id"]

    activate_resp = await client.post("/api/flags/turnon", {"id": flag_id}, token)

    assert activate_resp.status == 200, "Failed to activate flag"

    user_constraint_resp = await client.post(
        "/api/constraints",
        {
            "description": salt_uniqued("tgo-cu"),
            "key": "user",
            "commaSeparatedValues": "John, Steve"
        }, token)

    assert user_constraint_resp.status == 201, "Failed to create user constraint"
    user_constraint_id = user_constraint_resp.data["id"]

    brand_constraint_resp = await client.post(
        "/api/constraints",
        {
            "description": salt_uniqued("tgo-cb"),
            "key": "brand",
            "commaSeparatedValues": "Acme, Initech"
        }, token)

    assert brand_constraint_resp.status == 201, "Failed to create brand constraint"
    brand_constraint_id = brand_constraint_resp.data["id"]

    await client.post("/api/constraints/link", {"flagId": flag_id, "constraintId": user_constraint_id}, token)
    await client.post("/api/constraints/link", {"flagId": flag_id, "constraintId": brand_constraint_id}, token)

    flags = PlainFlags(PlainFlagsConfig(
        service_url=os.getenv("STATES_URL", "http://localhost:5001"),
        api_key=os.getenv(
            "APIKEY", ""),
        timeout_ms=10000,
        poll_interval_ms=0), None, None)

    await asyncio.sleep(1.2)  # Allow some time for the flag state to propagate

    await flags.init()

    assert flags.is_on(flag_name, False, {
        "user": "John", "brand": "Initech"}), "Expected flag to be on for complete context match"

    assert not flags.is_on(flag_name, False, {
        "user": "Dave", "brand": "Initech"}), "Expected flag to be off for partial context match"

    assert not flags.is_on(flag_name, False, {
        "user": "John", "brand": "TBC"}), "Expected flag to be off for partial context match"

    assert flags.is_on(flag_name, False, {
        "region": "Elbonia"}), "Expected flag to be on for irrelevant context"

    if flags.is_on("User can log in with social media",
                   False,
                   {
                       "userId": "12345",
                       "countryCode": "RO",
                   }):
        # Your feature code here
        pass


if __name__ == "__main__":
    # Run the test
    pytest.main([__file__])
