//! Bytepay Smart Contract
//! This contract is made to save author(who create a task)'s token to pay for the developer
//! Owner calling deposit to sign with platform
//! Owner set up the transfer whitelist set_witelist(username, address)
//! The platform could only transfer to the account in the whitelist

#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::new_without_default)]

use ink_lang as ink;

#[ink::contract]
pub mod bytepay {
    use ink_storage::{traits::SpreadAllocate, Mapping};

    /// Bytepay storage
    /// Save owner, balances map and whitelist vector
    #[ink(storage)]
    #[derive(SpreadAllocate)]
    pub struct Bytepay {
        owner: AccountId,
        balances: Mapping<AccountId, Balance>,
        whitelist: Mapping<(AccountId, AccountId), Balance>,
    }

    impl Bytepay {
        /// Creates a new instance of this contract.
        #[ink(constructor, payable)]
        pub fn new() -> Self {
            ink_lang::utils::initialize_contract(|contract| Self::new_init(contract))
        }

        fn new_init(&mut self) {
            self.owner = Self::env().caller();
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

        fn balance_of(&self, account: &AccountId) -> Balance {
            self.balances.get(&account).unwrap_or_default()
        }

        pub fn is_account_in_whitelist(&self, from: &AccountId, to: &AccountId) -> bool {
            let to_value = self.whitelist.get((&from, &to)).unwrap_or_default();
            if to_value > 0 {
                return true;
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
            assert_eq!(get_balance(bob), 100);

            // Eve havn't deposit
            set_balance(eve, 200);
            set_sender(eve, None);
            assert_eq!(contract.get(), 0);
            assert_eq!(get_balance(eve), 200);
        }

        /// This test would failed cause haven't panic
        /// In off-chain enviroment, callser can depoist any number even if
        /// he has insufficient balance
        #[ink::test]
        #[should_panic(expected = "insufficient funds!")]
        fn deposit_failes_insufficient_balcance() {
            // Use Alice as contract owner
            let accounts = default_accounts();
            let alice = accounts.alice;
            let bob = accounts.bob;
            set_sender(alice, None);
            let mut contract = Bytepay::new();

            // Bob Deposit
            set_balance(bob, 100);
            set_sender(bob, Some(200));
            contract.deposit();

            // should panic here
        }

        #[ink::test]
        fn set_whitelist_works() {
            // Use Alice as contract owner
            let accounts = default_accounts();
            let alice = accounts.alice;
            let bob = accounts.bob;
            set_sender(alice, None);
            let mut contract = Bytepay::new();

            // Bob Deposit
            set_balance(bob, 200);
            set_sender(bob, Some(100));
            contract.deposit();
            // Bob set whitelist
            contract.set_whitelist(accounts.eve, 100);
            // Eve should in whitelist
            assert!(contract.is_account_in_whitelist(&accounts.bob, &accounts.eve));
        }

        #[ink::test]
        #[should_panic(expected = "Account have no deposits")]
        fn set_whitelist_failes_not_deposited() {
            // Use Alice as contract owner
            let accounts = default_accounts();
            let alice = accounts.alice;
            let bob = accounts.bob;
            set_sender(alice, None);
            let mut contract = Bytepay::new();

            // Bob set whitelist without deposit
            set_balance(bob, 200);
            set_sender(bob, Some(100));
            contract.set_whitelist(accounts.eve, 100);
            // panic here
        }

        /// This test would failed cause self.env().transfer() function failed
        /// In off-chain environment, deposited token seems not go into contract accounts
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
        #[should_panic(expected = "Not Contract Owner")]
        fn transfer_failes_not_contract_owner() {
            // Use Alice as contract owner
            let accounts = default_accounts();
            let alice = accounts.alice;
            let bob = accounts.bob;
            let eve = accounts.eve;
            set_sender(alice, None);
            let mut contract = Bytepay::new();

            // Bob try to transfer
            set_sender(bob, Some(0));
            contract.transfer(bob, eve, 100);

            // should panic
        }

        #[ink::test]
        fn transfer_works() {
            // Not implemented becauseof off-chain test environment have problem
        }

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
