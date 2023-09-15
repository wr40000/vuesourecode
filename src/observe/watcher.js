import { Dep } from "./dep";

let id = 0;

export class Watcher{
    constructor(vm, fn, options){
        this.id = id++;
        this.render = options;//表示是一个渲染函数
        this.deps = [];     //后续实现计算属性和一些清理工作需要用到
        this.depsId =new Set();
        this.getter = fn;
        this.get()   //意味着这个函数发生取值操作
    }
    get(){
        // this:更新函数所在的那个watcher  类中的this都是实例 这里的this=> Watcher
        Dep.target = this;  //静态属性就是只有一份  
        this.getter();  //回去vm上取值
        Dep.target = null;

    }
    addDep(dep){    //一个事件对应着多个属性 重复的属性也不用记录
        let id = dep.id;
        if(!this.depsId.has(id)){
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this);   //watcher已经记住了dep,此时让dep也记住watcher
        }
    }
    updata(){
        this.get()  //重新更新
    }
}
// 给每个属性增加一个dep
