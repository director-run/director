# Director VM Sandbox

**Note: for Apple Silicon Only**

When you use an Stdio MCP server, it's essentially running unsigned code from the internet. To protect yourself from remote code attacks you can use the virtual machine (VM) sandbox. It allows you to run director (and all the MCP servers) inside an Ubuntu VM. 

## Dependencies
```
brew install cirruslabs/cli/tart
brew install ansible
brew install sshpass
```

## Using
```
git clone ...

bun cli create my-computer --start
bun cli provision my-computer

# ssh into the computer
./ssh.sh my-computer 
./run-director.sh
```