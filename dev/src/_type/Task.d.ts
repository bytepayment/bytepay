import type { Blockchain } from '@/_type/Blockchain'

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
