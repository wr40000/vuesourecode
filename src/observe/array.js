let oldArrayproto = Array.prototype;

export let newArrayproto = Object.create(oldArrayproto);

let methods = [
    "shift",
    "unshift",
    "pop",
    "push",
    "reverse",
    "sort",
    "splice"
]// concat slice不会改变原数组

methods.forEach((method) => {
    newArrayproto[method] = function(...args){  // 重写数组的方法
        const result = oldArrayproto[method].call(this,...args);   // 内部调用原来的方法，函数劫持 切片编程
        console.log(method);

        // 对对新增的数据再次观测
        let inserted;
        let ob = this.__ob__;  //外部data调用方法，所以this就指向data
        switch(method){
            case 'push':
            case "unshift":     //vm.arr.unshift({a: 100})
                inserted = args;
                break;
            case "splice":      //vm.arr.splice(0, 1, 55,56,57)
                inserted = args.slice(2);
                break;
        }
        console.log(inserted);
        if(inserted){
            ob.observeArray(inserted)
        }
        return result;
    }
})

