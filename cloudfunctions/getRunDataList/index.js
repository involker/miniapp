const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'test-adhnk'
})
const collection = db.collection('step')
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    await collection.where({
      openId: wxContext.OPENID
    }).update({
      data: {
        steps: event.weRunData.data.stepInfoList || []
      }
    })
    return await collection.limit(100).get()
  } catch (e) {
    console.error(e)
  }
}