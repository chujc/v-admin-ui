import { constantRoutes } from '@/router'
import Layout from '@/layout/index'

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // 生成路由
  generateRoutes({ commit }, payload) {
    return new Promise(resolve => {
      const accessedRoutes = filterAsyncRouter(payload.routes)
      accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {
  const routeTree = []
  asyncRouterMap.forEach(route => {
    let routeNode = {
      name: route.path,
      path: route.path,
      meta: {
        title: route.menu_name,
        icon: route.icon
      }
    }

    if (route.is_link) {
      routeNode.name = route.menu_name
      routeNode.component = Layout
    } else {
      if (route.component) {
        routeNode.component = loadView(route.component)
      } else {
        routeNode.component = Layout
      }
    }

    if (route.hasOwnProperty('children') && route.children != null && route.children && route.children.length) {
      routeNode.path = '/' + route.path
      routeNode.alwaysShow = true
      routeNode.redirect = 'noRedirect'
      routeNode.children = filterAsyncRouter(route.children)
    }

    if (route.is_visible === 1) {
      routeNode.hidden = false
    } else {
      routeNode.hidden = true
    }

    routeTree.push(routeNode)
  })
  return routeTree
}

export const loadView = (view) => { // 路由懒加载
  return () => import(`@/views/${view}`)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
