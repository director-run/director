#!/usr/bin/env bash

#
# Director Uninstaller
# curl -fsSL https://director.run/uninstall | bash
#
# This script will uninstall:
# - Director (using npm)
#
#

# Exit immediately if any command fails and enable error tracing
set -o errexit
set -o pipefail

uninstall() {    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "osx uninstall..."
        npm uninstall -g @director.run/cli    
    elif [[ "$OSTYPE" == "linux"* ]]; then
        echo "linux uninstall..."
        npm uninstall -g @director.run/cli
    else
        show_error "This installer only supports macOS and Linux environments."
        return 1
    fi
}

uninstall "$@"
