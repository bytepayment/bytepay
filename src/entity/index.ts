export interface GithubUser {
  id: string,
  avatar_url: string,
  login: string,
  name: string,
  public_repos: number
}

export interface GithubRepo {
  id: number,
  owner: GithubUser,
  name: string,
  full_name: string,
}

export interface BindedGithubRepo {
  owner_id: number,
  owner_name: string,
  repo_id: number,
  repo_name: string
}

