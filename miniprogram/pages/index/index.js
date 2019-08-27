//index.js
const app = getApp()

Page({
  data: {
    goal:50000,
    count:0,
    ownStep:0,
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
    this.setData({
      active:0
    })
    let _this = this
    let _wx = wx
    wx.getSetting({
      success: res => {
        wx.getUserInfo({
          fail:res=>{
          },
          complete:res=>{
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
                console.log(res)
                _this.setData({
                  openId:res.result.openId
                })
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
    wx.showLoading({
      title: '正在加载',
    })
  },
  onLoad: function() {
    wx.showLoading({
      title: '正在获取数据',
    })
    var ctx = wx.createCanvasContext('canvas')
    ctx.setLineWidth(5)
    ctx.beginPath()
    ctx.setStrokeStyle('#ddd')
    ctx.arc(55, 55, 50, 0, 2 * Math.PI)
    ctx.stroke();
    ctx.draw();
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
      url: `/pages/detail/detail?id=${openId}&t=${this.data.active}`,
    })
  },
  setProgress:function(list){
    let {openId,goal} = this.data
    let ownStep = list.filter(item=>item.openId === openId)
    let count = ownStep[0].count
    let percent = Math.ceil(count/goal*100)
    let p = 0
    let _this = this
    var ctx = wx.createCanvasContext('canvas')
    _this.setData({
      ownStep:count
    })
    function foo() {
      p++
      ctx.setLineWidth(5)
      ctx.beginPath()
      ctx.setStrokeStyle('#ddd')
      ctx.arc(55, 55, 50, 0, 2 * Math.PI)
      ctx.stroke();
      ctx.beginPath()
      ctx.setStrokeStyle("#1aad19")
      ctx.arc(55, 55, 50, 0.5 * Math.PI, (2 * p/100 + 0.5) * Math.PI)
      ctx.stroke()
      ctx.draw()
      let temp = Math.ceil(p / 100 * goal) > count ? count : Math.ceil(p / 100 * goal)
      _this.setData({
        count: temp,
      })
      if (p === percent) {
        // requestAnimationFrame(foo)
        clearInterval(_this.id)
      }
    }
    // requestAnimationFrame(foo)
    _this.id = setInterval(foo,16)
    
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
            let list = _this.setWeekData(data, active)
            wx.hideLoading()
            wx.stopPullDownRefresh()
            _this.setProgress(list)
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
