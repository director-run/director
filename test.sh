#!/bin/bash

# Try to source nvm, but continue if it fails
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh || echo "Warning: Failed to load nvm"
else
    echo "Warning: nvm not found at ~/.nvm/nvm.sh"
fi

node --version

# Only try to run nvm if it was successfully loaded
if command -v nvm &> /dev/null; then
    nvm --version
else
    echo "nvm command not available"
fi
