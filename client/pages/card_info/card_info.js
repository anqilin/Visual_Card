//import absolute from '/util/huawei';
const app= getApp();
Page({
  data: {
    systemInfo: {},
    keyi:true,
    cardno:"1234",
    balance:"",
    validity:"2024/3/22",
    deviceModel:"HUAWEI",
    isDefault:false,
    cardstatus:'设置默认卡片',
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

    var token=app.userInfo.token;
    if(token!=""){
        console.log("已获取用户信息")
      
    }else{
      this.getUserInfo();
    

    }
    //this.read_cardInfo();

  },
  onShow(){
    var that=this;
    that.read_cardInfo();
    that.getPhoneInfo();
    var keyiflag=app.getChargeKeyi();
    app.log("keyi"+keyiflag);
    if(keyiflag==null||keyiflag==undefined){

      that.setData({
        keyi:false
      })
    }else if(keyiflag==0||keyiflag==2||keyiflag==5){
      app.log(that.data.keyi);
      that.setData({
        keyi:false
      })
      app.log(that.data.keyi);
    }else if(keyiflag==1||keyiflag==3||keyiflag==4){

       that.setData({
        keyi:true
      })
    }

  },
  read_cardInfo(){

    var that=this;
    var pa={
      issuerID:app.issuer_Id,
      dataItems:15
    }
    var params= JSON.stringify(pa);
    console.log(params);

    my.call(app.plugin,
    {
      method: 'readCardInfo',
      param:params
    },
    function (result) {
      app.log(result);


      if(result.resultCode==0){
        app.cardInfo=result.data;
        my.alert({
          title: '提示',
          content:result.data 
        });

        var cardno=result.data.cardNo
        app.cardno=cardno;
        var logicno=result.data.logicCardNo;
        var balance=result.data.balance;
        var isDefault=result.data.isDefault;

        app.logiccardno=logicno;
        app.balance=balance;
        app.isDefault=isDefault;
        
        my.showToast({
          content:that.data.cardno,
   
        });

        that.setData({
          balance:balance,
          validity:result.data.validateDate,
          isDefault:isDefault,
          cardno: cardno,

        })
        if(that.data.isDefault){
          that.setData({
            cardstatus:"正常使用中"
          })
        }else{

          that.setData({
            cardstatus:"设置默认卡片"
          })
          var flag=app.getDefaultFlag();
          if(flag==null||flag==undefined){
            app.setDefaultFlag(true);
            that.show_confirm();

          }
        }
        

      }else if(result.resultCode==-9000){
          that.read_cardInfo();
      }else{
        
      }
    });

  },
  go_record(){
    my.navigateTo({
      url:'../record_list/records_list/records_list'
    });
  },
  go_keyi(){
    my.navigateTo({
      url:'../record_list/keyi_list/keyi_list'
    });

  },
  getUserInfo(){
    var that = this;
    console.log('getAuth--start');
      my.showLoading({
        content: '查询中',
      });
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        if(res.authCode){
         // console.log(res.authCode);
         app.log(res.authCode);
          var code=res.authCode;         
          this.getHttpUserInfo(code);
          

        }

      },
      fail: (res) => {
          console.log('getAuth--failed:' +  JSON.stringify(res));
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
    console.log(url);
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
          app.userInfo.token=resp.data.note;
          app.userInfo.buyId=resp.data.buyId;

        }
        
        console.log('resp data', resp.data); 


        
      },
      fail: (res) => {
          console.log('HttpUserInfo--failed:' +  JSON.stringify(res));
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

  go_recharge(){
    var that=this;
    if(that.data.keyi==true){
      my.alert({
        title: '提示',
        content: '请处理可疑交易'
      });
      return;
    }
    my.navigateTo({
      url:'../recharge_card/recharge_card'
    });

  },
  show_fee(){
    my.alert({
      title: '可退服务费',
      content: '20元可退服务费在退卡是一并退回',
      buttonText: '确定',

    });
  },
  show_confirm(){
    var that=this;
    my.confirm({
      title: '开卡成功',
      content: '将卡片设置为手机默认支付，才可正常乘车',
      confirmButtonText: '前往设定',
      cancelButtonText: '下次再说',
      complete: (e) => {
        if(e.confirm){
          that.setDefaulfCard();    
          return;
        }else{
          
          return;
        }
      },

    });
  },
  getPhoneInfo(){
    var that=this;
    var device_model=app.getDeviceModel();

    if(device_model==null||device_model==undefined){
      my.call(app.plugin,
        {
          method: 'getDeviceInfo'
        },
        function (result) {

          if(result!=null&&result.resultCode==0){
            var data=JSON.parse(result.data);
            var model=data.deviceModel;

            app.setDeviceModel(model);
            that.setData({
              deviceModel:model
            })


          }else if(result.resultCode==0){
            that.getPhoneInfo();
          }

        });

    }else{
          that.setData({
              deviceModel:device_model
            })
    }


  },
  setDefault(){
    var that=this;
    if(that.data.isDefault!=true){
      that.setDefaulfCard();

    }
  },
  setDefaulfCard(){
    var that=this;
    var pa={
      issuerID:app.issuer_Id,
      spID:app.spId
    }
    var params= JSON.stringify(pa);
    console.log(params);
    my.call(app.plugin,
      {
        method: 'startDefault',
        param:params
      },
      function (result) {
        if(result.resultCode==0){
           that.read_cardInfo()

        }else if(result.resultCode==-9000){
          that.setDefaulfCard();
        }else{
          my.alert({
            title: '提示',
            content:'设置默认卡失败'
        });

        }

      });

  },
});