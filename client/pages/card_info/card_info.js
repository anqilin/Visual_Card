import absolute from '/util/huawei';
const app= getApp();
Page({
  data: {
    systemInfo: {},
    keyi:true
  },
    onLoad(options) {
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)
      let systemInfo = my.getSystemInfoSync();
      this.setData({ systemInfo });
    } catch (e) {
      console.log(e);
      my.alert({
        title: '温馨提示',
        content: 'onLoad 执行异常'
      });
    }
     my.hideFavoriteMenu();
    this.show_confirm()
    var token=app.userInfo.token;
    if(token!=""){
        console.log("已获取用户信息")
      
    }else{
      this.getUserInfo();
    

    }

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
    });
  },
    getHttpUserInfo(code){
    var url = app.SERVER_URL
					+ "handapp_app/AlipayCommRegisterServlet?";
    url=url+"code="+code;
    console.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {
        if(resp.data.result_code=="success"){
          app.userInfo.phone=resp.data.phone;
          app.userInfo.token=resp.data.note;
          app.userInfo.buyId=resp.data.buyId;

        }
        
        console.log('resp data', resp.data); 


        
      },
      fail: (err) => {
        console.log('error', err);
      },

    });



  },

  go_recharge(){
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
    my.confirm({
      title: '开卡成功',
      content: '将卡片设置为手机默认支付，才可正常乘车',
      confirmButtonText: '前往设定',
      cancelButtonText: '下次再说',

    });
  }
});