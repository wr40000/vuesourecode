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


export default Vue;