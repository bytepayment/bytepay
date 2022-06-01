import test from 'ava'
import { readFile } from 'fs/promises'
import { Worker } from 'near-workspaces'

// TODO: 当它可用时，将此功能作为 npm 包的一部分
function encodeCall(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init()

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount

    // Deploy the jsvm contract.
    const jsvm = await root.createAndDeploy(
        root.getSubAccount('jsvm').accountId,
        './node_modules/near-sdk-js/res/jsvm.wasm',
    )

    // Deploy fungible token contract
    const fungibleTokenContract = await root.createSubAccount('fungible-token')
    let ftContractBase64 = (await readFile('build/contract.base64')).toString()
    await fungibleTokenContract.call(jsvm, 'deploy_js_contract', Buffer.from(ftContractBase64, 'base64'), { attachedDeposit: '400000000000000000000000' })
    await fungibleTokenContract.call(jsvm, 'call_js_contract', encodeCall(fungibleTokenContract.accountId, 'init', ['a', '1000']), { attachedDeposit: '400000000000000000000000' })

    // Create test accounts
    const ali = await root.createSubAccount('ali')
    const bob = await root.createSubAccount('bob')

    // Save state for test runs, it is unique for each test
    t.context.worker = worker
    t.context.accounts = {
        root,
        jsvm,
        fungibleTokenContract,
        ali,
        bob,
    }
})

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('拆除工人失败:', error)
    })
})

test('所有者在开始时拥有所有余额', async t => {
    const { jsvm, fungibleTokenContract } = t.context.accounts
    const result = await jsvm.view('view_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftBalanceOf', [fungibleTokenContract.accountId]))
    t.is(result, '1000')
})

test('余额充足可以转账', async t => {
    const { ali, jsvm, fungibleTokenContract } = t.context.accounts

    await fungibleTokenContract.call(jsvm, 'call_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftTransfer', [
        ali.accountId,
        '100',
    ]), { attachedDeposit: '400000000000000000000000' })
    const aliBalance = await jsvm.view('view_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftBalanceOf', [ali.accountId]))
    t.is(aliBalance, '100')
    const ownerBalance = await jsvm.view('view_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftBalanceOf', [fungibleTokenContract.accountId]))
    t.is(ownerBalance, '900')
})

test('余额不足无法转账', async t => {
    const { ali, bob, jsvm, fungibleTokenContract } = t.context.accounts
    try {
        await ali.call(jsvm, 'call_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftTransfer', [
            bob.accountId,
            '100',
        ]), { attachedDeposit: '400000000000000000000000' })
    } catch (e) {
        const { message, name, cause, dirname, range, version, code, stack, result } = e
        console.warn({ message, name, cause, dirname, range, version, code, stack, result })
    }
})
