import { GithubUser } from "@/entity"

const kToken = "access_token"
const kExpire = "token_expire"
const kUser = "user"

export function getToken() {
  const token = localStorage.getItem(kToken)
  const expire = getTokenExpire()

  if (!expire || expire <= Date.now() / 1000) {
    removeToken()
  }
  return token
}

export function getTokenExpire() {
  const expire = parseInt((localStorage.getItem(kExpire) as any) || 0)
  return expire
}

// default expires at 2099-12-31 23:59:59
export function setToken(token: string, expire: string = "4102415999000") {
  localStorage.setItem(kExpire, expire)
  return localStorage.setItem(kToken, token)
}

export function removeToken() {
  localStorage.removeItem(kExpire)
  localStorage.removeItem(kUser)
  return localStorage.removeItem(kToken)
}

export function getUser(): GithubUser {
  return JSON.parse(localStorage.getItem(kUser) as any)
}

export function setUser(user: any) {
  return localStorage.setItem(kUser, user)
}
