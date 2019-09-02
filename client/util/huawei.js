var a="hahahah"
function test(str) {
  mytest(str);
}

function mytest(str){
  console.log(str);
}
function testPromise(){
  var result=0;
 
  var example=new Promise((resolve, reject)=>{
    let i = 4;
    result=i;
    //return resolve(onFulfilled(result));
    });

  return result;

}
 function get_return(){
  var x= testPromise();
  console.log(x);
  return x;
}

function callAPI (method, param = {}) {
  return new Promise((resolve, reject) => {
    my.call('seNFCService', {
      method,
      param: JSON.stringify(param)
    }, function (res) {
      // -9000: 服务绑定中，需要重新调用
      if (res.resultCode === -9000) {
        setTimeout(() => {
          callAPI(method, param)
          .then(res => resolve(res))
          .catch(res => reject(res));
        }, 100);
        return;
      }
      // 0: 调用成功
      if (res.resultCode === 0) {
        //return resolve(typeof res.data === 'string' ? JSON.parse(res.data) : res.data);
        return resolve(typeof res === 'string' ? JSON.parse(res) : res);
      }
      // 调用失败
      //reject(res.resultCode);
      reject(typeof res === 'string' ? JSON.parse(res) : res);
    })
  });

}

//获取卡信息
  function readCardInfo(){
    //console.log("开始调用卡信息");
    callAPI('readCardInfo', {
      issuerID: 'issueID_12345',
      dataItems: 7
    })
    .then(res => {
         console.log(res);
         return res;
         /*
          {
            isDefault: true,        // 是否为默认卡
            cardNo: '0001',         // 卡面号
            balance: 200,           // 余额，单位（元）
            validity: '2018/01/02', // 有效期
            logicCardNo: '32323'    // 逻辑卡号
          }
            */
    }).catch(res => {
        console.log(res);
        return res;
    });

  };
  function getCardRecords(){
      callAPI('readCardRecords', {
        issuerID: 'issueID_12345'
      })
      .then(res => {
        return res;
            /*
              {
                 records: [
                  {
                    transType: '10',            // 交易类型 10-充值, 11-消费
                     transAmount: '20',          // 交易金额，单位（元）
                    transDate: '20190401120001' // 交易时间
                    }
                 ]
               }
          */
        }).catch(res => {
          return res;
        });
  }

  function rechangeCard(orderNo){
    callAPI('rechargeCard', {
      issuerID: 'issueID_12345',
      spID: 'APP-ALIPAY',
      orderNo: orderNo
      })
    .then(() => {
      return 0;
      // 走到这里即代表成功，无返回
    }).catch(() => {
      return -1;
    });

  }
  function getVirtualServiceVersion(){
    callAPI('getVirtualServiceVersion', {
      packageName: 'com.huawei.wallet'
    })
    .then(res => {
      // {virtualServiceVersion: '80111300'}
      return res;
    }).catch(res => {
      return res;

    });
  }

function getCplc(){
  callAPI('getCplc')
    .then(res => {
     // {cplc: '479044204700DA3E01005177009677935170481000000051000004343AC3593380010000000000000000'}
      return res;
     }).catch(res => {
       return res;
     });
}

function getDeviceInfo(){
  callAPI('getDeviceInfo')
    .then(res => {
    /*
       {
          deviceVendor: 'HUAWEI',     // 品牌
          deviceModel: 'TNY-AL00',    // 型号
          mobileVersion: '9.0.0.182(COOE180R1P19)GPU Turbo', // 手机版本
           deviceID: '863957042875325' // 设备唯一ID
        }
        */
       return res;
  }).catch(res => {
      return res;
  });
}

function getDefaultCard(){
  callAPI('getDefaultCard', {
  issuerIDs: 'issueID_12345,issueID_67890'
    })
  .then(res => {
   // {defaultIssuerID: 'issueID_12345'} // 默认卡的 issuerID
    console.log(res);
    return res;
  }).catch(res =>{
    console.log(res);
    return res;
    
  });
}
function startDefault(){
  callAPI('startDefault', {
  issuerID: 'issueID_12345',
  spID: 'APP-ALIPAY'
  })
  .then(() => {
  // 走到这里即代表成功，无返回
    return 0;
  }).catch(() => {
    return -1;
  });
}

function checkIssueCondition(){
  callAPI('checkIssueCondition', {
    issuerID: '123'
  })
  .then(() => {
  // 走到这里即代表成功，无返回
    return 0;
  }).catch(() =>{
    return -1;
  });
}

function issueCard(orderNo){
  callAPI('issueCard', {
    issuerID: 'issueID_12345',
    spID: 'APP-ALIPAY',
    orderNo: orderNo
  })
  .then(() => {
  // 走到这里即代表成功，无返回
    return 0;
  }).catch(() => {
    return -1;
  });
}

function checkRechargeCondition(){
  callAPI('checkRechargeCondition', {
    issuerID: 'issueID_12345',
  })
  .then(() => {
    return 0;
  }).catch(() =>{
    return -1;
  });

}
function showAuthenticDialog(){
  callAPI('showAuthenticDialog')
  .then(() => {
    return 0;
  }).catch(() =>{
    return -1;
  });

}
function getHttpData(url){
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {
        
        console.log('resp data', resp.data); 
        return resp.data;
      },
      fail: (err) => {
        console.log('error', err);
      },
    });

  }


  module.exports = {
  
  test: test,
  readCardInfo:readCardInfo,
  getCardRecords:getCardRecords,
  rechangeCard:rechangeCard,
  getVirtualServiceVersion:getVirtualServiceVersion,
  getCplc:getCplc,
  getDeviceInfo:getDeviceInfo,
  getDefaultCard:getDefaultCard,
  startDefault:startDefault,
  checkIssueCondition:checkIssueCondition,
  issueCard:issueCard,
  checkRechargeCondition:checkRechargeCondition,
  getHttpData:getHttpData,
  testPromise:testPromise,
  get_return:get_return,

}
  