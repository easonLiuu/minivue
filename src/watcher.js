//watcher模块负责将observer和compile关联起来
class Watcher {
    //vm 当前vue实例
    //expr data中数据的名字
    //cb 数据改变 调用cb
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb

        //this表示的是新创建的watch对象
        //存储到Dep.target的属性中
        Dep.target = this
        //需要把expr的旧值存起来
        this.oldValue = this.getVMValue(vm, expr)
        //清空Dep.target，方便下一次用
        Dep.target = null
    }

    //对外暴露的方法 用于更新数据 也就是更新页面
    update () {
        //对比expr是否发生了改变 改变就调用cb
        let oldValue = this.oldValue
        let newValue = this.getVMValue(this.vm, this.expr)
        if(oldValue != newValue) {
            this.cb(newValue, oldValue)
        }
    }

    //获取vm中的数据
    getVMValue(vm, expr) {
        //获取到data中的数据 
        let data = vm.$data
        expr.split('.').forEach(key => {
            data = data[key]
        })
        return data
    }   
}

//依赖收集 dep对象用于管理所有的订阅者和通知这些订阅者
class Dep {
    constructor() {
        //用于管理订阅者
        this.subs = []
    }

    
    //添加订阅者
    addSub(watcher) {
        this.subs.push(watcher)
    }

    //通知
    notify() {
        //遍历所有的订阅者，调用watcher的update方法
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}