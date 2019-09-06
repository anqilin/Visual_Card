const app= getApp();
Page({
  data: {
    record_list:[
      {
        transType:"11",
        transDate:"2019-08-02 07:42:55",
        transAmount:"-3.00元"
      }
    ]
  },
  onLoad() {},
  onShow(){

    this.data.record_list=app.cardInfo.transRecords;
    
    app.log(this.data.record_list);
    for(var i=0;i<this.data.record_list.length;i++){
      var year=this.data.record_list[i].transDate.substring(0,4);
      var month=this.data.record_list[i].transDate.substring(4,6);
      var day=this.data.record_list[i].transDate.substring(6,8);
      var h=this.data.record_list[i].transDate.substring(8,10);
      var min=this.data.record_list[i].transDate.substring(10,12);
      var sec=this.data.record_list[i].transDate.substring(12,14);
      var time=year+"-"+month+"-"+day+" "+h+":"+min+":"+sec;
      this.data.record_list[i].transDate=time;

    }


  },
});
