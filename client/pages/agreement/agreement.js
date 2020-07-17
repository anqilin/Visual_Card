
import { monitor } from '/util/monitor';
const app = getApp();
Page({
  data: {
    systemInfo: {},// 手机基础信息
    userInfo: {},
    userLogin: false,
    ueerNotLogin: true,
    cardInfo: {},
    card_staus: false,
    error_message: "当前手机不支持开卡",
    canclick: false,
    image_path: 'url(/resource/add_card_pic.png)',
    image_path_mot_big: 'url(/resource/mot.png)',
    image_path_mot: 'url(/resource/mot.png)',
    image_path_moc: 'url(/resource/moc.png)',
    add_mot_show: true,
    mot_big_show: false,
    mot_show: false,
    moc_show: false,
    moc_old_show: false,
    mot_card_no: '8888888888',
    mot_card_balance: '6.5',
    moc_card_no: '8888888888',
    moc_card_balance: '6.5',
    moc_old_card_no: '8888888888',
    moc_old_card_balance: '6.5',
    has_mot_card: false,
    has_moc_card: false,
    has_moc_old_card: false,

    flag_add_card: 1,
    flag_keyi: 2,
    flag_ant: 3,

    mot_bind_ant: false,
    moc_bind_ant: false,
    moc_old_bind_ant: false,

    has_mot_keyi: false,
    has_moc_keyi: false,
    has_f0: false

  },
  onLoad(options) {
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)
      //let systemInfo = my.getSystemInfoSync();
      let systemInfo = app.systemInfo;
      this.setData({ systemInfo });
    } catch (e) {
      app.log(e);
      my.alert({
        title: '温馨提示',
        content: 'onLoad 执行异常'
      });
    }

    my.hideFavoriteMenu();
    /* var isagree=app.getAgreement();
     console.log(isagree)
     if(isagree==true){
       my.navigateTo({
         url: '../index/index'
       });
     }*/
    monitor.report({
      info: "进入小程序",
    });
    //this.getUserInfo()

  },
  onShow() {
    if (app.systemInfo.version >= "10.1.82") {
      app.log("版本正常");
    } else {
      app.log("版本过低");
      my.alert({
        title: '提示',
        content: '支付宝版本过低请升级'
      });
      return;
    }

    app.log("版本:" + app.systemInfo.version)
    //var brand=app.systemInfo.brand;
    var model = app.systemInfo.model;
    //var brand=model.substring(0,6).trim();
    var brand = model.split(" ")[0];
    app.log(brand);
    app.log(model);
    var check_result = app.check_phone_type(brand, model);
    if (check_result == false) {
      my.alert({
        title: '提示',
        content: "该机型不支持开卡"
      });
      return
    }

    this.data.card_staus = false;
    this.data.canclick = false;
    this.get_cplc();


  },

  /**
   * 点击手机标题栏触发的事件,需要在index.json配置titlePenetrate:"YES"
   * @method onTitleBar
   */
  onTitleBar(e) {
    /*my.alert({
      title: '温馨提示',
      content: '您点击了"我是手机标题栏"'
    });*/
  },
  go_method() {
    my.navigateTo({ url: '../use_method/use_method' })
  },
  go_method2() {
    my.navigateTo({ url: '../use_method/use_method?type=1' })
  },
  agree_on() {
    var that = this;
    //that.go_zhifubao();
    if (that.data.canclick == false) {
      return;
    }

    if (that.data.card_staus == true) {

      var token = app.userInfo.token;
      var phonenumber = app.userInfo.phone;
      var buyId = app.userInfo.buyId;
      if (token != "" && phonenumber != "" && buyId != "") {
        app.log("已获取用户信息")
        that.go_zhifubao();


      } else {
        this.getUserInfo(that.data.flag_add_card, null, null);
      }

    } else {
      my.showToast({
        content: that.data.error_message
      });
    }
  },


  get_cplc() {

    var that = this;
    var cplc = app.getCplc();
    app.log('cplc:' + cplc);
    monitor.report({
      info: cplc
    });
    app.log('确认信息');

    if (cplc == null || cplc == undefined) {
      my.showLoading({
        content: '查询中',
      });

      my.seNFCServiceIsv({
        method: 'getCplc',
        success: (result) => {
          my.hideLoading({
            page: that,
          });

          app.log(result);

          if (result.resultCode == 0) {
            monitor.report({
              info: "获取cplc成功",
            });
            app.log("获取cplc成功:" + result.data.cplc);
            app.setCplc(result.data.cplc);
            that.read_cardInfo(1);

          } else if (result.resultCode == -9000) {
            that.get_cplc();
          } else {
            var msg = app.get_error_msg(result.resultCode)
            monitor.report({
              code: result.resultCode,
              msg: result.resultMsg,
              info: "获取cplc失败"
            });
            that.data.canclick = true;
            that.data.error_message = msg;
            //that.agree_on();
          }

        }
      });
    } else {
      that.read_cardInfo(1);

    }

  },
  read_cardInfo(type) {

    var that = this;

    var id = "";
    if (type == 1) {
      id = app.issuer_Id
    } else if (type == 2) {
      id = app.moc_issuer_Id;
    } else if (type == 3) {
      id = app.moc_maiduan_issuer_Id;
    }
    var pa = {
      issuerID: id,
      dataItems: 15
    }
    var params = JSON.stringify(pa);
    app.log(params);
    my.showLoading({
      content: '查询中',
    });

    my.seNFCServiceIsv({
      method: 'readCardInfo',
      param: params,
      success: (result) => {
        app.log(result);
        my.hideLoading({
          page: that,
        });

        if (result.resultCode == 0) {
          monitor.report({
            info: "读取卡信息成功",
            code: result.resultCode
          });
          if (type == 1) {
            app.cardInfo = result.data;
            app.cardno = result.data.cardNo;
            var inid = app.OuterIdToInnerId(app.cardno);
            app.log("innerId:" + inid);
            app.innerId = inid;
            app.logiccardno = result.data.logicCardNo;
            app.balance = result.data.balance;
            app.isHasCard = true;
            //my.redirectTo({ url: '../card_info/card_info' });
            //that.set_page_info();
            that.data.has_mot_card = true;
            that.read_cardInfo(2);

          } else if (type == 2) {
            app.moc_cardInfo = result.data;
            app.moc_cardno = result.data.cardNo;
            var moc_inid = app.OuterIdToInnerId(app.moc_cardno);
            app.log("innerId:" + moc_inid);
            app.moc_innerId = moc_inid;
            app.moc_logiccardno = result.data.logicCardNo;
            app.moc_balance = result.data.balance;
            app.isHasmocCard = true;
            that.data.has_moc_card = true;
            that.set_page_info();
            if (that.data.has_mot_card == false) {
              that.get_creat_status();
            }
          } else if (type == 3) {
            app.moc_old_cardInfo = result.data;
            app.moc_old_cardno = result.data.cardNo;
            var moc_old_inid = app.OuterIdToInnerId(app.moc_cardno);
            app.log("innerId:" + moc_old_inid);
            app.moc_old_innerId = moc_old_inid;
            app.moc_old_logiccardno = result.data.logicCardNo;
            app.moc_old_balance = result.data.balance;
            that.data.has_moc_old_card = true;
            that.set_page_info();
            if (that.data.has_mot_card == false) {
              that.get_creat_status();
            }
          }



        } else if (result.resultCode == -9000) {
          that.read_cardInfo(type);
        } else {

          monitor.report({
            code: result.resultCode,
            msg: result.resultMsg,
            info: "获取卡信息失败"
          });
          if (type == 1) {
            that.read_cardInfo(2);
          } else if (type == 2) {
            that.read_cardInfo(3);
          } else if (type == 3) {
            if (that.data.has_mot_card == false) {
              that.get_creat_status();
            }
            that.set_page_info();
          }
          //that.get_creat_status();
        }
      }

    });

  },
  get_creat_status() {
    var that = this;
    var pa = {
      issuerID: app.issuer_Id,

    }
    var params = JSON.stringify(pa);
    app.log(params);
    my.showLoading({
      content: '查询中',
    });

    my.seNFCServiceIsv({
      method: 'checkIssueCondition',
      param: params,
      success: (result) => {
        app.log(result);
        my.hideLoading({
          page: that,
        });


        if (result.resultCode == 0) {
          monitor.report({
            info: "虚拟卡开卡状态正常",
            code: result.resultCode
          });
          that.get_charge_status();
          app.log("虚拟卡开卡状态正常")

        } else if (result.resultCode == -9000) {
          that.get_creat_status();
        } else {
          var msg = app.get_error_msg(result.resultCode)
          monitor.report({
            code: result.resultCode,
            msg: result.resultMsg,
            info: msg
          });
          that.data.error_message = msg
          that.data.canclick = true;
          //that.agree_on();
        }
      }
    });
  },
  get_charge_status() {
    var that = this;
    var pa = {
      issuerID: app.issuer_Id,

    }
    var params = JSON.stringify(pa);
    app.log(params);
    my.showLoading({
      content: '查询中',
    });

    my.seNFCServiceIsv({
      method: 'checkRechargeCondition',
      param: params,
      success: (result) => {
        my.hideLoading({
          page: that,
        });
        app.log(result);

        if (result.resultCode == 0) {
          monitor.report({
            info: "虚拟卡充值状态正常",
            code: result.resultCode
          });
          that.data.card_staus = true;
          app.log("虚拟卡充值状态正常")
          that.data.canclick = true;
          //that.agree_on();

        } else if (result.resultCode == -9000) {
          that.get_charge_status();

        } else {
          var msg = app.get_error_msg(result.resultCode)
          monitor.report({
            code: result.resultCode,
            msg: result.resultMsg,
            info: "充值服务不支持"
          });
          that.data.error_message = msg
          that.data.canclick = true;
          //that.agree_on();
        }
      }
    });

  },
  getUserInfo(flag, cardno, type) {
    var that = this;
    that.data.canclick = false;
    app.log('getAuth--start');
    my.showLoading({
      content: '查询中',
    });
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        if (res.authCode) {
          monitor.report({
            info: "获取authCode成功"
          });
          app.log(res.authCode);
          var code = res.authCode;
          this.getHttpUserInfo(code, flag, cardno, type);


        }

      },
      fail: (res) => {
        app.log('getAuth--failed:' + JSON.stringify(res));
        that.data.canclick = true;
        monitor.report({
          info: "获取Authcode失败"
        });
        my.hideLoading({
          page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
        });
        my.confirm({
          title: '提示',
          content: '网络不流畅，请稍后重试！',
          confirmButtonText: '重试',
          cancelButtonText: '取消',
          complete: (e) => {
            if (e.confirm) {
              that.getUserInfo(flag, cardno, type);
              return;
            } else {
              //my.navigateBack({ delta: 1});
              return;
            }
          },
        });
      },
    });
  },
  getHttpUserInfo(code, flag, cardno, type) {
    var that = this;


    var url = app.SERVER_URL
      + "handapp_app/AlipayCommRegisterServlet?";
    url = url + "code=" + code;
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {

        my.hideLoading({
          page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
        });
        that.data.canclick = true;
        if (resp.data.result_code == "success") {

          app.userInfo.phone = resp.data.phone;
          app.userInfo.token = resp.data.note.substring(0, 16);
          app.userInfo.buyId = resp.data.buyId;
          monitor.report({
            info: "获取用户信息成功",
            phone_number: app.userInfo.phone
          });
          /*my.navigateTo({
            url: '../index/index'
          });*/
          if (flag == that.data.flag_add_card) {
            that.go_zhifubao();
          }
          if (flag == that.data.flag_ant) {
            that.Ant_Search(cardno, type)
          }
          if (flag == that.data.flag_keyi) {
            that.search_keyi();
          }


        }

        app.log('AlipayCommRegister resp data' + resp.data);

      },
      fail: (res) => {
        app.log('HttpUserInfo--failed:' + JSON.stringify(res));
        that.data.canclick = true;
        monitor.report({

          info: "获取用户信息失败"
        });
        /*my.hideLoading({
          page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
        });*/
        my.confirm({
          title: '提示',
          content: '网络不流畅，请稍后重试！',
          confirmButtonText: '重试',
          cancelButtonText: '取消',
          complete: (e) => {
            if (e.confirm) {
              that.getUserInfo(flag, cardno, type);
              return;
            } else {
              //my.navigateBack({ delta: 1});
              return;
            }
          },
        });
      },

    });


  },
  go_message() {
    my.navigateTo({
      url: '../contract/contract'
    });
  },
  go_zhifubao() {

    var cplc = app.getCplc();
    app.log(cplc);
    var path = 'alipays://platformapi/startapp?appId=68687011&appClearTop=false&startMultApp=YES&bizPage=apply&sign_params=biz_content%3D%257B%2522card_sign_mode%2522%253A%2522DIRECT%2522%252C%2522card_type%2522%253A%2522N1310100%2522%252C%2522disabled%2522%253A%2522false%2522%257D%26method%3Dalipay.user.virtualcard.page.sign%26version%3D1.0' + '&cplc=' + cplc;
    app.log("zhifubao path:" + path);
    my.ap.navigateToAlipayPage({
      path: path
    });

  },
  set_page_info() {
    var that = this;
    var add_mot = true;
    var mot_big = false;
    var mot_showing = false;
    if (that.data.has_mot_card == true) {
      add_mot = false;
    }
    if (that.data.has_mot_card == true && that.data.has_moc_card == false && that.data.has_moc_old_card == false) {
      mot_big = true;
    }
    if (that.data.has_mot_card == true && (that.data.has_moc_card == true || that.data.has_moc_old_card == true)) {
      mot_showing = true;
    }

    that.setData({
      add_mot_show: add_mot,
      mot_big_show: mot_big,
      mot_show: mot_showing,
      moc_show: that.data.has_moc_card,
      moc_old_show: that.data.has_moc_old_card,

    })
    if (that.data.has_mot_card) {
      that.setData({
        mot_card_no: app.cardInfo.cardNo,
        mot_card_balance: app.cardInfo.balance
      })
    }
    if (that.data.has_moc_card) {
      that.setData({
        moc_card_no: app.moc_cardInfo.cardNo,
        moc_card_balance: app.moc_cardInfo.balance
      })
    }
    if (that.data.has_moc_card) {
      that.setData({
        moc_old_card_no: app.moc_old_cardInfo.cardNo,
        moc_old_card_balance: app.moc_old_cardInfo.balance
      })
    }
    if (that.data.has_mot_card) {
      var token = app.userInfo.token;
      var phonenumber = app.userInfo.phone;
      var buyId = app.userInfo.buyId;
      if (token != "" && phonenumber != "" && buyId != "") {
        app.log("已获取用户信息")

        that.Ant_Search(app.cardInfo.cardNo, 1);

      } else {
        this.getUserInfo(that.data.flag_ant, app.cardInfo.cardNo, 1);
      }

    } else if (that.data.has_mot_card == false && that.data.has_moc_card == true) {
      var token = app.userInfo.token;
      var phonenumber = app.userInfo.phone;
      var buyId = app.userInfo.buyId;
      if (token != "" && phonenumber != "" && buyId != "") {
        app.log("已获取用户信息")
        setTimeout(function() {
          that.Ant_Search(app.moc_cardInfo.cardNo, 2);
        }, 200);


      } else {
        this.getUserInfo(that.data.flag_ant, app.moc_cardInfo.cardNo, 2);
      }


    }
    /*if(that.data.has_moc_card){
      var token=app.userInfo.token;
      var phonenumber=app.userInfo.phone;
      var buyId=app.userInfo.buyId;
      if(token!=""&&phonenumber!=""&&buyId!=""){
        app.log("已获取用户信息")
        setTimeout(function(){
          that.Ant_Search(app.moc_cardInfo.cardNo,2);
        },600);
        
      
      }else{
        that.getUserInfo(that.data.flag_ant,app.moc_cardInfo.cardNo,2);    
      }

    }*/
    /*if(that.data.has_moc_old_card){

      var token=app.userInfo.token;
      var phonenumber=app.userInfo.phone;
      var buyId=app.userInfo.buyId;
      if(token!=""&&phonenumber!=""&&buyId!=""){
        app.log("已获取用户信息")
        setTimeout(function(){
          that.Ant_Search(app.moc_old_cardInfo.cardNo,3);
        },1000);
        
      
      }else{
        that.getUserInfo(that.data.flag_ant,app.moc_old_cardInfo.cardNo,3);    
      }

    }*/
    /*if(that.data.has_mot_card||that.data.has_moc_card){
      var token=app.userInfo.token;
      var phonenumber=app.userInfo.phone;
      var buyId=app.userInfo.buyId;
      if(token!=""&&phonenumber!=""&&buyId!=""){
        app.log("已获取用户信息")
        setTimeout(function(){
          that.search_keyi();
        },1500);
        
      
      }else{
        this.getUserInfo(that.data.flag_keyi,null,null);    
      }

    }*/




  },
  Ant_Search(cardno, type) {//type:1 mot type:2 moc type:3 moc_old
    var that = this;

    var url = app.AntSearch(cardno);//
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {

        app.log('antsearch resp data:' + JSON.stringify(resp.data));

        app.log("ant:" + resp.data.return_code + resp.data.result_code);
        if (resp.data.return_code == "success" && resp.data.result_code == "success") {
          var msg = JSON.parse(resp.data.result_msg);
          app.log("ResponseCode:" + msg.responseCode);
          app.log(msg);
          if (msg.responseCode == "00") {

            if (type == 1) {
              if (that.data.has_moc_card == false) {
                that.search_keyi();
              } else {
                that.Ant_Search(app.moc_cardInfo.cardNo, 2);
              }
              that.setData({
                mot_bind_ant: true
              })
            } else if (type == 2) {
              that.setData({
                moc_bind_ant: true
              });
              that.search_keyi();
            } else if (type == 3) {
              that.setData({
                moc_old_bind_ant: true
              })
            }

            app.log("该卡已绑定蚂蚁森林能量");

            monitor.report({
              info: "该卡已绑定蚂蚁森林能量",
              code: resp.data.result_code
            });
          } else {
            if (type == 1) {
              if (that.data.has_moc_card == false) {
                that.search_keyi();
              } else {
                that.Ant_Search(app.moc_cardInfo.cardNo, 2);
              }
              that.setData({
                mot_bind_ant: false
              })
            } else if (type == 2) {
              that.setData({
                moc_bind_ant: false
              });
              that.search_keyi();
            } else if (type == 3) {
              that.setData({
                moc_old_bind_ant: false
              })
            }

            app.log("该卡没有绑定蚂蚁森林能量");
            monitor.report({
              info: "该卡没有绑定蚂蚁森林能量",

            });

          }

        } else {
          app.log("该卡没有绑定蚂蚁森林能量");
          if (type == 1) {
            if (that.data.has_moc_card == false) {
              that.search_keyi();
            } else {
              that.Ant_Search(app.moc_cardInfo.cardNo, 2);
            }
            that.setData({
              mot_bind_ant: false
            })
          } else if (type == 2) {
            that.setData({
              moc_bind_ant: false
            });
            that.search_keyi();
          } else if (type == 3) {
            that.setData({
              moc_old_bind_ant: false
            })
          }

          monitor.report({
            info: "该卡没有绑定蚂蚁森林能量",

          });

        }

      },
      fail: (err) => {
        app.log(err)
        my.confirm({
          title: '提示',
          content: '网络不流畅，获取卡能量信息失败，请稍后重试！',
          confirmButtonText: '重试',
          cancelButtonText: '取消',
          complete: (e) => {
            if (e.confirm) {
              that.Ant_Search(cardno, type);
              return;
            } else {

              return;
            }
          },
        });

      },

    });

  },
  search_keyi() {
    var that = this;
    my.showLoading({
      content: '查询中',
    });
    var url = app.getKeyiList();
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {
        my.hideLoading({
          page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
        });
        app.log('resp data:' + resp.data);

        if (resp.data.return_code == "success") {
          monitor.report({
            info: "可疑交易查询成功",
            phone_number: app.userInfo.phone
          });
          app.log("可疑查询成功");
          var return_msg = resp.data.return_msg;

          app.log(return_msg);
          var msg = JSON.parse(return_msg);
          app.log("msg.TotNum----" + msg.TotNum);

          if (msg.TotNum == 0) {
            that.setData({
              has_mot_keyi: false,
              has_moc_keyi: false,
              has_f0: false
            });
            that.change_flag(1);
            that.change_flag(2);
            app.hasf0 = false;

          } else {

            var data = msg.data;


            app.log("datalength" + data.length);

            //that.change_flag();

            for (var i = 0; i < data.length; i++) {
              app.log("data---" + data[i]);


              if (data[i].TransType == '10000013') {
                var note = data[i].Note.split(",");
                var inid = note[0].substring(10, 20);
                app.log('inid:' + inid);
                app.log('appinid:' + app.innerId);

                if (inid == app.innerId) {
                  app.log('找到了')
                  app.setChargeKeyi(4);

                  that.data.has_mot_keyi = true;
                  that.change_flag(1);

                }

              } else if (data[i].TransType == '00000013') {
                var note = data[i].Note.split(",");
                var inid = note[0].substring(10, 20);
                app.log('inid:' + inid);
                app.log('appinid:' + app.innerId);

                if (inid == app.moc_innerId) {
                  app.log('找到了')
                  app.setMocChargeKeyi(4);

                  that.data.has_moc_keyi = true;
                  that.change_flag(2);

                }

              } else if (data[i].TransType == '00000015') {

                that.data.has_f0 = true;
                app.hasf0 = true;

              }
            }


          }

        } else {
          monitor.report({
            info: "可疑交易查询失败",
            code: resp.data.return_code,
            msg: resp.data.return_msg
          });
          app.log("查询失败");
          var return_msg = resp.data.return_msg;
          app.log(return_msg);
          if (return_msg == '交易未处理') {

            that.setData({
              has_mot_keyi: false,
              has_moc_keyi: false,
              has_f0: false
            });
            that.change_flag(1);
            that.change_flag(2);

          }
        }



      },
      fail: (err) => {
        app.log('error:' + err);
        my.hideLoading({
          page: that,
        });
        my.confirm({
          title: '提示',
          content: '网络不流畅，请稍后重试！',
          confirmButtonText: '重试',
          cancelButtonText: '取消',
          complete: (e) => {
            if (e.confirm) {
              that.search_keyi();
              return;
            } else {
              //my.navigateBack({ delta: 1});
              return;
            }
          },
        });

      },

    });

  },

  change_flag(type) {
    if (type == 1) {
      app.setCreatKeyi(0);
      app.setChargeKeyi(0);
      //app.hasf0=false;
    } else if (type == 2) {
      app.setMocCreatKeyi(0);
      app.setMocChargeKeyi(0);
      //app.hasf0=false;
    }
  },

  go_recharge_mot() {
    var that = this;
    if (that.data.has_mot_keyi == true || that.data.has_f0 == true) {
      my.alert({
        title: '提示',
        content: '请处理可疑交易'
      });
      that.go_keyi();
      return;
    }
    my.navigateTo({
      url: '../recharge_card/recharge_card?card_type=1'
    });

  },
  go_recharge_moc() {
    var that = this;
    if (that.data.has_moc_keyi == true || that.data.has_f0 == true) {
      my.alert({
        title: '提示',
        content: '请处理可疑交易'
      });
      that.go_keyi();
      return;
    }
    my.navigateTo({
      url: '../recharge_card/recharge_card?card_type=2'
    });
  },
  go_cardinfo_mot() {
    my.navigateTo({ url: '../card_info/card_info?card_type=1' });

  },
  go_cardinfo_moc() {
    my.navigateTo({ url: '../card_info/card_info?card_type=2' });

  },
  bind_card_mot() {

    var url = app.ant_bind + app.cardno;
    console.log("绑定url:" + url);
    url = encodeURIComponent(url);
    console.log("转码url:" + url);
    my.ap.navigateToAlipayPage({
      path: url
    });

  },
  bind_card_moc() {

    var url = app.ant_bind + app.moc_cardno;
    console.log("绑定url:" + url);
    url = encodeURIComponent(url);
    console.log("转码url:" + url);
    my.ap.navigateToAlipayPage({
      path: url
    });

  },
  unbind_card_moc() {
    var that = this;
    var url = app.ant_unbind + app.moc_cardno;
    console.log("解绑url:" + url);
    url = encodeURIComponent(url);
    console.log("转码url:" + url);


    my.ap.navigateToAlipayPage({
      path: url
    });

  },
  go_keyi() {
    my.navigateTo({
      url: '../record_list/keyi_list/keyi_list'
    });
  },
  moc_old_upgrade() {
    var that=this;
    my.confirm({
      title: '提示',
      content: '该卡是买断卡，如需充值或绑定蚂蚁森林请至华为钱包完成卡片升级',
      confirmButtonText: '如何升级',
      cancelButtonText: '再想想',
      complete: (e) => {
        if (e.confirm) {
          that.go_moc_up();
          return;
        } else {
          
          return;
        }
      },
    });

  },
  go_moc_up(){
    my.navigateTo({
      url:'../moc_up/moc_up'
    });
  }


});
