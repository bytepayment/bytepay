```shell
# 构建
# rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
cp ./target/wasm32-unknown-unknown/release/bytepay_contract_near.wasm ./build/

# 发布
near dev-deploy res/bytepay_contract_near.wasm
```
