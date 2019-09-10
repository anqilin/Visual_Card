import util from '/util/huawei';
App({
  name:"my name is",
  SERVER_URL : "https://online.sptcc.com:8445/",

//	SERVER_URL : "https://online.sptcc.com:8443/",
  orderReq:{
    detail:"",// 商品详情：
	  body:"",// 商品描述：
	  total_fee:5000,// 总金额：即实际金额（第三方支付需要支付的金额） 单位分
	  phone:"",// 手机号：
	  Paytype:"0002",// 支付方式：0001:银联 0002：支付宝 0003：微信 0004：实名账户 0005：充值额

	  PAYFLAG:"0004",// 支付用途： 0001:卡片圈存 0002:账户充值 0003:购买充值额 0004:远程开卡 ;
	  TOTAMT:5000,// 总金额： 即订单金额（total_fee+积分、抵用券等） 单位分
	  CardNo:"",// 卡号：

	  CZNUM :0,// 充值额个数： 没有写0
	  CZID :"",// 充值额ID：
	  czamt: "0",// 充值券金额
	  DYNUM : 0,// 抵用券个数： 没有写0
	  DYID : "0",// 抵用券ID：
	  dyamt : "0",// 抵用券金额
	  INTERGRAL :0,// 抵用积分：
	  payPassWord:"",// 当账户支付时需要

	  bluetoothRechFlag : "",// 00 蓝牙沪通卡充值

	  virtual : 2000,//20元虚拟卡押金
  },
  orderResq:{
    payResult :"01",// 01: 成功; 02：失败
	  return_code:"",// 订单请求结果
	  result_code:"",// 业务处理结果
	  orderId:"", // 本地订单号
	  appid:"", // 应用APPID
	  partnerid:"", // 商家向财付通申请的商家id
	  prepayid:"", // 预支付订单(从后台获取)
	  appPackage:"", // 商家根据财付通文档填写的数据和签名
	  noncestr:"", // 随机串，防重发
	  timestamp:"", // 时间戳，防重发
	  sign:"", // 签名
	  qorderId:"",// 合并订单号
	  content:"",// 支付宝支付控件调用参数;银联调用控件内容
  },
  userInfo:{
    phone:"",
    token:"",
    buyId:"",
  },
  cplc:"",
  seid:"",
  model:"",
  cardno:"",
  logiccardno:"",
  balance:"0",
  cardInfo:{},
  issuer_Id:'t_fdw_sh_mot',
  spId:'APP-SH-SPTC',
  isDefault:false,
  systemInfo: {} ,// 手机基础信息
  plugin:'virtualServiceH5Plugin',
  isHasCard:false,
  

  onLaunch(options) {
    // 第一次打开
    // options.query == {number:1}
    console.info('App onLaunch');
        try {
      // 获取手机基础信息(头状态栏和标题栏高度)
       
      this.systemInfo=my.getSystemInfoSync();
    } catch (e) {
      console.log(e);
      my.alert({
        title: '温馨提示',
        content: 'onLoad 执行异常'
      });
    }
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}

  },
  getOrder(mCardno,mPayFlag){
    var url = this.SERVER_URL
					+ "handapp_app/OrderApplicationServlet?";
      
			this.orderReq.detail="SPTCC";
			if (mCardno==null||mCardno=="") {
				mCardno="1";
			}
			this.orderReq.body=mCardno;
			// double temp = Double.parseDouble(mAmount);
			// int nn = (int) (temp * 100);
			// orderReq.setTotal_fee(nn);// 调试阶段默认支付1分钱
			this.orderReq.Paytype="0002";
			this.orderReq.phone=this.userInfo.phone;
			this.orderReq.PAYFLAG=mPayFlag;
			// orderReq.setTOTAMT(Double.parseDouble(mAmount));
			this.orderReq.CardNo=mCardno;

			url=url+"detail=" + "SPTCC";
			url=url+"&body=" + mCardno;
			var str = this.orderReq.total_fee + "";
			if (this.SERVER_URL.includes("8445")) {
				// 测试统一支付2分钱
				str = "2";
			}
			url=url+"&sMoney=" + str;// 待支付金额:测试环境统一支付1分钱
													// PayOrderInfo.orderReq.getTotal_fee()
			url=url+"&payType=" + "0011";// 0001：银联 0002：支付宝
														// 0003：微信 0004:apple
														// pay
			url=url+"&phone=" + this.userInfo.phone;
			url=url+"&payFlag=" + mPayFlag;// 0001:卡片圈存 0002:账户充值
														// 0003:购买充值额 0004:远程开卡
			url=url+"&bMoney=" + this.orderReq.TOTAMT;// 即订单金额（total_fee+积分、抵用券等）
			url=url+"&cardNo=" + this.orderReq.CardNo;
			url=url+"&payPassWord=" + this.orderReq.payPassWord;

			url=url+"&CZNUM=" + this.orderReq.CZNUM;
			url=url+"&CZID=" + this.orderReq.CZID;
			url=url+"&DYNUM=" + this.orderReq.DYNUM;
			url=url+"&DYID=" + this.orderReq.DYID;
			url=url+"&interGral="
					+ this.orderReq.INTERGRAL;
			
			url=url+"&commToken=" + this.userInfo.token;
      url=url+"&note=" + "00"+";";
      url=url+"&Model="+"alipay";
      url=url+"&buyId="+this.userInfo.buyId;

      return url;
  },
  getCreatCardRequest(){
    	var url = this.SERVER_URL
					+ "handapp_app/AirCardServlet_Android?";


			url=url+"cardType=" + "4";
			url=url+"&Order=" + this.orderResq.orderId;

			url=url+"&orderId=" + this.orderResq.qorderId;


			url=url+"&payType=" + "0011";
			url=url+"&totleamt=" + this.orderReq.TOTAMT;

			url=url+"&payMoney=" + this.orderReq.total_fee;// 即订单金额（total_fee+积分、抵用券等）

      var money=this.orderReq.TOTAMT - this.orderReq.virtual
			url=url+"&money=" + money;

			url=url+"&payresult=" + "00";

			//dataBuilder.append("&seAuth=" + "123456");
			url=url+"&commToken=" + this.userInfo.token;
			url=url+"&cplc=" + this.cplc;
			url=url+"&accountHash=" + "01700001";
			url=url+"&phone="+this.userInfo.phone;

			url=url+"&SEID=" +this.seid;
      url=url+"&Model="+"FRD-AL10";
      

      return url;

  },
  getRechargeCardOrder(){
    			var url = this.SERVER_URL
					+ "handapp_app/RechargeServlet_Android?";

			url=url+"cardType=" + "4";
			url=url+"&Order=" + this.orderResq.orderId;
			url=url+"&orderId=" + this.orderResq.qorderId;

			url=url+"&payType=" + "0011";// 0001：银联 0002：支付宝
														// 0003：微信 0004:apple
														// pay
			url=url+"&totleamt=" + this.orderReq.TOTAMT;// 即订单金额（total_fee+积分、抵用券等）
			url=url+"&payMoney=" + this.orderReq.total_fee;// 即订单金额（total_fee+积分、抵用券等）
			url=url+"&money=" + this.orderReq.TOTAMT;// 即订单金额（total_fee+积分、抵用券等）
			url=url+"&commToken=" + this.userInfo.token;
			url=url+"&payresult=" + "00";
			url=url+"&appNo=" + this.logiccardno;//逻辑卡号
			url=url+"&accountHash=" + "01700001";//03000007:华为 03000004:小米
			url=url+"&phone="+this.userInfo.phone;
      url=url+"&Model="+"FRD-AL10";
      return url;



  },

  getGlobalUserInfo(){
    var userInfo= my.getStorageSync({
      key: 'globalUserInfo', // 缓存数据的key
    }).data;
    return userInfo;

  },
  setGlobalUserInfo(userInfo){
    my.setStorageSync({
      key: 'globalUserInfo', // 缓存数据的key
      data: userInfo, // 要缓存的数据
    });
  },
  setValue(data){
    my.setStorageSync({
      key: 'value', // 缓存数据的key
      data: data, // 要缓存的数据
    });
  },
  getValue(){
   var data= my.getStorageSync({
      key: 'value', // 缓存数据的key
    }).data;
    return data;
  },
  getCplc(){
     var data= my.getStorageSync({
      key: 'cplc', // 缓存数据的key
    }).data;
    return data;
  },
  setCplc(cplc){
    my.setStorageSync({
      key: 'cplc', // 缓存数据的key
      data: cplc, // 要缓存的数据
    });

  },
  getCreatCardFlag(){
     var data= my.getStorageSync({
      key: 'creatflag', // 缓存数据的key
    }).data;
    return data;
  },
  setCreatCardFlag(flag){
    my.setStorageSync({
      key: 'creatflag', // 缓存数据的key
      data: flag, // 要缓存的数据
    });

  },
  getHuaWeiSeid(){
    var cplc=this.getCplc();
    return cplc.substring(0, 4)+ cplc.substring(20, 36);
  },
  setAgreement(agree){
    my.setStorageSync({
      key: 'isagree', // 缓存数据的key
      data: agree, // 要缓存的数据
    });
  },
  getAgreement(){
    var data= my.getStorageSync({
      key: 'isagree', // 缓存数据的key
    }).data;
    return data;

  },

  setDeviceModel(model){
    my.setStorageSync({
      key: 'model', // 缓存数据的key
      data: model, // 要缓存的数据
    });
  },
  getDeviceModel(){
    var data= my.getStorageSync({
      key: 'model', // 缓存数据的key
    }).data;
    return data;
  },

  setDefaultFlag(flag){
    my.setStorageSync({
      key: 'flag', // 缓存数据的key
      data: flag, // 要缓存的数据
    });
  },
  getDefaultFlag(){
    var data= my.getStorageSync({
      key: 'flag', // 缓存数据的key
    }).data;
    return data;
  },

  setChargeKeyi(flag){
    my.setStorageSync({
      key: 'chargekeyi', // 缓存数据的key
      data: flag, // 要缓存的数据
    });
  },
  getChargeKeyi(){
    var data= my.getStorageSync({
      key: 'chargekeyi', // 缓存数据的key
    }).data;
    return data;
  },

  setCreatKeyi(flag){
    my.setStorageSync({
      key: 'creatkeyi', // 缓存数据的key
      data: flag, // 要缓存的数据
    });
  },
  getCreatKeyi(){
    var data= my.getStorageSync({
      key: 'creatkeyi', // 缓存数据的key
    }).data;
    return data;
  },
  getKeyiList(){
    var url = this.SERVER_URL
					+ "handapp_app/AccountSuspiciousServlet?";
    url=url+"cardNo=" + this.cardno;
    url=url+"&note=" + "";
    url=url+"&startNo=1";
    url=url+"&commToken=" + this.userInfo.token;
    url=url+"&phone="+this.userInfo.phone;
    return url;

  },
  searchCardStatus(orderid){
    var url = this.SERVER_URL
					+ "handapp_app/SearchOrderStateServlet_Android?";
    url=url+"cardType=" + "1";
    url=url+"&orderId="+orderid;
    url=url+"&commToken=" + this.userInfo.token;
    url=url+"&phone="+this.userInfo.phone;
    return url;

  },
  creditRefund(orderid,money){
    var url = this.SERVER_URL
					+ "handapp_app/CancelCreditOrder?";

    url=url+"orderId="+orderid;
    url=url+"paytype="+"0011";
    url=url+"money="+money;
    url=url+"&commToken=" + this.userInfo.token;
    url=url+"&phone="+this.userInfo.phone;
    return url;

  },
  log(data){
    if (this.SERVER_URL.includes("8445")) {
				console.log(data);
			}

  }




});
