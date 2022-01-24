//! A smart contract which demonstrates behavior of the `self.env().transfer()` function.
//! It transfers some of it's balance to the caller.

#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::new_without_default)]

use ink_lang as ink;

#[ink::contract]
pub mod bytepay {
    /// No storage is needed for this simple contract.
    #[ink(storage)]
    pub struct Bytepay {
        owner: AccountId,
        balances: ink_storage::collections::HashMap<AccountId, Balance>,
        whitelist: ink_storage::collections::Vec<AccountId>,
    }

    impl Bytepay {
        /// Creates a new instance of this contract.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                balances: Default::default(),
                whitelist: Default::default(),
            }
        }

        /// Get Contracts Owner
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        /// Get caller balance
        #[ink(message)]
        pub fn get(&self) -> Balance {
            self.balance_of(&self.env().caller())
        }

        /// Get balance for a given account
        #[ink(message)]
        pub fn get_account_balance(&self, account: AccountId) -> Balance {
            self.balance_of(&account)
        }

        /// Deposit
        #[ink(message, payable)]
        pub fn deposit(&mut self) {
            let caller = self.env().caller();
            let deposited = self.env().transferred_value();
            let mut balance = self.balance_of(&caller);
            balance += deposited;
            self.balances.insert(caller, balance);
        }

        /// Withdraw
        #[ink(message)]
        pub fn withdraw(&mut self, amount: Balance) {
            let caller = self.env().caller();
            let mut balance = self.balance_of(&caller);

            // This means this caller have not deposit or his account have no balance
            // or balance is not enough for number he want to withdraw
            assert!(balance >= amount, "Not enough balance");

            // Start transfer given amount to caller
            assert!(self.env().transfer(caller, amount).is_ok());
            balance -= amount;
            self.balances.insert(caller, balance);
        }

        /// Set Whitelist
        pub fn set_whitelist(&mut self, account: AccountId) {
            let caller = self.env().caller();
            let balance = self.balance_of(&caller);

            // only who deposited can set white-list
            assert!(balance != 0, "Account have no deposits");

            // check account if already in whitelist
            if self.is_account_in_whitelist(&account) {
                return;
            }
            self.whitelist.push(account);
        }

        /// Transfer
        pub fn transfer(&mut self, account: AccountId, amount: Balance) -> bool {
            // Only owner of contract can do transfer work
            let caller = self.env().caller();
            assert!(caller == self.owner, "Not Contract Owner");

            // Check whitelist
            if !self.is_account_in_whitelist(&account) {
                return false;
            }
            // Check balance
            let mut balance = self.balance_of(&caller);
            assert!(balance >= amount, "Not enough balance");

            // Transfer
            assert!(self.env().transfer(account, amount).is_ok());
            balance -= amount;
            self.balances.insert(caller, balance);
            return true;
        }

        fn balance_of(&self, account: &AccountId) -> Balance {
            *self.balances.get(&account).unwrap_or(&0)
        }

        fn is_account_in_whitelist(&self, account: &AccountId) -> bool {
            for item in &self.whitelist {
                if account == item {
                    return true;
                }
            }
            return false;
        }
    }

    #[cfg(not(feature = "ink-experimental-engine"))]
    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_env::{call, test};
        use ink_lang as ink;

        #[ink::test]
        fn contract_init_works() {
            // Use Alice as contract owner
            let accounts = default_accounts();
            set_sender(accounts.alice, None);
            let contract = Bytepay::new();

            // Alice is owner of contract
            assert_eq!(contract.get_owner(), accounts.alice);

            // Bob is not owner of contract
            assert_ne!(contract.get_owner(), accounts.bob);
        }

        #[ink::test]
        fn deposit_works() {
            // Use Alice as contract owner
            let accounts = default_accounts();
            let alice = accounts.alice;
            let bob = accounts.bob;
            let eve = accounts.eve;
            set_sender(alice, None);
            let mut contract = Bytepay::new();

            // Bob Deposit
            set_balance(bob, 200);
            set_sender(bob, Some(100));
            contract.deposit();
            assert_eq!(contract.get(), 100);

            // Eve havn't deposit
            set_balance(eve, 200);
            set_sender(eve, None);
            assert_eq!(contract.get(), 0);
            assert_eq!(get_balance(eve), 200);
        }

        #[ink::test]
        fn set_whitelist_works() {}

        #[ink::test]
        fn withdraw_works() {
            // Use Alice as contract owner
            let accounts = default_accounts();
            let alice = accounts.alice;
            let bob = accounts.bob;
            let eve = accounts.eve;
            set_sender(alice, None);
            let mut contract = Bytepay::new();

            // Bob deposit
            set_balance(bob, 200);
            set_sender(bob, Some(100));
            contract.deposit();
            assert_eq!(contract.get(), 100);

            // Bob withdraw
            contract.withdraw(50);
            assert_eq!(contract.get(), 50);
            assert_eq!(get_balance(bob), 150);

            // Eve withdraw
            set_sender(eve, None);
            contract.withdraw(100);
        }

        #[ink::test]
        fn transfer_works() {}

        fn set_sender(sender: AccountId, endowment: Option<Balance>) {
            let callee = ink_env::account_id::<ink_env::DefaultEnvironment>();
            test::push_execution_context::<Environment>(
                sender,
                callee,
                1000000,
                endowment.unwrap_or(0),
                test::CallData::new(call::Selector::new([0x00; 4])), // dummy
            );
        }

        fn default_accounts() -> ink_env::test::DefaultAccounts<ink_env::DefaultEnvironment> {
            ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                .expect("Off-chain environment should have been initialized already")
        }

        fn set_balance(account_id: AccountId, balance: Balance) {
            ink_env::test::set_account_balance::<ink_env::DefaultEnvironment>(account_id, balance)
                .expect("Cannot set account balance");
        }

        fn get_balance(account_id: AccountId) -> Balance {
            ink_env::test::get_account_balance::<ink_env::DefaultEnvironment>(account_id)
                .expect("Cannot set account balance")
        }
    }
}
