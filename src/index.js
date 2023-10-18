import {initMixin} from './init'
import {initLifeCycle} from  './lifecycle'
import {initGlobalAPI} from './global'
import {initStateMixin} from './state'
import {createElm, patchProps, patch} from './vdom/patch'
import {compileToFunction} from './compiler/index'

function Vue(options){
    this._init(options)
};

initMixin(Vue)  //扩展了init方法
initLifeCycle(Vue);
initGlobalAPI(Vue);//全局API
initStateMixin(Vue)//实现$nextTick $watch



let render1 = compileToFunction(`<ul a="1" key="a" style="color:#0000ff;background-color: #ff0000">    
<li key="a">1</li>
<li key="b">2</li>
<li key="c">3</li>  
<li key="d">4</li>    
</ul>`);
let vm1 = new Vue({data:{name:'第一次'}});
let preVnode = render1.call(vm1)

let el = createElm(preVnode);
document.body.appendChild(el)

// let render2 = compileToFunction('<span>{{name}}</span>');
let render2 = compileToFunction(`<ul a="1" key="a" style="color:#0000ff;background-color: #00ff00">
<li key="b">2</li>
<li key="m">5</li>
<li key="a">1</li>
<li key="p">6</li>
<li key="c">3</li>  
<li key="q">7</li>        
</ul>`);
let vm2 = new Vue({data:{name:'第二次'}});
let nextVnode = render2.call(vm2)
// console.log(nextVnode);

setTimeout(()=>{    
    patch(preVnode, nextVnode)
}, 1000)


export default Vue;