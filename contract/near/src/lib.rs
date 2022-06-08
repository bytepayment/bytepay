pub mod bytepay_near {
    use near_sdk::{AccountId, Balance, env, log, near_bindgen, Promise};
    use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
    use near_sdk::collections::LookupMap;

    near_sdk::setup_alloc!();

    #[near_bindgen]
    #[derive(BorshDeserialize, BorshSerialize)]
    pub struct BytePayNearContract {
        /// 所有者
        pub owner: AccountId,
        /// 余额
        pub balances: LookupMap<AccountId, Balance>,
        /// 白名单
        pub whitelist: LookupMap<(AccountId, AccountId), Balance>,
    }

    impl Default for BytePayNearContract {
        fn default() -> Self {
            Self {
                owner: env::current_account_id(),
                balances: LookupMap::new(b"b".to_vec()),
                whitelist: LookupMap::new(b"w".to_vec()),
            }
        }
    }

    /// 实现
    #[near_bindgen]
    impl BytePayNearContract {
        /// 获取合约所有者
        pub fn get_owner(&self) -> AccountId {
            self.owner.clone()
        }

        /// 获取调用者余额
        pub fn get_balance(&self) -> Option<Balance> {
            self.balances.get(&env::signer_account_id())
        }

        /// 获取指定账号余额
        pub fn get_account_balance(&self, account: &AccountId) -> Option<Balance> {
            self.balances.get(account)
        }

        /// 查看指定账户的白名单限制
        pub fn get_whitelist(&self, account: AccountId) -> Option<Balance> {
            self.whitelist.get(&(env::signer_account_id(), account))
        }

        /// 充值
        pub fn recharge(&mut self, amount: Balance) -> &'static str {
            let signer_account = env::signer_account_id();
            let balance = self.balances.get(&signer_account).unwrap_or_default();

            Promise::new(env::current_account_id()).transfer(amount);
            self.balances.insert(&signer_account, &(amount + balance));

            "END"
        }

        /// 设置 / 更新 白名单
        pub fn set_whitelist(&mut self, account: AccountId, amount: Balance) -> &'static str {
            let signer_account = env::signer_account_id();
            let balances = self.balances.get(&signer_account).unwrap_or_default();

            if amount > balances {
                log!("INSUFFICIENT_BALANCE");
                return "INSUFFICIENT_BALANCE";
            }
            let key = (signer_account, account);
            let old = self.whitelist.get(&key).unwrap_or_default();
            self.whitelist.insert(&key, &(old + amount));

            "END"
        }

        /// 在白名单的限制下, 合约管理者发起转账
        pub fn transfer(&mut self, from: AccountId, to: AccountId, amount: Balance) -> &'static str {
            let call = env::signer_account_id();
            let current = env::current_account_id();
            if call != current {
                log!("PERMISSION_DENIED");
                return "PERMISSION_DENIED";
            }

            let key = (from.clone(), to.clone());
            let limit = self.whitelist.get(&key).unwrap_or_default();

            let zero = Balance::from('0');
            if amount < zero || (limit == zero && amount > limit) {
                log!("EXCEED_THE_LIMIT");
                return "EXCEED_THE_LIMIT";
            }

            // 发起交易
            Promise::new(to).transfer(amount);

            let balance = self.balances.get(&from).unwrap_or_default();
            self.balances.insert(&from, &(balance - amount));

            "END"
        }
    }

    /// 单元测试
    #[cfg(not(target_arch = "wasm32"))]
    #[cfg(test)]
    mod bytepay_near_test {
        use near_sdk::{testing_env, VMContext};
        use near_sdk::MockedBlockchain;

        use super::*;

// use serde_json::to_string;

        fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
            VMContext {
                current_account_id: String::from("合约拥有者账户"),
                signer_account_id: String::from("签名账户"),
                signer_account_pk: vec![0, 1, 2],
                predecessor_account_id: String::from("前任账户"),
                input,
                block_index: 0,
                block_timestamp: 0,
                account_balance: 1000000,
                account_locked_balance: 0,
                storage_usage: 0,
                attached_deposit: 0,
                prepaid_gas: 10u64.pow(18),
                random_seed: vec![0, 1, 2],
                is_view,
                output_data_receivers: vec![],
                epoch_height: 0,
            }
        }

        /// 测试充值
        #[test]
        fn test_recharge() {
            let context = get_context(vec![], false);
            testing_env!(context);
            let mut contract = BytePayNearContract::default();
            // --------------------------------------------------------------------------
            let msg = contract.recharge(233);
            println!("回执消息: {}", msg);
            let balance = contract.get_balance().unwrap_or_default();
            assert_eq!(balance, 233);
        }

        /// 测试设置白名单
        #[test]
        fn test_set_whitelist() {
            let context = get_context(vec![], false);
            testing_env!(context);
            let mut contract = BytePayNearContract::default();
            // --------------------------------------------------------------------------

            let limit = 0;
            let msg = contract.set_whitelist(AccountId::from("test-account.near.org"), limit);
            println!("设置白名单回执消息: {}", msg);
            assert_eq!(msg, "END");

            let option = contract.get_whitelist(AccountId::from("test-account.near.org"));
            assert_eq!(option.unwrap_or_default(), limit)
        }

        /// 测试转账
        #[test]
        fn test_transfer() {
            let context = get_context(vec![], false);
            testing_env!(context);
            let mut contract = BytePayNearContract::default();
            // --------------------------------------------------------------------------

            let msg = contract.transfer(env::current_account_id(), AccountId::from("test-account.near.org"), 233);
            println!("回执: {}", msg)
        }
    }
}
