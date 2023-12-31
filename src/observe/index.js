import {newArrayproto} from './array'
import {Dep} from './dep'

class Observe{
    constructor(data){
        this.dep = new Dep();//所有对象也增加dep
        // Object.defineProperty只能劫持已经存在的属性，vue2的$set就是为后加的属性添加响应式

        // data.__ob__ = this //给data加上walk observeArray方法，array.js要使用以给新数据加上数据监测
        // data.__ob__ = this;会发生死循环，__ob__会被当做walk的key,defineReactive
        // 中调用observe，再次return new Observe(data)，又加上data.__proto__ = newArrayproto;
        // 再次执行walk,陷入死循环，所以修改该属性为不可枚举即可解决
        Object.defineProperties(data,{
            ['__ob__']: 
            {
                value: this,
                enumerable: false
            }
        })

        // 不能给数组中的每个基本数据类型加上响应式，但是引用数据类型要加上响应式
        if(Array.isArray(data)){
            data.__proto__ = newArrayproto
            // 这里我们要重新重写数组的7个方法，但同时保留其他的方法
            this.observeArray(data)
        } else{
            this.walk(data) 
        }              
    }
    walk(data){
        // 重新定义属性  性能不太行
        Object.keys(data).forEach(key => defineReactive(data,key,data[key]))
    }
    observeArray(data){
        data.forEach(item => observe(item))
    }
}
function dependArray(value){
    for(let i = 0;i<value.length; i++){
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if(Array.isArray(current)){
            dependArray(current)
        }
    }
}
export function defineReactive(target, key, value) {
    let childDep = observe(value);    
    let dep = new Dep();
    // console.log(dep,key);
    Object.defineProperties(target, {
        [key]: {
            get() {
                if(Dep.target){
                    dep.depend();//让这个属性收集器记住当前的watch
                    if(childDep){  
                        childDep.dep.depend();//让对象和数组本身也依赖收集
                        if(Array.isArray(value)){
                            dependArray(value)
                        }
                    }
                }
                //修改数组元素为基本数据类型时之所以会有这个log，应该是外层的数据的get,
                //不会出现打印console.log("用户取值了", value); 的value为数组元素为基本数据类型的情况
                // console.log("用户取值了", value); 
                return value;
            },
            set(newValue) {
                // console.log("用户更改值了");
                if (value === newValue) return;
                observe(newValue);  // 每一个新值也同样需要进行数据代理
                value = newValue;
                dep.notify()
            }
        }
    });
}

export function observe(data){    
    if(typeof data !== 'object' || data == null){
        return;     // 只对对象数据劫持
    }
    if(data.__ob__ instanceof Observe) {    // 说明数据已经被劫持过，直接返回
        return data.__ob__
    }

    // 被劫持过则不需要在劫持(判断是否被劫持,可以增添一个实例，用实例来判断是否被劫持过)
    return new Observe(data)
}