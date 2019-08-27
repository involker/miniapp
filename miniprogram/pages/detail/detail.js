const app = getApp()
var wxCharts = require('../../util/wxcharts-min.js');
var lineChart = null;
Page({
  data:{
    list: [], 
    showChart:true,
    loading:true
  },
  onLoad:function(options){
    console.log(options)
    wx.showLoading({
      title: '正在加载中',
    })
    let openId = options.id
    let t = options.t
    this.getList(openId,t)
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
  createData:function(list){
    var categories = [];
    var data = [];
    list.forEach(item=>{
      categories.push(item.time)
      data.push(item.step)
    })
    return {
      categories,
      data
    }
  },
  getPreWeekData(list) {
    let time = new Date()
    let curDay = time.getDay()
    let D = time.getDate()
    let M = time.getMonth()
    let Y = time.getFullYear()
    let endTime = new Date(Y, M, D).getTime() - curDay * 24 * 60 * 60 * 1000
    let startTime = endTime - 7 * 24 * 60 * 60 * 1000
    return list.filter(item => {
      return item.timestamp > startTime / 1000 && item.timestamp <= endTime / 1000
    })
  },
  getCurWeekData(list) {
    let time = new Date()
    let curDay = time.getDay()
    let D = time.getDate()
    let M = time.getMonth()
    let Y = time.getFullYear()
    let endTime = new Date(Y, M, D).getTime()
    let startTime = endTime - curDay * 24 * 60 * 60 * 1000
    return list.filter(item => {
      return item.timestamp > startTime / 1000 && item.timestamp <= endTime / 1000
    })
  },
  createChart:function(list){
    if(list.length === 0) {
      this.setData({
        showChart:false
      })
      return
    }
    var data = this.createData(list);
    var res = wx.getSystemInfoSync();
    var windowWidth = res.windowWidth;
    lineChart = new wxCharts({
      canvasId: 'canvas',
      type: 'line',
      categories: data.categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '日期',
        data: data.data,
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '步数',
        min: 0
      },
      width: windowWidth,
      height: 300,
      dataLabel: true,
      dataPointShape: true,
      legend:true,
    });
  },
  getList:function(id,t){
    console.log(id)
    wx.cloud.callFunction({
      name:'getRunData',
      data:{
        openId:id
      },
      success:(res)=>{
        console.log(res)
        let list = res.result.data[0].steps
        if(list.length === 0) return
        list.forEach(item=>{
          item.time = this.format(item.timestamp)
        })
        let chartList = t==0?this.getCurWeekData(list):this.getPreWeekData(list)
        this.createChart(chartList)
        wx.hideLoading()
        this.setData({
          list,
          loading:false
        })
      },
      fail:(res)=>{
        console.log(res)
      }
    })
  }

})