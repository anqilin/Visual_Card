const app= getApp();
Page({
  data: {
    record_list:[
      {
        transType:"11",
        transDate:"2019-08-02 07:42:55",
        transAmount:"-3.00元"
      }
    ],
    show_warn:true,
    card_type:1
  },
  onLoad(options) {
    var that=this;
    if(options.card_type==1){

      that.data.card_type=1;
    }else if(options.card_type==2){

      that.data.card_type=2;
    }
  },
  onShow(){
    this.setData({
      show_warn:true
    })
    if(this.data.card_type==1){
      this.data.record_list=app.cardInfo.transRecords; 
    }else if(this.data.card_type==2){
      this.data.record_list=app.moc_cardInfo.transRecords; 
    }
   
    
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
  close_warn(){
    this.setData({
      show_warn:false
    })
  }
});
