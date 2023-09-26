import {initMixin} from './init'
import {initLifeCycle} from  './lifecycle'
import { nextTick } from './observe/watcher';
import {initGlobalAPI} from './global'

function Vue(options){
    this._init(options)
};
Vue.prototype.$nextTick = nextTick
initMixin(Vue)  //扩展了init方法
initLifeCycle(Vue);
initGlobalAPI(Vue);





export default Vue;