// 引入模块
const log = (...args) => { console.log.apply(console, args) }
const fs = require('fs')
const User = require('./ku/user')

const session = {}

// currentUser 现在改成返回 user 实例, 这样可以直接拿到 user 的所有信息
// 但是对于 username 的处理需要加一层判断, 因为 u 可能是 null
// 为了消除这种判断, 可以使用 fake user(这个上课会讲)
const currentUser = (request) => {
    const id = request.cookies.user || ''
    // const uid = session[id] || -1
    const username = session[id]
    const u = User.findOne('username', username)
    return u
}

// 读取 html 文件的函数
// 这样我们可以把页面的内容写入到 html 文件中, 专注处理逻辑
const template = (name) => {
    const path = 'html/' + name
    const options = {
        encoding: 'utf8'
    }
    const content = fs.readFileSync(path, options)
    return content
}

const headerFromMapper = (mapper={}, code=200) => {
    let base = `HTTP/1.1 ${code} OK\r\n`
    const keys = Object.keys(mapper)
    const s = keys.map((k) => {
        const v = mapper[k]
        const h = `${k}: ${v}\r\n`
        return h
    }).join('')

    const header = base + s
    return header
}

// 图片的响应函数, 读取图片并生成响应返回
const img = (request) => {
    // 静态资源的处理, 读取图片并生成相应返回
    const filename = request.query.file || 'doge.gif'
    const path = `img/${filename}`
    const body = fs.readFileSync(path)
    const header = headerFromMapper()
    const h = Buffer.from(header + '\r\n')
    const r = Buffer.concat([h, body])
    return r
}

// 重定向函数
const redirect = (url) => {
    // 浏览器在收到 302 响应的时候
    // 会自动在 HTTP header 里面找 Location 字段并获取一个 url
    // 然后自动请求新的 url
    const headers = {
        Location: url,
    }
    const header = headerFromMapper(headers, 302)
    const r=  header + '\r\n' + ''
    return r
}

// 检测是否登录的函数
// 实际上这个就是装饰器模式
// @login_required
const loginRequired = (routeFunc) => {
    const func = (request) => {
        const u = currentUser(request)
        if (u === null) {
            return redirect('/login')
        } else {
            return routeFunc(request)
        }
    }
    return func
}

module.exports = {
    session: session,
    currentUser: currentUser,
    template: template,
    headerFromMapper: headerFromMapper,
    img: img,
    redirect: redirect,
    loginRequired: loginRequired,
}
