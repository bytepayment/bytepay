export interface GithubUser {
  id: number
  avatar_url: string
  login: string
  name: string
  public_repos: number
  email: string
  gotoTaskPageTimes: number
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
  name: string
  owner: GithubUser
  full_name: string
  description: string
  isBinded: boolean
  loading: boolean
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
  repo_id: number
  repo_url: string
  repo_description: string
  pay: number
  describe: string
  status: string
  createTime: string
  updataTime: string
  author: GithubUser
  developer: GithubUser
  repository: GithubRepo
}

// NFT Releated
export interface NFTClass {
  meta: {
    name: string,
    desc: string
  },
  chain_key: string
}
