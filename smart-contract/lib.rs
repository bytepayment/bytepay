//! A smart contract which demonstrates behavior of the `self.env().transfer()` function.
//! It transfers some of it's balance to the caller.

#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::new_without_default)]

use ink_lang as ink;

#[ink::contract]
pub mod give_me {
    /// No storage is needed for this simple contract.
    #[ink(storage)]
    pub struct GiveMe {
        owner: AccountId,
        balances: ink_storage::collections::HashMap<AccountId, Balance>,
        whitelist: ink_storage::collections::Vec<AccountId>,
    }

    impl GiveMe {
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
            assert!(balance != 0);
            self.whitelist.push(account);
        }

        /// Transfer
        pub fn transfer(&mut self) {
            // Only owner of contract can do transfer work
            assert!(self.env().caller() == self.owner);

            // Check whitelist
        }

        fn balance_of(&self, account: &AccountId) -> Balance {
            *self.balances.get(&account).unwrap_or(&0)
        }
    }

    #[cfg(not(feature = "ink-experimental-engine"))]
    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_env::{call, test};
        use ink_lang as ink;

        #[ink::test]
        fn deposit_works() {
            let accounts = default_accounts();
            set_sender(accounts.alice, 100);
            let mut contract = GiveMe::new();
            assert_eq!(contract.get_owner(), accounts.alice);

            assert_eq!(contract.get(), 0);
            contract.deposit();
            assert_eq!(contract.get(), 100);

            contract.deposit();
            assert_eq!(contract.get(), 200);
        }

        /// Creates a new instance of `GiveMe` with `initial_balance`.
        ///
        /// Returns the `contract_instance`.
        // fn create_contract(initial_balance: Balance) -> GiveMe {
        //     let accounts = default_accounts();
        //     set_sender(accounts.alice, 1000);
        //     set_balance(contract_id(), initial_balance);
        //     GiveMe::new()
        // }

        // fn contract_id() -> AccountId {
        //     ink_env::test::get_current_contract_account_id::<ink_env::DefaultEnvironment>()
        //         .expect("Cannot get contract id")
        // }

        fn set_sender(sender: AccountId, balance: Balance) {
            let callee = ink_env::account_id::<ink_env::DefaultEnvironment>();
            test::push_execution_context::<Environment>(
                sender,
                callee,
                1000000,
                balance,
                test::CallData::new(call::Selector::new([0x00; 4])), // dummy
            );
        }

        fn default_accounts() -> ink_env::test::DefaultAccounts<ink_env::DefaultEnvironment> {
            ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                .expect("Off-chain environment should have been initialized already")
        }

        // fn set_balance(account_id: AccountId, balance: Balance) {
        //     ink_env::test::set_account_balance::<ink_env::DefaultEnvironment>(account_id, balance)
        //         .expect("Cannot set account balance");
        // }

        // fn get_balance(account_id: AccountId) -> Balance {
        //     ink_env::test::get_account_balance::<ink_env::DefaultEnvironment>(account_id)
        //         .expect("Cannot set account balance")
        // }
    }
}
