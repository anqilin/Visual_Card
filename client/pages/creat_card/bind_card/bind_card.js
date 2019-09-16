const app= getApp();
Page({
  data: {
    systemInfo: {} ,// 手机基础信息
    userInfo:{},
    userLogin:false,
    ueerNotLogin:true,
    cardInfo:{},
    text1:"设备绑定中",
    text2:"正在加载中",
    text3:"请不要退出运用，且保持网络正常，否则会导致绑定失败",
    percent:"0",
    num:0,
    bind_card:false,


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
    
    this.changeBar();
    this.creat_card();
    


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
  changeBar(){
    var that = this;
    var num=that.data.percent;    
    var interval = setInterval(function () {
    that.setData({
          percent: num
      })
      num++;
      if(num==100){

        that.setData({
          percent:0
        })
      }
    if (that.data.bind_card==true) {
        clearInterval(interval);
        that.setData({
          text1:"绑定成功",
          text2:"已完成开卡和绑定",
          text3:"你的上海NFC交通卡已开通成功！",
          percent: "100"
        });
        my.redirectTo({
          url:'../../card_info/card_info'
        });

    }
    }, 1000)

    
  },
  creat_card(){
    var that = this;

    var pa={
      issuerID:app.issuer_Id,
      spID:app.spId,
      orderNo:app.bussiness_id
    }
    var params= JSON.stringify(pa);
    app.log(params);
    try{
      my.call(app.plugin,
      {
        method: 'issueCard',
        param:params
      },
      function (result) {
        app.log(result)
        if(result.resultCode==0){
          app.setCreatKeyi(5);


          that.data.bind_card=true;

        }else if(result.resultCode==-9000){
          clearInterval(that.data.interval);
          that.creat_card();


        }else{
          app.setCreatKeyi(4);
           clearInterval(that.data.interval);
           //app.setCreatCardFlag(false);
            my.alert({
              title: '提示',
              content: '开卡失败', 
           });
           my.redirectTo({ url: '../../record_list/keyi_list/keyi_list' });

        }
  
  
      });
      /*my.seNFCServiceIsv({
        method: 'issueCard',
        param:params, 
        success:(result) => {
          app.log(result)
          if(result.resultCode==0){
            app.setCreatKeyi(5);


            that.data.bind_card=true;

          }else if(result.resultCode==-9000){
            clearInterval(that.data.interval);
            that.creat_card();


          }else{
            app.setCreatKeyi(4);
            clearInterval(that.data.interval);
           //app.setCreatCardFlag(false);
            my.alert({
              title: '提示',
              content: '开卡失败', 
            });
           my.navigateTo({ url: '../../record_list/keyi_list/keyi_list' });

          }
          
        }
      });*/

    }catch(err){
      my.alert({
        title: '提示',
        content: '程序发生错误'+err.message, 
      });

    }

  }



  
});
