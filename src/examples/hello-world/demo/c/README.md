# Hello World (C)

Compile with the following shell command

```shell
clang --target=wasm32 --no-standard-libraries -Wl,--export-all -Wl,--no-entry -o hello-world.wasm hello-world.c
```