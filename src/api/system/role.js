import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: 'roles',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: 'roles/' + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: 'roles',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(roleId, data) {
  return request({
    url: 'roles/' + roleId,
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(roleId) {
  return request({
    url: 'roles/' + roleId,
    method: 'delete'
  })
}
