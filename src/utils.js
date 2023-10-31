// 静态方法
const strats = {};
const LIFECYCLE = ["beforeCreate", "created"];
LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    if (c) {
      if (p) {
        return p.concat(c);
      } else {
        return [c]; //儿子有父亲没有
      }
    } else {
      return p; //如果儿子没有则用父亲即可
    }
  };
});

strats.components = function(parentVal, childVal){
  const res = Object.create(parentVal);
  
  if(childVal){
    for(let key in childVal){      
      // 返回的是构造的对象 可以拿到富强原型上的属性，并且将儿子的都拷贝到自己身上
      res[key] = childVal[key];
    }
  }

  return res;
}

export function mergeOptions(parent, child) {
  // console.log("parent: ",parent);
  const options = {};

  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    // 策略模式，目的是减少if / else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      // 如果不在策略中
      options[key] = child[key] || parent[key]; // 优先采用儿子
    }
  }  
  // debugger
  return options;
}
