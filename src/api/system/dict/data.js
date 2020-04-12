import request from '@/utils/request'

// 查询字典数据列表
export function listData(query) {
  return request({
    url: 'dict/data',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: 'dict/data/' + dictCode,
    method: 'get'
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return request({
    url: 'dict/data/all/' + dictType,
    method: 'get'
  })
}

// 新增字典数据
export function addData(data) {
  return request({
    url: 'dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(dictCode, data) {
  return request({
    url: 'dict/data/' + dictCode,
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode) {
  return request({
    url: 'dict/data/' + dictCode,
    method: 'delete'
  })
}
