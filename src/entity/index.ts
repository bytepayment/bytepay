export interface GithubUser {
  id: string
  avatar_url: string
  login: string
  name: string
  public_repos: number
}

export interface GithubRepo {
  id: number
  owner: GithubUser
  name: string
  full_name: string
  description: string
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
  repo: string
  repo_id: string
  repo_url: string
  author: string
  pay: number
  describe: string
  createTime: string
  updataTime: string
  status: string
}
