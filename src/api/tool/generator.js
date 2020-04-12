import request from '@/utils/request'

// 查询生成表数据
export function listGeneratorTable(query) {
  return request({
    url: 'tools/table',
    method: 'get',
    params: query
  })
}
// 代码生成器URL
export const buildUrl = '/tools/generator/build?tables=';

// 查询db数据库列表
export function listDbTable(query) {
  return request({
    url: '/tools/db/table',
    method: 'get',
    params: query
  })
}

// 查询表详细信息
export function getGeneratorTable(tableId) {
  return request({
    url: '/tools/table/' + tableId,
    method: 'get'
  })
}

// 修改代码生成信息
export function updateGeneratorTable(data) {
  return request({
    url: '/tools/table',
    method: 'put',
    data: data
  })
}

// 删除生成表数据
export function delGeneratorTable(tableId) {
  return request({
    url: '/tools/table/' + tableId,
    method: 'delete'
  })
}

// 导入表
export function importGeneratorTable(data) {
  return request({
    url: 'tools/table/import',
    method: 'post',
    params: data
  })
}
