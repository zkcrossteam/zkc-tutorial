clang --target=wasm32 --no-standard-libraries -Wl,--export-all -Wl,--no-entry -o helloWorld.wasm helloWorld.c