const app= getApp();
Page({
  data: {},
  onLoad() {
    this.get_keyi();

  },
  get_keyi(){
    var url=app.getKeyiList();
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {        
        console.log('resp data', resp.data);
        
        if(resp.data.return_code=="success"){
          console.log("查询成功");
         
        }else{
          console.log("查询失败");
        }


        
      },
      fail: (err) => {
        console.log('error', err);

      },

    });

  },
  re_writecard(){
    var that=this;
    var url=app.searchCardStatus();
    var taskStatusMsg="";
    var flag;
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {        
        console.log('resp data', resp.data);
        
        if(resp.data!=null&&resp.data.resCode=="9000"){
          if(resp.data.taskStatus){
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
							}else if (taskStatus=="3") {
								taskStatusMsg = "订单已失败";
							}else if (taskStatus=="4") {
								taskStatusMsg = "订单取消中";
								that.doRetry();
							}else if (taskStatus=="5") {
								taskStatusMsg = "订单已取消";
							}else{
								taskStatusMsg = "状态["+taskStatus+"]";
								that.doRetry();
							}

          }
          if(resp.data.flag){
						flag=resp.data.flag;
            if ("00".equals(flag)) {
			/*	00: 我们已帮你进行了退款，请关于钱包余额变化
				01: 退款发生错误，请联系我们的客服
				02: 请耐心等待*/

              my.alert({
                title: '提示' ,
                content:'您的资金将在7个工作日内退还支付账户，退款到账时间以各银行实际到账时间为准',
              });
			      } else if("01".equals(flag)) {

                my.alert({
                  title: '提示' ,
                  content:'退款发生错误，请联系我们的客服',
                });
		        	}else if ("02".equals(flag)) {

                  my.alert({
                    title: '提示' ,
                    content:'请耐心等待',
                  });

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
          console.log("查询成功");
         
        }else{
          console.log("查询失败");
        }


        
      },
      fail: (err) => {
        console.log('error', err);
        my.alert({
          title: '' ,
          content:'获取数据失败'
        });

      },

    });

  },
  doRetry(){


  }

});
