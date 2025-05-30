#!/usr/bin/env python3


from utils.salt import salt_uniqued


async def user_token(client):
    """Create a new user and get a login token."""
    user_email = f"{salt_uniqued('pyuser')}@mail.com"
    password = "pass01"

    # Create user
    await client.post(
        "/api/users",
        {"email": user_email, "password": password},
        ""
    )

    # Login to get token
    resp_login = await client.post(
        "/api/users/login",
        {"email": user_email, "password": password},
        ""
    )

    if resp_login.status == 200:
        return resp_login.data["token"]
    else:
        raise Exception(f"Failed to login: {resp_login.status} - {await resp_login.text()}")
