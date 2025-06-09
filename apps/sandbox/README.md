# Director VM Sandbox

For Apple Silicon. Builds and runs an ubuntu VM that is completely isolated from the host. Anything you place in `./shared/` will automatically be synced to `~/shared` in the guest.

## Pre-requisits
```
brew install cirruslabs/cli/tart
brew install ansible
brew install sshpass

ansible-galaxy install geerlingguy.docker # todo requirements.yml
```

## Using
```
# Start the computer
./up.sh

# Watch for and sync any changes in ./shared
# vagrant rsync-auto

# ssh into the computer
./ssh.sh

# Destroy the computer
./down.sh
```

## TODO
```
# Install uv (which includes uvx)
sudo apt install pipx
pipx install uv
sudo apt install postgresql-client
```