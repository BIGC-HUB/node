const log = (...args) => { console.log.apply(console, args) }
const fs = require('fs')


// 路径验证
const ensurePath = (path) => {
    // 一个辅助函数, 确保要操作的文件已经存在
    // 如果不存在就直接创建这个文件, 这样在调用的时候不会报错
    if (!fs.existsSync(path)) {
        // 因为保存的数据都是 json 格式的, 所以在初始化文件的时候
        // 会写入一个空数组
        const data = '[]'
        fs.writeFileSync(path, data)
    }
}

// 保存
const saveFile = (data, path) => {
    const str = JSON.stringify(data, null, 2)
    fs.writeFileSync(path, str, 'utf8')
}

// 读取
const loadFile = (path) => {
    // 从文件中读取数据, 并且转成 JSON 形式(即 object 或者 array)
    ensurePath(path)
    // 上节课提到如果指定了 encoding, readFileSync 返回的就不是 buffer, 而是字符串
    const str = fs.readFileSync(path, 'utf8')
    return JSON.parse(str)
}

// 定义一个 Ku 类来处理数据相关的操作
// Ku 是基类, 可以被其他类继承

class Ku {
    // 加了 static 关键字的方法是静态方法
    // 直接用 类名.方法名() 的形式调用
    // 这里的类名是 Ku, 所以调用的方式就是 Ku.initPath()
    // initPath 方法返回 db 文件的路径
    static initPath() {
        // 静态方法中的 this 指的是类
        // this.name 指的是类名, 类名是一个字符串 'Ku'
        // 文件名一般来说建议全小写, 所以这里将名字换成了小写
        const classname = this.name.toLowerCase()
        // db 的文件名通过这样的方式与类名关联在一起
        const path = `data/${classname}.txt`
        return path
    }

