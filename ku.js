// 引入模块
const log = (...args) => { console.log.apply(console, args) }
const fs = require('fs')

// 一个辅助函数, 确保要操作的文件已经存在
// 如果不存在就直接创建这个文件, 这样在调用的时候不会报错
const ensureExists = (path) => {
    if (!fs.existsSync(path)) {
        // 因为保存的数据都是 json 格式的, 所以在初始化文件的时候
        // 会写入一个空数组
        const data = '[]'
        fs.writeFileSync(path, data)
    }
}

// 将数据(object 或者 array)写入到文件中, 相当于持久化保存数据
// data 是 object 或者 array
// path 是 保存文件的路径
const save = (data, path) => {
    // 默认情况下使用 JSON.stringify 返回的是一行数据
    // 开发的时候不利于读, 所以格式化成缩进 2 个空格的形式
    const s = JSON.stringify(data, null, 2)
    fs.writeFileSync(path, s)
}

// 从文件中读取数据, 并且转成 JSON 形式(即 object 或者 array)
// path 是保存文件的路径
const load = (path) => {
    // 指定 encoding 参数
    const options = {
        encoding: 'utf8',
    }
    // 读取之前确保文件已经存在, 这样不会报错
    ensureExists(path)
    // 上节课提到如果指定了 encoding, readFileSync 返回的就不是 buffer, 而是字符串
    const s = fs.readFileSync(path, options)
    const data = JSON.parse(s)
    return data
}

// 定义一个 Model 类来处理数据相关的操作
// Model 是基类, 可以被其他类继承

// var o = {} 实际上这个是一个简写形式, 相当于 var o = new Object() 的简写
// o.toString() toString 是一个原型方法(也叫实例方法)
// Object.keys(o) 就是一个 static 方法
// o.keys 就不能被调用

// var l = [] 是 var l = new Array() 的缩写
// l.push('a') push 就是一个原型方法
// Array.isArray(l) 是一个 static 方法


class Model {
    // 加了 static 关键字的方法是静态方法
    // 直接用 类名.方法名() 的形式调用
    // 这里的类名是 Model, 所以调用的方式就是 Model.dbPath()
    // dbPath 方法返回 db 文件的路径
    static dbPath() {
        // 静态方法中的 this 指的是类
        // this.name 指的是类名, 类名是一个字符串 'Model'
        // 文件名一般来说建议全小写, 所以这里将名字换成了小写
        const classname = this.name.toLowerCase()
        // db 的文件名通过这样的方式与类名关联在一起
        const path = require('path')
        const filename = `${classname}.txt`
        // 使用绝对路径可以保证路径没有问题
        const p = path.join(__dirname, './db', filename)

        // 下面的这种写法对路径有要求
        // const p = path.join('db', filename)
        return p
    }

    // 这个函数是用来获取一个类的所有实例
    // 用法如下: 类名.all()
    static all() {
        // 先获取文件路径
        const path = this.dbPath()
        // 打开文件, 获取数据
        // 因为使用的 json 格式存储数据, 而且我们初始化时用的是数组,
        // 之后保存也用的是数组
        // 所以 models 是一个数组

        const models = load(path)
        // map 是 es5 里新增的方法, 可以方便地遍历数组
        // map 是用一个旧数组生成一个新数组

        const ms = models.map((item) => {
            // item 是数组中的每一项
            // 前面提到了静态方法中的 this 指向的是 class
            // 这里为了更加显式观察, 将 this 赋值给 cls
            // 然后调用 cls.create 方法生成实例

            // 简写的话是下面这样的, 不过不容易理解, 所以初期不建议这样写代码
            // return this.create(item)
            const cls = this
            const instance = cls.create(item)
            return instance
        })
        return ms

        // 特别是与箭头函数结合使用, 简洁得让人不容易看懂, 所以我们目前写详细版本
        // 这一大段可以简写成下面这一行
        // return models.map(m => this.create(m))
    }

