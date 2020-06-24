import {monitor} from '/util/monitor';
const app= getApp();
Page({
  data: {
    systemInfo: {} ,// 手机基础信息
    userInfo:{},
    userLogin:false,
    ueerNotLogin:true,
    cardInfo:{},
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
    amount:"0.00",
    canclick:false,
    touming:0.6
  },
  onLoad(options) {
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)
      //let systemInfo = my.getSystemInfoSync();
      let systemInfo=app.systemInfo;
      this.setData({ systemInfo });
      app.model=systemInfo.model;
      console.log(systemInfo.model);
    } catch (e) {
      console.log(e);
      my.alert({
        title: '温馨提示',
        content: 'onLoad 执行异常'
      });
    }

    var token=app.userInfo.token;
    var phonenumber=app.userInfo.phone;
    var buyId=app.userInfo.buyId;
    if(token!=""&&phonenumber!=""&&buyId!=""){
        app.log("已获取用户信息")
        this.search_keyi();
      
    }else{
      this.getUserInfo();
    

    }


  },
  onShow(){
    this.getPhoneInfo()
  },
  getUserInfo(){
    var that = this;
    app.log('getAuth--start');
      my.showLoading({
        content: '查询中',
      });
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        if(res.authCode){
          monitor.report({
            info:"获取authCode成功"      
          });
          app.log(res.authCode);
          var code=res.authCode;         
          this.getHttpUserInfo(code);
          

        }

      },
      fail: (res) => {
          app.log('getAuth--failed:' +  JSON.stringify(res));
          monitor.report({
            info:"获取Authcode失败"       
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
              if(e.confirm){
                that.getUserInfo();    
                return;
              }else{
                //my.navigateBack({ delta: 1});
                return;
              }
            },
          });
      },
    });
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
      app.log(e.target.dataset.money);
      var money=e.target.dataset.money;            
      app.orderReq.total_fee=money*100+2000;
      app.orderReq.TOTAMT=money*100+2000;
      //app.orderReq.total_fee=money*100;
      //app.orderReq.TOTAMT=money*100;
      var amount=parseFloat(money).toFixed(2);
      this.setData({
        amount:amount
      })
      this.setData({
         touming:1.0
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





  getHttpUserInfo(code){
    var that = this;


    var url = app.SERVER_URL
					+ "handapp_app/AlipayCommRegisterServlet?";
    url=url+"code="+code;
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {
        
        my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });
        if(resp.data.result_code=="success"){

          app.userInfo.phone=resp.data.phone;
          app.userInfo.token=resp.data.note.substring(0,16);
          app.userInfo.buyId=resp.data.buyId;
           monitor.report({
            info:"获取用户信息成功",
            phone_number:app.userInfo.phone   
          });
          that.search_keyi();
          

        }
        
        app.log('resp data'+resp.data); 


        
      },
      fail: (res) => {
          app.log('HttpUserInfo--failed:' +  JSON.stringify(res));
          monitor.report({

            info:"获取用户信息失败"       
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
              if(e.confirm){
                that.getUserInfo();    
                return;
              }else{
                //my.navigateBack({ delta: 1});
                return;
              }
            },
          });
      },

    });



  },
  getOrderData(url){
    var that=this;
      my.showLoading({
        content: '订单申请中',
      });

    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => { 
          my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });       
        app.log('resp data:'+resp.data);

        if(resp.data.return_code=="success"){
          monitor.report({
            info:"获取订单信息成功",
            phone_number:app.userInfo.phone   
          });
          app.orderResq.orderId=resp.data.return_msg.orderId;
          app.orderResq.qorderId=resp.data.return_msg.QorderId;
          app.orderResq.partnerid=resp.data.return_msg.partnerid;
          app.orderResq.content=resp.data.return_msg.content;
          app.cplc=app.getCplc();
          app.seid=app.getHuaWeiSeid();
          
          this.goPay();

        }else{
          monitor.report({
            info:"获取订单信息失败",
            msg: resp.data.return_msg 
          });
          
          my.alert({
            title: '提示',
            content:resp.data.return_msg

          });
        }  
        
      },
      fail: (err) => {
          my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });
          my.alert({
            title: '提示',
            content:'订单申请失败' 
          });
        app.log(err);

      },

    });

  },
  goPay(){
    my.tradePay({
  
      tradeNO: app.orderResq.content,
      success: (res) => {
        app.log("付款返回"+res.resultCode);
        if(res.resultCode=="9000"){
          monitor.report({
            info:"支付宝支付成功",
            phone_number:app.userInfo.phone   
          });
          var url=app.getCreatCardRequest();
          //var url=app.getRechargeCardOrder();
          app.log(url);
          app.setCreatKeyi(1);
          this.goCreatCard(url);

        }else{
          monitor.report({
            info:"支付宝支付失败",
            code:res.resultCode
          });
          my.alert({
            title: '提示',
            content:'支付失败' 
          });

        }


      },
      fail: (res) => {
        app.log("付款失败"+res.resultCode);
        my.alert({
          title: '提示',
          content:'支付失败' 
        });



      }
    });
  },
  goCreatCard(url){
    var that=this;
      my.showLoading({
        content: '开卡申请中',
      });
      my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {
        my.hideLoading({
          page:that,
        });        
        app.log('resp data:'+ resp.data);
        
        /*my.alert({
          title: resp.data.resCode,
          content: resp.data.resDesc, 
        });*/
        if(resp.data.resCode=="9000"){
          monitor.report({
            info:"复旦开卡接口返回成功",
            phone_number:app.userInfo.phone   
          });
          app.bussiness_id=resp.data.taskId;
          app.log("busiid:"+app.bussiness_id);
          app.log("开卡接口成功");
          app.setCreatKeyi(3);
          my.redirectTo({ url: '../creat_card/bind_card/bind_card' })
        }else{
          app.log(JSON.stringify(resp.data))          
          monitor.report({
            info:"复旦微接口返回失败",
            code:resp.data.resCode,
            msg:resp.data.resDesc
          });
          that.revokeOrder();
          
          app.log("开卡失败");
          my.alert({
            title: '提示',
            content:'开卡失败,请稍后尝试' ,
            success: () => {
              my.redirectTo({
                url: '../agreement/agreement', 

              });
            }
          });

          app.setCreatKeyi(2);
        }


        
      },
      fail: (err) => {
        my.hideLoading({
          page:that,
        }); 
        console.log('error', err);
        my.alert({
            title: '提示',
            content:'开卡失败',
            success: () => {
              my.redirectTo({
                url: '../agreement/agreement', 

              });
            }

        });


      },

    });


  },
  go_bind(){
    var that=this
     var device_model=app.getDeviceModel();
     
     if(device_model==null||device_model==undefined){
       my.showToast({
         content:'正在获取手机类型'
       });
       return;
     }
     if(that.data.canclick==false){
      my.showToast({
         content:'正在获取数据'
       });
       return;

     }
    if(that.data.amount=="0.00"){
      my.showToast({
        content:'请选择开卡金额'

      });
      return;
    }
      //var order_url=app.getOrder("88724922506","0009");
      var order_url=app.getOrder("","0008");
      app.log(order_url);
      this.getOrderData(order_url);
     
  },
  getPhoneInfo(){
    var that=this;
    var device_model=app.getDeviceModel();

    if(device_model==null||device_model==undefined){

        my.seNFCServiceIsv({
          method: 'getDeviceInfo',
          success:(result) => {
            if(result!=null&&result.resultCode==0){
              monitor.report({
                info:"获取手机信息成功",
              });
              var data=JSON.parse(result.data);
              var model=data.deviceModel;

              app.setDeviceModel(model);
              app.devicemodel=model;

            }else if(result.resultCode==-9000){
              that.getPhoneInfo();
            }else{
              var msg=app.get_error_msg(result.resultCode) 
              my.alert({
                title: '提示',
                content:msg 
              });
            }
          }
        });


    }else{
      app.devicemodel=device_model;
    }


  },
  search_keyi(){
    var that=this;
    my.showLoading({
        content: '查询中',
      });
    var url=app.getKeyiList();
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => { 
        that.data.canclick=true;
        my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });       
          app.log('resp data:'+resp.data);
        
        if(resp.data.return_code=="success"){
          monitor.report({
            info:"可疑交易查询成功",
            code:resp.data.return_code
          });
          app.log("可疑查询成功");
          var return_msg=resp.data.return_msg;

          app.log(return_msg);
          var msg=JSON.parse(return_msg);
          app.log("msg.TotNum----" + msg.TotNum);

          if(msg.TotNum==0){

          }else{

            var data=msg.data;
         

            app.log("datalength"+data.length);

            for(var i=0;i< data.length;i++){
              app.log("data---"+data[i]);
              app.log(data[i].TransType);
              
              if(data[i].TransType=='10000012'||data[i].TransType=='00000015'){
                app.log("发现开卡可疑")

                 my.navigateTo({ url: '../record_list/keyi_list/keyi_list' });
                 return;


              }
            }


          }
         
        }else{
          monitor.report({
            info:"可疑交易查询失败",
            code:resp.data.return_code,
            msg:resp.data.return_msg
          });
          app.log("查询失败");
          var return_msg=resp.data.return_msg;
          app.log(return_msg);
          if(return_msg=='交易未处理'){

          }
        }
        
      },
      fail: (err) => {
        
        app.log('error:'+err);
          my.hideLoading({
            page: that,  
          });
          my.confirm({
            title: '提示',
            content: '网络不流畅，请稍后重试！',
            confirmButtonText: '重试',
            cancelButtonText: '取消',
            complete: (e) => {
              if(e.confirm){
                that.search_keyi();    
                return;
              }else{
                that.data.canclick=true;
                return;
              }
            },
          });

      },

    });

  },
  revokeOrder(){
    //var that=this;
    var url=app.revokeAirCard();
    /*my.showLoading({
      content: '订单申请中',
    });*/

    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => { 
          /*my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          }); */      
        app.log('resp data:'+resp.data);

        if(resp.data.resCode=="9000"){
          monitor.report({
            info:"订单业务取消成功",
            phone_number:app.userInfo.phone   
          });


        }
        
      },


    });

  }

});
