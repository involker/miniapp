const app = getApp()

Page({
  data:{
    list:[]
  },
  onLoad:function(options){
    console.log(options)
    let openId = options.id
    this.getList(openId)
  },
  format:function(timestamp,pattern){
    let time = new Date(timestamp*1000)
    let Y = time.getFullYear()
    let M = time.getMonth() + 1
    let D = time.getDate()
    let h = time.getHours()
    let m = time.getMinutes()
    let s = time.getSeconds()
    return `${Y}-${M}-${D}`
  },
  getList:function(id){
    console.log(id)
    wx.cloud.callFunction({
      name:'getRunData',
      data:{
        openId:id
      },
      success:(res)=>{
        console.log(res)
        let list = res.result.data[0].steps
        list.forEach(item=>{
          item.time = this.format(item.timestamp)
        })
        this.setData({
          list
        })
      },
      fail:(res)=>{
        console.log(res)
      }
    })
  }

})