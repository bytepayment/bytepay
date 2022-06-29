import { Api, Blockchain } from '@/api/Api'
import { ElForm, ElMessage } from 'element-plus'
import { Md5 } from 'ts-md5'
import { reactive, ref, watch } from 'vue'

export const rules = {
    address: [
        {
            type: 'string',
            required: true,
            trigger: 'blur',
            message: 'Please input polka address you want to withdraw',
        },
        {
            min: 40,
            max: 255,
            message: 'length should be 40 to 255',
        },
    ],
    amount: [{trigger: 'blur', required: true}],
    cm: [{trigger: 'blur', required: true}],
    password: [
        {
            type: 'string',
            required: true,
            trigger: 'blur',
            message: 'Please input password you had set or set a password first',
        },
        {
            min: 6,
            max: 16,
            message: 'length should be 6 to 16',
        },
    ],
}

/**
 * Withdraw
 * @author 冰凝
 * @date 2022-06-27 上午 10:59
 **/
export class Withdraw {

    public formRef = ref<InstanceType<typeof ElForm>>({} as any)
    public formData = reactive<{ address: string, password: string, amount: number, cm: Blockchain }>({
        address: '',
        password: '',
        amount: 0,
        cm: Blockchain.NEAR,
    })
    public formIsLoading = ref(false)

    public availableBalance = ref('0')

    constructor() {
        this.breakAmount()
        watch(() => this.formData.cm, this.breakAmount)
    }

    private breakAmount = () => {
        Api.withdrawnAmount(this.formData.cm)
            .then(amount => this.availableBalance.value = amount)
            .catch(err => ElMessage.error('ERROR:' + err?.message))
    }

    public fillInWithOneClick = () => this.formData.amount = parseFloat(this.availableBalance.value)

    /**
     * 表单提交: 提现
     */
    public formSubmit = () => {
        const submit = async () => {
            const {address, amount, cm, password: pwd} = this.formData
            const password = Md5.hashStr(pwd)
            const isValidate = await this.formRef.value?.validate?.()
                ?.catch(err => console.debug('表单验证失败: ', err))

            if (isValidate) {
                const res = await Api.withdraw({amount, address, password, cm})
                console.debug('withdraw success: ', res)
                ElMessage.success('success')
            }
        }

        this.formIsLoading.value = true
        submit()
            .catch(err => ElMessage.error('ERROR:' + err?.message))
            .finally(() => this.formIsLoading.value = false)
    }
}
