// @ts-ignore
import cloud from '@/cloud-sdk'
import { KeyringPair$Meta } from '@polkadot/keyring/types'
import { KeypairType } from '@polkadot/util-crypto/types'
import axios from 'axios'
import { createHmac } from 'crypto'
import { Db } from 'database-ql'

const DB: Db = cloud.database()
const Config = cloud.shared.get('config')
const COLLECTION = {
    user: 'user',
    tasks: 'tasks',
    repository: 'repos',
}

/**
 * <h2 color="red">
 *     这里的定义仅提供基础示例, 如果后期扩展 以 init_system 中为准
 * </h2>
 * value 和 用户信息中的账户名对应
 */
enum Blockchain {
    ACALA = 'acala',
    POLKA = 'polka',
    NEAR = 'near'
}

/**
 * 货币单位和链映射
 * <h2 color="red">
 *     TODO: 不提供动态扩展 需要后期补充
 * </h2>
 */
const CurrencyMapping = {
    'DOT': Blockchain.POLKA,
    'ACA': Blockchain.ACALA,
    'NEAR': Blockchain.NEAR,
}

/**
 * 主函数 我们只监听 issue comment event 和 issue close event
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const headers = ctx.headers as Headers
    const repositoryId = ctx.body.repository?.id

    const effective = await BytePayService.check(repositoryId, headers, ctx.body)
    if (!effective) {
        const {body, headers} = ctx
        return '无效请求: ' + JSON.stringify({body, headers})
    }

    const issue: Issue = ctx.body
    const {sender} = issue

    if (sender.id === Config.CryptoPayLabBotId) {
        console.log('屏蔽我们自己的机器人')
        return
    }

    try {
        const user = await UserRepository.selectUserById(sender.id)
        if (!user) {
            console.log('为sender注册账户, sender.id: ', sender.id)
            await BytePayService.createUser(sender)
        }
    } catch (error) {
        console.log('create account error', error)
    }

    // debugInfo(issuePayload)
    const {repository, comment, action} = issue

    const issueContent = comment?.body || ''
    const issueLoc: IssueLoc = {
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.issue.number,
    }

    // 3. action 过滤
    let notIncludes = !(['created', 'closed'].includes(action))
    if (notIncludes) {
        console.log(`Dispatch => DoNothing; issuePayload.action ${ action } 无需处理`)
        return
    }
    if (action === 'closed') {
        console.log('Dispatch => closed')
        await BytePayService.closeIssue(issue, issueLoc)
        return
    }
    if (!comment) {
        console.log('comment 为空, 丢弃.')
        return
    }

    // 4. 指令匹配
    const matchRes = BytePayCommand.matchCommand(issueContent)
    if (!matchRes) {
        console.log('Dispatch => Not Bytepay related issue comment')
        return
    }
    const [command, params] = matchRes!

    console.log('Dispatch =>', Command[command])
    switch (command) {
        case Command.PostTask:
            return await BytePayService.createTask(issue, issueLoc, params as any)
        case Command.ApplyTask:
            return await BytePayService.applyTask(issue, issueLoc)
        case Command.PayTask:
            return await BytePayService.payTask(issue, issueLoc)
        case Command.DevPayTask:
            return await BytePayService.otherPay(issue, issueLoc, params as any)
        case Command.BindWallet:
            return await BytePayService.BindDotAddress(issue, issueLoc, params as any)
        default:
            console.log('不支持的命令: ', command)
    }
}

class BytePayService {

    private static readonly blockchainService: BlockchainDispatch = cloud.shared.get('blockchain_service')
    private static readonly CHAIN: Record<string, Blockchain> = cloud.shared.get('Blockchain')

    /**
     * 检查: 请求参数签名认证
     * @param {number} repoId 仓库ID
     * @param {Headers} headers github 消息 请求头
     * @param body github 消息 请求体
     * @return {Promise<boolean>} 认证通过?
     */
    public static async check(repoId: number, headers: Headers, body: any) {
        const repos = await Repository.selectByRepoIdAndHookId(repoId, parseInt(headers['x-github-hook-id']))

        const result = createHmac('sha256', repos.webhookSecret)
            .update(JSON.stringify(body))
            .digest('hex')

        const my = 'sha256=' + result
        const target = headers['x-hub-signature-256']
        const ok = my === target
        console.log(`我方计算签名: ${ my }\n 对方提供签名: ${ target }\n 认证通过? ${ ok }`)

        return ok
    }

    /**
     * 创建任务
     * 1. 检查 issue 下是否已发布任务
     * 2. 检查 sender 是否注册了 bytepay 账户
     * 3. 检查账号余额 - 已冻结金额, 是否充足
     * 4. 创建任务
     *      4.1 写入任务信息
     *      4.2 累加冻结金额到 用户信息 -> 账户信息中
     */
    public static async createTask(issuePayload: Issue, issueLoc: IssueLoc, params: { amount: string, currency: string }) {
        const {issue, comment, repository, sender} = issuePayload
        // 去除只有owner可以发布任务的限制
        // 1. 检查该Issue下是否已发布任务
        const task = await TaskRepository.selectByIssueId(issue.id)
        // 任务已存在
        if (task) {
            await RobotService.taskExisted(issueLoc)
            console.log('任务已存在', task)
            return
        }

        // 2. 检查sender是否注册bytepay
        let senderId = sender.id
        const user = await UserRepository.selectUserById(senderId)
        if (!user.token) {
            await RobotService.unregistered(issueLoc, sender.login)
            return
        }

        // 3. 检查账户余额是否充足
        const info = await this.blockchainService.accountInfo(senderId)
        const account: Blockchain = CurrencyMapping[params.currency]
        if (!account) {
            throw new Error('不支持的类型' + params.currency)
        }
        const free = info[account].free
        const fm = user[account].frozenAmount || 0

        const dotNumber = parseFloat(params.amount)
        let insufficientBalance = free - fm < dotNumber

        if (insufficientBalance) {
            return await RobotService.insufficientBalance(issueLoc, {
                login: sender.login,
                balance: free - fm,
                dotNumber,
                currency: params.currency,
            })
        }
        // 创建任务，添加至数据库
        const newTask: Partial<Task> = {
            issue_id: issue.id,
            issue_number: issue.number,
            title: issue.title,
            task_url: issue.html_url,
            repo_name: repository.full_name,
            repo_id: repository.id,
            repo_url: repository.html_url,
            author: issue.user,
            pay: dotNumber,
            payAccount: account,
            describe: issue.body,
            createTime: comment.created_at,
            updateTime: comment.updated_at,
            status: 'created',
            repository,
        }
        // 更新数据库
        await TaskRepository.insert(newTask)
        await UserRepository.updateFrozenAmount(senderId, account, fm + dotNumber)

        return await RobotService.completeTask(issueLoc, sender.login, dotNumber, params.currency)
    }

    /**
     * 接任务
     */
    public static async applyTask(issuePayload: Issue, issueLoc: IssueLoc) {
        const {issue, sender} = issuePayload
        // 1. 查找该任务是否已创建
        const task = await TaskRepository.selectByIssueId(issue.id)
        if (!task) {
            await RobotService.taskNotExist(issueLoc)
            return
        }

        // 2. 查找该任务是否已被申领
        if (task.status !== 'created') {
            await RobotService.taskAssigned(issueLoc, task.developer.login)
            return
        }

        // 3. 申领成功，更新数据库
        await TaskRepository.updateByIssueId(issue.id, {developer: sender, status: 'applied'})
        await RobotService.taskDeclareAssign(issueLoc, sender.login)

        // 检查开发者是否绑定账户，提醒他可以绑定自己的账户
        const user = await UserRepository.selectUserById(sender.id)
        // 未绑定个人地址的，提醒其绑定
        if (!user[this.getBindAddressKey(task.payAccount)]) {
            await RobotService.reminderBinding(issueLoc, sender.login)
        }
    }

    public static async payTask(issuePayload: Issue, issueLoc: IssueLoc) {
        const {issue, sender} = issuePayload
        // 1. 查找该任务是否已创建
        const task = await TaskRepository.selectByIssueId(issue.id)
        if (!task) {
            await RobotService.noTask(issueLoc)
            return
        }
        // 2. 查找该任务是否已申领
        if (!task.developer) {
            await RobotService.taskUnassigned(issueLoc)
            return
        }
        // 3. 只有task owner可以用/bytepay pay 指令来支付, 其余支付者使用另外一条指令
        if (sender.id !== task.author.id) {
            await RobotService.notTheTaskOwner(issueLoc, sender.login, task.developer.login)
            return
        }

        // 隐含条件: 冻结金额策略无误, 账号余额充足
        // 4. 确定支付地址
        const account = task.payAccount
        const developer = await UserRepository.selectUserById(task.developer.id)
        const owner = await UserRepository.selectUserById(task.author.id)

        const transResult = await this.transaction(owner[account], developer, account, task.pay, sender.login, issueLoc)

        // 7. 更新数据库 - 任务状态修改为 已支付；支付账户减去冻结金额
        await TaskRepository.updateByIssueId(issue.id, {status: 'paid'})
        await UserRepository.updateFrozenAmount(owner.id, account, owner[account].frozenAmount - task.pay)
        // 8. Robot 发布 comment
        await RobotService.taskPay(issueLoc, {login: sender.login, devLogin: task.developer.login, hash: transResult?.hash, account})

        // 9. 发送邮件，提醒开发者提现
        // 未绑定个人账户，提醒其去 bytepay 提现
        if (!developer[this.getBindAddressKey(account)]) {
            await RobotService.pointWithdraw(issueLoc, task.developer.login)
        }
    }

    /**
     * 转账
     * @param {UserAccount} fromAccount 支付方
     * @param {User} to 收款方
     * @param {Blockchain} account 账号类型
     * @param {number} amount 金额
     * @param {string} login 支付方姓名
     * @param issueLoc
     */
    private static async transaction(fromAccount: UserAccount, to: User, account: Blockchain, amount: number, login: string, issueLoc: any) {
        console.log('发起交易: ', {fromAccount, to, account, amount})

        // 应对一种极端情况: 接任务时候收款方的账号没有创建成功
        if (!to[account]) {
            to[account] = await this.blockchainService.createAccount(account, to.id)
        }

        const bindAddress = to[this.getBindAddressKey(account)]
        const toAddress = bindAddress ? bindAddress : to[account].address

        const onError = async (balance: any) => {
            await RobotService.insufficientBalance(issueLoc, {login, balance, currency: getCurrency(account), dotNumber: amount})
        }

        const getCurrency = (account: Blockchain) => {
            for (let key of Object.keys(CurrencyMapping)) {
                if (CurrencyMapping[key] == account) {
                    return key
                }
            }
            return ''
        }

        const request: TransactionRequest = {
            amount,
            from: fromAccount,
            to: toAddress,
            frozen: fromAccount.frozenAmount,
        }

        return await this.blockchainService.transfer(account, request, onError)
    }

    /**
     * 其他支付
     */
    public static async otherPay(issuePayload: Issue, issueLoc: IssueLoc, params: { amount: string, currency: string, login: string }) {
        const {sender} = issuePayload
        const user = await UserRepository.selectUserById(sender.id)

        // 1. 判断该支付者是否余额充足
        const info = await this.blockchainService.accountInfo(user.id)
        const account: Blockchain = CurrencyMapping[params.currency]
        if (!account) {
            throw new Error('不支持的类型' + params.currency)
        }
        const free = info[account].free
        const fm = user[account].frozenAmount || 0
        const dotNumber = parseFloat(params.amount)

        // 余额不足提醒充值
        if (free - fm < dotNumber) {
            await RobotService.insufficientBalance(issueLoc, {
                login: sender.login,
                balance: free - fm,
                dotNumber,
                currency: params.currency,
            })
            return
        }

        // 2. 确定收款人
        const receiverLogin = params.login
        const receiver = await UserRepository.selectUserByGithubLogin(receiverLogin)
        if (!receiver) {
            return RobotService.comment(issueLoc, `**We can not locate ${ receiverLogin }'s address**`)
        }
        // 发起转账
        const transResult = await this.transaction(user[account], receiver, account, dotNumber, sender.login, issueLoc)

        // 4. Robot 发布 comment
        return await RobotService.otherPay(issueLoc, {
            receiverLogin: receiverLogin,
            login: sender.login,
            dotNumber,
            hash: transResult?.hash,
            currency: params.currency,
            account,
        })
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * 关闭 Issue 事件处理
     * - 维护 task 状态
     * - 解冻金额
     */
    public static async closeIssue(issuePayload: Issue, issue_loc: IssueLoc) {
        const {id, html_url} = issuePayload.issue

        const task = await TaskRepository.selectByIssueId(id)
        if (!task) {
            console.log(`Task not found for this issue: ${ html_url }`)
            return
        }

        // 无人申领，置为closed
        if (task.status === 'created') {
            await TaskRepository.closeByIssueId(id)
            return
        }
        // 有人申领，尚未支付，置为closed-without-pay
        if (task.status === 'applied') {
            // 解冻金额
            const author = await UserRepository.selectUserById(task.author.id)
            let payAccount = task.payAccount
            let frozenAmount = author[payAccount].frozenAmount - task.pay
            await UserRepository.updateById(author.id, {[payAccount]: {frozenAmount}})
            await TaskRepository.updateByIssueId(id, {status: 'closed-without-pay'})

            return
        }
        // 已支付, 置为closed
        if (task.status === 'paid') {
            await TaskRepository.closeByIssueId(id)
            return
        }

        console.log('Close event match nothing')
    }

    /**
     * 绑定地址
     * TODO: params.type 仅临时定义, 使用供应商名 / 货币名称未定
     */
    public static async BindDotAddress(issuePayload: Issue, issue_loc: IssueLoc, params: { type: Blockchain, address: string }) {
        const {id, login} = issuePayload.sender
        const {type, address} = params

        // 确定绑定者账户
        const user = await UserRepository.selectUserById(id)
        const bindKey = this.getBindAddressKey(type)
        if (!bindKey) {
            throw new Error('不支持的 bind type' + type)
        }

        await UserRepository.updateById(id, {[bindKey]: address})

        // 如之前已绑定，则提醒
        let bindAddress = user[bindKey]
        if (bindAddress) {
            await RobotService.comment(issue_loc, `\r\nPrevious Is: \`${ bindAddress }\`\r\n `)
        } else {
            await RobotService.bindingSucceeded(issue_loc, login, address, type)
        }
    }

    public static async createUser(user: GithubUser) {
        await UserRepository.insert(user)
        // 补全账号信息
        for (const key of Object.values(this.CHAIN)) {
            try {
                await this.blockchainService.createAccount(key, user.id)
            } catch (e) {
                console.log('创建账号失败, 类型: ', key, e)
            }
        }
    }

    private static getBindAddressKey(account: Blockchain) {
        return `own_${ account }_address`
    }
}

