const app= getApp();
Page({
  data: {
    keyidata:[],
    showkeyi:false,
    Transdt:'',
    TransType:'',
    TransAmt:'',
    type:'',
    orderId:'',
    is_search:false,
    flag:'10'
  },
  onLoad() {
    

  },
  onShow(){
    this.data.is_search=false;
    this.data.flag='10';
    this.get_keyi();

  },
  get_keyi(){
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
          app.log("可疑查询成功");
          var return_msg=resp.data.return_msg;

          app.log(return_msg);
          var msg=JSON.parse(return_msg);
          app.log("msg.TotNum----" + msg.TotNum);

          if(msg.TotNum==0){
            that.setData({
              showkeyi:false
            })

          }else{

            var data=msg.data;
         

            app.log("data0------"+data[0]);
            app.log("datalength"+data.length);
            var jsonarray=new Array();
            for(var i=0;i< data.length;i++){
              app.log("data---"+data[i]);
              
              if(data[i].TransType=='00000012'||data[i].TransType=='00000013'||data[i].TransType=='00000015'){
                var json={};

                  
                var amt=(parseFloat(data[i].TransAmt)/100).toFixed(2);
                var fen=parseInt(data[i].TransAmt);
                var year=data[i].Transdt.substring(0,4);
                var month=data[i].Transdt.substring(4,6);
                var day=data[i].Transdt.substring(6,8);
                var h=data[i].Transdt.substring(8,10);
                var min=data[i].Transdt.substring(10,12);
                var sec=data[i].Transdt.substring(12,14);
                var time=year+"-"+month+"-"+day+" "+h+":"+min+":"+sec;
                var note=data[i].Note.split(",");

                app.log(note[3])
                json.orderId=note[3],
                json.Transdt=time;
                json.TransAmt=amt;
                json.fen=fen;


                if(data[i].TransType=='00000013'){

                  json.TransType="充值可疑"
                  json.type='00000013';
                  json.text="去验证"

                }else if(data[i].TransType=='00000012'){
                  
                  json.TransType="开卡可疑"
                  json.type='00000012';
                  json.text="去验证"

                }else if(data[i].TransType=='00000015'){
                  json.TransType="异常交易"
                  json.type='00000015';
                  json.text="去退款"

                }
                jsonarray.push(json)

              }
            }
            that.setData({
              keyidata:jsonarray
            })

          }
         
        }else{
          app.log("查询失败");
          var return_msg=resp.data.return_msg;
          if(return_msg=='交易未处理'){

            that.setData({
               showkeyi:false
            })
            that.change_flag();

            if(that.data.is_search){

              if(this.data.type=="00000012"){
                  my.redirectTo({
                    url:'../../success_result/success_result?from=0'
                  });

              }else if(this.data.type=="00000013"){
                my.redirectTo({
                  url: '../../success_result/success_result?from=1', 

                });

              }else if(this.data.type=="00000015"){
                my.redirectTo({
                  url: '../../refund_result/refund_result', 

                });

              }


            }else{
              if(app.isHasCard){
                my.redirectTo({
                  url:'../../card_info/card_info'
                });

              }else{
                my.redirectTo({
                  url:'../../agreement/agreement'
                });

              }

            }


          }
        }


        
      },
      fail: (err) => {
        app.log('error:'+err);
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
                that.get_keyi();    
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
  creditRefund(orderId,money){

    var that=this;
    var url=app.creditRefund(orderId,money)
    app.log(url);
    my.showLoading({
        content: '退款中',
    });
    my.request({
      url: url,
      success: (resp) => {
        my.hideLoading({
          page:that,
        });
        app.log(resp.data);
         that.data.is_search=true;
        if(resp.data.return_code="success"){
          
          that.get_keyi();

        }else{
          my.alert({
            title: '提示' ,
            content:'退款发生错误'+resp.data.return_msg
          });
        }
        
      },
      fail:(resp) => {
        app.log(resp.data);
        my.hideLoading({
          page:that,
        });
        my.alert({
          title: '提示' ,
          content:'请求数据失败'
        });

      }
    });

  },
  re_writecard(e){
    var that=this;
    app.log(e.target.dataset.type);
    app.log(e.target.dataset.id);
    app.log(e.target.dataset.money);
    var type=e.target.dataset.type;
    var orderId=e.target.dataset.id;
    var money=e.target.dataset.money;
    that.data.type=type;
    if(type=='00000015'){
      that.creditRefund(orderId,money);
      return;

    }
    
    var url=app.searchCardStatus(orderId);
    var taskStatusMsg="";
    var flag;
    my.showLoading({
        content: '查询中',
    });
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => { 
          my.hideLoading({
            page:that,
          });       
        app.log('resp data:'+ resp.data);
        that.data.is_search=true;
        
        if(resp.data!=null&&resp.data.resCode=="9000"){

          if(resp.data.taskStatus){
            app.log(resp.data);
            var taskStatus=resp.data.taskStatus;
            if (taskStatus=="0") {
								/*0：受理
								1：执行
								2：完成
								3：失败
								4：取消中
								5：取消*/
								taskStatusMsg = "正在受理";
								that.doRetry();
							} else if(taskStatus=="1") {
								taskStatusMsg = "正在执行";
								that.doRetry();
							}else if (taskStatus=="2") {
								taskStatusMsg = "订单已完成";
                that.get_keyi();
                return;

							}else if (taskStatus=="3") {
								taskStatusMsg = "订单已失败";
                that.get_keyi()
                return;
							}else if (taskStatus=="4") {
								taskStatusMsg = "订单取消中";
								that.doRetry();
							}else if (taskStatus=="5") {
								taskStatusMsg = "订单已取消";
                that.get_keyi();
                return;
							}else{
								taskStatusMsg = "状态["+taskStatus+"]";
								that.doRetry();
							}

          }
          if(resp.data.flag){
						flag=resp.data.flag;
            app.log("flag:"+flag)
            that.setData({
              flag:flag
            })
            if(taskStatus=="5"||taskStatus=="3"||taskStatus=="2"){
              if ("00"==flag) {

                that.show_fail();
			        } else if("01"==flag) {

               /* my.alert({
                  title: '提示' ,
                  content:'退款发生错误，请联系我们的客服',
                });*/
                that.show_fail();
		        	}else if ("02"==flag) {


                  that.show_fail();

			        }else if(flag==null){
				
                 my.showToast({
                  content:'业务状态查询失败'
                  });
			        }else{

        
               my.alert({
                  title: '提示' ,
                  content:taskStatusMsg,
               });

			        }

            }



					}
          app.log("查询成功");
         
        }else{

          my.alert({
            title: '提示',
            content:'可疑交易处理失败' 
          });
          app.log("查询失败");
        }


        
      },
      fail: (err) => {
          my.hideLoading({
            page:that,
          });
        app.log('error:'+err);
        my.alert({
          title: '' ,
          content:'获取数据失败'
        });

      },

    });

  },
  doRetry(){
    var that=this;
    if(that.data.type="00000013"){
      that.recharge_card();
    }else if(that.data.type="00000012"){
      that.creat_card();

    }


  },
  change_flag(){
    app.setCreatKeyi(0);
    app.setChargeKeyi(0);
  },
  creat_card(){
    var that = this;

    var pa={
      issuerID:app.issuer_Id,
      spID:app.spId,
      orderNo:'111'
    }
    var params= JSON.stringify(pa);
    my.showLoading({
        content: '开卡中',
    });
    app.log(params);

    try{
    my.call(app.plugin,
      {
        method: 'issueCard',
        param:params
      },
      function (result) {
          my.hideLoading({
            page:that,
          });
        if(result.resultCode==0){
          app.setCreatKeyi(5);
          app.log('开卡成功');

           that.get_keyi();
           if(that.data.flag=="00"||that.data.flag=="01"||that.data.flag=="02"){
            that.show_fail();
          }  


        }else if(result.resultCode==-9000){

          that.creat_card();


        }else{
          app.setCreatKeyi(4);

          if(that.data.flag=="00"||that.data.flag=="01"||that.data.flag=="02"){
            that.show_fail();
          } 

        }
  
  
      });

    }catch(e){
       my.hideLoading({
        page:that,
      });

    }

  },
  recharge_card(){

    var that=this;
    var pa={
      issuerID:app.issuer_Id,
      spID:app.spId,
      orderNo:'111'
    }
    var params= JSON.stringify(pa);
    app.log(params);
    my.showLoading({
        content: '充值中',
    });
    my.call(app.plugin,
    {
      method: 'rechargeCard',
      param:params
  },
  function (result) {
      my.hideLoading({
        page:that,
      });
  
     if(result.resultCode==0){
        app.setChargeKeyi(5);
        that.get_keyi();
        if(that.data.flag=="00"||that.data.flag=="01"||that.data.flag=="02"){
           that.show_fail();

        }


      }else if(result.resultCode==-9000){
        that.recharge_card();

      }else{
        app.setChargeKeyi(4);
        my.alert({
          title: '提示',
          content: '充值失败', 
          });
        if(that.data.flag=="00"||that.data.flag=="01"||that.data.flag=="02"){
           that.show_fail();

        }
      }
  });

  }, 
  show_fail(){
    if(this.data.type=="00000012"){
      my.navigateTo({
        url: '../../fail_result/fail_result?from=0', 
      });


    }else if(this.data.type=="00000013"){
      my.navigateTo({
        url: '../../fail_result/fail_result?from=1', 
      });

    }

  } 

});
