import cloud from '@/cloud-sdk'
const nearAPI = require('near-api-js')

exports.main = async function (ctx: FunctionContext) {
  // creates keyStore from a private key string
  // you can define your key here or use an environment variable
  const { keyStores, KeyPair, connect, utils } = nearAPI;

  // public key for new account for main account
  const publicKey = "Gox34J9bbL13UcjybW4BpmQRw289fQCmpx9hDe8QTeFM"
  const PRIVATE_KEY = "2vFNjTixrCBG4utzmkYRcSTYFECDQwSoqRRLbHx19TDHXZR7edCHAYocWraAehKdR9WQ52SApJjiUnEejmxN5Wmy";
  // main account
  const mainAccount = "ff3e8979eb1eac55858651bb40e51760bdfcf12ef57b1edbdd75f53fb0ed6c06"
  const networkId = "mainnet"

  // creates a public / private key pair using the provided private key
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  // adds the keyPair you created to keyStore
  const keyStore = new keyStores.InMemoryKeyStore();
  await keyStore.setKey(networkId, mainAccount, keyPair);

  const config = {
    networkId: networkId,
    keyStore: keyStore, // optional if not signing transactions
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://wallet.mainnet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://explorer.mainnet.near.org",
  };
  const near = await connect(config);
  console.log('near', near)

  // Load Account
  const account = await near.account(mainAccount);
  // Get Account Balance
  const balance = await account.getAccountBalance()
  console.log('account balance', balance);

  // Create subd Account for mainAccount
  const initialBalance = "0.182"
  const amt = utils.format.parseNearAmount(initialBalance);
  // sub Account
  const subAccount = "a29ba3209bce42988817d06ba16ee62e"
  console.log('initial balance for new account', amt);
  const res = await account.createAccount(subAccount, publicKey, amt);
  console.log('create sub account for main account', res)

  // Create account by Contract

}

