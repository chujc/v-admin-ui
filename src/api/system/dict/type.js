import request from '@/utils/request'

// 查询字典类型列表
export function listType(query) {
  return request({
    url: 'dict/type',
    method: 'get',
    params: query
  })
}

// 查询字典类型详细
export function getType(dictId) {
  return request({
    url: 'dict/type/' + dictId,
    method: 'get'
  })
}

// 新增字典类型
export function addType(data) {
  return request({
    url: 'dict/type',
    method: 'post',
    data: data
  })
}

// 修改字典类型
export function updateType(dictId, data) {
  return request({
    url: 'dict/type/' + dictId,
    method: 'put',
    data: data
  })
}

// 删除字典类型
export function delType(dictId) {
  return request({
    url: 'dict/type/' + dictId,
    method: 'delete'
  })
}

// 获取字典选择框列表
export function optionselect(query) {
  return request({
    url: 'dict/type?mode=all',
    method: 'get',
    params: query
  })
}