class RobotService {
    private static readonly RobotToken = Buffer.from(Config.CryptoPayLabBotToken, 'base64').toString()
    private static readonly CryptoPayLabUrl = Config.CryptoPayLabUrl

    /**
     * 提示任务已存在
     */
    public static async taskExisted(issueLoc: IssueLoc) {
        // 一个Issue只能创建一个Task。
        return await this.submitIssueComment(issueLoc, '**Bytepay: A Single Issue Can Create One Task Only.**')
    }

    /**
     * 任务不存在
     */
    public static async taskNotExist(issueLoc: IssueLoc) {
        // 没有人在这个问题上创建过任务。
        return await this.submitIssueComment(issueLoc, '**Bytepay: No one had created task in this issue before.')
    }

    /**
     * 没有任务
     */
    public static async noTask(issueLoc: IssueLoc) {
        return await this.submitIssueComment(issueLoc, '**No task under this issue.**')
    }

    /**
     * 任务已分配
     */
    public static async taskAssigned(issueLoc: IssueLoc, login: string) {
        const s = `**Bytepay: task has already assigned to ${ login }.**`
        return await this.submitIssueComment(issueLoc, s)
    }

    /**
     * 任务未分配
     */
    public static async taskUnassigned(issueLoc: IssueLoc) {
        return await this.submitIssueComment(issueLoc, 'Task have not been assigned.')
    }

