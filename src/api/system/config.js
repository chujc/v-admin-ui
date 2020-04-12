import request from '@/utils/request'

// 查询参数列表
export function listConfig(query) {
  return request({
    url: 'configs',
    method: 'get',
    params: query
  })
}

// 查询参数详细
export function getConfig(configId) {
  return request({
    url: 'configs/' + configId,
    method: 'get'
  })
}

// 根据参数键名查询参数值
export function getConfigKey(configKey) {
  return request({
    url: 'configs/key/' + configKey,
    method: 'get'
  })
}

// 新增参数配置
export function addConfig(data) {
  return request({
    url: 'configs',
    method: 'post',
    data: data
  })
}

// 修改参数配置
export function updateConfig(configId, data) {
  return request({
    url: 'configs/' + configId,
    method: 'put',
    data: data
  })
}

// 删除参数配置
export function delConfig(configId) {
  return request({
    url: 'configs/' + configId,
    method: 'delete'
  })
}

