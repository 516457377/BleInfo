// pages/ble/ble.js
var mac;
var name;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 1,//页面选择
    parTop: 0,//eq模式
    windowHeight: 0,
    screenHeight: 0,
    sound:10,//音量
    aux_index:0,//aux模式
    delay1:0,//延时时间
    delay2: 0,
    delay3: 0,
    delay4: 0,
    eq1: 0,//EQ设置
    eq2: 0,
    eq3: 0,
    eq4: 0,
    eq5: 0,
    eq6: 0,
    eq7: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    mac = options.mac;
    name = options.name;

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**-----------------------------------------*/
  changeTabbar(e) {
    this.setData({ index: e.currentTarget.dataset.id })
  },
  onClickUp(e){
    this.setData({ parTop : e.currentTarget.dataset.id })
  },
  //AUX
  auxClick(e){
    this.setData({ aux_index: e.currentTarget.dataset.id})
  },
  /**音量ing*/
  Soundchangeing(e){
    this.setData({
      sound: e.detail.value
    })
  },
  Soundchanged(e){
    console.log('souned')
    this.setData({
      sound: e.detail.value
    })
  },
  /**延迟ing*/
  delayChanging(e){
    var that = this;
    //console.log('delayChanging',e);
    switch (e.currentTarget.id) {
      case 'd1':
        this.setData({
          delay1: e.detail.value
        })
        break;
      case 'd2':
        this.setData({
          delay2: e.detail.value
        })
       break;
      case 'd3':
        this.setData({
          delay3: e.detail.value
        })
        break;
      case 'd4':
        this.setData({
          delay4: e.detail.value
        })
        break;
    }
    
  },
  delaychanged(e){
    var that = this;
    //console.log('delaychanged',e);
    switch (e.currentTarget.id) {
      case 'd1':
        this.setData({
          delay1: e.detail.value
        })
        break;
      case 'd2':
        this.setData({
          delay2: e.detail.value
        })
        break;
      case 'd3':
        this.setData({
          delay3: e.detail.value
        })
        break;
      case 'd4':
        this.setData({
          delay4: e.detail.value
        })
        break;
    }
  },
  /**EQing*/
  EQchangeing(e){

  },
  EQchanged(e){
    switch (e.currentTarget.id) {
      case "eq1":
        break;

      case "eq2":
        break;

      case "eq3":
        break;

      case "eq4":
        break;

      case "eq5":
        break;

      case "eq6":
        break;

      case "eq7":
        break;
    }
  },
  onReset(e){
    console.log("click");
  },

  /**
   * 写入数据事件
   */
  wirte: function (buff) {
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: mac,
      serviceId: that.data.UUID_SERVER,
      characteristicId: that.data.UUID_WRITE,
      value: buff.buffer,
      success: function (res) {
        console.log('发送成功', res)
      },
      fail(res) {
        console.log(res, "发送失败")
      }
    })
  }

})