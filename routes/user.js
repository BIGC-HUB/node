const log = (...args) => { console.log.apply(console, args) }
const {
    session,
    currentUser,
    template,
    loginRequired,
    headerFromMapper,
} = require('../routes.js')

const User = require('../ku/user')

// 登录的处理函数, 根据请求方法来处理业务
// 请求原始信息, path 是 /login
const login = (request) => {
    const headers = {
        'Content-Type': 'text/html',
    }
    let result
    if (request.method === 'POST') {
        // 获取表单中的数据
        const form = request.form()
        // 根据 form 生成 User 实例
        const u = User.create(form)
        // 如果不把 validateLogin 方法提取出去, 那就需要像下面这种形式写代码
        // if (u.username === 'gua' && u.password === '123') {
        //
        // }
        if (u.validateLogin()) {
            const sid = randomStr()
            // uvbmsn6e6bfdjag6
            session[sid] = u.username
            headers['Set-Cookie'] = `user=${sid}`
            result = '登录成功'
        } else {
            result = '用户名或者密码错误'
        }
    } else {
        result = ''
    }
    const u = currentUser(request)
    let username
    if (u === null) {
        username = ''
    } else {
        username = u.username
    }
    let body = template('login.html')
    // 使用{{label}} 在页面里做一个记号, 直接替换掉这部分内容
    // 这里的 {{}} 是自己约定的, 完全可以换成其他的形式, 比如 <<>>, >_<result>_<
    body = body.replace('{{username}}', username)
    body = body.replace('{{result}}', result)
    const header = headerFromMapper(headers)
    const r = header + '\r\n' + body
    return r
}

// 注册的处理函数
const register = (request) => {
    let result
    if (request.method === 'POST') {
        const form = request.form()
        const u = User.create(form)
        if (u.validateRegister()) {
            // 如果 u 这个实例符合注册条件, 就调用 save 函数, 将这个 u 保存到文件中
            u.save()
            const us = User.all()
            result = `注册成功<br><pre>${us}</pre>`
        } else {
            result = '用户名和密码长度必须大于2或者用户名已经存在'
        }
    } else {
        result = ''
    }
    let body = template('register.html')
    body = body.replace('{{result}}', result)
    const headers = {
        'Content-Type': 'text/html',
    }
    const header = headerFromMapper(headers)
    const r = header + '\r\n' + body
    return r
}

const profile = (request) => {
    const headers = {
        'Content-Type': 'text/html',
    }
    const header = headerFromMapper(headers)
    let body = template('profile.html')
    const u = currentUser(request)
    body = body.replace('{{username}}', u.username)
    body = body.replace('{{password}}', u.password)
    body = body.replace('{{note}}', u.note)
    const r = header + '\r\n' + body
    return r
}

const routeUser = {
    '/login': login,
    '/register': register,
    '/profile': loginRequired(profile),
}

module.exports = routeUser
