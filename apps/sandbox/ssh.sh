if [ -z "$1" ]; then
  echo "Usage: $0 <vm-name>" >&2
  exit 1
fi

VM_NAME="$1"

ssh admin@$(tart ip "$VM_NAME")