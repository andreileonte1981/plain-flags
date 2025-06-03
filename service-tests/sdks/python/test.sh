#!/bin/bash

# Save the original PYTHONPATH and virtual environment state
ORIGINAL_PYTHONPATH="$PYTHONPATH"
ORIGINAL_VIRTUAL_ENV="$VIRTUAL_ENV"
ORIGINAL_PATH="$PATH"

# Check if .venv directory exists
if [ -d ".venv" ]; then
    echo "Using project virtual environment..."
    # Activate the virtual environment
    source .venv/bin/activate
else
    echo "No virtual environment found. Using system Python."
fi

# Run the tests with the appropriate environment
if [ $# -eq 1 ]; then
    # If an argument is provided, use it as the output file path
    OUTPUT_FILE="$1"
    pytest -n 8 -rxP sdk_test.py -s --verbose > "$OUTPUT_FILE" 2>&1
else
    # If no argument is provided, run tests normally
    pytest -n 8 -rxP sdk_test.py -s --verbose
fi

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
