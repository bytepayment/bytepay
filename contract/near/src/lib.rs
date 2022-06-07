pub mod bytepay_near {
    use near_sdk::{AccountId, Balance, env, near_bindgen};
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
        pub whitelist: LookupMap<(AccountId, AccountId), String>,
    }

    impl Default for BytePayNearContract {
        fn default() -> Self {
            Self {
                owner: String::from("琉璃"),
                balances: LookupMap::new(b"b".to_vec()),
                whitelist: LookupMap::new(b"w".to_vec()),
            }
        }
    }

    /// 实现
    #[near_bindgen]
    impl BytePayNearContract {
        pub fn set_state(&mut self, msg: &Balance) {
            let account_id: AccountId = env::signer_account_id();
            self.balances.insert(&account_id, &msg);
        }

        pub fn get_msg(&self) -> Option<Balance> {
            self.balances.get(&env::signer_account_id())
        }

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

        /// 冻结金额 定金
        pub fn deposit(&self) {
            println!("暂未实现")
        }

        /// 转账
        pub fn withdraw(&self, amount: Balance) {
            let balance = match self.balances.get(&env::signer_account_id()) {
                None => {
                    println!("没有余额");
                    // 权宜之策
                    return;
                }
                Some(b) => b
            };

            if balance < amount {
                println!("余额不足");
                return;
            }

            // TODO:: 转账
            // env::promise_batch_action_transfer()
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
                current_account_id: "alice_near".to_string(),
                signer_account_id: "bob_near".to_string(),
                signer_account_pk: vec![0, 1, 2],
                predecessor_account_id: "carol_near".to_string(),
                input,
                block_index: 0,
                block_timestamp: 0,
                account_balance: 0,
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

        #[test]
        fn test() {
            let context = get_context(vec![], false);
            testing_env!(context);
            let mut contract = BytePayNearContract::default();

            let string = 233333333333;

            contract.set_state(&string);

            assert_eq!(string, contract.get_msg().unwrap());

            println!("测试通过 {}", contract.get_msg().unwrap())
        }
    }
}
