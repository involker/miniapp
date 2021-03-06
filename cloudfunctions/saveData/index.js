const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env:'test-adhnk'
})
const collection = db.collection('step')
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let { userInfo, nickName, avatarUrl} = event
  try {
    let list = await collection.where({
      openId: wxContext.OPENID
    }).get()
    if (list.data.length){
      await collection.where({
        openId: wxContext.OPENID
      }).update({
        data: {
          openId: wxContext.OPENID,
          avatarUrl,
          nickName
        }
      })
      
    }else{
      await collection.add({
        data: {
          openId: wxContext.OPENID,
          avatarUrl,
          nickName,
          steps: []
        }
      })
    }
    return {
      openId: wxContext.OPENID
    }
  } catch (e) {
    return collection
  }
}