    /**
     * 声明任务分配
     */
    public static async taskDeclareAssign(issueLoc: IssueLoc, login: string) {
        const s = `**Bytepay: Task has been assigned to @${ login }.**`
        return await this.submitIssueComment(issueLoc, s)
    }

    /**
     * 任务付费
     */
    public static async taskPay(issueLoc: IssueLoc, params: { login: string, devLogin: string, hash: string, account: Blockchain }) {
        const url = params.account === Blockchain.NEAR
            ? Config.nearExplorerUrl + params.hash
            : `${ Config.SubscanBaseUrl }/extrinsic/${ params.hash || '' }`
        const s = `
  \r\n**@${ params.devLogin }:**\r\n
  \r\n**${ params.login } have paid for this task**, visit ${ url }  for detail\r\n
  `
        return await this.submitIssueComment(issueLoc, s)
    }

    public static async otherPay(issueLoc: IssueLoc, params: { receiverLogin: string, login: string, dotNumber: any, hash: string, currency: string, account: Blockchain }) {
        const url = params.account === Blockchain.NEAR
            ? Config.nearExplorerUrl + params.hash
            : `${ Config.SubscanBaseUrl }/extrinsic/${ params.hash || '' }`

        const {receiverLogin, dotNumber, login, currency} = params
        const comment = `
  \r\n**@${ receiverLogin }:**\r\n
  \r\n**${ login } have paid ${ dotNumber } ${ currency } for you :)**, visit ${ url } for detail\r\n
  `
        return await this.submitIssueComment(issueLoc, comment)
    }

