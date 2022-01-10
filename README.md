# Dot Pay

## LICENSE

## How to run this project

### 1. Eidt your host file
```bash
127.0.0.1   dotpay.com
```
### 2. Clone And Run
```bash
git clone git@github.com:zhuo-tech/dot-pay-client.git
cd dot-pay-clinet
npm i
npm run dev
```

### 3. Open your browser
Open http://dotpay.com:3000

### Milestone 1 — User account management & repo management & mnemonic management
* **Estimated Duration:** 4 weeks
* **FTE:**  5
* **Costs:**  15,000 USD

| Number | Deliverable | Specification | Progress |
| ------------- | ------------- | ------------- |------------- |
| 0a. | License | Apache 2.0 | `Done` |
| 0b. | Documentation | Dotpay user guide, workflow, and what is dotpay. | `0%` |
| 0c. | Testing Guide | We will provide uni test for user management and recharge management modules(70% cover), the two module UI test report | `0%` |
| 0d. | Docker | We will provide Dockerfile and docker image to run the website in one command line | `Done, 暂未测试` |
| 1. | User management, create an polkadot account for each developer | We will provide login function, you can login our website using github, and we will create an polkadot account for each user by default | `Done` |
| 2. | Repo & webhook management| We will fetch your github repo list, so you can active the repo you want integrate with polkadot, the webhook module will listen the pay event and tigger transform module to pay developer DOT | 已完成：`List github public repo`; `绑定仓库：添加webhooks`; 未完成：`监听issue并执行对应逻辑` |
| 3. | Address binding | Develop using github issue comment to bind there polkadot address. `/dotpay bind [address]` | `0%`|
| 4. | Recharge management | Recharge DOT to your platform account | `Done` |
| 5. | Transfer ink! contract| We will provide an tested ink! contract on Substrate Smart Contracts Node, provide transfer limit, witelist and transfer function. The platform will integrate the contract when the Polkadot mainnet contract para chain is available. | `0%` |
