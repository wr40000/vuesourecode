import { observe } from "./observe/index";
import { Watcher } from "./observe/watcher";
import { Dep } from "./observe/dep";

export default function initState(vm){
    const opts = vm.$options;
    if(opts.data){
        initData(vm);
    }
    if(opts.computed){
        // debugger
        initComputed(vm);
    }
    if(opts.watch){
        // debugger
        initWatch(vm);
    }
}
// vm._data 用vm 代理 使得读取vm._data.name可以简化为vm.name
function proxy(vm, target, key){
    Object.defineProperties(vm,{
        [key]:
        {
            get(){
                return vm[target][key]
            },
            set(newvalue){                
                if(vm[target][key] === newvalue) return
                vm[target][key] = newvalue
            }
        }
    })
}
function initData(vm){
    let data = vm.$options.data
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data;
    // console.log(vm._data === data); // true
    // 数据劫持
    observe(data)   //Object.defineProperties重新递归定义递归

    // vm._data 用vm 代理 使得读取vm._data.name可以简化为vm.name
    for(let key in data){
        proxy(vm, "_data", key)
    }
}

function initWatch(vm){
    let watch = vm.$options.watch
    for(let key in watch){
        const handler = watch[key]; //字符串 数组 函数
        // console.log("key: ", key, "handler: ", handler);
        if(Array.isArray(handler)){
            for(let i=0; i< handler.length; i++){
                createWatcher(vm, key, handler[i])
            }
        }else{
            createWatcher(vm, key, handler)
        }
    }
}
function createWatcher(vm, key, handler){
    // 字符串 函数
    if(typeof handler === 'string'){
        handler = vm[handler];
    }
    return vm.$watch(key, handler)
}

function initComputed(vm){
    let computed = vm.$options.computed
    // 将计算属性的getter保存到vm上
    const watchers = vm._createComputedGetter = {} 
    for(let key in computed){
        let userDef = computed[key];    

        const fn = typeof userDef === 'function' ? userDef : userDef.get;
        // 1> {lazy:true}是不希望上来就执行fn 像一般的渲染watcher会直接执行get(),也就是渲染函数
        // 2> 将属性和watcher对应起来
        watchers[key] = new Watcher(vm, fn, {lazy:true})

        defineComputed(vm, key, userDef)
    }
    
}
function defineComputed(target, key, userDef){
    const setter = userDef.set || (() => {})
    Object.defineProperty(target,key, {
            get:createComputedGetter(key),
            set:setter
    })
}
function createComputedGetter(key){
    // 监测是否要执行这个getter
    return function(){
        // 获取到对应的watcher
        const watcher = this._createComputedGetter[key]
        if(watcher.dirty){
            // 求值后dirty为true, 下次就不求了
            watcher.evaluate()
        }
        if(Dep.target){     //渲染watcher                       
            watcher.depend();   //计算属性出栈后，应该让计算属性watcher里面的w属性也去收集上层watcher
            // 月收集上一层的watcher
        }
        return watcher.value
    }

}