    // 这个函数是用来获取一个类的所有实例
    // 用法如下: 类名.all()
    static all() {
        // 先获取文件路径
        const path = this.initPath()
        // 打开文件, 获取数据
        // 因为使用的 json 格式存储数据, 而且我们初始化时用的是数组,
        // 之后保存也用的是数组
        // 所以 Kus 是一个数组
        const Kus = loadFile(path)
        // map 是 es5 里新增的方法, 可以方便地遍历数组
        // map 是用一个旧数组生成一个新数组

        const ms = Kus.map((item) => {
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
        // return Kus.map(m => this.create(m))
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
        let Ku = null
        all.forEach((m) => {
            // m 是一个实例
            // 根据 key 属性来查找 m[key] 的值
            // 然后判断 m[key] 与 value 是否相等
            // 如果相等就把 m 赋值给 Ku, 同时结束循环
            if (m[key] === value) {
                Ku = m
                return false
            }
        })
        return Ku
    }

    // 查找 key 为 value 的所有实例
    static find(key, value) {
        // 上课实现
        const all = this.all()
        let Kus = []
        all.forEach((m) => {
            // m 是一个实例
            // 根据 key 属性来查找 m[key] 的值
            // 然后判断 m[key] 与 value 是否相等
            // 如果相等就把 m 赋值给 Ku, 同时结束循环
            if (m[key] === value) {
                Kus.push(m)
            }
        })
        return Kus
    }

    // save 前面没有 static 关键字, 是实例方法或者原型方法
    // 调用方式是 实例.方法()
    // save 函数的作用是把 Ku 的一个实例保存到文件中
    // save() {
    //     // 实例方法中的 this 指向的是实例本身, 也就是 new 出来的那个对象
    //     // this.constructor 是指类
    //     const cls = this.constructor
    //     // 先获取 Ku 的所有实例, 是一个数组
    //     const Kus = cls.all()
    //     // 然后把当前实例添加到 Kus 中, 接着保存到文件中
    //     Kus.push(this)
    //     const path = cls.initPath()
    //     // 这个 save 函数是 save 文件的函数, 而不是当前这个实例方法
    //     save(Kus, path)
    // }

    save() {
        // save 前面没有 static 所以 this 指的是 实例
        // 先用 this.constructor 拿到 类
        const cls = this.constructor
        const Kus = cls.all()
        if (this.id === undefined) {
            // 如果 id 不存在, 说明数据文件中没有当前这条数据
            if (Kus.length > 0) {
                const last = Kus[Kus.length - 1]
                this.id = last.id + 1
            } else {
                this.id = 0
            }
            Kus.push(this)
        } else {
            // id 存在说明这条数据已经在数据文件中了
            // 直接找到这条数据并且替换
            // 先找到这条数据的位置
            let index = -1
            Kus.forEach((m, i) => {
                if (m.id === this.id) {
                    index = i
                    return false
                }
            })
            if (index > -1) {
                // 把旧的数据换成新的
                // 新数据带有 id
                Kus[index] = this
            }
        }
        const path = cls.initPath()
        saveFile(Kus, path)
    }

    toString() {
        return JSON.stringify(this, null, 2)
    }
}

// 以下两个类用于实际的数据处理
// 因为继承了 Ku 类
// 所以可以直接 save load
class User extends Ku {
    constructor(form={}) {
        // 继承的时候, 要先调用 super 方法, 才可以使用 this, 这里的 super 就是套路
        super()
        // User 类定义两个属性
        this.username = form.username || ''
        this.password = form.password || ''
        // 因为我们第一个 id 设置的是 0
        // 所以 form.id 是 false, 也就是转成了undefined
        this.id = form.id
        this.node = form.node || ''
    }

    // 我们把创建实例的操作封装起来, 直接调用 create 方法就可以了
    // 每个类都有 create 的操作, 所以可以直接将这个操作写到 Ku 中
    // 这一步上课会演示

    // 与逻辑相关的数据操作都写在类中, 这样我们的路由处理的逻辑就会比较简单
    // 路由那部分是 controller, 按照这样的方式组织代码
    // 会出现 胖 Ku, 瘦 controller 的情况, 这个也是我们提倡的

    // 校验登录的逻辑
    validateLogin() {
        // validateLogin 前面没有 static, 所以是实例方法, this 指向 user 实例
        // log(this, this.username, this.password)
        // const us = User.all()
        // let valid = false
        // for (let i = 0; i < us.length; i++) {
        //     const u = us[i]
        //     if (u.username === this.username && u.password === this.password) {
        //         valid = true
        //         break
        //     }
        // }
        // return valid
        const u = User.findOne('username', this.username)
        return u !== null && u.password === this.password
        // 这样的代码是不好的, 不应该用隐式转换
        // if (l.length) 也是不好的
        // if (l.length > 0)
        // return u && u.password === this.password
    }

    // 校验注册的逻辑
    validateRegister() {
        // log(this.username.length > 2 && this.password.length > 2)
        if (this.username.length > 2 && this.password.length > 2) {
            const u = this
            const all = User.find()
            for (let i of all) {
                if (i.username === u.username) {
                    return false
                }
            }
            return true
        } else {
            return false
        }
    }
}

// MVC
// Ku            模型(数据)
// View             视图(就是我们看的 html)
// Controller       控制器(也就是路由 route)
//

const test = () => {
    const form = {
        username: 'gua2',
        password: '123',
        note: "666"
    }
    const u = User.create(form)
    // log(u.validateRegister())
    // u.save()

    // const u = User.findOne('username', 'gua')
    // u.password = '123456'
    // u.save()

    // const us = User.find('username', 'gua1')
    // console.log('us', us)
}

test()

class Message extends Ku {
    constructor(form={}) {
        super()
        this.author = form.author || ''
        this.content = form.content || ''
        this.extra = 'extra message'
    }

    static fhfa() {

    }
    // static uuxy = 'uuxy'
}

User.uuxy = 'es6 uuxy'

// 这次暴露的是一个包含两个 Ku 的对象
module.exports = {
    User: User,
    Message: Message,
}
