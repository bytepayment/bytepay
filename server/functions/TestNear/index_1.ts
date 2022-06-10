

import cloud from '@/cloud-sdk'
import * as nearAPI from "near-api-js";

exports.main = async function (ctx: FunctionContext) {
  const { KeyPair, connect, keyStores, WalletConnection } = nearAPI;

  const keyStore = new keyStores.InMemoryKeyStore();
  const PRIVATE_KEY =
    "3ZtthmdHUNqwBauUqHvtXBr7NKoAbdDzDZomuSuc7A2wVGSRsym3gpjnCRmBUVYTUARaY78woxXwD2e8iDZokA9u";
  // creates a public / private key pair using the provided private key
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  // adds the keyPair you created to keyStore
  await keyStore.setKey("testnet", "yudie.testnet", keyPair);

  const config = {
    networkId: "testnet",
    keyStore,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };

  // connect to NEAR
  const near = await connect(config);
  // 创建子账户的用户名必须.主账户名字结尾
  const account = await near.account("yudie.testnet");
  // const res  = await account.deleteAccount();
  // console.log(res)

  // creates a new account using funds from the account used to create it

  // const dd = await account.createAccount(
  //   "zhanghao2.yudie.testnet", // new account name
  //   "FfnKsGnWh1GeVBPCNnHvTQYoTe8VgRCidNTaqxvZfcok", // public key for new account
  //   "3820000000000000000000" // initial balance for new account in yoctoNEAR
  // ); 
  // // initial balance 最少是0.00182000_00000000_00000000
  // // initial balance 最少是0.01000000_00000000_00000000




  const i = await account.sendMoney(
    "zhanghao2.yudie.testnet", // receiver account
    '10000000000000000000000'
  );

  console.log('转账响应: ', JSON.stringify(i, null, 4))

  console.log(await account.getAccountBalance(), '钱包')
  // create wallet connection
}

