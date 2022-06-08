# Bytepay ink! 合约

## 为什么需要合约

1. Bytepay 平台不再需要业主充值，只需与业主签订合同
2. Bytepay 平台无权设置白名单，确保平台无法将资金转移到所有者设置的白名单以外的地址
3. 单笔最高额度和总额度设置在一定程度上保证了业主资金的安全。
   <br/><br/>

## Why ink! contract

1. 墨水！是基于底物的，我们相信底物生态系统会发展得非常快。
2. 墨水！选择不发明一种新的编程语言，而是调整 Rust 的一个子集来服务于我们的目的。
3. Rust 是一种理想的智能合约语言：它是类型安全的、内存安全的，并且没有未定义的行为。
4. 一流的 Wasm：Rust 为 WebAssembly 提供一流的支持。
   <br/><br/>

## 合约执行

### 1. 存储

```rust
/// 字节支付存储
/// 保存所有者、余额图和白名单矢量
#[ink(storage)]
#[derive(SpreadAllocate)]
pub struct Bytepay {
    owner: AccountId,
    balances: Mapping<AccountId, Balance>,
    whitelist: Mapping<(AccountId, AccountId), Balance>,
}
```

- `owner`: 这里指的是字节支付平台，所有者是 `polkadot AccountId` 谁实例化这个合约，未来字节支付平台会支持更多的加密货币。
- `balances`: balances 存储每个调用的用户的余额 `deposit` 函数.
- `whitelist`: 用户可以调用 `set_whitelist` 功能设置白名单，限制字节支付平台可以转账的数量和地址。

### 2. 核心功能

#### 2.1 存款

```rust
/// 从调用者余额中通过捐赠存款
///
/// 错误
/// 如果请求存款超过呼叫者余额，则会出现恐慌
/// 因其他原因存款失败时的恐慌
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

Bytepay用户可以调用该函数为该合约充值一些加密货币(等于存款), 然后他可以调用`set_whitelist`函数来决定字节支付平台可以转移到哪里以及转移多少。

#### 2.2 设置白名单

```rust
/// 设置白名单，只有作者有权限调用该函数
///
/// 错误
/// 万一来电者没有存款时的恐慌
pub fn set_whitelist(&mut self, account: AccountId, amount: Balance) {
    let caller = self.env().caller();
    let balance = self.balance_of(&caller);

    // 只有存款的人才能设置白名单
    assert!(balance != 0, "Account have no deposits");

    let mut dev_balances = self.whitelist.get((&caller, &account)).unwrap_or_default();
    dev_balances += amount;
    self.whitelist.insert((&caller, &account), &dev_balances);
}
```

充值后，用户可以调用 set_whitelist 来限制 `amount` 和 `address` 那个字节支付平台可以转账

#### 2.3 转移

```rust
/// 转移
/// 只有平台有权调用该函数
///
/// 错误
/// 万一调用者不是平台时发生恐慌
/// 万一惊慌失措
pub fn transfer(&mut self, from: AccountId, to: AccountId, amount: Balance) -> bool {
    // 只有合同所有者才能进行转让工作
    let caller = self.env().caller();
    assert!(caller == self.owner, "Not Contract Owner");

    // 签到帐户来自白名单
    let to_balance = self.whitelist.get((&from, &to)).unwrap_or_default();
    assert!(to_balance >= amount, "beyond value in whitelist");

    // 查看余额
    let mut balance = self.balance_of(&from);
    assert!(balance >= amount, "Not enough balance");

    // 转移
    assert!(self.env().transfer(to, amount).is_ok());
    balance -= amount;
    self.balances.insert(caller, &balance);
    return true;
}
```

开源项目开发者完成任务后，所有者或其他人可以使用
`/bytepay pay` 指令支付给开发者，然后字节支付团队将调用 `transfer` 功能将加密货币从所有者的余额转移到开发者的地址。

#### 2.4 提现

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
