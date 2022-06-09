import cloud from '@/cloud-sdk'
const nearAPI = require('near-api-js')

exports.main = async function (ctx: FunctionContext) {
  // creates keyStore from a private key string
  // you can define your key here or use an environment variable
  const { keyStores, KeyPair, connect, utils } = nearAPI;
  const keyStore = new keyStores.InMemoryKeyStore();
  const PRIVATE_KEY =
    "4g6oz55foGsd7DfxgGNdsy7g8G9qQH3x3XsTT646Gh22edfhxPqaXm3LbLzqAYbaKa4aYpqKRrsBf7gG6Qe8pzUA";
  // creates a public / private key pair using the provided private key
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  // adds the keyPair you created to keyStore
  await keyStore.setKey("testnet", "yudie.testnet", keyPair);

  const config = {
    networkId: "testnet",
    keyStore: keyStore, // optional if not signing transactions
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };
  const near = await connect(config);
  console.log('near', near)

  // Load Account
  const mainAccount = "yudie.testnet"
  const account = await near.account(mainAccount);
  // Get Account Balance
  const balance = await account.getAccountBalance()
  console.log('account balance', balance);

  // Create subd Account for mainAccount
  const initialBalance = "0.182"
  const amt = utils.format.parseNearAmount(initialBalance);
  // sub Account
  const subAccount = "629889a0ff68df77ddfe8034.yudie.testnet"
  console.log(subAccount.length)
  // public key for new account for main account
  const publicKey = "FfnKsGnWh1GeVBPCNnHvTQYoTe8VgRCidNTaqxvZfcok"
  console.log('initial balance for new account', amt);
  const res = await account.createAccount(subAccount, publicKey, amt);
  console.log('create sub account for main account', res)

}

