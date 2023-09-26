import { Dep } from "./dep";

let id = 0;

// 给每个属性增加一个dep
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
        // this.get()  //重新更新
        queueWatcher(this)  //把当前watcher存起来  放到一个队列里
    };
    run(){
        console.log("run");
        this.get()
    }
}
let queue = [];
let has = {};
let pending = false;    //防抖
function flushSchedulerQueue(){
    let flusherQueue = queue.slice(0);
    has = {};
    queue = [];
    pending = false;
    flusherQueue.forEach((q)=>{
        q.run()})
}
function queueWatcher(watcher){
    const id = watcher.id;
    if(!has[id]){   //一个watcher不重复刷新
        queue.push(watcher);
        has[id] = true;
        if(!pending){
            // setTimeout(flushSchedulerQueue,0)
            nextTick(flushSchedulerQueue, 0)
            pending = true
        }
    }
}

let callbacks = [];
let waiting = false;
function flushCallbacks(){
    let cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach((cb)=>cb())
}
// nextTick没有直接使用某个api，而是采用优雅降级的方式
// 内部先采用的是Promise,MutationObserver(h5的api), 
let timeFunc;       //初始化文件时确定了该函数
if(Promise){
    timeFunc = ()=>{
        Promise.resolve().then(flushCallbacks)
    }
}else if(MutationObserver){
    let observer = new MutationObserver(flushCallbacks) //这里传入的回调是异步执行的
    let textNode = document.createTextNode(1);
    observer.observe(textNode,{
        characterData: true
    });
    timeFunc = () => {
        textNode.textContent = 2;
    }
}else if(setImmediate){
    timeFunc = ()=>{
        setImmediate(flushCallbacks);
    }
}else{
    timeFunc = () => {
        setTimeout(flushCallbacks)
    }
}
export function nextTick(cb){
    callbacks.push(cb); //维护nextTick中的callback方法
    if(!waiting){
        // setTimeout(()=>{
        //     flushCallbacks();
        // }, 0)
        timeFunc();
        waiting = true;
    }
}