
App({
  name: "my name is",
//  SERVER_URL: "https://online.sptcc.com:8445/",

  SERVER_URL : "https://online.sptcc.com:8443/",
  ant_bind:"https://render.alipay.com/p/c/k76guhcy/1582871152196.html?cardType=N1310100&cardNo=",
  ant_unbind:"https://render.alipay.com/p/c/k76guhcy/1582871169913.html?cardType=N1310100&cardNo=",
  orderReq: {
    detail: "",// 商品详情：
    body: "",// 商品描述：
    total_fee: 5000,// 总金额：即实际金额（第三方支付需要支付的金额） 单位分
    phone: "",// 手机号：
    Paytype: "0002",// 支付方式：0001:银联 0002：支付宝 0003：微信 0004：实名账户 0005：充值额

    PAYFLAG: "0004",// 支付用途： 0001:卡片圈存 0002:账户充值 0003:购买充值额 0004:远程开卡 ;
    TOTAMT: 5000,// 总金额： 即订单金额（total_fee+积分、抵用券等） 单位分
    CardNo: "",// 卡号：

    CZNUM: 0,// 充值额个数： 没有写0
    CZID: "",// 充值额ID：
    czamt: "0",// 充值券金额
    DYNUM: 0,// 抵用券个数： 没有写0
    DYID: "0",// 抵用券ID：
    dyamt: "0",// 抵用券金额
    INTERGRAL: 0,// 抵用积分：
    payPassWord: "",// 当账户支付时需要

    bluetoothRechFlag: "",// 00 蓝牙沪通卡充值

    virtual: 0,//20元虚拟卡押金
  },
  orderResq: {
    payResult: "01",// 01: 成功; 02：失败
    return_code: "",// 订单请求结果
    result_code: "",// 业务处理结果
    orderId: "", // 本地订单号
    appid: "", // 应用APPID
    partnerid: "", // 商家向财付通申请的商家id
    prepayid: "", // 预支付订单(从后台获取)
    appPackage: "", // 商家根据财付通文档填写的数据和签名
    noncestr: "", // 随机串，防重发
    timestamp: "", // 时间戳，防重发
    sign: "", // 签名
    qorderId: "",// 合并订单号
    content: "",// 支付宝支付控件调用参数;银联调用控件内容
  },
  userInfo: {
    phone: "",
    token: "",
    buyId: "",
  },
  cplc: "",
  seid: "",
  model: "",
  cardno: "",
  logiccardno: "",
  balance: "0",
  cardInfo: {},
  issuer_Id: 't_fdw_sh_mot',
  moc_issuer_Id: 't_fdw_shanghai',
  moc_maiduan_issuer_Id: 't_sh_01',
  spId: 'APP-ALIPAY',
  isDefault: false,
  systemInfo: {},// 手机基础信息
  plugin: 'virtualServiceH5PluginIsv',
  isHasCard: false,
  innerId: "",
  devicemodel: "",
  hasf0: false,
  bussiness_id: "",

  moc_cardno:"",
  moc_logiccardno: "",
  moc_balance: "0",
  moc_innerId: "",
  moc_cardInfo: {},
  isHasmocCard:false,

  moc_old_cardno:"",
  moc_old_logiccardno: "",
  moc_old_balance: "0",
  moc_old_innerId: "",
  moc_old_cardInfo: {},



  onLaunch(options) {
    // 第一次打开
    // options.query == {number:1}
    console.info('App onLaunch');
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)

      this.systemInfo = my.getSystemInfoSync();
      //this.log(this.systemInfo)
      this.log("systeminfo:"+this.systemInfo.brand+this.systemInfo.model);
      this.log(this.systemInfo.model.substring(6).trim())
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
  getOrder(mCardno, mPayFlag) {
    var url = this.SERVER_URL
      + "handapp_app/OrderApplicationServlet?";
    var body=mCardno;
    this.orderReq.detail = "SPTCC";
    if (mCardno == null || mCardno == "") {
      mCardno = "1";
      body="Add Card";
    }
    this.orderReq.body = mCardno;
    // double temp = Double.parseDouble(mAmount);
    // int nn = (int) (temp * 100);
    // orderReq.setTotal_fee(nn);// 调试阶段默认支付1分钱
    this.orderReq.Paytype = "0011";
    this.orderReq.phone = this.userInfo.phone;
    this.orderReq.PAYFLAG = mPayFlag;
    // orderReq.setTOTAMT(Double.parseDouble(mAmount));
    this.orderReq.CardNo = mCardno;

    url = url + "detail=" + "SPTCC";
    url = url + "&body=" + body;
    var str = this.orderReq.total_fee + "";
    if (this.SERVER_URL.includes("8445")) {
      // 测试统一支付2分钱
      str = "2";
    }
    url = url + "&sMoney=" + str;// 待支付金额:测试环境统一支付1分钱
    // PayOrderInfo.orderReq.getTotal_fee()
    url = url + "&payType=" + "0011";// 0001：银联 0002：支付宝
    // 0003：微信 0004:apple
    // pay
    url = url + "&phone=" + this.userInfo.phone;
    url = url + "&payFlag=" + mPayFlag;// 0001:卡片圈存 0002:账户充值
    // 0003:购买充值额 0004:远程开卡
    url = url + "&bMoney=" + this.orderReq.TOTAMT;// 即订单金额（total_fee+积分、抵用券等）
    url = url + "&cardNo=" + this.orderReq.CardNo;
    url = url + "&payPassWord=" + this.orderReq.payPassWord;

    url = url + "&CZNUM=" + this.orderReq.CZNUM;
    url = url + "&CZID=" + this.orderReq.CZID;
    url = url + "&DYNUM=" + this.orderReq.DYNUM;
    url = url + "&DYID=" + this.orderReq.DYID;
    url = url + "&interGral="
      + this.orderReq.INTERGRAL;

    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&note=" + "00" + ";";
    url = url + "&Model=" + "alipay";
    url = url + "&buyId=" + this.userInfo.buyId;

    return url;
  },
  getCreatCardRequest() {
    var url = this.SERVER_URL
      + "handapp_app/AirCardServlet_Android?";


    url = url + "cardType=" + "4";
    url = url + "&Order=" + this.orderResq.orderId;

    url = url + "&orderId=" + this.orderResq.qorderId;


    url = url + "&payType=" + "0011";
    url = url + "&totleamt=" + this.orderReq.TOTAMT;

    url = url + "&payMoney=" + this.orderReq.total_fee;// 即订单金额（total_fee+积分、抵用券等）

    var money = this.orderReq.TOTAMT - this.orderReq.virtual
    url = url + "&money=" + money;

    url = url + "&payresult=" + "00";

    //dataBuilder.append("&seAuth=" + "123456");
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&cplc=" + this.cplc;
    url = url + "&accountHash=" + "01700001";
    url = url + "&phone=" + this.userInfo.phone;

    url = url + "&SEID=" + this.seid;
    if(this.devicemodel==null||this.devicemodel==undefined||this.devicemodel==""){
      this.devicemodel=this.getDeviceModel();
    }
    url = url + "&Model=" + this.devicemodel;
    url = url + "&bizPortal=" + "APP-ALIPAY";
    url = url + "&appver=130";

    return url;

  },
  getRechargeCardOrder(type) {
    var url = this.SERVER_URL
      + "handapp_app/RechargeServlet_Android?";

    url = url + "cardType=" + "1";
    url = url + "&Order=" + this.orderResq.orderId;
    url = url + "&orderId=" + this.orderResq.qorderId;

    url = url + "&payType=" + "0011";// 0001：银联 0002：支付宝
    // 0003：微信 0004:apple
    // pay
    url = url + "&totleamt=" + this.orderReq.TOTAMT;// 即订单金额（total_fee+积分、抵用券等）
    url = url + "&payMoney=" + this.orderReq.total_fee;// 即订单金额（total_fee+积分、抵用券等）
    url = url + "&money=" + this.orderReq.TOTAMT;// 即订单金额（total_fee+积分、抵用券等）
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&payresult=" + "00";
    if(type==1){
      url = url + "&appNo=" + this.logiccardno;//逻辑卡号
    }else if(type==2){
       url = url + "&appNo=" + this.moc_logiccardno;//逻辑卡号
    }
    
    url = url + "&accountHash=" + "01700001";//03000007:华为 03000004:小米
    url = url + "&phone=" + this.userInfo.phone;
    if(this.devicemodel==null||this.devicemodel==undefined||this.devicemodel==""){
      this.devicemodel=this.getDeviceModel();
    }
    url = url + "&Model=" + this.devicemodel;
    url = url + "&appver=130";
    return url;



  },

  getGlobalUserInfo() {
    var userInfo = my.getStorageSync({
      key: 'globalUserInfo', // 缓存数据的key
    }).data;
    return userInfo;

  },
  setGlobalUserInfo(userInfo) {
    my.setStorageSync({
      key: 'globalUserInfo', // 缓存数据的key
      data: userInfo, // 要缓存的数据
    });
  },
  setValue(data) {
    my.setStorageSync({
      key: 'value', // 缓存数据的key
      data: data, // 要缓存的数据
    });
  },
  getValue() {
    var data = my.getStorageSync({
      key: 'value', // 缓存数据的key
    }).data;
    return data;
  },
  getCplc() {
    var data = my.getStorageSync({
      key: 'cplc', // 缓存数据的key
    }).data;
    return data;
  },
  setCplc(cplc) {
    my.setStorageSync({
      key: 'cplc', // 缓存数据的key
      data: cplc, // 要缓存的数据
    });

  },

  getBussinessId() {
    var data = my.getStorageSync({
      key: 'bussinessid', // 缓存数据的key
    }).data;
    return data;
  },
  setBussinessId(bussinessid) {
    my.setStorageSync({
      key: 'bussinessid', // 缓存数据的key
      data: bussinessid, // 要缓存的数据
    });

  },
  getCreatCardFlag() {
    var data = my.getStorageSync({
      key: 'creatflag', // 缓存数据的key
    }).data;
    return data;
  },
  setCreatCardFlag(flag) {
    my.setStorageSync({
      key: 'creatflag', // 缓存数据的key
      data: flag, // 要缓存的数据
    });

  },
  getHuaWeiSeid() {
    var cplc = this.getCplc();
    return cplc.substring(0, 4) + cplc.substring(20, 36);
  },
  setAgreement(agree) {
    my.setStorageSync({
      key: 'isagree', // 缓存数据的key
      data: agree, // 要缓存的数据
    });
  },
  getAgreement() {
    var data = my.getStorageSync({
      key: 'isagree', // 缓存数据的key
    }).data;
    return data;

  },

  setDeviceModel(model) {
    my.setStorageSync({
      key: 'model', // 缓存数据的key
      data: model, // 要缓存的数据
    });
  },
  getDeviceModel() {
    var data = my.getStorageSync({
      key: 'model', // 缓存数据的key
    }).data;
    return data;
  },

  setDefaultFlag(flag) {
    my.setStorageSync({
      key: 'flag', // 缓存数据的key
      data: flag, // 要缓存的数据
    });
  },
  getDefaultFlag() {
    var data = my.getStorageSync({
      key: 'flag', // 缓存数据的key
    }).data;
    return data;
  },

  setChargeKeyi(flag) {
    my.setStorageSync({
      key: 'chargekeyi', // 缓存数据的key
      data: flag, // 要缓存的数据
    });
  },
  getChargeKeyi() {
    var data = my.getStorageSync({
      key: 'chargekeyi', // 缓存数据的key
    }).data;
    return data;
  },

  setMocChargeKeyi(flag) {
    my.setStorageSync({
      key: 'moc_chargekeyi', // 缓存数据的key
      data: flag, // 要缓存的数据
    });
  },
  getMocChargeKeyi() {
    var data = my.getStorageSync({
      key: 'moc_chargekeyi', // 缓存数据的key
    }).data;
    return data;
  },

  setCreatKeyi(flag) {
    my.setStorageSync({
      key: 'creatkeyi', // 缓存数据的key
      data: flag, // 要缓存的数据
    });
  },
  setMocCreatKeyi(flag) {
    my.setStorageSync({
      key: 'moc_creatkeyi', // 缓存数据的key
      data: flag, // 要缓存的数据
    });
  },
  getCardTypeFlag(){
    var data = my.getStorageSync({
      key: 'cardtypeflag', // 缓存数据的key
    }).data;
    return data;

  },
 setCardTypeFlag(typefalg){
    my.setStorageSync({
      key: 'cardtypeflag', // 缓存数据的key
      data: typefalg, // 要缓存的数据
    });

  },

  getCreatKeyi() {
    var data = my.getStorageSync({
      key: 'creatkeyi', // 缓存数据的key
    }).data;
    return data;
  },
  getMocCreatKeyi() {
    var data = my.getStorageSync({
      key: 'moc_creatkeyi', // 缓存数据的key
    }).data;
    return data;
  },
  getKeyiList() {
    var url = this.SERVER_URL
      + "handapp_app/AccountSuspiciousServlet?";

    url = url + "note=" + "";
    url = url + "&startNo=1";
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&phone=" + this.userInfo.phone;
    return url;

  },
  searchCardStatus(orderid) {
    var url = this.SERVER_URL
      + "handapp_app/SearchOrderStateServlet_Android?";
    url = url + "cardType=" + "1";
    url = url + "&orderId=" + orderid;
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&phone=" + this.userInfo.phone;
    return url;

  },
  creditRefund(orderid, money) {
    var url = this.SERVER_URL
      + "handapp_app/CancelCreditOrder?";

    url = url + "orderId=" + orderid;
    url = url + "&paytype=" + "0011";
    url = url + "&money=" + money;
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&phone=" + this.userInfo.phone;
    return url;

  },
  revokeAirCard(){
    var url = this.SERVER_URL
      + "handapp_app/RevokeAirCardServlet_Android?";
    url=url+"cardType=1";
    url = url + "&orderId=" + this.orderResq.orderId;
    url = url +"&accountHash=03000007";
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&phone=" + this.userInfo.phone;
    return url;


  },
  AntSearch(cardno){
    var url = this.SERVER_URL
      + "handapp_app/AntSearch?";
    url=url+"flag=0002";
    url=url+"&UID="+this.userInfo.buyId;
    url=url+"&cardNo="+cardno;
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&phone=" + this.userInfo.phone;
    return url;

  },
  AntBind(cardno,flag){
    var url = this.SERVER_URL
      + "handapp_app/AntBinding?";
    url=url+"flag=0002";
    url=url+"&UID="+this.userInfo.buyId;
    url=url+"&cardNo="+cardno;
    url=url+"&bindingFlag="+flag
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&phone=" + this.userInfo.phone;
    return url;

  },
  get_deposit(cardno){
    var url = this.SERVER_URL
      + "handapp_app/VerificationHubbleCardServlet?";
    url=url+"cardNo="+cardno;
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&phone=" + this.userInfo.phone;
    return url;

  },
  get_skin(cardno){
    var url = this.SERVER_URL
      + "handapp_app/SkinSearch?";
    url=url+"cardNo="+cardno;
    url = url + "&commToken=" + this.userInfo.token;
    url = url + "&phone=" + this.userInfo.phone;
    return url;
  },
  log(data) {
    console.log(data);
    if (this.SERVER_URL.includes("8445")) {

    }

  },
  OuterIdToInnerId(OuterId) {
    var InnerId = null;

    if (OuterId.length == 11) {
      try {

        InnerId = OuterId.substring(9, 11);
        InnerId += OuterId.substring(7, 9);
        InnerId += OuterId.substring(5, 7);
        InnerId += OuterId.substring(3, 5);
        InnerId += OuterId.substring(1, 3);

      } catch (e) {
        console.log(e);
      }

      return InnerId;
    } else {
      return OuterId;
    }
  },
  get_error_msg(code){
    var msg='';
    if(code==10001){
      msg="系统繁忙请稍后再试";
    }else if(code==10002){
      msg="网络不可用请确保连接上网络后重试"
    }else if(code==10003){
      msg="NFC开关未打开请前往系统设置打开后重试"
    }else if(code==10004){
      msg="华为钱包系统异常请稍后再试"
    }else if(code==10005){
      msg="请开启华为钱包的电话权限"
    }else if(code==10006){
      msg="请在华为钱包中登录华为账号"
    }else if(code==10007){
      msg="当前手机机型不支持"
    }else if(code==10008){
      msg="华为钱包系统异常请稍后再试"
    }else if(code==10009){
      msg="暂不支持该类型卡片操作"
    }else if(code==10010){
      msg="请在NFC设置中将默认付款应用切换成华为钱包"
    }else if(code==10099){
      msg="华为钱包系统异常请稍后再试"
    }else if(code==10101){
      msg="当前手机机型不支持"
    }else if(code==10204){
      msg="请确保当前手机系统登录的账号为领卡时的手机账号"
    }else if(code==10301){
      msg="华为开卡服务暂不可用请稍后再试"
    }else if(code==10302){
      msg="华为充值服务暂不可用请稍后再试"
    }else if(code==10401){
      msg="当前华为系统ROM不支持请检查并升级ROM版本"
    }else if(code==10402){
      msg="华为钱包版本过低请先升级华为钱包应用"
    }else if(code==10403){
      msg="当前手机机型不支持"      
    }else if(code==10404){
      msg="当前手机开通卡片数量已达上限"
    }else if(code==10405){
      msg="当前手机开通交通卡数量已达上限"
    }else if(code==10406){
      msg="卡片已经存在"
    }else if(code==10407){
      msg="卡片正在开通中"
    }else if(code==10408){
      msg="卡片对应的旧卡已存在"
    }else if(code==10502){
      msg="卡片在外部应用操作流程中请稍后再试"
    }else if(code==10601){
      msg="华为充值服务异常请稍后再试"
    }else if(code==10602){
      msg="当前登录的华为账号不是开卡时的账号请切换登录账号"
    }else if(code==10702){
      msg="当前登录的华为账号不是开卡时的账号请切换登录账号"
    }else if(code==10801){
      msg="卡片未开通成功不支持设置默认卡"
    }else if(code==10802){
      msg="卡片目前已设置默认卡"
    }else if(code==10803){
      msg="当前登录的华为账号不是开卡时的账号请切换登录账号"
    }else if(code==10805){
      msg="设置默认卡失败"
    }else if(code==10901){
      msg="卡片未开通"
    }else if(code==-9999){
      msg="当前手机机型不支持"
    }else if(code==-9001){
      msg="手机没有安装华为钱包"
    }else if(code==-9002){
      msg="当前手机机型不支持"
    }else if(code==-9004){
      msg="NFC开关未打开请前往系统设置打开后重试"
    }else{
      msg="系统繁忙请稍后再试"
    }
    return msg;

  },
  check_phone_type(brand,model){
    var phone = ["ANA-AL00", "ANA-AN00", "ANA-TN00", "ELS-AN00","ELS-TN00", "ELS-AN10", "ELS-TN10", "WLZ-AL10",
    "WLZ-AN00", "OXF-AN00", "OXF-AN10", "ELE-AL00","ELE-TL00", "VOG-AL00", "VOG-AL10", "VOG-TL00",
    "TAS-AL00", "TAS-TL00", "TAS-AN00", "TAS-TN00","LIO-AL00", "LIO-TL00", "LIO-AN00", "LIO-TN00",
    "LIO-AN00P", "TAH-AN00", "HMA-AL00", "HMA-TL00","LYA-AL00", "LYA-AL10", "LYA-TL00", "LYA-AL00P",
    "EVR-AL00", "EVR-TL00", "EVR-AN00", "SEA-AL10","SEA-TL10", "PCT-AL10", "PCT-TL10", "YAL-AL00",
    "YAL-TL00", "YAL-AL10", "YAL-TL10", "TNY-AL00","TNY-TL00"];
    if(brand!="HUAWEI"){
      return false;
    }
    var my_model=model.substring(6).trim()
    if(phone.indexOf(my_model)!=-1){
      this.log(phone.indexOf(my_model));
      return true
    }else{
      return false;
    }

  }




});
