//index.js
const app = getApp()

Page({
  data: {
    userInfo:{},
    showBtn:false,
    steps:[],
    list:[],
    loading:true,
    active:0,
    tabs:[
      { name: '本周', time: 1 },
      { name: '上周', time: 0 },
    ]
  },
  changeTab:function(e){
    let index = e.currentTarget.dataset.index
    if(index === this.data.active) return
    let {steps} = this.data
    let list = this.setWeekData(steps,index)
    this.setData({
      active:index,
      list
    })
  },
  setWeekData:function(data,i){
    let list = data.map(item => {
      let steps = i === 0 ? this.getCurWeekData(item.steps) : this.getPreWeekData(item.steps)
      console.log(steps)
      let openId = item.openId
      let count = steps.reduce((total, cur) => {
        return total + (cur && cur.step ? cur.step : 0)
      }, 0)
      let temp = {
        avatarUrl: item.avatarUrl,
        nickName: item.nickName,
        count,
        steps,
        openId,
      }
      return temp
    }).sort(function (a, b) {
      return b.count - a.count
    })
    return list
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
              userInfo: res.userInfo,
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
  onPullDownRefresh:function(){
    this.init()
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
  getPreWeekData(list){
    let time = new Date()
    let curDay = time.getDay()
    let D = time.getDate()
    let M = time.getMonth()
    let Y = time.getFullYear()
    let endTime = new Date(Y,M,D).getTime() - curDay * 24 * 60 * 60 * 1000
    let startTime = endTime - 7 * 24 * 60 * 60 * 1000
    return list.filter(item => {
      return item.timestamp > startTime / 1000 && item.timestamp <= endTime / 1000
    })
  },
  getCurWeekData(list){
    let time = new Date()
    let curDay = time.getDay()
    let D = time.getDate()
    let M = time.getMonth()
    let Y = time.getFullYear()
    let endTime = new Date(Y,M,D).getTime()
    let startTime = endTime - curDay * 24 * 60 * 60 * 1000
    return list.filter(item => {
      return item.timestamp > startTime / 1000 && item.timestamp <= endTime / 1000
    })
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
            let {active} = _this.data
            console.log(data)
            let list = _this.setWeekData(data, active)
            wx.hideLoading()
            wx.stopPullDownRefresh()
            _this.setData({
              list,
              loading:false,
              showBtn:false,
              steps:data
            })
            
          }
        })
      }
    })
  }
})
