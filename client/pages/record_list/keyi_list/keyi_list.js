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
    var url=app.searchCardStatus();
    var taskStatusMsg="";
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
								doRetry();
							} else if(taskStatus=="1") {
								taskStatusMsg = "正在执行";
								doRetry();
							}else if (taskStatus=="2") {
								taskStatusMsg = "订单已完成";
							}else if (taskStatus=="3") {
								taskStatusMsg = "订单已失败";
							}else if (taskStatus=="4") {
								taskStatusMsg = "订单取消中";
								doRetry();
							}else if (taskStatus=="5") {
								taskStatusMsg = "订单已取消";
							}else{
								taskStatusMsg = "状态["+taskStatus+"]";
								doRetry();
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

  }

});