    /**
     * 提示未注册
     */
    public static async unregistered(issueLoc: IssueLoc, login: string) {
        const comment = `
    \r\n**@${ login }:**\r\n
    \r\nYou can goto ${ this.CryptoPayLabUrl } to create an account and recharge some token\r\n
    \r\nThen you can create task under any issue if you want.\r\n
    `
        return await this.submitIssueComment(issueLoc, comment)
    }

    /**
     * 余额不足
     */
    public static async insufficientBalance(issueLoc: IssueLoc, params: { login: string, balance: any, dotNumber: any, currency: string }) {
        const {login, dotNumber, balance, currency} = params
        const comment = `
    \r\n**@${ login }:**\r\n
    \r\nSeems your account have only ${ balance } ${ currency } available, less than ${ dotNumber } ${ currency } you want pay.\r\n
    \r\n**Please recharge token on ${ this.CryptoPayLabUrl } first.**\r\n
    `
        return await this.submitIssueComment(issueLoc, comment)
    }

    /**
     * 完成任务
     */
    public static async completeTask(issueLoc: IssueLoc, login: string, dotNumber: any, token: string) {
        const comment = `
  \r\n**Bytepay: Finish This Task, ${ login } will pay you ${ dotNumber } ${ token }.**\r\n
  \r\nComment in Following instruction to apply for this task\r\n
  \r\n\`/bytepay apply\`\r\n
  \r\nVisit ${ this.CryptoPayLabUrl } for more detail\r\n
  `
        return await this.submitIssueComment(issueLoc, comment)
    }

