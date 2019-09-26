import AlipayLogger from './alipayLogger.js';
const monitor = AlipayLogger.init({
  // 替换成自定义监控监控项的token,每个监控项对应一个token

  //token: 'tha7iw65kd1gt8ujpefw0w=='
  token: 'mzkunt5hxacjg6xkpiwnia=='
});
export { monitor };
AlipayLogger.hookApi({
  // 替换成小程序API监控监控项的token
  //token: 'tha7iw65kd1gt8ujpefw0w==',
  token: 'mzkunt5hxacjg6xkpiwnia==',

  // 返回数据中状态码字段名称
  // code: ["code"],
  // 返回数据中的error message字段名称
  // msg: ["message"]
});