// 给元素添加类
export function addClass(el, newClassName) {
  if (hasClass(el, newClassName)) {
    return;
  }
  let classList = el.className; // 获取到的是字符串
  let classArr = classList.split(''); // 将字符串变为数组
  classArr.push(newClassName);
  el.className = classArr.join(''); // 将数组变为字符串后赋值给el
}

// 判断当前的DOM的是否已经有了我们要添加的class
export function hasClass(el, newClassName) {
  let reg = new RegExp('(^|\\s)' + newClassName + '(\\s|$)');
  return reg.test(el.newClassName);
}

// 获取或者设置元素的自定义属性，如果有val就是设置
export function getData(el, name, val) {
  const prefix = 'data-';
  name = prefix + name;
  if (val) {
    return el.setAttribute(name, val);
  } else {
    return el.getAttribute(name);
  }
}

// 对js操作transfrom进行封装
let elementStyle = document.createElement('div').style;

// 供应商对应的不同属性
let vendor = (() => {
  let transformsName = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  };

  for (let key in transformsName) {
    if (elementStyle[transformsName[key]] !== undefined) {
      return key;
    }
  }

  return false;
})();

export function profixStyle(style) {
  if (vendor === false) {
    return false;
  }
  if (vendor === 'standard') {
    return style;
  }
  return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}