    /**
     * 绑定地址
     */
    public static async reminderBinding(issueLoc: IssueLoc, login: string) {
        const comment = `
  \r\n**@${ login }:**\r\n
  \r\nSeems you are not bind your own address, you can bind on ${ this.CryptoPayLabUrl }/settings/address or\r\n
  \r\nComment in following instruction\r\n
  \r\n\`/bytepay bind 5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE\`\r\n
  `
        return await this.submitIssueComment(issueLoc, comment)
    }

    /**
     * 不是任务所有者
     */
    public static async notTheTaskOwner(issueLoc: IssueLoc, login: string, dev: string) {
        const comment = `
    \r\n**@${ login }**\r\n
    \r\nSeems you are not the owner of this task, you can pay for the developer by following instruction:\r\n
    \r\n\`/bytepay pay ${ dev } 5DOT\`\r\n
    \r\nNotice: you can give any number of token to anyone if your account is available.\r\n
    `
        return await this.submitIssueComment(issueLoc, comment)
    }

    /**
     * 交易错误
     */
    public static async transferError(issueLoc: IssueLoc) {
        const comment = `
    \r\nTransfer not executed because of Existential Deposit Error\r\n
    \r\nView ${ Config.ExistentailDepositDocUrl } for detail.\r\n
    `
        return await this.submitIssueComment(issueLoc, comment)
    }

