// 引入原始的jsonp
import originJSONP from 'jsonp';

// 对原始的jsonp封装后输出(可以单独使用data，利用函数将data和url拼接，因为元素的jsonp是不支持单独传data的)
export default function jsonp(url, data, option) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data); // 如果url已经带参数，直接用&往后接参数，否知是用？连接
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
};

function param(data) {
  let url = '';
  for (let i in data) {
    let val = data[i] !== undefined ? data[i] : '';
    url += `&${i}=${encodeURIComponent(val)}`;
  }
  return url ? url.substring(1) : ''; // 如果url不为空的话，传出url，但是我们会将第一个&去掉，换为？号;
}
