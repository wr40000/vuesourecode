import initState from "./state";
import {compileToFunction} from './compiler'

export function initMixin(Vue){
    Vue.prototype._init = function(options){
        const vm = this;
        vm.$options = options;    // 用户数据挂载到实例上

        // 初始状态
        initState(vm);

        if(options.el){
            vm.$mount(options.el)
        }
    }

    Vue.prototype.$mount = function(el){
        const vm = this;
        el = document.querySelector(el);
        let ops = vm.$options;
        if(!ops.render){    // 查找有无render
            let template;
            if(!ops.template && el){        // 没写template用外部的template
                template = el.outerHTML
            }else{
                if(el){
                    template = ops.template  // 写了template用自己的的template
                }
            }
            // console.log(template);
            if(template){
                const render = compileToFunction(template)
                ops.render = render
            }
        }
    }
}

