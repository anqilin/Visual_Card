import {monitor} from '/util/monitor';
const app= getApp();
Page({
  data: {
    systemInfo: {} ,// 手机基础信息
    userInfo:{},
    userLogin:false,
    ueerNotLogin:true,
    cardInfo:{},
    SERVER_URL : "https://online.sptcc.com:8445/",
    color1:"#ffffff",
    color2:"#ffffff",
    color3:"#ffffff",
    color4:"#ffffff",
    color5:"#ffffff",
    color6:"#ffffff",
    text_color1:"#18BB99",
    text_color2:"#18BB99",
    text_color3:"#18BB99",
    text_color4:"#18BB99",
    text_color5:"#18BB99",
    text_color6:"#18BB99",
    mybalance:0,
    afterbalance:0,
    image_path:'/resource/card.png',
    issuer_Id:app.issuer_Id,
    card_type:1,
    cardno:""
  },
  onLoad(options) {
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)
      //let systemInfo = my.getSystemInfoSync();
      let systemInfo=app.systemInfo;
      this.setData({ systemInfo });
    } catch (e) {
      console.log(e);
      my.alert({
        title: '温馨提示',
        content: 'onLoad 执行异常'
      });
    }

    my.hideFavoriteMenu();
    var that=this;
    if(options.card_type==1){
      that.data.mybalance=app.balance;
      that.data.afterbalance=app.balance;
      that.data.card_type=1;
      that.data.cardno=app.cardno;
      that.data.issuer_Id=app.issuer_Id;
      that.setData({
        image_path:'url(/resource/mot_card.png)'
      })
    }else if(options.card_type==2){
      that.data.mybalance=app.moc_balance;
      that.data.afterbalance=app.moc_balance;
      that.data.card_type=2;
      that.data.cardno=app.moc_cardno;
      that.data.issuer_Id=app.moc_issuer_Id;
    }




  },
  onShow(){
    //this.data.mybalance=app.balance;
    //this.data.afterbalance=app.balance;

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
  onsetmoney(e){
      var that=this;
      var balance=0;
      if(that.data.card_type==1){
        balance=app.balance;
      }else if(that.data.card_type==2){
        balance=app.moc_balance;
      }
      app.log(e.target.dataset.money);
      var money=e.target.dataset.money;
      app.orderReq.total_fee=money*100;
      app.orderReq.TOTAMT=money*100;
      var num= parseFloat(balance)  +parseInt(money);
      num=num.toFixed(2); 

      this.setData({
        mybalance:balance,
        afterbalance:num
      })

      this.setData({
          color1:"#ffffff",
          color2:"#ffffff",
          color3:"#ffffff",
          color4:"#ffffff",
          color5:"#ffffff",
          color6:"#ffffff",
          text_color1:"#18BB99",
          text_color2:"#18BB99",
          text_color3:"#18BB99",
          text_color4:"#18BB99",
          text_color5:"#18BB99",
          text_color6:"#18BB99",
      });

 
      if(money=="10"){
        this.setData({
          color1:"#06B794",
          text_color1:"#ffffff"
        });
      }else if(money=="20"){
        this.setData({
          color2:"#06B794",
          text_color2:"#ffffff"
        });

      }else if(money=="30"){
        this.setData({
          color3:"#06B794",
          text_color3:"#ffffff"
        });

      }else if(money=="100"){
        this.setData({
          color4:"#06B794",
          text_color4:"#ffffff"
        });

      }else if(money=="200"){
        this.setData({
          color5:"#06B794",
          text_color5:"#ffffff"
        });

      }else if(money=="500"){
        this.setData({
          color6:"#06B794",
          text_color6:"#ffffff"
        });

      }

      
      
  },
  getOrderData(url){
    var that = this;
    my.showLoading({
        content: '正在申请',
      });

    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {        
        app.log('resp data:'+resp.data);
          my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });
        if(resp.data.return_code=="success"){
          monitor.report({
            info:"申请订单成功",
            phone_number:app.userInfo.phone   
          });
          app.orderResq.orderId=resp.data.return_msg.orderId;
          app.orderResq.qorderId=resp.data.return_msg.QorderId;
          app.orderResq.partnerid=resp.data.return_msg.partnerid;
          app.orderResq.content=resp.data.return_msg.content;
          app.cplc=app.getCplc();
          app.seid=app.getHuaWeiSeid();
          
          that.goPay();

        }else{
          monitor.report({
            info:"获取authcode成功",
            msg:resp.data.return_msg,
            code:resp.data.return_code             
          });
          my.alert({
            title: '提示',
            content:resp.data.return_msg

          });
        } 
        
      },
      fail: (err) => {
        console.log('error', err);
        my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });
        my.alert({
          title: '提示' ,
          content:'订单申请失败'
        });

      },

    });

  },
  goPay(){
    var that=this;
    my.tradePay({
  
      tradeNO: app.orderResq.content,
      success: (res) => {
        app.log(res.resultCode);
        if(res.resultCode=="9000"){
          monitor.report({
            info:"支付成功",
            phone_number:app.userInfo.phone   
          });
          //var url=app.getCreatCardRequest();
          
          var url=app.getRechargeCardOrder(that.data.card_type);
          app.log(url);
          app.setChargeKeyi(1);
          this.goChargeCard(url);

        }else{
          monitor.report({
            info:"获取authcode成功",
            code:res.resultCode            
          });
          my.alert({
          title: '提示' ,
          content:'支付失败'
        });
        }


      },
      fail: (res) => {
        app.log(res.resultCode);
        my.alert({
          title: '提示' ,
          content:'支付申请失败'
        });



      }
    });
  },
  goChargeCard(url){
    var that = this;
    my.showLoading({
        content: '正在充值',
      });

      my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {        
        app.log('resp data:'+ JSON.stringify(resp.data));
      
        if(resp.data.resCode=="9000"){
          monitor.report({
            info:"复旦微充值接口返回成功",
            phone_number:app.userInfo.phone   
          });
          app.bussiness_id=resp.data.taskId;
          app.log("busiid:"+app.bussiness_id);
          app.log("充值成功");
          app.setChargeKeyi(3);
          setTimeout(function(){
            that.recharge_card(); 
            that.hide_load();    

          },3000);
          

        }else{
           my.hideLoading({
            page: that,  
          });
          monitor.report({
            info:"复旦充值失败",
            code:resp.data.resCode,
            msg:resp.data.resDescs           
          });
          app.setChargeKeyi(2);
          app.log(resp.data.resCode);
          app.log(resp.data.resDesc);
          app.log("复旦充值失败");
          my.alert({
            title: '提示',
            content:'充值失败,请稍后再次尝试' ,
            success: () => {
              /*my.redirectTo({
                url: '../card_info/card_info', 

              });*/
              my.navigateBack();
            }
          });

        }


        
      },
      fail: (err) => {

        console.log('error', err);
        my.hideLoading({
            page: that,  
          });
        my.alert({
          title: '提示' ,
          content:'申请充值失败',
          success: () => {
            /*my.redirectTo({
                url: '../card_info/card_info', 

            });*/
            my.navigateBack();
          }
        });


      },

    });


  },
  recharge_card(){

    var that=this;
    var pa={
      issuerID:that.data.issuer_Id,
      spID:app.spId,
      orderNo:'111'
    }
    var params= JSON.stringify(pa);
    app.log(params);
    my.showLoading({
        content: '充值中',
    });

    my.seNFCServiceIsv({
      method: 'rechargeCard',
      param:params, 
      success:(result) => {
        my.hideLoading({
          page:that,
        });  
        app.log(result);
        if(result.resultCode==0){
          monitor.report({
            info:"虚拟卡充值成功",
            phone_number:app.userInfo.phone   
          });
          app.setChargeKeyi(5);
       /* my.redirectTo({
          url: '../card_info/card_info', // 需要跳转的应用内非 tabBar 的目标页面路径 ,路径后可以带参数。参数规则如下：路径与参数之间使用

        });*/
          my.navigateBack({
          
          });



        }else if(result.resultCode==-9000){
          that.recharge_card();

        }else{
          var msg=app.get_error_msg(result.resultCode) 
          monitor.report({
            info:"充值失败",
            code:result.resultCode,
            msg:result.resultMsg           
          });
          if(that.data.card_type==1){
            app.setChargeKeyi(4);
          }else if(that.data.card_type==2){
            app.setMocChargeKeyi(4);
          }
          
          my.alert({
            title: '提示',
            content: msg, 
          });
          my.redirectTo({
            url: '../record_list/keyi_list/keyi_list'

          });
        }
      }

    });

  },     
  recharge(){
    var that=this;
    if(that.data.afterbalance==that.data.mybalance){
      my.showToast({
        content:'请选择充值金额'

      });
      return;
    }
    if(that.data.afterbalance>1000){
      my.showToast({
        content:'卡内总金额不得大于1000元'

      });
      return;

    }
    var device_model=app.getDeviceModel();

    if(device_model==null||device_model==undefined){
        that.getPhoneInfo();
        return;
    }
     var order_url=app.getOrder(that.data.cardno,"0009");
      
      app.log(order_url);
      this.getOrderData(order_url);

  },
  hide_load(){
    my.hideLoading({
      page:that,
    }); 
  },
  getPhoneInfo(){
    var that=this;
    var device_model=app.getDeviceModel();

    if(device_model==null||device_model==undefined){
        my.showLoading({
          content: '查询设备信息',
        });

        my.seNFCServiceIsv({
          method: 'getDeviceInfo',
          success:(result) => {
            app.log("新接口"+result);
            my.hideLoading({
              page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
            });
            if(result!=null&&result.resultCode==0){

              var data=JSON.parse(result.data);
              var model=data.deviceModel;
              app.log(model);
              monitor.report({
                info:"读取手机信息成功",
                msg:"手机型号"+ model
              });

              app.setDeviceModel(model);
              app.devicemodel=model;
              that.setData({
                deviceModel:model
              })
              that.recharge();


            }else if(result.resultCode==-9000){
              that.getPhoneInfo();
            }else{
              var msg=app.get_error_msg(result.resultCode) 
              monitor.report({
                info:"获取手机信息失败",
                code:result.resultCode,
                msg:result.resultMsg,
              });
              my.alert({
                title: '提示' ,
                content:msg
              });
            }
          }
        });

    }else{
      app.devicemodel=device_model;
      app.log("device:"+device_model);

    }


  },












});
