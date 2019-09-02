import util from '/util/huawei';
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
  },
  onLoad(options) {
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)
      let systemInfo = my.getSystemInfoSync();
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
    if(token!=""){
        console.log("以获取用户信息")
      
    }else{
      this.getUserInfo();
    

    }


  },
  getUserInfo(){
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        if(res.authCode){
          console.log(res.authCode);
          var code=res.authCode;         
          this.getHttpUserInfo(code);
          

        }

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
      console.log(e.target.dataset.money);
      var money=e.target.dataset.money;

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

  getCardInfo(){
    try{
        var issue_flag=util.checkIssueCondition();
        var cplc=app.getCplc();
        if(cplc==null||cplc==undefined){
          var json=util.getCplc();
          if(json.resultCode === 0){
            cplc=json.data.cplc;
            app.setCplc(cplc);
          }else{
            return "queryCplc";
          }         
        }
        var jsoncard=util.readCardInfo();
        if(jsoncard.resultCode===0){
          this.setData({
             cardInfo:jsoncard,

          });
          
          return "ok";
        }
        if(issue_flag!==0){
          return "虚拟卡功能不支持:"+issue_flag;

        }

        var read_flag=util.checkRechargeCondition();
        if(read_flag!==0){
          return "checkServiceStatus-rechargeService"
        }

    }catch(e){
        console.log(e);
        return "虚拟卡服务繁忙,请稍后再试";
    }

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
  getOrderData(url){
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {        
        console.log('resp data', resp.data);
        if(resp.data.return_code=="success"){
          app.orderResq.orderId=resp.data.return_msg.orderId;
          app.orderResq.qorderId=resp.data.return_msg.QorderId;
          app.orderResq.partnerid=resp.data.return_msg.partnerid;
          app.orderResq.content=resp.data.return_msg.content;
          app.cplc="479044204700E753010062530553059392844810000000510000041741B3853C80010000000000484554";
          app.seid="47906253055305939284";
          app.logiccardno="B2D736CA254ED1B7";
          this.goPay();

        } 
        
      },
      fail: (err) => {
        console.log('error', err);

      },

    });

  },
  goPay(){
    my.tradePay({
  
      tradeNO: app.orderResq.content,
      success: (res) => {
        console.log(res.resultCode);
        if(res.resultCode=="9000"){
          //var url=app.getCreatCardRequest();
          var url=app.getRechargeCardOrder();
          console.log(url);
          this.goCreatCard(url);

        }


      },
      fail: (res) => {
        console.log(res.resultCode);



      }
    });
  },
  goCreatCard(url){
      my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {        
        console.log('resp data', resp.data);
        
        my.alert({
          title: resp.data.resCode,
          content: resp.data.resDesc, 
        });
        if(resp.data.resCode=="9000"){
          console.log("充值成功");
          my.navigateTo({ url: '../creat_card/bind_card/bind_card' })
        }else{
          console.log("充值失败");
        }


        
      },
      fail: (err) => {
        console.log('error', err);

      },

    });


  },
  go_bind(){
      var order_url=app.getOrder("88724922506","0009");
      //var order_url=app.getOrder("","0009");
      console.log(order_url);
      this.getOrderData(order_url);
     
  }

});
