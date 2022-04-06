# Bytepay ink! contract

## Why need a contract
1. Bytepay platform no longer needs the owner to recharge, just need to sign a contract with the owner
2. Bytepay platform does not have the authority to set a whitelist, ensuring that the platform cannot transfer funds to addresses other than the whitelist set by the owner
3. The single maximum amount and the total amount set to a certain extent ensure the safety of the owner's funds.

## Why ink! contract
1. ink! is based on substrate, we believe substrate ecosystem would be develop very fast.
2. ink! chooses not to invent a new programming language, but rather adapt a subset of Rust to serve our purpose.
3. Rust is an ideal smart contract language: It is type safe, memory safe, and free of undefined behaviors.
4. 1st class Wasm: Rust provides the first class support for the WebAssembly.

## Dive into

> This contract has three interfaces:

1. Set the maximum amount and maximum total amount for each transaction
set_limit(per_transfer_amount, total_transfer_amount)
Only the owner of the project has the calling permission

2. Set up the transfer whitelist
set_witelist(username, address)
Only the owner of the project has the calling permission

3. Transfer interface
transfer(address,amount)
The platform has the calling permission
