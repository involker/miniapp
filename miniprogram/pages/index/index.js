//index.js
const app = getApp()

Page({
  data: {
    userInfo:{},
    showBtn:false,
    steps:[],
    list:[],
    loading:true
  },
  onGetUserInfo:function(e){
    this.init()
  },
  init:function(){
    let _this = this
    let _wx = wx
    wx.getSetting({
      success: res => {
        wx.getUserInfo({
          fail:res=>{
            console.log(res)
          },
          complete:res=>{
            console.log(res)
          },
          success: res => {
            this.setData({
              userInfo: res.userInfo
            })
            wx.cloud.callFunction({
              name: 'saveData',
              data: {
                nickName: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              },
              success: res => {
                _this.getStep()

                // _wx.login({
                //   success: res => {
                //     _this.getStep()
                //   }
                // })
              }
            })
            this.setData({
              avatarUrl: res.userInfo.avatarUrl,
              userInfo: res.userInfo
            })
          },
          fail: res => {
            _wx.hideLoading()
            this.setData({
              showBtn: true
            })
          }
        })

      }
    })
  },
  onLoad: function() {
    wx.showLoading({
      title: '正在获取数据',
    })
    if (!wx.cloud) {
      return
    }
    this.init()
    
  },
  getCurWeekData(list){
    let curDay = new Date().getDay()
    let arr = []
    for(let i=0;i<curDay;i++){
      let temp = list[list.length-1-i]
      arr.push(temp)
    }
    return arr
  },
  gotoDetail:function(event){
    console.log(event)
    let {openId} = event.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/detail/detail?id=${openId}`,
    })
  },
  getStep:function(e){
    let _this = this
    wx.getWeRunData({
      success(res){
        let cloudID = res.cloudID
        wx.cloud.callFunction({
          name:'getRunDataList',
          data: {
            weRunData: wx.cloud.CloudID(cloudID)
          },
          success:(res)=>{
            let {data} = res.result
            let list = data.map(item=>{
              let curWeekSteps = _this.getCurWeekData(item.steps)
              let openId = item.openId
              let count = curWeekSteps.reduce((total,cur)=>{
                return total + (cur&&cur.step?cur.step:0)
              },0)
              let temp = {
                avatarUrl: item.avatarUrl,
                nickName:item.nickName,
                count,
                curWeekSteps,
                openId,
              }
              return temp
            }).sort(function (a, b) {
              return b.count - a.count
            })
            wx.hideLoading()
            _this.setData({
              list,
              loading:false,
              showBtn:false
            })
            
          }
        })
      }
    })
  }
})
