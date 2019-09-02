import API from '../api'
import * as routerRedux from 'connected-react-router'
export default async function(props) {
  console.log('propspropsprops',props)
  try {
    const { appKey } = await getClientId()

    const code = await getCodeByClientId(appKey)

    const userInfo = await getTokenByCode(code)

    // const userInfo = yield getUserInfoByToken(access_token)
    console.log('userInfouserInfo', userInfo)
    const data = await getTokenByUserInfo({
      ...userInfo,
      authType: 5
    })
    return data
  } catch (err) {
    console.log('err', err.message)
  }
}

function getClientId(type) {
  return new Promise(function(resolve, reject) {
    API.get(`welink/thirdParty/appSecret?appName=welink`).then(data => {
      const { code, result } = data
      if (code === 200) {
        const { appKey, appSecret } = result
        resolve({
          appKey,
          appSecret
        })
      }
    })
  })
}

function getCodeByClientId(clientId) {
  return new Promise(function(resolve, reject) {
    //第一个参数是error

    window.HWH5.getAuthCode({
      clientId
    })
      .then(data => {
        const { code } = data
        if (!code) {
          reject('获取 welink code 失败')
          return
        }
        resolve(code)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function getTokenByCode(code) {
  return new Promise(function(resolve, reject) {
    API.get('/welink/token', {
      params: {
        code
      }
    })
      .then(data => {
        const { code, result } = data
        if (code !== 0) {
          reject(result.message)
          return
        }
        // const { access_token } = result
        const { tenantId: externalId, userEmail: username } = result
        if (!username) {
          //   router.push('/welinkError?msg=用户邮箱不能为空,请检查自己的邮箱')
          routerRedux.push({
            pathname: '/welinkError',
            query: {
              msg: '用户邮箱不能为空,请检查自己的邮箱'
            }
          })
          return
        }
        resolve({
          externalId,
          username
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}

function getTokenByUserInfo(userInfo) {
  return new Promise(function(resolve, reject) {
    API.post(`/welink/login`, userInfo)
      .then(data => {
        const { code, result = {} } = data
        console.log('codecodecode', code)
        if (code !== 200) {
          if (code === 70000) {
            // router.push('/welinkError?msg=正在审核中，请耐心等待！')
            routerRedux.push({
              pathname: '/welinkError',
              query: {
                msg: '正在审核中，请耐心等待'
              }
            })
            return
          }
          reject(result.message)
          return
        }
        const { token, userName } = result
        resolve({
          token,
          userName
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}
