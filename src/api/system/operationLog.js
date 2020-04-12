import request from '@/utils/request'

// 查询操作日志列表
export function listOperationLog(query) {
  return request({
    url: 'logs/operation',
    method: 'get',
    params: query
  })
}

// 删除操作日志
export function delOperationLog(ids) {
  return request({
    url: 'logs/operation/' + ids,
    method: 'delete'
  })
}

// 清空操作日志
export function cleanOperationLog() {
  return request({
    url: 'logs/operation/clean',
    method: 'delete'
  })
}

// 导出操作日志
export function exportOperationLog(query) {
  return request({
    url: 'logs/operation/export/excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
