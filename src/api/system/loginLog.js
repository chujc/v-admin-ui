import request from '@/utils/request'

// 查询登录日志列表
export function listLoginLog(query) {
  return request({
    url: 'logs/login',
    method: 'get',
    params: query
  })
}

// 删除登录日志
export function delLoginLog(ids) {
  return request({
    url: 'logs/login/' + ids,
    method: 'delete'
  })
}

// 清空登录日志
export function cleanLoginLog() {
  return request({
    url: 'logs/login/clean',
    method: 'delete'
  })
}

// 导出登录日志
export function exportLoginLog(query) {
  return request({
    url: 'logs/login/export/excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
