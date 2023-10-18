import {isSameVnode} from './index'
export function createElm(vnode){
    //              (标签名 key)
    //          vnode(div app)
    //              /           \
    //    vonde(div div)         vnode(span span)
    let {tag,data,children,text} = vnode;
    if(typeof tag === 'string'){    //标签
        vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点对应起来，后续如果修改属性
        patchProps(vnode.el, {}, data)
        children.forEach((child) => {
            // console.log(vnode);
            vnode.el.appendChild(createElm(child))  //递归，不断地向vnode.el里添加html元素
        })        
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
export function patchProps(el, oldProps = {}, props = {}){
    // 老的属性有，新的没有，删除老的
    let oldStyles = oldProps.style || {};
    let newStyles = props.style || {};
    for(let key in oldStyles){
        if(!newStyles[key]){
            el.style[key] = ''
        }
    }

    for(let key in oldProps){   //老的属性有
        if(!props[key]){    //新的没有要删除
            el.removeAttribute[key];
        }
    }

    for(let key in props){  //用新的覆盖老的
        if(key === 'style'){
            for(let styleName in props.style){
                el.style[styleName] = props.style[styleName]
            }
        }else{
            el.setAttribute(key, props[key])
        }
    }
}
export function patch(oldVNode, vnode){
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
        return patchVnode(oldVNode, vnode)
    }
}
function patchVnode(oldVNode, vnode){    
    if(!isSameVnode(oldVNode, vnode)){
        let el = createElm(vnode);
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el);
        return el;
    }
    // 文本情况
    // debugger
    let el = vnode.el = oldVNode.el;    //复用老节点的文本
    if(!oldVNode.tag){  //是文本
        if(oldVNode.text !== vnode.text){
            el.textContent = vnode.text
        }
    }
    patchProps(el, oldVNode.data, vnode.data)

    // 比较儿子节点
    let oldChildren = oldVNode.children || [];
    let newChildren = vnode.children || [];

    if(oldChildren.length > 0 && newChildren.length > 0){
        // 完整的diff算法,比较两者的孩子
        updateChildren( el, oldChildren, newChildren )
    }else if( newChildren.length > 0){
        mountChildren(el, newChildren);
    }else if( oldChildren.length > 0){
        el.innerHTML = ''
    }
    return el;
}

function mountChildren(el, newChildren){
    for(let i=0; i<newChildren.length; i++){
        let child = newChildren[i];
        el.appendChild(createElm(child))
    }
}

function updateChildren( el, oldChildren, newChildren ){
    // console.log(oldChildren, newChildren);
    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;

    let oldStartVnode = oldChildren[0];
    let newStartVnode = newChildren[0];

    let oldEndVnode = oldChildren[oldEndIndex];
    let newEndVnode = newChildren[newEndIndex];

    function makeIndexByKey(children){
        let map = {}
        children.forEach((child, index)=>{
            map[child.key] = index
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)

    // 我们循环的时候为什么要用key
    // 每次直接更新DOM
    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
        if(!oldStartVnode){//处理因为索引表导致当前索引对应的旧节点出现undefined，需要跳过
            oldStartVnode = oldChildren[++oldStartIndex]//头指针
        }else if(!oldEndVnode){//处理因为索引表导致当前索引对应的旧节点出现undefined，需要跳过
            oldEndVnode = oldChildren[--oldEndIndex]//尾指针
        }else if(isSameVnode(oldStartVnode, newStartVnode)){  //头头比对
            patchVnode(oldStartVnode, newStartVnode)    //相同节点，递归比较子节点
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
            // 开始比较开头节点
        }else if(isSameVnode(oldEndVnode, newEndVnode)){  //尾尾比对
            patchVnode(oldEndVnode, newEndVnode)    //相同节点，递归比较子节点
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
        }else if(isSameVnode(oldEndVnode, newStartVnode)){  //交叉比对
            patchVnode(oldEndVnode, newStartVnode)  
            el.insertBefore(oldEndVnode.el, oldStartVnode.el);
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex];
        }else if(isSameVnode(oldStartVnode, newEndVnode)){  //头尾  尾头
            patchVnode(oldStartVnode, newEndVnode)  
            // insertBefore具备移动性，会将原来的元素移走
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);  //将老的尾巴移到前边去
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newEndIndex];
        }else{
            // 乱序比对
            let moveIndex = map[newStartVnode.key];
            if(moveIndex !== undefined){
                let moveVnode = oldChildren[moveIndex];//找到对应虚拟节点
                el.insertBefore(moveVnode.el, oldStartVnode.el);
                oldChildren[moveIndex] = undefined;//表示这个节点已经移走了
                patchVnode(moveVnode, newStartVnode);//比较属性和子节点
            }else{
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
            }
            newStartVnode = newChildren[++newStartIndex]
        }
    }

    if(newStartIndex <= newEndIndex){   //新的多了  多余的就插入进去
        for(let i = newStartIndex; i <= newEndIndex; i++){
            let childEl = createElm(newChildren[i])
            let anchor = newChildren[newEndIndex + 1] ?  newChildren[newEndIndex + 1].el : null;
            // el.appendChild(childEl)
            el.insertBefore(childEl, anchor)    //anchor为null则会认为是appendchildren
        }
    }

    if(oldStartIndex <= oldEndIndex){   //老的多了  删除老的
        for(let i = oldStartIndex; i <= oldEndIndex; i++){
            if(oldChildren[i]){
                let childEl = oldChildren[i].el
                el.removeChild(childEl)
            }
        }
    }


    // console.log(oldEndIndex,newEndIndex,oldStartVnode,newStartVnode,oldEndVnode,newEndVnode);
}