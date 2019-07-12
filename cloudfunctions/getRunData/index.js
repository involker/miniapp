// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()
const db = cloud.database({
  env: 'test-adhnk'
})
const collection = db.collection('step')
exports.main = async (event, context) => {
  let {openId} = event
  try{
    return await collection.where({
      openId:openId
    }).get()
  }catch(e){
    console.log(e)
  }
}
