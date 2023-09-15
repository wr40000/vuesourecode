let id = 0;

export class Dep{
    constructor(){
        this.id = id++
        this.subs = [];
    }
    depend(){
        // 不希望放重复的watcher 而且刚才只是一个单向的关系  dep => Watcher
        // this.subs.push(Dep.target);

        Dep.target.addDep(this) //让watcher记住dep  双向
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher=>watcher.updata())
    }
}

Dep.target = null;

