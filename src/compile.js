//专门负责解析模版内容
class Compile {
    //参数1 模版 参数2 vue实例
    constructor(el, vm) {
        //el: new vue传递的选择器
        //其实这个el不一定是选择器还有可能是DOM对象 所以要判断一下
        //vm: new的vue实例
        this.el = typeof el === 'string' ? document.querySelector(el) : el
        this.vm = vm

        //编译模版
        if(this.el) {
            //1.把el所有的子节点都放入到内存中，不要再DOM树中，放入fragment(文档碎片) 性能高 防止反复渲染
            let fragment = this.node2fragment(this.el)
            //2.内存中编译fragment
            this.compile(fragment)
            //3.把fragment一次性添加到页面
            this.el.appendChild(fragment)
        }
    }

    //核心方法 和编译相关
    node2fragment(node) {
        let fragment = document.createDocumentFragment()
        //把el中的所有子节点挨个添加到文档碎片中
        let childNodes = node.childNodes
        //childNodes为类数组
        this.toArray(childNodes).forEach(node => {
            //把所有子节点添加到fragment
            fragment.appendChild(node)
        })
        return fragment
    }
    
    //编译文档碎片（内存中）
    compile(fragment) {
        let childNodes = fragment.childNodes
        this.toArray(childNodes).forEach(node => {
            //编译子节点
            if(this.isElementNode(node)) {
                //如果是元素，需要解析它的指令
                this.compileElement(node)
            }
            if(this.isTextNode(node)) {
                //如果是文本节点，需要解析它的插值表达式
                this.compileText(node)
            }

            //当前节点还有子节点，递归解析
            if(node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }
    
    //解析html标签
    compileElement (node) {
        //1.获取到当前节点下的所有属性
        let attributes = node.attributes
        this.toArray(attributes).forEach(attr => {
            //2.解析vue的指令（所有以v-开头的属性）
           let attrName = attr.name           
           if(this.isDirective(attrName)){
            let type = attrName.slice(2)
            //取值
            let expr = attr.value

            //解析v-on else解析别的
            if(this.isEventDirective(type)) {
                CompileUtil['eventHandler'](node, this.vm, type, expr)
            }else {
                CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
            }
           }
        })
        
    }

    //解析文本节点
    compileText (node) {
        CompileUtil.mustache(node, this.vm)
    }

    //工具方法 辅助
    toArray (likeArray) {
       return [].slice.call(likeArray)
    }
    isElementNode (node) {
        //nodeType: 节点的类型 1:元素节点 3:文本节点
        //这块需要对DOM了解深一点
        return node.nodeType === 1
    }
    isTextNode (node) {
        //nodeType: 节点的类型 1:元素节点 3:文本节点
        return node.nodeType === 3
    }
    isDirective(attrName) {
        return attrName.startsWith('v-')
    }
    isEventDirective(attrName) {
        return attrName.split(':')[0] === 'on'
    }
}

//所有处理的操作都在这里（编译）
let CompileUtil = {
    mustache (node, vm){ 
        let txt = node.textContent
        //正则匹配
        let reg = /\{\{(.+)\}\}/
        if(reg.test(txt)) {
           let expr = RegExp.$1
           node.textContent = txt.replace(reg, this.getVMValue(vm, expr))         
        }
    },
    //处理v-text文本解析
    text(node, vm, expr) {        
        node.textContent = this.getVMValue(vm, expr)
    },
    html(node, vm ,expr) {
        node.innerHTML = this.getVMValue(vm, expr)
    },
    model(node, vm, expr) {
        node.value = this.getVMValue(vm, expr)
    },
    eventHandler(node, vm, type, expr) {
        //给当前元素注册事件
        let eventType = type.split(':')[1]
        let fn = vm.$methods && vm.$methods[expr]
        if(eventType && fn) {
            //这里一定要修改this指向
            node.addEventListener(eventType, fn.bind(vm))
        }
    },

    //用于获取vm中的数据 简单复杂类型都适用
    getVMValue(vm, expr) {
        //获取到data中的数据 
        let data = vm.$data
        expr.split('.').forEach(key => {
            data = data[key]
        })
        return data
    }
}