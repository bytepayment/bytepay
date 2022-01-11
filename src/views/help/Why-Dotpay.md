DotPay is a payment platform, you can initiate open source tasks and paid with DOT tokens  (for example, you can initiate paid collaboration tasks when you encounter difficulties in architecture construction, requirements analysis, document construction and testing). Those who complete the tasks as required can receive tokens after the task initiator verifies that the tasks are completed

The specific process is as follows:
1. Alice recharge Dot tokens on the platform.
2. Alice initiates paid open source tasks on the Github (such as the task about architecture construction, requirements analysis, document construction, development and testing, etc )
3. Bob accepted this task on Github and completed it!
4. Alice clicks on the payment instruction.
Github receives the instruction and trigger the webhook to contact Bob by email and other notification methods to notify that 10 DOT tokens have been put into our platform
Exclusive account Wallet.
5. Call Polkadot API for on-chain transfer.
6. Bob withdraws 10 DOT tokens from our platform to his wallet(such as Polkawallet or MetaMask), if Bob already bind his own address, will transfer DOT to his account directly.

### Data models / API specifications of the core functionality

> Create tasks
```
{
  "id": "issue id",
  "name": "issue name",
  "repo": "paritytech/substrate",
  "author": "gavofyork",
  "pay": "10DOT",
  "describe": "issue overview",
  "createTime": "",
  "updataTime": "",
}
```

> Apply task
```
{
   "issueID": "issue id",
   "applier": "Bob",
   "applyTime": ""
}
```

> Payment
Command line in issue reply: `/pay Bob 10DOT`

```
{
   "id": "payment id",
   "from": "Alice",
   "to": "Bob",
   "amount": "10DOT",
   "RMKS": "Alice pay bob",
}
```

### An overview of the technology stack to be used

* Font-end, typescipt,react
* Backend, golang,Rust
* Devops, github action, kubenretes
* Search, MeiliSearch

### Key Functions

0. User management
    - Using github OAuth2 login, user group management.

1. Email / Issue informal
    - Imformal user to withdraw their DOT tokens.

2. Webhook sever
    - Github webhook management, listen events and trigger payment.

3. Transfer module
    - Transfer by calling the API of the chain.

4. Recharge / Withdraw
    - User recharge DOT tokens if they want to pay others on Github.
    - User withdraw  DOT tokens to their own wallet.

5. Issue search
    - Users can find and filter paid collaboration tasks that meet their requirements in the issue search form.

6. Payment secrect management
    - Create it on DotPay website and config it to github secrect to pay user DOT.

7. Recharge & transfer by ink! contract

* Set the maximum amount and maximum total amount for each transaction
set_limit(per_transfer_amount, total_transfer_amount)
Only the owner of the project has the calling permission

* Set up the transfer whitelist
set_witelist(username, address)
Only the owner of the project has the calling permission

* Transfer interface
transfer(address,amount)
The platform has the calling permission

Benefits of this design:
* The platform no longer needs the owner to recharge, just need to sign a contract with the owner
* The platform does not have the authority to set a whitelist, ensuring that the platform cannot transfer funds to addresses other than the whitelist set by the owner
* The single maximum amount and the total amount set to a certain extent ensure the safety of the owner's funds


### Ecosystem Fit

As far as I am concerned, there are no similar projects in Polkadot ecosystem.

Maybe we have some similarities with dotmarket, there are still many differences to compare with dotmarket,

dotpay will focus on open-source payment collaboration, deep integration with GitHub, closer to end-users，

what's more important is we prefer to realize open source payment cooperation in Polkadot ecosystem.

As we all know Polkadot offers flexible cross-chain interoperation functionality with a large user base and volume expectation,

and as a mainstream cryptocurrency with high market value, DOT tokens is easier for developers to accept and be recognized，

we also believe that we will attract more Github developers especially who not familiar with blockchain to join and expand the user-number of Polkadot ecosystem.

And we also look forward to cooperating with dotmarket in the future.

## Team :busts_in_silhouette:

### Team members

We will pleased to offer github accounts, LinkedIn and any other information in private.

All team members can contact privately for any specific information.

* Richard Fang: team leader, core developer

* Fugen Wang: Background development
  - responsible for the development of the website background.

* Yang Li:
  - Responsible for front-end development.

* Peng Qiao: Rust developer
  - Responsible for back-end development, relevant development of blockchain, payment task management module, and docking API and key management module on the chain.


* Wei Zhang:
  - Responsible for operation, promotion in the open source community after the website is launched, and attracting open source projects to use our services.

* AdaLam:  PD/PMO
  - Responsible for product design and project schedule management.

### Team's Experience

* Richard Fang:
    - As an expert in the field of cloud computing in one of the biggested Internet listed companies with 7 years of rich working  experience.
    - The author of a well-known cloud native project which has more than 5K stars and 4k paid enterprise users.

* Fugen Wang:
   - CEO of an Internet start-up company and manages more than a dozen employees with 7 years working experience.

* Yang Li:
   - Andriod/IOS front-end engineer with 5 years working experience.

* Peng Qiao:
   - A core member of AI Research Institute wich is one of the top AI listed companies in China with 5 years working experience.

* Wei Zhang:
   - An advertising director, one of the top AI listed companies in China with 7 years of rich working experience.

* AdaLam: PD/PMO
  - Familiar with product design and project schedule management.

### Contact

- **Contact Name:**  AdaLam
- **Contact Email:** adalamlzy@gmail.com
- **Website:**  comming soon

- **Contact Name:** Richard Fang
- **Contact Email:** lamelegdog@gmail.com