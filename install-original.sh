#!/usr/bin/env bash

# Exit immediately if any command fails and enable error tracing
set -o errexit
set -o pipefail

# ========================= CONFIGURATION =========================

# Branding and Visual Elements
readonly BRAND_NAME="Furi Installer"
readonly VERSION="1.0.0"
readonly DESCRIPTION="CLI & API for MCP management & execution"
readonly WEBSITE="https://furi.so     https://discord.gg/B8vAfRkdXS     https://github.com/ashwwwin/furi"

# Directory Configuration
readonly FURIKAKE_DIR="${HOME}/.furikake"
readonly BIN_DIR="${HOME}/.local/bin"
readonly REPO_OWNER="ashwwwin"
readonly REPO_NAME="furi"
readonly REPO_BRANCH="main"
readonly REPO_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}"

# Progress Configuration
readonly TOTAL_STEPS=7
readonly PROGRESS_BAR_WIDTH=40

# Global Variables
current_step=0
temp_dir=""
shell_config=""
bun_cmd=""

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

# Modern Unicode symbols for enhanced visual appeal
readonly SYMBOL_SUCCESS="✅"
readonly SYMBOL_ERROR="❌"
readonly SYMBOL_WARNING="⚠️"
readonly SYMBOL_INFO="💡"
readonly SYMBOL_ROCKET="🚀"
readonly SYMBOL_PACKAGE="📦"
readonly SYMBOL_DOWNLOAD="⬇️"
readonly SYMBOL_GEAR="⚙️"
readonly SYMBOL_SPARKLES="✨"
readonly SYMBOL_FOLDER="📁"
readonly SYMBOL_CHECK="✓"
readonly SYMBOL_CROSS="✗"
readonly SYMBOL_ARROW="→"
readonly SYMBOL_BULLET="•"
readonly SYMBOL_PROGRESS_FULL="█"
readonly SYMBOL_PROGRESS_EMPTY="░"
readonly SYMBOL_PROGRESS_PARTIAL="▒"

# ========================= ASCII ART & BRANDING =========================

show_banner() {
    clear
    printf "\n"
    printf "  %s\n" "🍃 Furi Installer"
    printf "  %s%s%s\n" "${DIM}" "CLI & API for MCP management" "${RESET}"
    printf "  %s%s%s\n" "${DIM}" "https://furi.so     https://discord.gg/B8vAfRkdXS     https://github.com/ashwwwin/furi" "${RESET}"
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
    printf "  ✓ %s\n" "$1"
}

show_error() {
    printf "  ✗ Error: %s\n" "$1" >&2
    exit 1
}

show_warning() {
    printf "  ⚠ %s\n" "$1"
}

show_info() {
    printf "    %s• %s%s\n" "${DIM}" "$1" "${RESET}"
}

show_step() {
    printf "  %s\n" "$1"
}

# ========================= ENHANCED UTILITIES =========================

command_exists() {
    command -v "$1" &>/dev/null
}

