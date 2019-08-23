Page({
  data: {},
  onLoad() {},
  onGetAuthorize(res) {
     my.getOpenUserInfo({
      fail: (res) => {
      },
      success: (res) => {
        let userInfo = JSON.parse(res.response).response // 以下方的报文格式解析两层 response
         console.log(userInfo);
      }
    });
    },
});
