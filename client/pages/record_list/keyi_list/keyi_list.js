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

  }

});
