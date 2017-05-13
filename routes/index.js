const log = (...args) => { console.log.apply(console, args) }
const fs = require('fs')
const {
    session,
    currentUser,
    template,
    headerFromMapper,
    img
} = require('../routes.js')
const index = (request) => {
    const headers = {
        'Content-Type': 'text/html',
    }
    const header = headerFromMapper(headers)
    let body = template('index.html')
    const u = currentUser(request)
    // 应同学要求使用三元表达式
    const username = u ? u.username : ''
    body = body.replace('{{username}}', username)
    const r = header + '\r\n' + body
    return r
}

const favicon = (request) => {
    // 静态资源的处理, 读取图片并生成相应返回
    const filename = 'favicon.ico'
    const path = `img/${filename}`
    const body = fs.readFileSync(path)
    const header = headerFromMapper()

    const h = Buffer.from(header + '\r\n')
    const r = Buffer.concat([h, body])
    return r
}

const routeIndex = {
    '/': index,
    '/img': img,
    '/favicon.ico': favicon,
}

module.exports = routeIndex
