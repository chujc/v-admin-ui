import axios from 'axios'
import { Notification, MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 100000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    if (getToken()) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

const error = (error) => {
  if (error.response) {
    const data = error.response.data
    const status = error.response.status
    const message = data.hasOwnProperty('message') ? data.message : error.message
    if (status === 401) {
      MessageBox.confirm(
        '登录状态已过期，您可以继续留在该页面，或者重新登录',
        '系统提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
    } else if (status === 422) {
      Message({
        message: message,
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      Message({
        message: message,
        type: 'error',
        duration: 5 * 1000
      })
    }
  }
  return Promise.reject(error)
}

// 响应拦截器
service.interceptors.response.use((res) => {
  const code = res.data.code
  const message = res.data.message
  if (code === 401) {
    MessageBox.confirm(
      '登录状态已过期，您可以继续留在该页面，或者重新登录',
      '系统提示',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      store.dispatch('user/logout').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    })
  }
  // 统一的异常代码
  if (code === 400) {
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
  }

  // Excel文件导出下载
  if (res.headers['content-type'] === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    let downloadElement = document.createElement('a')
    let href = window.URL.createObjectURL(blob) //创建下载的链接
    downloadElement.href = href
    //获取文件名
    downloadElement.download = decodeURI(res.headers['content-disposition'].split('=')[1])  //处理文件名乱码问题
    // downloadElement.download = excelFileName; //下载后文件名
    document.body.appendChild(downloadElement)
    downloadElement.click() //点击下载
    document.body.removeChild(downloadElement) //下载完成移除元素
    window.URL.revokeObjectURL(href) //释放掉blob对象
  }

  return res.data
}, error)

export default service
