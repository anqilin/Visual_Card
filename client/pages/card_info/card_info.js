import {monitor} from '/util/monitor';
const app= getApp();
Page({
  data: {
    systemInfo: {},
    keyi:true,
    cannext:true,
    cardno:"1234",
    balance:"",
    validity:"2024/3/22",
    deviceModel:"HUAWEI",
    isDefault:false,
    cardstatus:'设置默认卡片',
    cardstatuscolor:'#108EE9',
    cardstatusback:'#FDFDFD',
    balance_color:'#333333',
    image_path:'url(/resource/card.png)',
    deposit:"20.00",
    deposit_num:0,
    deposit_title:'通过APP提前返还服务费',
    deposit_msg:'实名认证后，在卡片详情页面进行返还申请（每个账户提前返还服务费仅能享受一次）',
    modalOpened: false,
    bind_text:'升级',
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
    //my.hideFavoriteMenu();
    var that=this;

    var token=app.userInfo.token;
    var phonenumber=app.userInfo.phone;
    var buyId=app.userInfo.buyId;
    if(token!=""&&phonenumber!=""&&buyId!=""){
        app.log("已获取用户信息")
        that.get_mydeposit();
        setTimeout(function(){
          that.search_keyi();

        },4000);
        
      
    }else{
      that.getUserInfo();
    

    }
    //this.read_cardInfo();
    


  },
  onShow(){
    var that=this;
    that.setData({
      cardstatuscolor:'#108EE9',
      cardstatusback:'#FDFDFD',
      balance_color:'#333333'
    })
    that.read_cardInfo();
    setTimeout(function(){

      that.read_cardInfo();
      //that.change_card_show();

    },5000);
    that.getPhoneInfo();
    var keyiflag=app.getChargeKeyi();
    app.log("keyi"+keyiflag);
    if(keyiflag==null||keyiflag==undefined){

      that.setData({
        keyi:false,
        cannext:true
      })
    }else if(keyiflag==0||keyiflag==2||keyiflag==5){
      app.log(that.data.keyi);
      that.setData({
        keyi:false,
        cannext:true
      })
      app.log(that.data.keyi);
    }else if(keyiflag==3||keyiflag==4){

       that.setData({
        keyi:true,
        cannext:false
      })
    }
    if(app.hasf0==true){
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
    app.log(params);

    my.seNFCServiceIsv({
      method: 'readCardInfo',
      param:params, 
      success:(result) => {
        app.log(result);
        app.log("新接口返回:"+result);

      if(result.resultCode==0){
          monitor.report({
            info:"读取卡信息成功"  
          });
        app.cardInfo=result.data;

        var cardno=result.data.cardNo
        app.cardno=cardno;
        var logicno=result.data.logicCardNo;
        var balance=result.data.balance;
        var isDefault=result.data.isDefault;

        app.logiccardno=logicno;
        app.balance=balance;
        app.isDefault=isDefault;
        app.isHasCard=true;
        

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
          if(parseFloat(result.data.balance)<0){

            that.setData({
              cardstatus:"无法使用",
              cardstatuscolor:'#FFFFFF',
              cardstatusback:'#F24724',
              balance_color:'#F24724'
            })


          }
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
        monitor.report({
          info:"读取卡信息失败",
          code:result.resultCode,
          msg:result.resultMsg,
        });
        my.redirectTo({
          url:'../agreement/agreement'
        });
        
      }
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
    app.log('getAuth--start');
      my.showLoading({
        content: '查询中',
      });
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        if(res.authCode){
          monitor.report({
            info:"获取authcode成功"             
          });
         app.log("res.authCode:"+res.authCode);
          var code=res.authCode;         
          this.getHttpUserInfo(code);
          

        }

      },
      fail: (res) => {
          app.log('getAuth--failed:' +  JSON.stringify(res));
          monitor.report({
            info:"获取authcode失败"             
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
        if(resp.data.result_code=="success"){
          app.log("userinfo data:"+resp.data);
          app.userInfo.phone=resp.data.phone;
          app.userInfo.token=resp.data.note.substring(0,16);
          app.userInfo.buyId=resp.data.buyId;
          app.log(app.userInfo.token);
          monitor.report({
            info:"获取用户信息成功",
            phone_number:app.userInfo.phone   
          });

          that.search_keyi();
          that.get_mydeposit();
          that.Ant_Search();
          //that.Ant_BindOrUnbind('01');


        }else{
          my.alert({
            title: '获取用户信息失败' 
          });
        }
        
        app.log('resp data:'+ resp.data.result_code); 


        
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

  go_recharge(){
    var that=this;
    if(that.data.cannext==false){
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
    var that=this;
    that.openModal() 

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
      /*my.call(app.plugin,
        {
          method: 'getDeviceInfo'
        },
        function (result) {

          if(result!=null&&result.resultCode==0){

            var data=JSON.parse(result.data);
            var model=data.deviceModel;
            monitor.report({
              info:"读取手机信息成功",
              msg:"手机型号"+ model
            });

            app.setDeviceModel(model);
            app.devicemodel=model;
            that.setData({
              deviceModel:model
            })


          }else if(result.resultCode==-9000){
            that.getPhoneInfo();
          }else{
            monitor.report({
              info:"获取手机信息失败",
              code:result.resultCode,
              msg:result.resultMsg,
            });
          }

        });*/
        my.seNFCServiceIsv({
          method: 'getDeviceInfo',
          success:(result) => {
            app.log("新接口"+result);
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


            }else if(result.resultCode==-9000){
              that.getPhoneInfo();
            }else{
              monitor.report({
                info:"获取手机信息失败",
                code:result.resultCode,
                msg:result.resultMsg,
              });
            }
          }
        });

    }else{
      app.devicemodel=device_model;
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
    app.log(params);
    my.showLoading({
        content: '正在跳转设置',
    });
    /*my.call(app.plugin,
      {
        method: 'startDefault',
        param:params
      },
      function (result) {
        my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
        });  
        if(result.resultCode==0){
          monitor.report({
            info:"设置默认卡片成功"  
          });
           that.read_cardInfo()

        }else if(result.resultCode==-9000){
          that.setDefaulfCard();
        }else{
          monitor.report({
            info:"设置默认卡片失败",
            code:result.resultCode,
            msg:result.resultMsg,
          });
          my.alert({
            title: '提示',
            content:'设置默认卡失败'
        });

        }

      });*/
      my.seNFCServiceIsv({
        method: 'startDefault',
        param:params, 
        success:(result) => {
          my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });  
          if(result.resultCode==0){
            monitor.report({
              info:"设置默认卡片成功"  
            });
           that.read_cardInfo()

          }else if(result.resultCode==-9000){
            that.setDefaulfCard();
          }else{
            app.log(result.resultCode+":"+result.resultMsg)
            monitor.report({
              info:"设置默认卡片失败",
              code:result.resultCode,
              msg:result.resultMsg,
            });
            my.alert({
              title: '提示',
              content:'设置默认卡失败'
            });

          }
        }
      });

  },
  go_method(){
     my.navigateTo({ url: '../use_method/use_method' })
  },
  change_flag(){
    app.setCreatKeyi(0);
    app.setChargeKeyi(0);
    app.hasf0=false;
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
        my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });       
          app.log('resp data:'+resp.data);
        
        if(resp.data.return_code=="success"){
          monitor.report({
            info:"可疑交易查询成功",
            phone_number:app.userInfo.phone   
          });
          app.log("可疑查询成功");
          var return_msg=resp.data.return_msg;

          app.log(return_msg);
          var msg=JSON.parse(return_msg);
          app.log("msg.TotNum----" + msg.TotNum);

          if(msg.TotNum==0){
            that.setData({
              keyi:false,
              cannext:true
            });
            that.change_flag();

          }else{

            var data=msg.data;
         

            app.log("datalength"+data.length);
            var haskeyi=false;
            var hasf0=false;
            that.change_flag();

            for(var i=0;i< data.length;i++){
              app.log("data---"+data[i]);
              
              
              if(data[i].TransType=='10000013'){
                  var note=data[i].Note.split(",");
                  var inid=note[0].substring(10,20);
                  app.log('inid:'+inid);
                  app.log('appinid:'+app.innerId);

                  if(inid==app.innerId){
                    app.log('找到了')
                    app.setChargeKeyi(4);

                    haskeyi=true;

                  }                  

              }else if(data[i].TransType=='00000015'){

                hasf0=true;
                app.hasf0=true;
              

              }
            }
            if(hasf0){
              that.setData({
                  keyi:true,
                  cannext:true
              })
            }
            if(haskeyi){
              that.setData({
                keyi:true,
                cannext:false
              })

            }
            if(haskeyi==false&&hasf0==false){
                that.setData({
                  keyi:false,
                  cannext:true
                });
                that.change_flag();

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

            that.setData({
               keyi:false,
               cannext:true
            })
            that.change_flag();

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
                //my.navigateBack({ delta: 1});
                return;
              }
            },
          });

      },

    });

  },
  change_card_show(){
    var that=this;
    that.setData({
        image_path:'url(/resource/card_unbind.png)'
    });
  },
  Ant_Search(){
    var that=this;

    var url=app.AntSearch(app.cardno);
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => { 
      
        app.log('antsearch resp data:'+JSON.stringify(resp.data));

        var msg=JSON.parse(resp.data.result_msg);
        
        if(resp.data.return_code=="success"&&resp.data.result_code=="success"){
          app.log("ResponseCode:"+msg.responseCode);
          app.log(msg);
          if(msg.responseCode=="00"){
            app.log("该卡已绑定蚂蚁森林能量");
            that.setData({
              bind_text:"解绑"
            })
            monitor.report({
              info:"该卡已绑定蚂蚁森林能量",
              code:resp.data.result_code
            });
          }else{
            pp.log("该卡没有绑定蚂蚁森林能量");
            monitor.report({
              info:"该卡没有绑定蚂蚁森林能量",

            });

          }

        }else{
          app.log("该卡没有绑定蚂蚁森林能量");
            monitor.report({
              info:"该卡没有绑定蚂蚁森林能量",

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
              if(e.confirm){
                that.Ant_Search();    
                return;
              }else{
                
                return;
              }
            },
          });

      },

    });

  },
  Ant_BindOrUnbind(falg){
    var that=this;

    var url=app.AntBind(app.cardno,falg);
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => { 
      
        app.log('antbind resp data:'+JSON.stringify(resp.data));

        var msg=JSON.parse(resp.data.result_msg);
        
        if(resp.data.return_code=="success"&&resp.data.result_code=="success"){
          app.log("ResponseCode:"+msg);
          app.log("操作成功")

        }else{

        }
  
      },
      fail: (err) => {
          app.log(err);


      },

    });

  },
  get_mydeposit(){
    var that=this;
    var url=app.get_deposit(app.cardno);
    app.log("获取押金:"+url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => { 
 
        app.log('deposit data:'+JSON.stringify(resp.data));
        app.log(resp.data.return_code);
        
                
        if(resp.data.return_code=="success"){
          var msg=JSON.parse(resp.data.return_msg);
          app.log("ResponseCode:"+msg);
          var deposit=msg.deposit;
          //app.log("押金:"+deposit);
          app.log("押金:"+parseInt(deposit));
          var num=parseFloat(parseInt(deposit)/100).toFixed(2);
          app.log("押金:"+num);
          that.setData({
            deposit:num,
            deposit_num:parseInt(deposit)

          });
          if(parseInt(deposit)>0){
            app.log("押金不为0");
          }
          var notes=msg.note.split(";");
          if(notes[0]=="2"){
            var phone=notes[2];
            var year=notes[1].substring(0,4);
            var month=notes[1].substring(4,8);
            var day=notes[1].substring(8,10);
            var title="无可退服务费";
            var content="该卡开卡服务费已于"+year+"年"+month+"月"+day+"日退至"+phone.substring(0,3)+
            "****"+phone.substring(7,11);
            that.setData({
              deposit_title:title,
              deposit_msg:content
            })
          }


        }else{

        }
  
      },
      fail: (err) => {

      },

    });


  },
  openModal() {
    this.setData({
      modalOpened: true,
    });
  },
  onModalClick() {
    this.setData({
      modalOpened: false,
    });
  },
  onModalClose() {
    this.setData({
      modalOpened: false,
    });
  },

});