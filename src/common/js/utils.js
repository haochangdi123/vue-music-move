// 洗牌算法   就是将数据打乱
// 就是讲随机的数据交换
export function shuffle(arr) {
  let newArr = arr;
  for (let i = 0; i < newArr.length; i++) {
    let j = _getRandomInt(0, i);
    let t = newArr[i];
    newArr[i] = newArr[j];
    newArr[j] = t;
  }
  return newArr;
}

// 返回min到max中间的数字(包括min和max)
function _getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
