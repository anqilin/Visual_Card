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
    this.data.record_list=app.cardInfo.records;


  },
});
