const app= getApp();
Page({
  data: {
    systemInfo: {} ,// 手机基础信息
    userInfo:{},
    userLogin:false,
    ueerNotLogin:true,
    cardInfo:{},
    card_staus:false,
    error_message:"手机不支持开卡",


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

 
  },
  onShow(){
    var keyiflag=app.getCreatKeyi();
    if(keyiflag==null||keyiflag==undefined){
      this.get_cplc();
    }else if(keyiflag==1||keyiflag==3||keyiflag==4){
      app.log("存在未完成开卡任务");
      my.navigateTo({ url: '../record_list/keyi_list/keyi_list' });

    }else{
      this.get_cplc();

    }

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
  agree_on(){
    var that=this;

    if(that.data.card_staus==true){
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
    if(cplc==null||cplc==undefined){
      my.call(app.plugin,
      {
        method: 'getCplc'
      },
      function (result) {
        
        app.log(result);


        if(result.resultCode==0){
          app.setCplc(result.data.cplc);
          that.read_cardInfo();

        }else if(result.resultCode==-9000){
          that.get_cplc();
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
    my.call(app.plugin,
    {
      method: 'readCardInfo',
      param:params
    },
    function (result) {
      app.log(result);
              

      if(result.resultCode==0){
        app.cardInfo=result.data;
        app.cardno=result.data.cardNo;
        app.logiccardno=result.data.logicCardNo;
        app.balance=result.data.balance; 
        my.navigateTo({ url: '../card_info/card_info' });
        /*my.redirectTo({
          url: '../card_info/card_info', // 需要跳转的应用内非 tabBar 的目标页面路径 ,路径后可以带参数。参数规则如下：路径与参数之间使用

        });*/

      }else if(result.resultCode==-9000){
          that.read_cardInfo();
      }else{
        that.get_creat_status();
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
    my.call(app.plugin,
      {
        method: 'checkIssueCondition',
        param:params
      },
      function (result) {
        app.log(result);

        
        if(result.resultCode==0){
            that.get_charge_status();
            app.log("虚拟卡开卡状态正常")

          }else if(result.resultCode==-9000){
            that.get_creat_status();
          }else{
            that.data.error_message="开卡服务不支持"
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
    my.call(app.plugin,
    {
      method: 'checkRechargeCondition',
      param:params
    },
    function (result) {
      app.log(result);

      if(result.resultCode==0){
        that.data.card_staus=true;
        app.log("虚拟卡充值状态正常")

      }else if(result.resultCode==-9000){
        that.get_charge_status();

      }else{
        that.data.error_message="充值服务不支持"
      }
    });

  },
  go_message(){
    my.navigateTo({
      url:'../contract/contract'
    });
  }



  
});