    public static async pointWithdraw(issueLoc: IssueLoc, devLogin: string) {
        const comment = `
  \r\n**@${ devLogin }:**\r\n
  \r\nGoto ${ this.CryptoPayLabUrl }/settings/withdraw to withdraw the token you earned :)\r\n
  `
        return await this.submitIssueComment(issueLoc, comment)
    }

    public static async bindingSucceeded(issueLoc: IssueLoc, login: string, address: string, chain: string) {
        const msg = `
  \r\n**@${ login }:**\r\n
  \r\nBind Success.\r\n
  \r\nNow Your Own ${ chain } Address Is: \`${ address }\`\r\n
  `
        return await this.submitIssueComment(issueLoc, msg)
    }

    public static async comment(issueLoc: IssueLoc, msg: string) {
        return await this.submitIssueComment(issueLoc, msg)
    }

    /**
     * Robot 自动回复Comment
     * @param {IssueLoc} issueLoc
     * @param {string} body
     */
    private static async submitIssueComment(issueLoc: IssueLoc, body: string) {
        // noinspection ES6RedundantAwait
        return await axios({
            url: `https://api.github.com/repos/${ issueLoc.owner }/${ issueLoc.repo }/issues/${ issueLoc.issue_number }/comments`,
            method: 'POST',
            headers: {'Accept': 'application/json', 'Authorization': `Bearer ${ this.RobotToken }`},
            data: {body: body},
        })
    }
}

class UserRepository {
    private static collection = DB.collection(COLLECTION.user)

    public static selectUserById(id: number): Promise<User> {
        return this.selectOne({id})
    }

    public static async selectUserByGithubLogin(login: string): Promise<User> {
        return this.selectOne({login})
    }

    public static updateFrozenAmount(id: number, account: Blockchain, amount: number) {
        return this.updateById(id, {[account]: {frozenAmount: amount}})
    }

    public static async updateById(id: number, data: Partial<User>) {
        return await this.update({id}, data)
    }

    private static async update(where: Partial<User>, data: Partial<User>) {
        const res = await this.collection.where(where).update(data)
        if (res.ok) {
            return res.updated
        }
        throw new Error(res.error)
    }

    public static async insert(user: Partial<User>) {
        const res = await this.collection.add(user)
        if (res.ok) {
            return res.id
        }
        throw new Error(res.error)
    }

    private static async selectOne(where: Partial<User>): Promise<User> {
        const res = await this.collection
            .where(where)
            .getOne<User>()
        if (res.ok) {
            return res.data
        }
        throw new Error(res.error)
    }
}

class TaskRepository {

    private static collection = DB.collection(COLLECTION.tasks)

    public static selectByIssueId(id: number): Promise<Task> {
        return this.selectOne({issue_id: id})
    }

    public static async insert(task: Partial<Task>) {
        let res = await this.collection.add(task)
        if (res.ok) {
            return res.id
        }
        throw new Error(res.error)
    }

    public static updateByIssueId(id: number, data: Partial<Task>) {
        return this.update({issue_id: id}, data)
    }

    public static async closeByIssueId(id: number) {
        return await this.updateByIssueId(id, {status: 'closed'})
    }

    private static async selectOne(where: Partial<Task>): Promise<Task> {
        const res = await this.collection.where(where).getOne<Task>()
        if (res.ok) {
            return res.data
        }
        throw new Error(res.error)
    }

    private static async update(where: Partial<Task>, data: Partial<Task>) {
        const res = await this.collection.where(where).update(data)
        if (res.ok) {
            return res.updated
        }
        throw new Error(res.error)
    }
}

class Repository {

    public static async selectByRepoIdAndHookId(repoId: number, hookId: number) {
        const resp = await DB.collection(COLLECTION.repository)
            .where({repo_id: repoId, hook_id: hookId})
            .getOne()
        if (resp.ok) {
            return resp.data
        }
        throw new Error(resp.error)
    }
}

