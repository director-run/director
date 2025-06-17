#!/usr/bin/env bash

# Install homebrew
# xcode-select --install
# NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
#
# Director Installer
# curl -fsSL https://director.run/install | bash
# curl -fsSL http://macbook.local:8000/install.sh | bash
#

# Exit immediately if any command fails and enable error tracing
set -o errexit
set -o pipefail

# ========================= CONFIGURATION =========================

# Progress Configuration
readonly TOTAL_STEPS=3

# Global Variables
current_step=0
temp_dir=""
shell_config=""

# ========================= COLORS & STYLING =========================

# ANSI Color Codes with fallback support
if command -v tput &>/dev/null && [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
    # Rich colors using tput for better compatibility
    readonly RED=$(tput setaf 1)
    readonly GREEN=$(tput setaf 2)
    readonly YELLOW=$(tput setaf 3)
    readonly BLUE=$(tput setaf 4)
    readonly MAGENTA=$(tput setaf 5)
    readonly CYAN=$(tput setaf 6)
    readonly WHITE=$(tput setaf 7)
    readonly GRAY=$(tput setaf 8)
    readonly BRIGHT_GREEN=$(tput setaf 10)
    readonly BRIGHT_BLUE=$(tput setaf 12)
    readonly BRIGHT_CYAN=$(tput setaf 14)
    
    # Text Formatting
    readonly BOLD=$(tput bold)
    readonly DIM=$(tput dim)
    readonly ITALIC=$(tput sitm)
    readonly UNDERLINE=$(tput smul)
    readonly RESET=$(tput sgr0)
    readonly REVERSE=$(tput rev)
    
    # Background colors
    readonly BG_GREEN=$(tput setab 2)
    readonly BG_RED=$(tput setab 1)
    readonly BG_BLUE=$(tput setab 4)
else
    # Fallback for environments without color support
    readonly RED="" GREEN="" YELLOW="" BLUE="" MAGENTA="" CYAN="" WHITE="" GRAY=""
    readonly BRIGHT_GREEN="" BRIGHT_BLUE="" BRIGHT_CYAN=""
    readonly BOLD="" DIM="" ITALIC="" UNDERLINE="" RESET="" REVERSE=""
    readonly BG_GREEN="" BG_RED="" BG_BLUE=""
fi

# ========================= UNICODE SYMBOLS =========================

show_banner() {
    clear
    printf "\n"
    printf "  %s\n" "Director Installer"
    printf "  %s%s%s\n" "${DIM}" "The easiest way to use MCP" "${RESET}"
    printf "  %s%s%s\n" "${DIM}" "https://director.run" "${RESET}"
    printf "\n"
}

# ========================= PROGRESS VISUALIZATION =========================

show_progress() {
    local step_description="$1"
    
    if [ $current_step -eq 0 ]; then
        current_step=1
    else
        current_step=$((current_step + 1))
    fi
    
    # Simple progress indicator
    printf "  [%d/%d] %s" "$current_step" "$TOTAL_STEPS" "$step_description"
}

# Animated loader function
show_loader() {
    local message="$1"
    local pid="$2"
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    
    printf "    %s%s%s " "${DIM}" "$message" "${RESET}"
    
    while kill -0 "$pid" 2>/dev/null; do
        local temp=${spinstr#?}
        printf "\r    %s%s %s%s" "${DIM}" "$message" "${spinstr%"$temp"}" "${RESET}"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    
    printf "\r    %s✓ %s%s\n" "${DIM}" "$message" "${RESET}"
}

# Start a background process and show loader
run_with_loader() {
    local message="$1"
    shift
    
    # Run command in background
    "$@" &>/dev/null &
    local pid=$!
    
    # Show animated loader
    show_loader "$message" "$pid"
    
    # Wait for completion and return exit status
    wait "$pid"
    return $?
}

# ========================= STATUS MESSAGES =========================

show_success() {
    printf "    %s✓ %s%s\n" "${DIM}" "$1" "${RESET}"
}

show_error() {
    printf "  ✗ Error: %s\n" "$1" >&2
    exit 1
}

show_warning() {
    printf "    ⚠ %s\n" "$1"
}

show_info() {
    printf "    %s• %s%s\n" "${DIM}" "$1" "${RESET}"
}

# ========================= ENHANCED UTILITIES =========================

command_exists() {
    command -v "$1" &>/dev/null
}

# ========================= SYSTEM DETECTION =========================

detect_shell_config() {
    if [ -n "$SHELL" ]; then
        local shell_name=$(basename "$SHELL")
        case "$shell_name" in
            bash)
                if [ -f "$HOME/.bash_profile" ]; then
                    shell_config="$HOME/.bash_profile"
                elif [ -f "$HOME/.bashrc" ]; then
                    shell_config="$HOME/.bashrc"
                fi
                ;;
            zsh)
                if [ -f "$HOME/.zshrc" ]; then
                    shell_config="$HOME/.zshrc"
                fi
                ;;
            fish)
                if [ -f "$HOME/.config/fish/config.fish" ]; then
                    shell_config="$HOME/.config/fish/config.fish"
                fi
                ;;
            *)
                if [ -f "$HOME/.profile" ]; then
                    shell_config="$HOME/.profile"
                fi
                ;;
        esac
    else
        # Fallback detection
        for config in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
            if [ -f "$config" ]; then
                shell_config="$config"
                break
            fi
        done
    fi
}


