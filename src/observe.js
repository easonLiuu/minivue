//用于给data中的所有数据添加getter setter 实现数据响应式
class Observer {
    constructor(data) {
        this.data = data
        this.walk(data)
    }

    //核心方法
    //遍历data中所有数据 添加getter setter
    walk(data) {
        if(!data || typeof data != 'object') {
            return
        }
        Object.keys(data).forEach(key => {
            //给data中的key设置setter getter
            this.defineReactive(data, key, data[key])
            //递归 将data中的所有数据都变成响应式的
            this.walk(data[key])
        })
    }

    //定义响应式数据 也就是数据劫持
    //data中的每一个数据都应该维护一个Dep对象
    //Dep保存了所有订阅该数据的订阅者
    defineReactive(obj, key, value) {
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                //如果Dep.target有watcher订阅者 就存储到订阅者数组中
                Dep.target && dep.addSub(Dep.target)
                console.log(dep)
                return value
            },
            set(newValue) {
                if(value === newValue) {
                    return
                }
                value = newValue
                console.log('111')
                //如果newValue也是一个对象 也要对它进行劫持
                //这个就是Object.defineProperty的缺点。。。
                that.walk(newValue)

                //需要调用watcher的update
                //发布通知 让所有订阅者更新内容
                dep.notify()               
            }
        })

    }
}