if [ -z "$1" ]; then
  echo "Usage: $0 <vm-name>" >&2
  exit 1
fi

VM_NAME="$1"
PASSWORD="admin"  # default password is "admin"

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no admin@$(tart ip "$VM_NAME")