# ========================= OPTIONAL COMPONENTS =========================

install_brew() {
    if command_exists brew; then
        show_info "homebrew is already installed. skipping..."
        return 0
    fi
    
    run_with_loader "installing homebrew..." /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    if ! command_exists brew; then
        show_error "homebrew is not installed. Please install it manually and try again."
        return 1
    fi
}

install_nvm() {
    if command_exists nvm; then
        show_info "nvm is already installed. skipping..."
        return 0
    fi

    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command_exists brsdfsdfsfdew; then
            show_warning "homebrew is not installed. please install and try again"
            echo
            printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' '━'
            echo
            echo "To install homebrew, run the following commands:"
            echo
            echo "    $ xcode-select --install"
            echo '    $ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
            echo ""
            exit 1
            #NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi

        if ! run_with_loader "installing nvm" brew install nvm; then
            show_error "Error installing nvm. Please install it manually and try again."
            return 1
        fi
        # /opt/homebrew/opt/nvm/nvm.sh
    else 
        # use the shell script to install nvm on linux
        run_with_loader "installing nvm" /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh)"
    fi

    source_nvm

    if ! command_exists nvm; then
        show_error "nvm is not available. Reload your terminal and try again."
        return 1
    fi
}


install_node() {
    # Try sourcing nvm.sh if it exists
    source_nvm

    if ! command_exists nvm; then
        install_nvm
    fi

    run_with_loader "installing latest node.js" nvm install node --default
    source_nvm
    
    if ! command_exists node; then
        show_error "node.js is not available. Reload your terminal and try again."
        return 1
    fi
}

ensure_node_installed() {
    # Try sourcing nvm.sh if it exists
    source_nvm

    if command_exists node; then
        if command_exists npm; then
            show_success "node.js is already installed"
            return 0
        else
            show_error "node is installed but npm is not available in your \$PATH."
            return 1
        fi
    else
        install_node
        return 0
    fi
}


source_nvm() {
    if [ -f ~/.nvm/nvm.sh ]; then
        source ~/.nvm/nvm.sh
        # TODO fish?
    fi
}


source_env() {
    if [ -f "$HOME/.local/bin/env" ]; then
        # bash, zsh
        source "$HOME/.local/bin/env"
        # fish 
        # source $HOME/.local/bin/env.fish (fish)
    fi
}


ensure_uv_installed() {
    source_env

    if command_exists uv; then
        show_success "uv is already installed"
        return 0
    else
        run_with_loader "installing uv" /bin/bash -c "$(curl -fsSL https://astral.sh/uv/install.sh)"
        source_env

        if ! command_exists uv; then
            show_error "uv is not available. Reload your terminal and try again."
            return 1
        fi

        return 0  
    fi
}

ensure_director_installed() {
    if command_exists director; then
        show_success "director is already installed"
        # TODO: update director
    else
        if command_exists npm; then
            if run_with_loader "installing director..." npm install -g @director.run/cli; then
                show_success "director is now installed"
                return 0
            else 
                show_error "something went wrong."
                return 1
            fi
        else
            show_error "npm is not installed or available in your \$PATH."
            return 1
        fi
    fi
}


# ========================= MAIN INSTALLATION FLOW =========================

main() {
    # Show beautiful banner
    show_banner
    
    # System compatibility check
    if [[ "$OSTYPE" != "darwin"* ]] && [[ "$OSTYPE" != "linux"* ]]; then
        show_error "This installer only supports macOS and Linux environments."
    fi
        
    show_progress "Installing Node.js"
    printf "\n"
    ensure_node_installed

    show_progress "Installing uv"
    printf "\n"
    ensure_uv_installed

    show_progress "Installing Director"
    printf "\n"
    ensure_director_installed
    
    # Installation complete
    printf "\n"
    printf "  %s✓ installation complete%s" "${GREEN}" "${RESET}"
    printf "\n"
    
    printf "  %sRestart your terminal and run %s%sdirector quickstart%s%s to get started%s\n" "${DIM}" "${RESET}" "${BOLD}" "${RESET}" "${DIM}" "${RESET}"
    printf "\n"
}

main "$@"