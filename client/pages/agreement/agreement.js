const app= getApp();
Page({
  data: {
    systemInfo: {} ,// 手机基础信息
    userInfo:{},
    userLogin:false,
    ueerNotLogin:true,
    cardInfo:{},
    card_staus:false,
    error_message:"暂不支持开卡",


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
   /* var isagree=app.getAgreement();
    console.log(isagree)
    if(isagree==true){
      my.navigateTo({
        url: '../index/index'
      });
    }*/


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
      my.call('seNFCService',
      {
        method: 'getCplc'
      },
      function (result) {
        if(result.resultCode==0){
          that.read_cardInfo();

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
    console.log(params);
    my.call('seNFCService',
    {
      method: 'readCardInfo',
      param:params
    },
    function (result) {
      if(result.resultCode==0){
        app.cardInfo=result.data;
        my.navigateTo({ url: '../card_info/card_info' });

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
    console.log(params);
    my.call('seNFCService',
      {
        method: 'checkIssueCondition',
        param:params
      },
      function (result) {
        console.log(result.resultCode);
        if(result.resultCode==0){
            that.get_charge_status();

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
    console.log(params);
    my.call('seNFCService',
    {
      method: 'checkRechargeCondition',
      param:params
    },
    function (result) {
      if(result.resultCode==0){
        that.data.card_staus=true;

      }else{
        that.data.error_message="充值服务不支持"
      }
    });

  },



  
});
