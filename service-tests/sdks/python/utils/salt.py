import uuid


def salt_uniqued(s):
    """Add a unique UUID to a string to make it unique."""
    random_string = str(uuid.uuid4())
    return f"{s}{random_string}"