class BytePayCommand {
    /**
     * 创建任务
     * <pre>
     *     形如: /bytepay task <任意数字>[.任意小数位] <大写字母的货币单位 2-5字母>
     * </pre>
     * 不允许前置空格, 所有中间空格可选
     *
     * - group 1 完整金额
     * - group 2 可选的小数部分
     * - group 3 币种单位
     */
    private static CreateReg = new RegExp('^/bytepay\\s*?task\\s*?(\\d+(\\.\\d+)?)\\s*?([A-Z]{2,5})$')
    /**
     * 接任务
     * <pre>
     *     形如: /bytepay apply
     * </pre>
     * 不允许前置空格, 所有中间空格可选
     */
    private static ApplyReg = new RegExp('^/bytepay\\s*?apply$')
    /**
     * 支付任务
     * <pre>
     *     形如: /bytepay pay
     * </pre>
     * 不允许前置空格, 所有中间空格可选
     */
    private static PaidReg = new RegExp('^/bytepay\\s*?pay$')
    /**
     * 支付指定金额
     * <pre>
     *     形如: /bytepay pay <github用户名> <任意数字>[.任意小数位] <大写字母的货币单位 2-5字母>
     * </pre>
     * 不允许前置空格, 中间空格部分可选, pay - 账号信息中的不能省略
     * - group 1 github 账号
     * - group 2 完整金额
     * - group 3 可选的小数部分
     * - group 4 币种单位
     */
    private static PaidReg2 = new RegExp('^/bytepay\\s*?pay\\s+(\\S+?)\\s*?(\\d+(\\.\\d+)?)\\s*?([A-Z]{2,5})$')
    /**
     * 绑定账户
     * <pre>
     *     形如: /bytepay[可选任意数量空格]bind<必需空格><group1:账号类型><必须空格><group2:任意数量非空字符 账号地址>
     * </pre>
     * 不允许前置空格
     *
     * - group 1 绑定账号类型, 内容未定义 参考 {@link Blockchain}
     * - group 2 账号地址
     */
    private static BindReg = new RegExp('^/bytepay\\s*?bind\\s+(\\S+)\\s+(\\S+)$')

    public static matchCommand(str: string): null | [Command, { amount: string, currency: string, login?: string } | { type: string, address: string } | null] {
        // 判断是否包含 '/bytepay'
        if (!str || !str.startsWith('/bytepay')) {
            return null
        }
        str = str.trim()
        if (this.CreateReg.test(str)) {
            const arr: RegExpExecArray = this.CreateReg.exec(str)!
            return [Command.PostTask, {amount: arr[1], currency: arr[3]}]
        }
        if (this.ApplyReg.test(str)) {
            return [Command.ApplyTask, null]
        }
        if (this.PaidReg.test(str)) {
            return [Command.PayTask, null]
        }
        if (this.PaidReg2.test(str)) {
            const arr: RegExpExecArray = this.PaidReg2.exec(str)!
            return [Command.DevPayTask, {amount: arr[2], currency: arr[4], login: arr[1]}]
        }
        if (this.BindReg.test(str)) {
            const arr: RegExpExecArray = this.BindReg.exec(str)!
            return [Command.BindWallet, {type: arr[1], address: arr[2]}]
        }
        return null
    }

}

enum Command {
    /**
     * 发布任务
     */
    PostTask = 0,
    /**
     * 申请任务
     */
    ApplyTask = 1,
    /**
     * 支付任务
     */
    PayTask = 2,
    /**
     * 开发者支付任务
     */
    DevPayTask = 3,
    /**
     * 开发者绑定钱包地址
     */
    BindWallet = 4,
}

// noinspection JSUnusedLocalSymbols
function debugInfo(payload: Issue) {
    return {
        action: payload.action,
        issue: {
            id: payload.issue.id,
            title: payload.issue.title,
            body: payload.issue.body,
        },
        comment: {
            body: payload.comment.body,
        },
        sender: {
            id: payload.sender.id,
            login: payload.sender.login,
        },
        repository: {
            name: payload.repository.full_name,
            owner: payload.repository.owner.login,
        },
    }
}

/* 类型定义 ------------------------------------------------------------------------------------------------------------------------------------ */

