import {initMixin} from './init'
import {initLifeCycle} from  './lifecycle'
import { Watcher, nextTick } from './observe/watcher';
import {initGlobalAPI} from './global'

function Vue(options){
    this._init(options)
};
Vue.prototype.$nextTick = nextTick
initMixin(Vue)  //扩展了init方法
initLifeCycle(Vue);
initGlobalAPI(Vue);


Vue.prototype.$watch = function(exprOrFn, cb, options = {}){
    // console.log('exprOrFn: ',exprOrFn,"cb: ", cb, "options: ",options);

    // work的值发生变化了，直接执行cb函数即可
    new Watcher(this, exprOrFn, {user: true}, cb)
}


export default Vue;