create_loading_animation() {
    local message="$1"
    local pid="$2"
    
    local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
    local frame_index=0
    
    while kill -0 "$pid" 2>/dev/null; do
        printf "\r%s %s%s%s %s" \
            "${CYAN}${frames[$frame_index]}${RESET}" \
            "${DIM}" "WORKING" "${RESET}" \
            "${message}"
        frame_index=$(( (frame_index + 1) % ${#frames[@]} ))
        sleep 0.1
    done
    
    printf "\r\033[K"
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

# ========================= DEPENDENCY MANAGEMENT =========================

check_git() {
    if command_exists git; then
        return 0
    fi
    
    show_step "Installing Git dependency"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command_exists brew; then
            brew install git &>/dev/null || show_error "Failed to install Git via Homebrew"
        else
            show_info "Installing Homebrew package manager"
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" &>/dev/null || {
                show_error "Failed to install Homebrew. Please install Git manually and try again."
            }
            
            # Configure Homebrew in PATH
            if [[ -f "$HOME/.zshrc" ]]; then
                echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "$HOME/.zshrc"
                eval "$(/opt/homebrew/bin/brew shellenv)" &>/dev/null || true
            elif [[ -f "$HOME/.bashrc" ]]; then
                echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "$HOME/.bashrc"
                eval "$(/opt/homebrew/bin/brew shellenv)" &>/dev/null || true
            fi
            
            brew install git &>/dev/null || show_error "Failed to install Git via Homebrew"
        fi
    else
        # Linux package managers
        if command_exists apt-get; then
            sudo apt-get update &>/dev/null
            sudo apt-get install -y git &>/dev/null
        elif command_exists dnf; then
            sudo dnf install -y git &>/dev/null
        elif command_exists yum; then
            sudo yum install -y git &>/dev/null
        elif command_exists pacman; then
            sudo pacman -S --noconfirm git &>/dev/null
        elif command_exists zypper; then
            sudo zypper install -y git &>/dev/null
        else
            show_error "Could not install Git. Please install it manually and try again."
        fi
    fi
    
    if ! command_exists git; then
        show_error "Failed to install Git. Please install it manually and try again."
    fi
}

# ========================= BUN INSTALLATION =========================

install_bun() {
    # Check if bun is already available
    if command_exists bun; then
        bun_cmd="bun"

        return 0
    fi
    
    # Check common installation paths
    local paths=("$HOME/.bun/bin/bun" "/usr/local/bin/bun" "/opt/homebrew/bin/bun")
    for path in "${paths[@]}"; do
        if [ -f "$path" ] && [ -x "$path" ]; then
            bun_cmd="$path"
            export PATH="$(dirname "$path"):$PATH"

            return 0
        fi
    done
    
    # Create temporary files for installation
    local install_script=$(mktemp)
    local install_log=$(mktemp)
    
    # Download and install bun with error handling
    if curl -fsSL https://bun.sh/install > "$install_script" 2>>"$install_log"; then
        if ! run_with_loader "Installing Bun runtime" bash "$install_script"; then
            show_warning "Bun installation encountered issues, attempting to continue"
        fi
    else
        show_warning "Failed to download bun installer, checking for existing installation"
    fi
    
    # Clean up temporary files
    rm -f "$install_script" "$install_log" 2>/dev/null || true
    
    # Configure environment
    export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
    export PATH="$BUN_INSTALL/bin:$PATH"
    
    # Source shell configuration if available
    if [ -n "$shell_config" ] && [ -f "$shell_config" ]; then
        (source "$shell_config" 2>/dev/null) || true
        if grep -q "BUN_INSTALL\|\.bun" "$shell_config" 2>/dev/null; then
            eval "$(grep -E "(export.*BUN_INSTALL|export.*\.bun|export.*PATH.*\.bun)" "$shell_config" 2>/dev/null | head -5)" 2>/dev/null || true
        fi
    fi
    
    # Verify installation
    if command_exists bun; then
        bun_cmd="bun"

        return 0
    fi
    
    # Try direct path detection
    for path in "${paths[@]}" "$BUN_INSTALL/bin/bun"; do
        if [ -f "$path" ] && [ -x "$path" ]; then
            bun_cmd="$path"

            return 0
        fi
    done
    
    # Make executable if needed
    for path in "$HOME/.bun/bin/bun" "$BUN_INSTALL/bin/bun"; do
        if [ -f "$path" ]; then
            chmod +x "$path" 2>/dev/null || true
            if [ -x "$path" ]; then
                bun_cmd="$path"

                return 0
            fi
        fi
    done
    
    # Final attempt with verbose output
    show_warning "Attempting final bun installation with error details"
    if ! curl -fsSL https://bun.sh/install | bash; then
        show_error "Failed to install Bun. Please install manually: curl -fsSL https://bun.sh/install | bash"
    fi
    
    # Final verification
    if command_exists bun; then
        bun_cmd="bun"
        return 0
    fi
    
    printf "\n%s %s%s%s Could not install or locate Bun runtime.\n" \
        "${SYMBOL_ERROR}" "${RED}${BOLD}" "ERROR" "${RESET}"
    printf "  %s%s${SYMBOL_ARROW} Please install manually: ${BOLD}curl -fsSL https://bun.sh/install | bash${RESET}\n" "${DIM}"
    printf "  %s${SYMBOL_ARROW} Then restart your terminal and run this installer again${RESET}\n" "${DIM}"
    return 1
}

# ========================= CODE DOWNLOAD =========================

download_code() {
    temp_dir=$(mktemp -d)
    if [ ! -d "$temp_dir" ]; then
        show_error "Failed to create temporary directory"
    fi
    
    local download_success=false
    
    # Try Git clone first (preferred method)
    if ! $download_success && command_exists git; then
        if run_with_loader "Downloading source code" git clone --quiet --depth=1 --branch "$REPO_BRANCH" "$REPO_URL.git" "$temp_dir/repo"; then
            if [ -d "$temp_dir/repo" ] && [ -f "$temp_dir/repo/package.json" ]; then
                cp -r "$temp_dir/repo/"* "$temp_dir/" 2>/dev/null
                find "$temp_dir/repo" -maxdepth 1 -name ".*" -type f -exec cp {} "$temp_dir/" \; 2>/dev/null || true
                find "$temp_dir/repo" -maxdepth 1 -name ".*" -type d -not -name ".furikake" -exec cp -r {} "$temp_dir/" \; 2>/dev/null || true
                rm -rf "$temp_dir/repo"
                download_success=true
                # Small delay to show the spinner
                sleep 0.3
            fi
        fi
    fi
    
    # Fallback to ZIP download
    if ! $download_success && command_exists curl && command_exists unzip; then
        local download_url="$REPO_URL/archive/refs/heads/$REPO_BRANCH.zip"
        if curl -sL "$download_url" -o "$temp_dir/furikake.zip" 2>/dev/null; then
            if [ -f "$temp_dir/furikake.zip" ] && [ -s "$temp_dir/furikake.zip" ]; then
                if unzip -q "$temp_dir/furikake.zip" -d "$temp_dir" 2>/dev/null; then
                    local dir_name="$REPO_NAME-$REPO_BRANCH"
                    if [ -d "$temp_dir/$dir_name" ] && [ -f "$temp_dir/$dir_name/package.json" ]; then
                        cp -r "$temp_dir/$dir_name/"* "$temp_dir/" 2>/dev/null
                        find "$temp_dir/$dir_name" -maxdepth 1 -name ".*" -type f -exec cp {} "$temp_dir/" \; 2>/dev/null || true
                        find "$temp_dir/$dir_name" -maxdepth 1 -name ".*" -type d -not -name ".furikake" -exec cp -r {} "$temp_dir/" \; 2>/dev/null || true
                        rm -rf "$temp_dir/$dir_name"
                        download_success=true
                    fi
                fi
            fi
        fi
    fi
    
    # Fallback to tar.gz download
    if ! $download_success && command_exists curl && command_exists tar; then
        local download_url="$REPO_URL/archive/refs/heads/$REPO_BRANCH.tar.gz"
        if curl -sL "$download_url" -o "$temp_dir/furikake.tar.gz" 2>/dev/null; then
            if [ -f "$temp_dir/furikake.tar.gz" ] && [ -s "$temp_dir/furikake.tar.gz" ]; then
                if tar -xzf "$temp_dir/furikake.tar.gz" -C "$temp_dir" 2>/dev/null; then
                    local dir_name="$REPO_NAME-$REPO_BRANCH"
                    if [ -d "$temp_dir/$dir_name" ] && [ -f "$temp_dir/$dir_name/package.json" ]; then
                        cp -r "$temp_dir/$dir_name/"* "$temp_dir/" 2>/dev/null
                        find "$temp_dir/$dir_name" -maxdepth 1 -name ".*" -type f -exec cp {} "$temp_dir/" \; 2>/dev/null || true
                        find "$temp_dir/$dir_name" -maxdepth 1 -name ".*" -type d -not -name ".furikake" -exec cp -r {} "$temp_dir/" \; 2>/dev/null || true
                        rm -rf "$temp_dir/$dir_name"
                        download_success=true
                    fi
                fi
            fi
        fi
    fi
    
    if ! $download_success || [ ! -f "$temp_dir/package.json" ] || [ ! -f "$temp_dir/index.ts" ]; then
        show_error "Failed to download Furikake code. Please check your internet connection and try again."
    fi
}

# ========================= APPLICATION INSTALLATION =========================

install_app() {
    cd "$temp_dir" || show_error "Failed to navigate to temporary directory"
    
    # Validate bun command
    if [ -z "$bun_cmd" ]; then
        show_error "Bun command not found. Installation cannot continue."
    fi
    
    if [ ! -x "$bun_cmd" ] && ! command_exists "$bun_cmd"; then
        show_error "Bun executable not found at: $bun_cmd"
    fi
    
    # Install dependencies with multiple fallback strategies
    if ! run_with_loader "Installing dependencies" "$bun_cmd" install; then
        show_info "Standard install failed, trying with --no-save flag"
        if ! "$bun_cmd" install --no-save &>/dev/null; then
            show_warning "Dependency installation failed, trying alternative approach"
            if ! "$bun_cmd" install 2>&1 | grep -q "error\|Error\|ERROR"; then
                show_info "Dependencies installed with warnings"
            else
                show_error "Failed to install dependencies. Please check your internet connection and try again."
            fi
        fi
    fi
    

    
    # Create directories
    mkdir -p "$FURIKAKE_DIR" "$BIN_DIR" &>/dev/null
    

    
    # Create the main executable
    cat > "$BIN_DIR/furi" << 'EOF'
#!/usr/bin/env bash

export BASE_PATH="$HOME/.furikake"

find_bun() {
    # First try command lookup
    if command -v bun &> /dev/null; then
        echo "bun"
        return 0
    fi
    
    # Try to source shell configs to pick up PATH changes
    for config in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
        if [ -f "$config" ]; then
            if grep -q "BUN_INSTALL\|\.bun" "$config" 2>/dev/null; then
                eval "$(grep -E "(export.*BUN_INSTALL|export.*\.bun|export.*PATH.*\.bun)" "$config" 2>/dev/null | head -3)" 2>/dev/null || true
            fi
        fi
    done
    
    # Update PATH with BUN_INSTALL if available
    if [ -n "$BUN_INSTALL" ] && [ -d "$BUN_INSTALL/bin" ]; then
        export PATH="$BUN_INSTALL/bin:$PATH"
    fi
    
    # Try command lookup again after PATH update
    if command -v bun &> /dev/null; then
        echo "bun"
        return 0
    fi
    
    # Check common installation paths
    for path in "$HOME/.bun/bin/bun" "${BUN_INSTALL:-}/bin/bun" "/usr/local/bin/bun" "/opt/homebrew/bin/bun" "$HOME/bin/bun" "$HOME/.local/bin/bun"; do
        if [ -f "$path" ] && [ -x "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    
    return 1
}

BUN_CMD=$(find_bun)
if [ -z "$BUN_CMD" ]; then
    echo "❌ Error: Bun runtime not found. Please ensure bun is installed and in your PATH."
    echo "🔧 To reinstall Furi: curl -fsSL https://furi.so/install | bash"
    echo "📦 To install bun manually: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

if [ ! -f "$HOME/.furikake/index.ts" ]; then
    echo "❌ Error: Furi installation is corrupted. Please reinstall with: curl -fsSL https://furi.so/install | bash"
    exit 1
fi

exec $BUN_CMD "$HOME/.furikake/index.ts" "$@"
EOF
    
    chmod +x "$BIN_DIR/furi" &>/dev/null || 
        show_error "Failed to make the executable script. Check permissions and try again."
    

    
    # Copy files excluding .furikake directory to prevent nested structure
    find "$temp_dir" -maxdepth 1 -type f -exec cp {} "$FURIKAKE_DIR/" \; 2>/dev/null
    find "$temp_dir" -maxdepth 1 -type d -not -name ".*" -not -path "$temp_dir" -exec cp -r {} "$FURIKAKE_DIR/" \; 2>/dev/null
    find "$temp_dir" -maxdepth 1 -name ".*" -type f -exec cp {} "$FURIKAKE_DIR/" \; 2>/dev/null || true
    
    # Remove any nested .furikake directory
    if [ -d "$FURIKAKE_DIR/.furikake" ]; then
        rm -rf "$FURIKAKE_DIR/.furikake" &>/dev/null || true
    fi
    
    if [ ! -f "$FURIKAKE_DIR/index.ts" ]; then
        show_error "Installation failed. Essential files not found."
    fi
    

}

# ========================= ENVIRONMENT CONFIGURATION =========================

configure_environment() {
    detect_shell_config
    
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        if [ -n "$shell_config" ]; then
            {
                echo ""
                echo "# Added by Furi installer ($(date +%Y-%m-%d))"
                echo "export PATH=\"$BIN_DIR:\$PATH\""
            } >> "$shell_config"
        fi
        
        export PATH="$BIN_DIR:$PATH"
    fi
    
    # Create an alias for convenience
    alias furi="$BIN_DIR/furi" &>/dev/null || true
    
    # Small delay to make the loader visible
    sleep 0.5
}

# ========================= OPTIONAL COMPONENTS =========================

install_pm2() {
    if command_exists pm2; then
        show_info "PM2 already installed"
        return 0
    fi
    
    # Try npm first
    if command_exists npm; then
        if run_with_loader "Installing PM2 via npm" npm install -g pm2; then
            return 0
        fi
    fi
    
    # Try bun
    if [ -n "$bun_cmd" ]; then
        if run_with_loader "Installing PM2 via bun" $bun_cmd install -g pm2; then
            return 0
        fi
    fi
    
    # Check if it's available now
    if command_exists pm2; then
        show_success "PM2 is now available"
        return 0
    fi
    
    show_warning "Could not install PM2. Some features may be limited."
    return 1
}

# ========================= CLEANUP =========================

cleanup() {
    if [ -n "${temp_dir}" ] && [ -d "${temp_dir}" ]; then
        rm -rf "${temp_dir}" &>/dev/null || true
    fi
    
    if [ $? -ne 0 ] && [ ${current_step} -lt ${TOTAL_STEPS} ]; then
        printf "\n%s %s%s%s Installation was interrupted. Please try again.\n" \
            "${SYMBOL_ERROR}" "${RED}${BOLD}" "INTERRUPTED" "${RESET}"
    fi
}

trap cleanup EXIT

# ========================= MAIN INSTALLATION FLOW =========================

main() {
    # Show beautiful banner
    show_banner
    
    # System compatibility check
    if [[ "$OSTYPE" != "darwin"* ]] && [[ "$OSTYPE" != "linux"* ]]; then
        show_error "This installer only supports macOS and Linux environments."
    fi
    
    # Initialize shell detection
    detect_shell_config
    
    # Step 1: Check prerequisites
    show_progress "Checking prerequisites"
    printf "\n"
    if ! command_exists curl; then
        check_git
    fi
    
    # Step 2: Setup runtime
    show_progress "Setting up Bun runtime"
    printf "\n"
    if ! install_bun; then
        show_error "Failed to install or locate Bun runtime. Please install manually and try again."
    fi
    
    # Step 3: Download source
    show_progress "Downloading Furikake"
    printf "\n"
    download_code
    
    # Step 4: Install components
    show_progress "Installing components"
    printf "\n"
    if ! install_app; then
        show_error "Failed to install Furikake components. Please check your internet connection and try again."
    fi
    
    # Step 5: Configure environment  
    show_progress "Configuring environment"
    printf "\n"
    run_with_loader "Configuring environment" configure_environment
    
    # Step 6: Install PM2 (optional)
    show_progress "Installing PM2"
    printf "\n"
    if ! install_pm2; then
        show_info "PM2 installation skipped (optional)"
    fi
    
    # Step 7: Final verification
    show_progress "Finalizing installation"
    printf "\n"
    
    # Installation complete
    printf "\n"
    printf "  %s✓ furi installation complete%s" "${GREEN}" "${RESET}"
    printf "\n"
    
    if command_exists furi; then
        printf "      %sRun %s%sfuri%s%s to get started%s\n" "${DIM}" "${RESET}" "${BOLD}" "${RESET}" "${DIM}" "${RESET}"
    else
        printf "  %sRestart your terminal and run %s%sfuri%s%s to get started%s\n" "${DIM}" "${RESET}" "${BOLD}" "${RESET}" "${DIM}" "${RESET}"
    fi
    printf "\n"
}

# Run the main installation
main "$@"