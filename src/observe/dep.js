let id = 0;

export class Dep{
    constructor(){
        this.id = id++      // 属性的dep要收集watcher
        this.subs = [];     //这里存放着当前属性对应的wetcher有哪些
    }
    depend(){
        // 不希望放重复的watcher 而且刚才只是一个单向的关系  dep => Watcher
        // this.subs.push(Dep.target);

        Dep.target.addDep(this) //让watcher记住dep  双向
        // watcher和Dep是一个多对多的关系(一个属性可以再多个组件中使用dep -> 多个watcher)
        // 一个组件中由多个属性组成(一个watcher对应多个dep)
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher=>watcher.updata())
    }
}

Dep.target = null;

