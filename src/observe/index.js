class Observe{
    constructor(data){
        // Object.defineProperty智能劫持已经存在的属性，vue2的$set就是为后加的属性添加响应式
        this.walk(data)        
    }
    walk(data){
        // 重新定义属性  性能不太行
        Object.keys(data).forEach(key => defineReactive(data,key,data[key]))
    }
}

export function defineReactive(target, key, value) {
    observe(value);
    Object.defineProperties(target, {
        [key]: {
            get() {
                console.log("用户取值了");
                return value;
            },
            set(newValue) {
                console.log("用户更改值了");
                if (value === newValue) return;
                value = newValue;
            }
        }
    });
}

export function observe(data){    
    if(typeof data !== 'object' || data == null){
        return;     // 只对对象数据劫持
    }

    // 被劫持过则不需要在劫持(判断是否被劫持,可以增添一个实例，用实例来判断是否被劫持过)
    return new Observe(data)
}