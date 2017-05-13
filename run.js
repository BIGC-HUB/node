const log = (...args) => { console.log.apply(console, args) }
const net = require('net')
const fs = require('fs')

// 引入封装之后的 request
const Request = require('./req.js')

const routeIndex = require('./routes/index')
const routeUser = require('./routes/user')
const routeMessage = require('./routes/message')
const routeTodo = require('./routes/todo')

const error = (code=404) => {
    const e = {
        404: 'HTTP/1.1 404 NOT FOUND\r\n\r\n<h1>NOT FOUND</h1>',
    }
    const r = e[code] || ''
    return r
}

const responseFor = (raw, request) => {
    // 定义一个基本的 route, 是一个空 object,
    // 定一个变量而不是直接 Object.assign({}) 是因为需要表明 {} 是什么
    const route = {}
    // 然后将引入进来的 routeMapper 与 route 合并
    // Object.assign 的作用是合并多个 object, 然后将合并后的 object 返回
    const routes = Object.assign(route, routeIndex, routeUser, routeMessage, routeTodo)

    // console.log('debug base route', route)

    // 获取 response 函数
    const response = routes[request.path] || error

    // 将 request 作为 response 的参数传出去, 这样每一个 response 都可以与对应的 request 挂钩
    const resp = response(request)
    return resp
}

const processRequest = (data, socket) => {
    const raw = data.toString('utf8')
    const request = new Request(raw)
    const ip = socket.localAddress

    // 然后调用 responseFor, 根据 request 生成响应内容
    // 因为除了 path, 还有 method, query, body 都会影响 response 的内容
    const response = responseFor(raw, request)
    socket.write(response)
    socket.destroy()
}

// 把逻辑放在单独的函数中, 这样可以方便地调用
// 指定了默认的 host 和 port, 因为用的是默认参数, 当然可以在调用的时候传其他的值
const run = (host='', port=3000) => {
    // 创建一个服务器, 这个是套路写法
    const server = new net.Server()

    // 开启一个服务器监听连接
    server.listen(port, host, () => {
        const address = server.address()
        log(`listening server at http://${address.address}:${address.port}`)
    })

    server.on('connection', (s) => {
        s.on('data', (data) => {
            processRequest(data, s)
        })
    })

    // 服务器出错的时候会触发这个事件, 但是具体什么出错是未知的, 套路写法
    server.on('error', (error) => {
        log('server error', error)
    })

    // 当服务器关闭时被触发
    server.on('close', () => {
        log('server closed')
    })
}

// 程序的入口
const __main = () => {
    run('127.0.0.1', 5000)
}

// 调用 main 函数
// 如果是使用 node app.js 的方式运行, 那么 require.main 就是 module
// 否则不是(比如 const app = require('./app.js')
// 实际上这里就是一个套路

if (require.main === module) {
    __main()
}
