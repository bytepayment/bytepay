export interface GithubUser {
  id: number
  avatar_url: string
  login: string
  name: string
  public_repos: number
  email: string
}

export interface CPIUser {
  id: number
  avatar_url: string
  login: string
  name: string
  public_repos: number
  email: string
  polka: {
    address: string
    mnemonic: string
  }
  own_polka_address: string
}
export interface GithubRepo {
  id: number
  owner: GithubUser
  name: string
  full_name: string
  description: string
  isBinded: boolean
}

export interface BindedGithubRepo {
  owner_id: number
  owner_name: string
  repo_id: number
  repo_name: string
  meta: GithubRepo
}

export interface DotpayTask {
  _id: string
  issue_id: number
  title: string
  task_url: string
  repo_name: string
  repo_id: string
  repo_url: string
  pay: number
  describe: string
  status: string
  createTime: string
  updataTime: string
  author: GithubUser
  developer: GithubUser
}
