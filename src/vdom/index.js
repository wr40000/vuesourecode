// h()  _c()
export function createElementVNode(vm,tag, data, ...children){
    // console.log(vm);
    // console.log("tag: ",tag);
    // console.log("data: ",data);
    // console.log("...children: ",...children);
    if(data == null){
        data = {}
    }
    let key = data.key;
    // console.log("data: ",data);
    // console.log("key: ",key);
    // console.log(data);
    if(key){
        delete data.key
    }
    return vnode(vm,tag,key,data,children)
}

//  _v()
export function createTextVNode(vm,text){
    console.log("text: ",text);
    return vnode(vm,undefined,undefined,undefined,undefined,text)
}

// ast一样吗？ ast做的是语法层面的转化，他描述的是语法本身(html,css,js)，我们的虚拟DOM是
// 描述的DOM元素，可以增加一些自定义的属性
function vnode(vm,tag,key,data,children,text){
    let node = {
        vm,
        tag,
        key,
        data,
        children,
        text,
        //......
    }
    // console.log(node);
    return node
}
export function isSameVnode(vnode1, vnode2){
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}