// pages/start/start.js
var num;
var app = getApp()
var result = false;
var autoName = 'Nodivice';
var jump = false;
var jmac = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mList: [{
      name: '未搜索到设备，请刷新',
      mac: ''
    }],
    openBle: false,
    UUID_SERVER: '0000fee0-0000-1000-8000-00805f9b34fb',
    debug: __wxConfig.envVersion == "develop" ? true : false,
    name: '',
    mac: '',
    timeOut:0,
    // ios: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(this.route, 'onLoad');
    that = this;
    jump = false;
    autoName = 'Nodivice';

    //检查设备型号
    wx.getSystemInfo({
      success: function(res) {
        console.log('info', res, '版本', app.getVersion())
        // if (res.system.indexOf('ios') || res.system.indexOf('iOS') || res.system.indexOf('Ios')) {
        //   that.setData({
        //     ios: true
        //   })
        // }
      },
    })
    //版本判断
    if (app.getPlatform() == 'android' && this.versionCompare('6.5.7', app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false,
        success: function(res) {
          if (res.confirm) { //确认

          }
        }
      })
      return;
    } else if (app.getPlatform() == 'ios' && this.versionCompare('6.5.6', app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
      return;
    }
    // wx.clearStorageSync()

    var f = wx.getStorageSync('first');
    console.log('版本状态', f == "", f);
    if (f == "" && app.getPlatform() == 'android') {
      wx.showModal({
        title: '温馨提示',
        content: 'Android小程序因平台限制，若蓝牙配对后会连接不上，请不要配对设备，使用途中可能会出现多次重连，安卓端尽量使用APK端软件。',
        showCancel: false,
        confirmColor: '#007aff',
        success: function() {
          wx.setStorageSync('first', 'false')
        }
      });
    }



    if (options.result) {
      result = true;
    }
    var that = this;
    wx.openBluetoothAdapter({ //初始化蓝牙模块
      success: function(res) {
        console.log('蓝牙初始化成功')
        that.setData({
          openBle: true
        })
        wx.startPullDownRefresh({})
      },
      fail: function(res) {
        console.log('蓝牙初始化失败')
        that.setData({
          openBle: false
        })
        wx.showLoading({
          title: '请打开蓝牙刷新',
          mask: !that.data.debug,
        })
      }
    })

    wx.onBluetoothAdapterStateChange(function(res) {
      console.log('1检测蓝牙状态：', res.available, res.discovering)
      if (!res.available) {
        wx.showLoading({
          title: '请打开蓝牙刷新',
          mask: !that.data.debug,
        })
        that.setData({
          openBle: false,
        })
      }

      if (res.available && !that.data.openBle) {
        wx.showLoading({
          title: '模块加载中',
          mask: !that.data.debug,
        })

        wx.openBluetoothAdapter({
          success: function(res) {
            console.log('打开蓝牙成功')
            that.setData({
              openBle: true,
            })
            wx.startPullDownRefresh({})

          },
          fail: function(res) {
            console.log('打开失败', res)
          }
        })

      }


    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   * 每次进入会调用
   */
  onShow: function() {

    wx.closeBLEConnection({
      deviceId: jmac,
      success: function (res) {
        console.log('断开')
      },
    })
    wx.closeBluetoothAdapter({
      success: function (res) {
        console.log('关闭')
      },
    })
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log('打开')
      },
    })

    // this.setData({
    //   name: wx.getStorageSync('name'),
    //   mac: wx.getStorageSync('mac')
    // })

    // var that = this;

    // //延迟0.5秒触发，有可能初始化蓝牙有延迟。
    // setTimeout(function() {
    //   console.log(this.route, 'onShow', 'BLE has:', that.data.openBle, 'name:', that.data.name, '_result:', result)

    //   if (that.data.name != null && that.data.mac != null && result) {
    //     autoName = that.data.name;
    //   }

    //   // if (that.data.openBle) {
    //   //   wx.startPullDownRefresh({})
    //   // } else {
    //   wx.onBluetoothAdapterStateChange(function(res) { //会一直监听改变一次发送一次
    //     console.log('检测蓝牙状态：', res.available, res.discovering)
    //     if (that.data.openBle && !res.available) {
    //       that.setData({
    //         openBle: false
    //       })
    //       wx.showLoading({
    //         title: '请打开蓝牙重试',
    //         mask: !that.data.debug,
    //       })
    //       return;
    //     }

    //     if (!that.data.openBle && res.available) {
    //       that.setData({
    //         openBle: true
    //       })

    //         wx.startPullDownRefresh({})
    //     }
    //   })
    //   // }
    // }, 500)

  },


  /**
   * 当蓝牙状态可用 开始搜索设备
   */
  searchDevice: function() {
    var that = this
    //清空当前列表
    that.setData({
      mList: [{}]
    })

    console.log("搜索设备");
    // wx.hideLoading()
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: function(res) {
        console.log('打开扫描开始:', res)

        wx.onBluetoothDeviceFound(function(res) {
          console.log('发现设备', res)
          // var ds = that.data.mList
          // var temp = {
          //   name: res.devices[0].name,
          //   mac: res.devices[0].deviceId
          // }
          // ds.push(temp)
          // that.setData({
          //   mList: ds
          // })
        })
      },
      fail: function(res) {
        console.log('打开扫描设备失败', res)
      }
    })

    //3秒后关闭扫描
    clearTimeout(num) //只需要一个定时器存在
    num = setTimeout(function() {
      wx.stopBluetoothDevicesDiscovery({
        success: function(res) {

          wx.getBluetoothDevices({
            success: function(res) {
              console.log('所有设备', res)
              for (var i = 0; i < res.devices.length; i++) {
                var ds = that.data.mList
                if ((res.devices[i].name.indexOf('t') == -1
                    /*&&res.devices[i].name.indexOf('BLE') == -1*/
                  ) || res.devices[i].name.length > 4) { //过滤不符合蓝牙(不包含T 或者长度大于4)
                  continue;
                }
                console.log("name SIze:", res.devices[i].name.length)
                var temp = {
                  name: res.devices[i].name,
                  mac: res.devices[i].deviceId
                }
                ds.push(temp)
                that.setData({
                  mList: ds
                })
              }
            },
            fail: function(res) {
              that.setData({
                mList: [{
                  name: '未搜索到设备，请刷新',
                  mac: ''
                }]
              })
            },
            complete: function(res) {
              console.log('关闭扫描')
              wx.stopPullDownRefresh(); //停止当前页面的下拉刷新
              wx.hideNavigationBarLoading(); //加载动画结束
              wx.hideLoading();
              console.log('扫描结果：length:', that.data.mList, '可能连接名：', autoName)
              if (that.data.mList.length <= 1) {
                console.log('没有扫描到')
                that.setData({
                  mList: [{
                    name: '未搜索到设备，请刷新',
                    mac: ''
                  }]
                })
              }
            }
          })
        },
      })
    }, 5000)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    if (!this.data.openBle) {
      wx.stopPullDownRefresh(); //停止当前页面的下拉刷新
      wx.hideNavigationBarLoading(); //加载动画结束
      return;
    }

    wx.closeBLEConnection({
      deviceId: jmac,
      success: function(res) {
        console.log('断开')
      },
    })
    wx.closeBluetoothAdapter({
      success: function(res) {
        console.log('关闭')
      },
    })
    wx.openBluetoothAdapter({
      success: function(res) {
        console.log('打开')
      },
    })


    console.log('下拉刷新')
    wx.showLoading({
      title: '搜索设备中',
      mask: !this.data.debug,
    })
    wx.showNavigationBarLoading(); //加载动画开始

    var time = setTimeout(function() {
      wx.stopPullDownRefresh(); //停止当前页面的下拉刷新
      wx.hideNavigationBarLoading(); //加载动画结束
      wx.hideLoading();
    }, 10000)

    this.setData({
      timeOut: time,
    })

    this.searchDevice()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {},
  /**
   * 点击刷新
   */
  onRefresh: function() {
    wx.startPullDownRefresh({})
  },
  /**item 点击*/
  onItemClick: function(res) {
    console.log('itemclick', res.currentTarget.dataset.mac, res.currentTarget.dataset.name);
    if (res.currentTarget.dataset.mac == '' && !this.data.debug && !jump) {
      return
    }
    jump = true;
    wx.hideLoading();
    clearTimeout(this.data.timeOut);
    this.setData({
      jmac: res.currentTarget.dataset.mac,
    })
    wx.navigateTo({
      url: '../ble/ble?mac=' + res.currentTarget.dataset.mac + '&name=' + res.currentTarget.dataset.name,
      complete: function() {
        console.log('start结束')
      }
    })
  },

  /**版本比较*/
  versionCompare: function(ver1, ver2) {
    var version1pre = parseFloat(ver1)
    var version2pre = parseFloat(ver2)
    var version1next = parseInt(ver1.replace(version1pre + ".", ""))
    var version2next = parseInt(ver2.replace(version2pre + ".", ""))
    if (version1pre > version2pre)
      return true
    else if (version1pre < version2pre)
      return false
    else {
      if (version1next > version2next)
        return true
      else
        return false
    }
  }
})