    static create(form={}) {
        // 比如 User.create, this 就是指向 User
        // 比如 Message.create, this 就是指向 Message
        // 比如 Blog.create, this 就是指向 Blog
        // 比如 Comment.create, this 就是指向 Comment
        // 比如 Weibo.create, this 就是指向 Weibo
        const cls = this
        const instance = new cls(form)
        return instance
    }

    // 查找 key 为 value 的实例, 如果有多个, 只返回第一个
    // 如果找不到, 返回 null
    // 比如 查到 username 为 'gua' 的实例
    // findOne(username, 'gua')
    static findOne(key, value) {
        const all = this.all()
        // let model = null
        // forEach 里面的 return 相当于 continue, 所以这里用错了
        // all.forEach((m) => {
        //     // m 是一个实例
        //     // 根据 key 属性来查找 m[key] 的值
        //     // 然后判断 m[key] 与 value 是否相等
        //     // 如果相等就把 m 赋值给 model, 同时结束循环
        //     if (m[key] === value) {
        //         model = m
        //         return false
        //     }
        // })

        // es6 里新增的 find 方法, 可以把符合条件的元素查找出来
        // 如果没有找到, 返回的是 undefined
        let m = all.find((e) => {
            return e[key] === value
        })

        // 如果 m 为 undefined, 说明找不到符合条件的实例, 那就返回 null
        if (m === undefined) {
            m = null
        }

        return m

        // 下面这个是干人的时候用的写法
        // return all.find(e => e[key] === value) || null

        // for (let i = 0; i < all.length; i++) {
        //     // m 是一个实例
        //     // 根据 key 属性来查找 m[key] 的值
        //     // 然后判断 m[key] 与 value 是否相等
        //     // 如果相等就把 m 赋值给 model, 同时结束循环
        //     const m = all[i]
        //     if (m[key] === value) {
        //         model = m
        //         break
        //     }
        // }
        // return model
    }

    // 查找 key 为 value 的所有实例
    static find(key, value) {
        // 上课实现
        const all = this.all()
        let models = []
        all.forEach((m) => {
            // m 是一个实例
            // 根据 key 属性来查找 m[key] 的值
            // 然后判断 m[key] 与 value 是否相等
            // 如果相等就把 m 赋值给 model, 同时结束循环
            if (m[key] === value) {
                models.push(m)
            }
        })
        return models
    }

    // 因为经常用 id 来获取数据, 所以单独写一个 get 方法
    static get(id) {
        id = parseInt(id, 10)
        return this.findOne('id', id)
    }

    save() {
        // save 前面没有 static 所以 this 指的是 实例
        // 先用 this.constructor 拿到 类
        const cls = this.constructor
        const models = cls.all()
        if (this.id === undefined) {
            // 如果 id 不存在, 说明数据文件中没有当前这条数据
            if (models.length > 0) {
                const last = models[models.length - 1]
                this.id = last.id + 1
            } else {
                this.id = 0
            }
            models.push(this)
        } else {
            // id 存在说明这条数据已经在数据文件中了
            // 直接找到这条数据并且替换
            // 先找到这条数据的位置
            let index = -1
            for (let i = 0; i < models.length; i++) {
                const m = models[i]
                if (m.id === this.id) {
                    index = i
                    break
                }
            }
            if (index > -1) {
                // 把旧的数据换成新的
                // 新数据带有 id
                models[index] = this
            }
        }
        const path = cls.dbPath()
        save(models, path)
    }

    static remove(id) {
        const cls = this
        const models = cls.all()
        const index = models.findIndex((e) => {
            return e.id === id
        })
        if (index > -1) {
            models.splice(index, 1)
        }
        const path = cls.dbPath()
        save(models, path)
    }

    toString() {
        const s = JSON.stringify(this, null, 2)
        return s
    }
}

module.exports = Model
