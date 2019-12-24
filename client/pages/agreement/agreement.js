import {monitor} from '/util/monitor';
const app= getApp();
Page({
  data: {
    systemInfo: {} ,// 手机基础信息
    userInfo:{},
    userLogin:false,
    ueerNotLogin:true,
    cardInfo:{},
    card_staus:false,
    error_message:"当前手机不支持开卡",
    canclick:false,


  },
  onLoad(options) {
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)
      //let systemInfo = my.getSystemInfoSync();
      let systemInfo=app.systemInfo;
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
      info:"进入小程序",        
    });
    //this.getUserInfo()
 
  },
  onShow(){

    this.data.card_staus=false;
    this.data.canclick=false;
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
  go_method(){
     my.navigateTo({ url: '../use_method/use_method' })
  },
  go_method2(){
     my.navigateTo({ url: '../use_method/use_method?type=1' })
  },
  agree_on(){
    var that=this;
    //that.go_zhifubao();
    if(that.data.canclick==false){
      return;
    }

    if(that.data.card_staus==true){

      /*var token=app.userInfo.token;
      var phonenumber=app.userInfo.phone;
      var buyId=app.userInfo.buyId;
      if(token!=""&&phonenumber!=""&&buyId!=""){
        app.log("已获取用户信息")
        that.go_zhifubao();
        
      
      }else{
        this.getUserInfo();    
      }*/
      my.navigateTo({
        url: '../index/index'
      });
    }else{
      my.showToast({
          content:that.data.error_message
      });
    }
  },


  get_cplc(){

    var that=this;
    var cplc=app.getCplc();
    app.log('cplc:'+cplc);
    monitor.report({
      info:cplc      
    });
    app.log('确认信息');

    if(cplc==null||cplc==undefined){
      my.showLoading({
        content: '查询中',
      });
      /*my.call(app.plugin,
      {
        method: 'getCplc'
      },
      function (result) {
          my.hideLoading({
            page: that,
          });
        
        app.log(result);

        if(result.resultCode==0){
          monitor.report({
            info:"获取cplc成功",        
          });
          app.setCplc(result.data.cplc);
          that.read_cardInfo();

        }else if(result.resultCode==-9000){
          that.get_cplc();
        }else{
          monitor.report({
            code:result.resultCode,
            msg:result.resultMsg,
            info:"获取cplc失败"       
          });
          that.data.canclick=true;
        }
      });*/
      my.seNFCServiceIsv({
        method: 'getCplc',
        success:(result) => {
          my.hideLoading({
            page: that,
          });
        
          app.log(result);

          if(result.resultCode==0){
            monitor.report({
              info:"获取cplc成功",        
            });
            app.log("获取cplc成功:"+result.data.cplc);
            app.setCplc(result.data.cplc);
            that.read_cardInfo();

          }else if(result.resultCode==-9000){
            that.get_cplc();
          }else{            
            monitor.report({
              code:result.resultCode,
              msg:result.resultMsg,
              info:"获取cplc失败"       
            });
            that.data.canclick=true;
          }
          
        }
      });
    }else{
      that.read_cardInfo();

    }

  },
  read_cardInfo(){

    var that=this;
    var pa={
      issuerID:app.issuer_Id,
      dataItems:15
    }
    var params= JSON.stringify(pa);
    app.log(params);
      my.showLoading({
        content: '查询中',
      });
    /*my.call(app.plugin,
    {
      method: 'readCardInfo',
      param:params
    },
    function (result) {
      app.log(result);
        my.hideLoading({
            page: that,
          });              

      if(result.resultCode==0){
        monitor.report({
          info:"读取卡信息成功",
          code:result.resultCode        
        });
        app.cardInfo=result.data;
        app.cardno=result.data.cardNo;
        var inid=app.OuterIdToInnerId(app.cardno);
        app.log("innerId:"+inid);
        app.innerId=inid;
        app.logiccardno=result.data.logicCardNo;
        app.balance=result.data.balance; 
        app.isHasCard=true;
        my.redirectTo({ url: '../card_info/card_info' });

        
      }else if(result.resultCode==-9000){
          that.read_cardInfo();
      }else{
          monitor.report({
            code:result.resultCode,
            msg:result.resultMsg,
            info:"获取卡信息失败"       
          });
        that.get_creat_status();
      }
    });*/
    my.seNFCServiceIsv({
      method: 'readCardInfo',
      param:params, 
      success:(result) => {
        app.log(result);
        my.hideLoading({
            page: that,
          });              

        if(result.resultCode==0){
          monitor.report({
            info:"读取卡信息成功",
            code:result.resultCode        
          });
          app.cardInfo=result.data;
          app.cardno=result.data.cardNo;
          var inid=app.OuterIdToInnerId(app.cardno);
          app.log("innerId:"+inid);
          app.innerId=inid;
          app.logiccardno=result.data.logicCardNo;
          app.balance=result.data.balance; 
          app.isHasCard=true;
          my.redirectTo({ url: '../card_info/card_info' });
          

        
        }else if(result.resultCode==-9000){
          that.read_cardInfo();
        }else{
          monitor.report({
            code:result.resultCode,
            msg:result.resultMsg,
            info:"获取卡信息失败"       
          });
          that.get_creat_status();
        }
      }

    });

  },
  get_creat_status(){
    var that=this;
    var pa={
      issuerID:app.issuer_Id,

    }
    var params= JSON.stringify(pa);
    app.log(params);
      my.showLoading({
        content: '查询中',
      });
    /*my.call(app.plugin,
      {
        method: 'checkIssueCondition',
        param:params
      },
      function (result) {
        app.log(result);
         my.hideLoading({
            page: that,
          });

        
        if(result.resultCode==0){
          monitor.report({
            info:"虚拟卡开卡状态正常",
            code:result.resultCode        
          });
            that.get_charge_status();
            app.log("虚拟卡开卡状态正常")

          }else if(result.resultCode==-9000){
            that.get_creat_status();
          }else if(result.resultCode==10403){
            monitor.report({
              code:result.resultCode,
              msg:result.resultMsg,
              info:"手机现在不支持开卡"       
            });
            that.data.error_message="手机现在不支持开卡"
            that.data.canclick=true;

          }else{
            monitor.report({
              code:result.resultCode,
              msg:result.resultMsg,
              info:"开卡服务不支持"       
            });
            that.data.error_message="开卡服务不支持"
            that.data.canclick=true;
          }
    });*/
    my.seNFCServiceIsv({
      method: 'checkIssueCondition',
      param:params, 
      success:(result) => {
        app.log(result);
         my.hideLoading({
            page: that,
          });

        
        if(result.resultCode==0){
          monitor.report({
            info:"虚拟卡开卡状态正常",
            code:result.resultCode        
          });
            that.get_charge_status();
            app.log("虚拟卡开卡状态正常")

          }else if(result.resultCode==-9000){
            that.get_creat_status();
          }else if(result.resultCode==10403){
            monitor.report({
              code:result.resultCode,
              msg:result.resultMsg,
              info:"手机现在不支持开卡"       
            });
            that.data.error_message="手机现在不支持开卡"
            that.data.canclick=true;

          }else{
            monitor.report({
              code:result.resultCode,
              msg:result.resultMsg,
              info:"开卡服务不支持"       
            });
            that.data.error_message="开卡服务不支持"
            that.data.canclick=true;
          }
      }
    });
  },
  get_charge_status(){
    var that=this;
    var pa={
      issuerID:app.issuer_Id,

    }
    var params= JSON.stringify(pa);
    app.log(params);
      my.showLoading({
        content: '查询中',
      });
    /*my.call(app.plugin,
    {
      method: 'checkRechargeCondition',
      param:params
    },
    function (result) {
        my.hideLoading({
            page: that,
          });
      app.log(result);

      if(result.resultCode==0){
        monitor.report({
            info:"虚拟卡充值状态正常",
            code:result.resultCode        
        });
        that.data.card_staus=true;
        app.log("虚拟卡充值状态正常")
        that.data.canclick=true;

      }else if(result.resultCode==-9000){
        that.get_charge_status();

      }else{
        monitor.report({
          code:result.resultCode,
          msg:result.resultMsg,
          info:"充值服务不支持"       
        });        
        that.data.error_message="充值服务不支持"
        that.data.canclick=true;
      }
    });*/
    my.seNFCServiceIsv({
      method: 'checkRechargeCondition',
      param:params, 
      success:(result) => {
               my.hideLoading({
            page: that,
          });
      app.log(result);

      if(result.resultCode==0){
        monitor.report({
            info:"虚拟卡充值状态正常",
            code:result.resultCode        
        });
        that.data.card_staus=true;
        app.log("虚拟卡充值状态正常")
        that.data.canclick=true;

      }else if(result.resultCode==-9000){
        that.get_charge_status();

      }else{
        monitor.report({
          code:result.resultCode,
          msg:result.resultMsg,
          info:"充值服务不支持"       
        });        
        that.data.error_message="充值服务不支持"
        that.data.canclick=true;
      }
      }
    });

  },
  getUserInfo(){
    var that = this;
    that.data.canclick=false;
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
          that.data.canclick=true;
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
          that.data.canclick=true;
        if(resp.data.result_code=="success"){

          app.userInfo.phone=resp.data.phone;
          app.userInfo.token=resp.data.note.substring(0,16);
          app.userInfo.buyId=resp.data.buyId;
           monitor.report({
            info:"获取用户信息成功",
            phone_number:app.userInfo.phone   
          });
          /*my.navigateTo({
            url: '../index/index'
          });*/
          that.go_zhifubao();
          

        }
        
        app.log('AlipayCommRegister resp data'+resp.data); 
        
      },
      fail: (res) => {
          app.log('HttpUserInfo--failed:' +  JSON.stringify(res));
          that.data.canclick=true;
          monitor.report({

            info:"获取用户信息失败"       
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
  go_message(){
    my.navigateTo({
      url:'../contract/contract'
    });
  },
  go_zhifubao(){
    var path='alipays://platformapi/startapp?appId='+app.userInfo.buyId+'&cplc='+app.getCplc();
    app.log("zhifubao path:"+path);
    my.ap.navigateToAlipayPage({
      path:path
    });

  }



  
});
