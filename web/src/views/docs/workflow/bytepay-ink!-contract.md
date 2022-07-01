# Bytepay ink! contract

## Why need a contract
1. Bytepay platform no longer needs the owner to recharge, just need to sign a contract with the owner
2. Bytepay platform does not have the authority to set a whitelist, ensuring that the platform cannot transfer funds to addresses other than the whitelist set by the owner
3. The single maximum amount and the total amount set to a certain extent ensure the safety of the owner's funds.
<br/><br/>

## Why ink! contract
1. ink! is based on substrate, we believe substrate ecosystem would be develop very fast.
2. ink! chooses not to invent a new programming language, but rather adapt a subset of Rust to serve our purpose.
3. Rust is an ideal smart contract language: It is type safe, memory safe, and free of undefined behaviors.
4. 1st class Wasm: Rust provides the first class support for the WebAssembly.
<br/><br/>

## Contract implementation

### 1. Storage
```rust
/// Bytepay storage
/// Save owner, balances map and whitelist vector
#[ink(storage)]
#[derive(SpreadAllocate)]
pub struct Bytepay {
    owner: AccountId,
    balances: Mapping<AccountId, Balance>,
    whitelist: Mapping<(AccountId, AccountId), Balance>,
}
```
- `owner`: Here means bytepay platform, owner is an `polkadot AccountId` who instantiate this contract, in the future, bytepay platform will support more cryptocurrency.
- `balances`: balances store balance of every user who call the `deposit` function.
- `whitelist`: user can call `set_whitelist` function to set whitelist to limit the amount and address that bytepay platform can transfer.

### 2. Core Function

#### 2.1 deposit
```rust
/// Deposit by endowment from caller balance
///
/// Errors
/// Panics in case the request deposit exceeds the caller balance
/// Panics in case the deposit failed for another reason
#[ink(message, payable)]
pub fn deposit(&mut self) {
    let caller = self.env().caller();
    let deposited = self.env().transferred_value();
    ink_env::debug_println!("{:?} deposit {:?} tokens.", caller, deposited);
    let mut balance = self.balance_of(&caller);
    balance += deposited;
    self.balances.insert(caller, &balance);
}
```

Bytepay user can call this function to recharge some cryptocurrency to this contract(equals to deposit), then he can call `set_whitelist` function to decide where and how much bytepay platform can transfer.
#### 2.2 set_whitelist
```rust
/// Set Whitelist, only author have permission to call this function
///
/// Errors
/// Panics in case the caller have not deposited
pub fn set_whitelist(&mut self, account: AccountId, amount: Balance) {
    let caller = self.env().caller();
    let balance = self.balance_of(&caller);

    // only who deposited can set white-list
    assert!(balance != 0, "Account have no deposits");

    let mut dev_balances = self.whitelist.get((&caller, &account)).unwrap_or_default();
    dev_balances += amount;
    self.whitelist.insert((&caller, &account), &dev_balances);
}
```
After deposited, user can call set_whitelist to limit the `amount` and `address` that bytepay platform can transfer

#### 2.3 transfer
```rust
/// Transfer
/// Only the platform have permission to call this function
/// Transfer `amount` numbers of token to the given `account`
///
/// Errors
/// Panics in case the caller is not the platform
/// Panics in case
pub fn transfer(&mut self, from: AccountId, to: AccountId, amount: Balance) -> bool {
    // Only owner of contract can do transfer work
    let caller = self.env().caller();
    assert!(caller == self.owner, "Not Contract Owner");

    // Check to account is in from whitelist
    let to_balance = self.whitelist.get((&from, &to)).unwrap_or_default();
    assert!(to_balance >= amount, "beyond value in whitelist");

    // Check balance
    let mut balance = self.balance_of(&from);
    assert!(balance >= amount, "Not enough balance");

    // Transfer
    assert!(self.env().transfer(to, amount).is_ok());
    balance -= amount;
    self.balances.insert(caller, &balance);
    return true;
}
```
After open-source project developer finish the task, owner or others can use
`/bytepay pay` instruction pay for the developer, then bytepay team will call `transfer` function to transfer cryptocurrency from owner's balance to developer's address.

#### 2.4 withdraw
```rust
/// Withdraw
/// Author who deposit can withdraw his own token
#[ink(message)]
pub fn withdraw(&mut self, amount: Balance) {
    let caller = self.env().caller();
    let mut balance = self.balance_of(&caller);

    // This means this caller have not deposit or his account have no balance
    // or balance is not enough for number he want to withdraw
    assert!(balance >= amount, "Not enough balance");

    // Start transfer given amount to caller
    // assert!(self.env().transfer(caller, amount).is_ok());
    match self.env().transfer(caller, amount) {
        Ok(r) => {
            ink_env::debug_println!("{:?}", r)
        }
        Err(err) => {
            ink_env::debug_println!("{:?}", err)
        }
    }
    balance -= amount;
    self.balances.insert(caller, &balance);
}
```