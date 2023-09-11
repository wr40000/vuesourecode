import { observe } from "./observe/index";

export default function initState(vm){
    const opts = vm.$options;
    if(opts.data){
        initData(vm);
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