import absolute from '/util/huawei';
Page({
  data: {
    systemInfo: {}
  },
    onLoad(options) {
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)
      let systemInfo = my.getSystemInfoSync();
      this.setData({ systemInfo });
    } catch (e) {
      console.log(e);
      my.alert({
        title: '温馨提示',
        content: 'onLoad 执行异常'
      });
    }
     my.hideFavoriteMenu();

  },
});