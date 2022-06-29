```shell
# 构建
# rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
cp ./target/wasm32-unknown-unknown/release/bytepay_contract_near.wasm ./build/

# 发布
near dev-deploy res/bytepay_contract_near.wasm
```
# testnet
Near cli : https://gist.github.com/think-in-universe/019671d56a949ec8a475126f22d21248
export NEAR_CLI_TESTNET_RPC_SERVER_URL=https://public-rpc.blockpi.io/http/near-testnet
export NEAR_ENV=testnet
near deploy --accountId lafyun.testnet  --wasmFile ./contract/near/build/bytepay_contract_near.wasm

# mainnet
Near cli : https://gist.github.com/think-in-universe/019671d56a949ec8a475126f22d21248
export NEAR_CLI_MAINNET_RPC_SERVER_URL=https://public-rpc.blockpi.io/http/near
export NEAR_ENV=mainnet

near deploy --accountId ff3e8979eb1eac55858651bb40e51760bdfcf12ef57b1edbdd75f53fb0ed6c06 --wasmFile ./build/bytepay_contract_near.wasm