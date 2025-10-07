echo "untested"

cd sdk/python

# Check if .venv directory exists
if [ -d ".venv" ]; then
    echo "Using project virtual environment..."
    # Activate the virtual environment
    source .venv/bin/activate
else
    echo "No virtual environment found. Using system Python."
fi

python3 -m twine upload --skip-existing dist/*

# Restore the original environment if we activated a virtual environment
if [ -d ".venv" ]; then
    if [ -n "$ORIGINAL_VIRTUAL_ENV" ]; then
        # If there was a previous virtual environment, reactivate it
        echo "Restoring original virtual environment..."
        source "$ORIGINAL_VIRTUAL_ENV/bin/activate"
    else
        # If there was no previous virtual environment, deactivate the current one
        echo "Deactivating virtual environment..."
        deactivate
    fi
    
    # Restore original PYTHONPATH
    export PYTHONPATH="$ORIGINAL_PYTHONPATH"
    
    # If PATH was modified and we need to restore it
    if [ "$PATH" != "$ORIGINAL_PATH" ]; then
        export PATH="$ORIGINAL_PATH"
    fi
fi