interface Issue {
    issue: {
        id: number
        title: string
        body: string
        html_url: string
        user: GithubUser
        author_association: string,
        'number': number
    },
    comment: {
        id: number
        body: string
        created_at: string
        updated_at: string
        html_url: string
        user: GithubUser
        author_association: string
    },
    repository: {
        id: number
        name: string
        full_name: string
        owner: GithubUser
        html_url: string
    },
    /**
     * 发送人
     */
    sender: GithubUser,
    action: 'created' | 'closed' | string
}

interface Headers {
    host: string,
    connection: string,
    'content-length': string,
    'user-agent': 'GitHub-Hookshot/b257cdf',
    accept: '*/*',
    'x-github-delivery': string,
    'x-github-event': 'issue_comment',
    // '361139620'
    'x-github-hook-id': string,
    // '489581758'
    'x-github-hook-installation-target-id': string,
    // 'repository'
    'x-github-hook-installation-target-type': string,
    'x-hub-signature': string,
    /**
     * This header is sent if the webhook is configured with a secret.
     * This is the HMAC hex digest of the request body, and is generated using the SHA-256 hash function and the as the HMAC .secretkey
     */
    'x-hub-signature-256': string,
    'content-type': 'application/json'
}

interface GithubUser {
    id: number
    login: string
    site_admin: boolean
}

interface IssueLoc {
    owner: string,
    repo: string,
    issue_number: number
}

type AccountInfo = PolkaAccountInfo | AcalaAccountInfo

interface PolkaAccountInfo {
    free: number,
    reserved: number,
    miscFrozen?: number,
    feeFrozen?: number,
}

interface AcalaAccountInfo {
    free: number,
    reserved: number,
    frozen: number,
}

/**
 * DB entity User
 */
type User = UserBasicInfo & UserAccountInfo

/**
 * 用户基础信息
 */
interface UserBasicInfo {
    _id: string
    /**
     * Github UID
     */
    id: number
    /**
     * Github 用户名
     */
    login: string

    token: string
}

/**
 * 用户账户信息
 */
interface UserAccountInfo {
    /**
     * 生成地址
     */
    acala: UserAccount
    polka: UserAccount
    near: UserAccount
    /**
     * 绑定地址
     */
    own_polka_address: string
    own_acala_address: string
    own_near_address: string
}

/**
 * 用户账户
 */
interface UserAccount {
    /**
     * 注记词
     */
    mnemonic: string,
    /**
     * 账号地址
     */
    address: string,
    type: KeypairType,
    meta: KeyringPair$Meta,
    publicKey: Uint8Array,
    /**
     * 交易冻结金额, 默认 0
     */
    frozenAmount: number
}

class Task {
    issue_id: number
    issue_number: number
    title: string
    task_url: string
    repo_name: string
    repo_id: number
    repo_url: string
    author: GithubUser
    pay: number
    payAccount: Blockchain
    describe: string
    createTime: string
    updateTime: string
    status: 'created' | 'closed' | 'applied' | 'paid' | 'closed-without-pay'
    developer: GithubUser
    repository: Issue['repository']
}

interface BlockchainDispatch {

    /**
     * 交易
     */
    transfer: (blockchain: Blockchain, request: TransactionRequest, onError: (balance: string) => Promise<void>) => Promise<{ hash: string }>

    /**
     * 交易记录
     */
    transferRecord: (blockchain: Blockchain, address: string, page: Page) => Promise<Array<any>>

    /**
     * 创建账号
     */
    createAccount: (blockchain: Blockchain, uid: number) => Promise<UserAccount>

    /**
     * 绑定账号
     */
    bindAccount: (blockchain: Blockchain, uid: number, address: string) => Promise<void>

    /**
     * 查询账号信息
     */
    accountInfo: (uid: number) => Promise<Record<Blockchain, AccountInfo>>
}

/**
 * 一次交易请求
 */
interface TransactionRequest {
    from: UserAccount
    to: string
    /**
     * 此次交易金额
     */
    amount: number
    /**
     * 货币类型 可选
     */
    token?: string
    /**
     * 冻结金额
     */
    frozen: number
}

interface Page {
    /**
     * 从 1 开始
     */
    page: number
    /**
     * 从 1 开始
     */
    size: number
}
