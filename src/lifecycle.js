import {createElementVNode, createTextVNode} from './vdom'
import {Watcher} from './observe/watcher'

function createElm(vnode){
    //              (标签名 key)
    //          vnode(div app)
    //              /           \
    //    vonde(div div)         vnode(span span)
    let {tag,data,children,text} = vnode;
    if(typeof tag === 'string'){    //标签
        vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点对应起来，后续如果修改属性
        patchProps(vnode.el, data)
        children.forEach((child) => {
            // console.log(vnode);
            vnode.el.appendChild(createElm(child))  //递归，不断地向vnode.el里添加html元素
        })        
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
function patchProps(el, props){
    for(let key in props){
        if(key === 'style'){
            for(let styleName in props.style){
                el.style[styleName] = props.style[styleName]
            }
        }else{
            el.setAttribute(key, props[key])
        }
    }
}
function patch(oldVNode, vnode){
    // 写的是初渲染流程
    const isRealELement = oldVNode.nodeType;
    if(isRealELement){
        const elm = oldVNode;
        const parentElm = elm.parentNode;
        // console.log(parentElm, vnode);
        let newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm);

        return newElm
    }else{
        // diff算法
    }
}
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
        if(typeof value !== 'Object')  return value
        return JSON.stringify(value)
    }
    Vue.prototype._render = function(){        
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