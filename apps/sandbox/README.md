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

bun cli create gm --start
bun cli provision gm
bun cli clone gm my-sandbox
bun cli ssh my-sandbox

cd director # this is the root of this monorepo
bun cli serve

```

## TODO 
- use key based authentication for ssh
- add command --mount director/source
- document a way to run director from source code
- easy way to create a golden master and clone from it rather than starting fresh each time