# Bytepay

Bytepay is a platform that supports paid tasks to complete open-source projects on Github.
<br/>

## Visit Our Online Project (Recommend)

[Bytepay](https://bytepay.online)

<br/>

## How to run this project (dev mode)

### 1. Run docker command

```bash
docker run --rm -p 10086:80 sulnong/bytepay:app-v1
```

### 2. Open your browser

Open http://localhost:10086
<br/>

## How To Run Test

### Method 1 - By docker
```bash
docker pull sulnong/bytepay:test
docker run --rm sulnong/bytepay:test
```

### Method 2 - By local environment
```bash
git clone git@github.com:bytepayment/bytepaytest.git
cd bytepay/test
npm i
npm run test
```

## Test Report

After you run the command

**Notice**: Test will create an issue and does the main workflow like create task, apply task and pay for the task.

`In the end, test report would print an issue html url, please visit to check detail.`

You will get a test repost as following:

```bash
  Github Public Repo
    ✔ get() should be ok (1545ms)

  Github Public Userinfo
    ✔ get() should be ok (964ms)

  Interact With Repo
    ✔ userinfo:get() should be ok (2046ms)
    ✔ binded-repos:get() should be ok (1007ms)
    ✔ all-repos:get() should be ok (8579ms)
    ✔ unbind a binded repo should be ok (1118ms)
    ✔ bind a unbind repo should be ok (1246ms)

  Polkadot Related API
    ✔ userinfo:get() should be ok (901ms)
    ✔ polkadot-address:get() should be ok (809ms)
    ✔ polkadot-mnemonic:get() should be null (715ms)
    ✔ polkadot-account-info:get() should be ok (800ms)
    ✔ developer:bind_own_address() should be ok (2291ms)
    ✔ polkadot-transfers-record:get() should be ok (2380ms)
    ✔ polkadot-transfer:signAndSend() should be ok (1394ms)
    ✔ polkadot:ensure-transfer-success() should be ok (7984ms)

  Get Tasks From Bytepay
    ✔ dev_task:get() should be ok (2866ms)
    ✔ author_task:get() should be ok (1473ms)

  Interact With Repo
    ✔ Issue:create() should be ok (1196ms)
    ✔ Task:create() sould be ok (3206ms)
    ✔ Task:apply() should be ok (3531ms)
    ✔ Task:pay() should be ok (4686ms)
    ✔ Task:check() should be ok (2000ms)


  22 passing (60s)
Please visit https://github.com/bytepayment/bytepaytest/issues/4 check this full workflow...
```

## Ink! Transfer Contract

`source code` was `./smart-contract/lib.rs`

**Notice**:

Since [canvas-ui](https://paritytech.github.io/canvas-ui/#/instantiate) could not upload contract now, visit [opened issue](https://github.com/substrate-developer-hub/substrate-docs/issues/789) for detail,
we provide off-chain test.

```bash
cd smart-contract
cargo +nightly test
```

Above command would failed because deposit doesn't works. see [opened issue](https://github.com/paritytech/ink/issues/1117) for detail.


## Run all in local mode
```bash
docker-compose up
```

Above command would start three containers:
1. mongo - local database
2. web - our bytepay frontend web
3. app-server - bytepay backend server


Note: 
- backend app server is based on [lafyun/app-service](https://registry.hub.docker.com/r/lafyun/app-service), which is a http-backend-server runtime.
- Check [Dockerfile](https://github.com/bytepayment/bytepay/blob/main/server/Dockerfile) to know how we build.
- All our backend implementation is in directory [server/functions](https://github.com/bytepayment/bytepay/tree/main/server/functions).
- [This script - init.js](https://github.com/bytepayment/bytepay/blob/main/server/init.js) integrated our backend implementation with [lafyun/app-service](https://registry.hub.docker.com/r/lafyun/app-service)
