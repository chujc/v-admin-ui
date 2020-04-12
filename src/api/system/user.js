import request from '@/utils/request'

// 查询用户列表
export function listUser(query) {
  return request({
    url: 'users',
    method: 'get',
    params: query
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: 'users/' + userId,
    method: 'get'
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: 'users',
    method: 'post',
    data: data
  })
}

// 修改用户
export function updateUser(userId, data) {
  return request({
    url: 'users/' + userId,
    method: 'put',
    data: data
  })
}

// 删除用户
export function delUser(userId) {
  return request({
    url: 'users/' + userId,
    method: 'delete'
  })
}

