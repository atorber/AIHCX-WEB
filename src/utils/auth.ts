import { storage } from './storage.js'

const AccessToken = 'AUTH_TOKEN'

/**
 * 验证是否登录
 *
 * @returns token
 */
export function isLoggedIn() {
  return getAccessToken() != ''
}

/**
 * 获取登录授权 Token
 *
 * @returns token
 */
export function getAccessToken() {
  return storage.get(AccessToken) || ''
}

/**
 * 获取登录授权 Token
 *
 * @returns token
 */
export function getAkSk() {
  const token = storage.get(AccessToken)
  if (token) {
    const [ak, sk, region] = token.split("|");
    return { ak, sk, region };
  }
  return { ak: '', sk: '', region: '' };
}


/**
 * 设置登录授权 Token
 *
 * @returns token
 */
export function setAccessToken(token = '', expire = 60 * 60 * 24) {
  return storage.set(AccessToken, token, expire) || ''
}

/**
 * 删除登录授权 Token
 */
export function delAccessToken() {
  storage.remove(AccessToken)
}
