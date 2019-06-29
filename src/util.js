const router = require('@system.router')
const storage = require('@system.storage')
const fetch = require('@system.fetch')
const prompt = require('@system.prompt')
const uuidv1 = require('uuid/v1')
const sha1 = require('sha1')

/**
 * 显示菜单
 */
function showMenu() {
  let prompt = require('@system.prompt')
  prompt.showContextMenu({
    itemList: ['保存桌面', '取消'],
    success: function (ret) {
      switch (ret.index) {
        case 0:
          // 保存桌面
          createShortcut()
          break
        case 1:
          // 取消
          break  
      }
    }
  })
}

/**
 * 创建桌面图标
 * 注意：使用加载器测试`创建桌面快捷方式`功能时，请先在`系统设置`中打开`应用加载器`的`桌面快捷方式`权限
 */
function createShortcut() {
  let prompt = require('@system.prompt')
  let shortcut = require('@system.shortcut')
  shortcut.hasInstalled({
    success: function (ret) {
      if (ret) {
        prompt.showToast({ message: '已创建桌面图标' })
      } else {
        shortcut.install({
          success: function () {
            prompt.showToast({ message: '成功创建桌面图标' })
          },
          fail: function (errmsg, errcode) {
            prompt.showToast({ message: 'error: ' + errcode + '---' + errmsg })
          }
        })
      }
    }
  })
}

/**
 * 显示Toast消息
 */
function showToast(message) {
  prompt.showToast({
    message: message
  })
}

/**
 * 显示消息框
 */
function showModal(title, message) {
  prompt.showDialog({
    title: title,
    message: message,
    buttons: [
      {
        text: '确认'
      }
    ]
  })
}

/**
 * 显示确认消息框
 */
function showConfirmModal(title, message, confirmCallback, cancelCallback) {
  prompt.showDialog({
    title: title,
    message: message,
    buttons: [
      {
        text: '确认'
      },
      {
        text: '取消'
      }
    ],
    success: function (data) {
      switch (data.index) {
        case 0:
          //确定
          confirmCallback()
          break

        case 1:
          //取消
          cancelCallback()
          break
      }
    }
  })
}

/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('/') + ' '
    + [hour, minute, second].map(formatNumber).join(':');
}

/**
 * 格式化数字
 */
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

/**
 * 校验有无请求Token权限
 */
async function validateRequestAccess() {
  let accessToken = await this.getStorage('accessToken')
  if (accessToken) {
    if (validateTokenTimestamp(accessToken.expireTime)) {
      return true;
    }
  }
  return false;
}

/**
 * 校验令牌时间戳
 */
function validateTokenTimestamp(expireTime) {
  return Math.floor((expireTime - new Date().getTime()) / 3600000) >= 1
}

/**
 * 重置当前页面，返回到登录界面
 */
function reLaunch() {
  router.replace({
    uri: '/Login'
  })
}

/**
 * 跳转到应用内的某个页面
 */
function redirectTo(param) {
  router.push({
    uri: param.url
  })
}

/**
 * 跳转到应用内的某个页面，当前页面将被替换且页面不允许返回
 */
function replaceTo(param) {
  router.replace({
    uri: param.url
  })
}

/**
 * 返回上一页
 */
function navigateBack() {
  router.back()
}

/**
 * 异步读取数据值
 */
async function getStorage(key) {
  let result = await new Promise((resolve, reject) => {
    storage.get({
      key: key,
      success: function (data) {
        resolve(data)
      },
      fail: function () {
        resolve(null)
      }
    })
  })
  return result
}

/**
 * 异步存储数据值
 */
async function setStorage(key, object) {
  storage.set({
    key: key,
    value: object
  })
}

/**
 * 清除数据存储
 */
function clearStorage() {
  storage.clear()
}

/**
 * 发起网络请求
 */
async function request(param) {
  let that = this
  let result = await new Promise((resolve, reject) => {
    fetch.fetch({
      url: param.url,
      data: param.data,
      method: param.method,
      success: function (response) {
        if (response.code == 200) {
          let result = JSON.parse(response.data)
          if (result.success) {
            resolve(result.data)
          }
          else {
            that.showModal('请求失败', result.message)
          }
        }
        else {
          that.showModal('请求失败', '服务暂不可用，请稍后再试')
        }
        resolve(null)
      },
      fail: function () {
        that.showModal('网络异常', '网络连接超时，请重试')
        resolve(null)
      }
    })
  })
  return result
}

/**
 * 获取用户唯一标识ID
 */
function uuid() {
  return uuidv1()
}

/**
 * sha1哈希映射字符串
 */
function sha1Hex(content) {
  return sha1(content)
}

export default {
  showMenu,
  createShortcut,
  validateRequestAccess,
  validateTokenTimestamp,
  formatTime,
  formatNumber,
  showToast,
  showModal,
  showConfirmModal,
  reLaunch,
  redirectTo,
  replaceTo,
  navigateBack,
  getStorage,
  setStorage,
  clearStorage,
  request,
  uuid,
  sha1Hex
}