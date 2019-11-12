// pages/ble/ble.js
var mac;
var name;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
     * 调试模式
     * */
    debug: __wxConfig.envVersion == "develop" ? true : false,
    index: 0, //页面选择
    parTop: 0, //eq模式
    windowHeight: 0,
    screenHeight: 0,
    sound: 0, //音量
    aux_index: 0, //aux模式
    delay1: 0, //延时时间
    delay2: 0,
    delay3: 0,
    delay4: 0,
    eq1: 0, //EQ设置
    eq2: 0,
    eq3: 0,
    eq4: 0,
    eq5: 0,
    eq6: 0,
    eq7: 0,
    listen: false, //聆听位
    //版本相关
    dsp:"", 
    dsp2: "/APP:1.3.0",
    time: 0,
    cKnum: 0,
    //验证消息
    callBack: false,
    //确定退出
    onback: false,
    //连接次数限制20次。
    connectNum: 0,

    //-------------------------------
    connect: false, //连接状态
    deviceID: '', //当前连接设备id(MAC)
    UUID_SERVER: '0000FEE0-0000-1000-8000-00805F9B34FB',
    UUID_WRITE: '0000FEE2-0000-1000-8000-00805F9B34FB',
    UUID_READ: '0000FEE1-0000-1000-8000-00805F9B34FB',
    /**第一次获取服务失败后重启蓝牙*/
    NumOut: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    var that = this;
    mac = options.mac;
    name = options.name;
    console.log('跳转控制页面', mac, name);
    const envVersion = __wxConfig.envVersion;
    console.log('软件版本', envVersion);

    wx.showLoading({
      title: '连接中',
      mask: !that.data.debug,
    });
    // that.connectIng();
    that.connectBle();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    
    var that = this;
    console.log('Unload:退出');
    this.setData({
      onback : true,
    })
    wx.closeBLEConnection({
      deviceId: mac,
      success: function(res) {
        console.log('断开链接')
        // that.disConnect();
      },
      complete: function(res) {
        // console.log('跳转到搜索页面')
        // wx.reLaunch({
        //   url: '../start/start',
        // })
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},
  /**-----------------------------------------------------自定义方法(监听)-----------------------------------------------------*/
  //页面切换
  changeTabbar(e) {
    this.setData({
      index: e.currentTarget.dataset.id
    })
  },
  //AUX
  auxClick(e) {
    this.setData({
      aux_index: e.currentTarget.dataset.id
    })
    if (e.currentTarget.dataset.id == 0) {

      // var a = []{ 00x1, 00x2 };
      const b = this.getByte(new Int8Array([0x02, 0x00]));

      this.wirte(b)

    } else {
      this.wirte(this.getByte(new Int8Array([0x02, 0x01])));
    }
  },
  /**查看版本 音量控制点击8次*/
  onSoundClick(e) {
    var temp;
    var that = this;
    console.log("消息打印", this.data.cKnum)

    if (that.data.cKnum >= 8){
      wx.showModal({
        title: '版本信息',
        content: that.data.dsp + that.data.dsp2,
        showCancel: false,
        confirmColor: '#007aff',
        success: function () {
          
        }
      });
      that.setData({
        cKnum: 0,
      })
      return;
    }

    if(that.data.time != 0){//存在延时,先取消之前的
      clearTimeout(that.data.time);
    }

    temp = setTimeout(function() {
      that.setData({
        cKnum: 0,
        time: 0,
      })
    }, 5000);

    this.setData({
      time: temp,
      cKnum: that.data.cKnum+1,
    })

  },
  /**音量ing*/
  Soundchangeing(e) {
    this.setData({
      sound: e.detail.value
    })
  },
  Soundchanged(e) {
    console.log('souned')
    this.setData({
      sound: e.detail.value
    })
    this.wirte(this.getByte(new Int8Array([0x03, e.detail.value])))
  },
  /**延迟ing*/
  delayChanging(e) {
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
  delaychanged(e) {
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
    that.wirte(this.getByte(new Int8Array([0x09, that.data.delay1 * 2, that.data.delay2 * 2, that.data.delay3 * 2, that.data.delay4 * 2, 0, 0])));
  },
  /**EQ页面 顶部按钮*/
  onClickUp(e) {
    this.setData({
      parTop: e.currentTarget.dataset.id
    })
    switch (e.currentTarget.dataset.id) {
      case "0":
        // console.log('一级连接:', mac)
        // wx.createBLEConnection({
        //   deviceId: mac,
        //   success: function(res) {
        //     console.log('一级连接成功')
        //   },fail:function(res){
        //     console.log('一级连接失败',res)
        //   }
        // })
        this.setEq(new Int8Array([0, 0, 0, 0, 0, 0, 0]))
        this.wirte(this.getByte(new Int8Array([0x07, 0x00])))
        break;

      case "1":
        // console.log('断开一级连接')
        //   wx.closeBLEConnection({
        //     deviceId: mac,
        //     success: function(res) {
        //       console.log('1断开成功')
        //     },fail:function(res){
        //       console.log('1断开失败',res)
        //     }
        //   })
        this.setEq(new Int8Array([8, 5, 4, 3, 4, 3, 2]))
        this.wirte(this.getByte(new Int8Array([0x07, 0x01])))
        break;

      case "2":
        // console.log('获取server')
        //   wx.getBLEDeviceServices({
        //     deviceId: mac,
        //     success: function(res) {
        //       console.log('获取server成功')
        //     },fail:function(res){
        //       console.log('获取server失败',res)
        //     }
        //   })
        this.setEq(new Int8Array([5, 1, 0, 0, 0, 0, 0]))
        this.wirte(this.getByte(new Int8Array([0x07, 0x02])))
        break;

      case "3":
        // console.log('一级连接错误地址:')
        // wx.createBLEConnection({
        //   deviceId: '00000000',
        //   success: function (res) {
        //     console.log('一级连接成功')
        //   }, fail: function (res) {
        //     console.log('一级连接失败', res)
        //   }
        // })
        this.setEq(new Int8Array([6, 4, 3, 4, 5, 3, 2]))
        this.wirte(this.getByte(new Int8Array([0x07, 0x03])))
        break;

      case "4":
        // wx.closeBluetoothAdapter({
        //   success: function(res) {
        //     console.log('关闭蓝牙模块成功')
        //   },fail:function(res){
        //     console.log('关闭蓝牙模块失败',res)
        //   }
        // })
        this.setEq(new Int8Array([9, -8, -8, -7, -6, -5, -4]))
        this.wirte(this.getByte(new Int8Array([0x07, 0x04])))
        break;

      case "5":
        // wx.openBluetoothAdapter({
        //   success: function(res) {
        //     console.log('打开蓝牙模块')
        //   },
        //   fail:function(res){
        //     console.log('打开蓝牙模块失败',res)
        //   }
        // })
        this.setEq(new Int8Array([0, 0, 0, 0, 0, 0, 0]))
        this.wirte(this.getByte(new Int8Array([0x07, 0x05])))
        break;
    }

  },
  /**聆听位*/
  onListen(e) {
    var that = this;
    if (this.data.listen) {
      that.wirte(this.getByte(new Int8Array([0x0d, 0x00])));
    } else {
      that.wirte(this.getByte(new Int8Array([0x0d, 0x01])));
    }

    this.setData({
      listen: !this.data.listen,
    })
  },
  /**EQing*/
  EQchangeing(e) {

  },
  EQchanged(e) {
    switch (e.currentTarget.id) {
      case "eq1":
        this.setData({
          eq1: e.detail.value
        })
        break;

      case "eq2":
        this.setData({
          eq2: e.detail.value
        })
        break;

      case "eq3":
        this.setData({
          eq3: e.detail.value
        })
        break;

      case "eq4":
        this.setData({
          eq4: e.detail.value
        })
        break;

      case "eq5":
        this.setData({
          eq5: e.detail.value
        })
        break;

      case "eq6":
        this.setData({
          eq6: e.detail.value
        })
        break;

      case "eq7":
        this.setData({
          eq7: e.detail.value
        })
        break;
    }
    this.wirte(this.getByte(new Int8Array([0x0a, this.data.eq1, this.data.eq2, this.data.eq3, this.data.eq4, this.data.eq5, this.data.eq6, this.data.eq7, 0, 0])))
  },
  onReset(e) {
    console.log("click");
    this.setEq(new Int8Array([0, 0, 0, 0, 0, 0, 0]))
    this.wirte(this.getByte(new Int8Array([0x0a, 0, 0, 0, 0, 0, 0, 0, 0, 0])))
  },
  onBack(e) {
    wx.navigateBack({
      delta: 1
    })
    // console.log('退出');
    // wx.closeBLEConnection({
    //   deviceId: mac,
    //   success: function(res) {
    //     console.log('断开链接')
    //     that.disConnect();
    //   },
    //   complete: function(res) {
    //     console.log('跳转到搜索页面')
    //     wx.reLaunch({
    //       url: '../start/start',
    //     })
    //   }
    // })
  },
  /*--------------------------------------------自定调用方法-------------------------------------------------*/
  connectIng(){
    var that = this;
    console.log('多次连接', that.data.connectNum);
    if (that.data.connectNum > 60){
      return;
    }
    that.setData({
      connectNum:that.data.connectNum+1,
    })
    wx.createBLEConnection({
      deviceId: mac,
      success: function(res) {
        wx.writeBLECharacteristicValue({
          deviceId: mac,
          serviceId: that.data.UUID_SERVER,
          characteristicId: that.data.UUID_WRITE,
          value: that.getByte(new Int8Array([0x00])).buffer,
          success: function (res) {
            console.log('发送成功', res)
          },
          fail(res) {
            console.log(res, "发送失败")
            wx.getBLEDeviceServices({
              deviceId: mac,
              success: function(res) {
                wx.writeBLECharacteristicValue({
                  deviceId: mac,
                  serviceId: that.data.UUID_SERVER,
                  characteristicId: that.data.UUID_WRITE,
                  value: that.getByte(new Int8Array([0x00])).buffer,
                  success: function (res) {
                    console.log('获取发送成功', res)
                  },fail: function(res){
                    console.log(res, "发送失败")
                    that.connectIng();
                  }
                  })
              },fail: function(res){
                wx.closeBLEConnection({
                  deviceId: mac,
                  success: function (res) {
                    console.log(res, "获取失败")
                    that.connectIng();
                  },
                })
              }
            })
            
          }
        })
      },
      fail: function(res){
        console.log(res, "连接失败")
        that.connectIng();
      }
    })
  },

  /**一级连接ble*/
  connectBle() {
    var that = this;
    wx.createBLEConnection({
      deviceId: mac,
      timeout: 5000,
      success: function(res) {
        console.log('一级连接成功');
        that.onConnectOK(res)
      },
      fail: function(res) {
        // that.onConnectNO(res)
        console.log('一级连接失败', res)
        //第一次失败2秒后再次连接
        setTimeout(function() {
          wx.createBLEConnection({
            deviceId: mac,
            timeout: 5000,
            success: function(res) {
              that.onConnectOK(res)
            },
            fail: function(res) {
              that.onConnectNO(res)
            }
          })
        }, 2000)
      }
    })


  },
  onSendSuccess:function(r){
    that.setData({
      connect: true
    })
    wx.setNavigationBarTitle({
      title: name + '(已连接)',
    })
    wx.hideLoading()
    wx.onBLEConnectionStateChange(function (res) { //蓝牙状态监听
      console.log('连接状态', res.connected, "connect:", that.data.connect)

      if (!res.connected && that.data.connect) {
        //蓝牙断开后回到首页
        console.log('监听跳转')
        if (!that.data.onback) {
          //重连
          wx.showLoading({
            title: '请稍后',
            mask: !that.data.debug,
          })
          that.connectBle();

        }
        // wx.reLaunch({
        //   url: '../start/start?result=true',
        // })
      }
    })

    wx.notifyBLECharacteristicValueChange({
      deviceId: mac,
      serviceId: that.data.UUID_SERVER,
      characteristicId: that.data.UUID_READ,
      state: true,
      success: function (res) {
        console.log('监听开启成功')
        //连接成功发送请求
        // const sound = new Int8Array(3);
        // sound[0] = 121;
        // sound[1] = -121;
        // sound[2] = 124;
        // that.wirte(sound)
        //获取回调消息
        that.getCallBack();

        wx.onBLECharacteristicValueChange(function (res) {
          console.log('###收到消息:', res);
          var v = res.value;
          var array = new Int8Array(v);

          // that.setData({
          //   slider: array[0]
          // })
          console.log(array)
          that.setState(array);
        })
      },
    })

  },
  /**
   * 蓝牙连接成功,二级连接获取server
   */
  onConnectOK: function(res) {
    var that = this;
    console.log('蓝牙连接成功', res)
    
    // wx.setStorage({
    //   key: '',
    //   data: '',
    // })

    wx.getBLEDeviceServices({
      deviceId: mac,
      success: function(res) {
        console.log('获取到severuuid', res)
        that.setData({
          connect: true
        })

        wx.setNavigationBarTitle({
          title: name + '(已连接)',
        })
        wx.hideLoading()
        // wx.setStorageSync('name', name)
        // wx.setStorageSync('mac', mac)
        wx.onBLEConnectionStateChange(function(res) { //蓝牙状态监听
          console.log('连接状态', res.connected, "connect:", that.data.connect)

          if (!res.connected && that.data.connect) {
            //蓝牙断开后回到首页
            console.log('监听跳转')
            if(!that.data.onback){
              //重连
              wx.showLoading({
                title: '请稍后',
                mask: !that.data.debug,
              })
              that.connectBle();

            }
            // wx.reLaunch({
            //   url: '../start/start?result=true',
            // })
          }
        })

        wx.getBLEDeviceCharacteristics({
          deviceId: mac,
          serviceId: that.data.UUID_SERVER,
          success: function(res) {
            console.log('特征码', res)
          }
        })
      },
      fail: function(res) {
        console.log('serverid获取失败', res);
        if (that.data.NumOut) {
          that.onConnectNO(res)
          return;
        }
        that.setData({
          NumOut: true
        })
        wx.closeBluetoothAdapter({
          success: function(res) {
            console.log('适配器重启');
            wx.openBluetoothAdapter({
              success: function(res) {
                console.log('重启后重连')
                wx.createBLEConnection({
                  deviceId: mac,
                  timeout: 3000,
                  success: function(res) {
                    console.log('重连成功')
                    that.onConnectOK(res);
                  },
                  fail: function(res) {
                    console.log('第一次重接失败', res)
                    //第一次失败2秒后再次连接
                    setTimeout(function() {
                      wx.createBLEConnection({
                        deviceId: mac,
                        timeout: 5000,
                        success: function(res) {
                          that.onConnectOK(res)
                        },
                        fail: function(res) {
                          that.onConnectNO(res)
                        }
                      })
                    }, 2000)
                  }
                })
              },
            })
          },
        })

      }
    })

    wx.notifyBLECharacteristicValueChange({
      deviceId: mac,
      serviceId: that.data.UUID_SERVER,
      characteristicId: that.data.UUID_READ,
      state: true,
      success: function(res) {
        console.log('监听开启成功')
        //连接成功发送请求
        // const sound = new Int8Array(3);
        // sound[0] = 121;
        // sound[1] = -121;
        // sound[2] = 124;
        // that.wirte(sound)
        //获取回调消息
        that.getCallBack();

        wx.onBLECharacteristicValueChange(function(res) {
          console.log('###收到消息:', res);
          var v = res.value;
          var array = new Int8Array(v);

          // that.setData({
          //   slider: array[0]
          // })
          console.log(array)
          that.setState(array);
        })
      },
    })
  },
  /**蓝牙连接失败*/
  onConnectNO: function(res) {
    var that = this
    console.log('蓝牙连接失败', res)
    wx.showToast({
      title: '连接失败请重试',
      icon: 'none',
      image: '../../src/images/warning.png',
      mask: !that.data.debug,
      duration: 2000

    })
    if (!that.data.debug) {
      setTimeout(function() {
        console.log('链接失败跳转')
        wx.navigateBack({
          delta: 1
        })
        // wx.reLaunch({
        //   url: '../start/start?result=true',
        // })
      }, 2000)
    }
  },
  /**断开连接后重新连接一个空地址，有利于新的连接*/
  disConnect: function() {
    wx.createBLEConnection({
      deviceId: '00:00:00:00:00',
      success: function(res) {
        console.log("这也能连接成功？");
      },
      fail: function(res) {
        console.log("尝试连接失败");
      }
    })
  },

  /**
   * 写入数据
   */
  wirte: function(buff) {
    console.log('发送数据', buff);
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: mac,
      serviceId: that.data.UUID_SERVER,
      characteristicId: that.data.UUID_WRITE,
      value: buff.buffer,
      success: function(res) {
        console.log('发送成功', res)
      },
      fail(res) {
        console.log(res, "发送失败")
      }
    })
  },
  getByte: function(bytes) {
    const bs = new Int8Array(bytes.length + 2);
    var all = new Int8Array(1);
    for (let i = 0; i < bs.length; i++) {
      if (i == 0) {
        bs[0] = 0x45;
      } else if (i == bs.length - 1) {
        bs[bs.length - 1] = all;
      } else {
        bs[i] = bytes[i - 1];
        all[0] = all[0] + bs[i];
      }
    }
    return bs;
  },
  /**重设设置EQ值*/
  setEq(eqs) {
    this.setData({
      eq1: eqs[0],
      eq2: eqs[1],
      eq3: eqs[2],
      eq4: eqs[3],
      eq5: eqs[4],
      eq6: eqs[5],
      eq7: eqs[6],
    })

  },
  /**设置状态*/
  setState: function(data) {
    var that = this;
    if (data[0] == 0x58 && data[1] == 0x20) {
      //第一条消息 长度15+3 (+1)参数1：输入通道切换， 参数2：主音量设置， 参数3：音效模式， 参数4-9：相位设置， 参数10-15：延时设置，
      if (data.length == 18) {
        that.setData({
          aux_index: data[2],
          sound: data[3],
          parTop: data[4],

          delay1: data[11] / 2,
          delay2: data[12] / 2,
          delay3: data[13] / 2,
          delay4: data[14] / 2,
          callBack: true,
        })
      }
    }

    if (data[0] == 0x58 && data[1] == 0x21) {
      //第二条消息 长度14+3 (+1)参数1-9：GEQ调节， 参数10-11：车型选择， 参数12-13：版本号， 参数14；聆听位0关1开
      if (data.length == that.data.debug ? 16 : 17) {
        that.setData({
          listen: data[15] == 0x00 ? false : true,
          dsp: 'DSP:'+data[13] + "." + data[14],
        })
      }
    }
  },
  /**循环获取状态，若没有获取到回调数据一直发送*/
  getCallBack(){
    var that = this;
    if(!this.data.callBack){
      that.wirte(that.getByte(new Int8Array([0x01, 0x01])));
      setTimeout(function () {
        that.getCallBack();//1秒后再次循环
      },1000);

    }
  },


})