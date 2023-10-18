import {createElementVNode, createTextVNode} from './vdom'
import {Watcher} from './observe/watcher'
import {createElm, patchProps, patch} from './vdom/patch'

export function initLifeCycle(Vue){
    Vue.prototype._updata = function(vnode){
        const vm = this;
        const el = vm.$el;
        let elm = patch(el, vnode);
        vm.$el = elm
    }

    // _c(
    //     'div',
    //     {id:"app",style:{"color":"red","background-color":"yellow"}},
    //     _c(
    //         'div',
    //         {style:{"color":"red"}},
    //         _v(
    //             _s(arr[3].JNTM)+"Terraria"+_s(arr[1])+"Terraria" //似乎会将_s的结果拼串
    //         )
    //     ),
    //     _c('span',null,_v(_s(arr[2])))
    // )
    
    // 根据_c _v _s生成的vnode是不一样的，tag(标签名)是不一样的，可以根据这个区分
    // _c('div', {}, ...children)  ...arguments是 'div', {}, ...children
    Vue.prototype._c = function(){       
        return createElementVNode(this, ...arguments)
    }
    // _v(text)
    Vue.prototype._v = function(){              
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function(value){      
        if(typeof value !== 'object')  return value
        return JSON.stringify(value)
    }
    Vue.prototype._render = function(){   
        // debugger             
        const vm = this;
        // 让with中的this 指向 vm
        // 当渲染的时候会去实例上取值，我们就可以将属性和视图绑定在一起
        return vm.$options.render.call(vm)    // 通过ast语法转义后的render方法
    }
}

export function mountComponent(vm, el){
    vm.$el = el;

    // 1.调用render方法生成虚拟dom
    // vm._render();   //vm.$options.render() 虚拟节点
    const updataComponent = () => {
        vm._updata(vm._render());   //虚拟节点扩展为真实节点
    }
    // 我们可以给模板里的属性增加以一个收集器dep
    // 页面渲染的时候 我们将渲染逻辑封装到watcher中  vm._updata(vm._render())
    // 让dep记住这个wetcher即可，稍后属性表变化了可以找到对应的dep中的存放的wetcher进行
    // 重新渲染
    const watcher = new Watcher(vm, updataComponent, true)
    // console.log(watcher);
    
    // 2.根据虚拟dom生成真实dom

    // 3.插入到el元素中
}

// Vue核心流程
// 1> 创造响应式数据
// 1> 模板解析为ast语法树
// 1> 将ast语法树转换为render函数，因为使用正则匹配，性能损耗比较大，所以转换为render函数
// 1> 后续数据更新只需要重新执行render函数，无需再次执行ast转化

// render函数会产生虚拟节点(使用响应式数据)
// 根据生成的虚拟节点创造真实的DOM

export function callHook(vm, hook){ // 调用钩子函数
    const handlers = vm.$options[hook];
    // console.log("handlers: ",handlers);
    if(handlers){
        handlers.forEach((handler)=>{
            handler.call(vm)
        })
    }
}

