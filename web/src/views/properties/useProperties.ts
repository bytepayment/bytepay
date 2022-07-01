import { AccountInfo, Api, Blockchain, TransactionRecordResponse } from '@/api/Api'
import Router from '@/router/index'
import Clipboard from 'clipboard'
import { ElMessage } from 'element-plus/es'
import { computed, reactive, Ref, ref } from 'vue'

export const SUBSCAN_BASE_URL = import.meta.env.VITE_SUBSCAN_BASE_URL

/**
 * useProperties
 */
export function useProperties() {
    const accountIsLoading: Ref<boolean> = ref<boolean>(false)
    const account: Ref<AccountInfo> = ref<AccountInfo>({} as any)

    const recordIsLoading = reactive<Record<Blockchain, boolean>>({
        [Blockchain.ACALA]: false,
        [Blockchain.POLKA]: false,
        [Blockchain.NEAR]: false,
    })
    const recordData = reactive<Record<Blockchain, TransactionRecordResponse>>({
        [Blockchain.ACALA]: {} as any,
        [Blockchain.POLKA]: {} as any,
        [Blockchain.NEAR]: {} as any,
    })

    const accountInfo = () => {
        accountIsLoading.value = true
        Api.accountInfo({})
            .then(data => {
                account.value = data
                Object.values(Blockchain).forEach(key => getRecord(key))
            })
            .catch(ErrorCatch)
            .finally(() => accountIsLoading.value = false)
    }
    accountInfo()

    const getRecord = (chain: Blockchain) => {
        const address = account.value.account[chain].address

        recordIsLoading[chain] = true
        Api.transactionRecord({chain, address, page: {page: 1, size: 10}})
            .then(res => recordData[chain] = res)
            .catch(ErrorCatch)
            .finally(() => recordIsLoading[chain] = false)
    }

    return {
        accountIsLoading,
        recordData,
        acalaRecordIsLoading: computed(() => recordIsLoading.acala),
        polkaRecordIsLoading: computed(() => recordIsLoading.polka),
        nearRecordIsLoading: computed(() => recordIsLoading.near),
        acalaAddress: computed(() => account.value.account?.acala?.address || ''),
        acalaBalance: computed(() => account.value.balance?.acala ?? {}),
        polkaAddress: computed(() => account.value.account?.polka?.address || ''),
        polkaBalance: computed(() => account.value.balance?.polka ?? {}),
        nearaAddress: computed(() => account.value.account?.near?.address || ''),
        nearaBalance: computed(() => account.value.balance?.near ?? {}),
        gotoWithdraw() {
            // noinspection JSIgnoredPromiseFromCall
            Router.push('/settings/withdraw')
        },
    }
}

export function Copy(className: string) {
    const clipboard = new Clipboard('.' + className)
    clipboard.on('success', () => {
        ElMessage.success('Copied!')
        clipboard.destroy()
    })
    clipboard.on('error', (e) => console.log(e))
}

function ErrorCatch(err: Error | any) {
    console.log(err)
    ElMessage.error(err?.message || err || 'ERROR')
}
