import initState from "./state";

export function initMixin(Vue){
    Vue.prototype._init = function(options){
        const vm = this;
        vm.$options = options;    // 用户数据挂载到实例上

        // 初始状态
        initState(vm);
    }
}

