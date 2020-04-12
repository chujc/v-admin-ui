import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/auth/login',
    method: 'POST',
    params: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/auth/user',
    method: 'get'
  })
}

// 修改用户个人信息
export function updateAuthUser(data) {
  return request({
    url: '/auth/user/info',
    method: 'put',
    data: data
  })
}

// 修改用户个人信息
export function updateAuthUserPassword(data) {
  return request({
    url: '/auth/user/password',
    method: 'put',
    data: data
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/auth/user/avatar',
    method: 'post',
    data: data
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'get'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/auth/login/captcha',
    method: 'get'
  })
}
