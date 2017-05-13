const Model = require('../ku.js')
class User extends Model {
    constructor(form={}) {
        super()
        this.id = form.id
        this.username = form.username || ''
        this.password = form.password || ''
        this.note = form.note || ''
    }

    validateLogin() {
        const u = User.findOne({
            username: this.username
        })
        return u !== null && u.password === this.password
    }

    validateRegister() {
        const validForm = this.username.length > 2 && this.password.length > 2
        const uniqueUser = User.findOne('username', this.username) === null
        return validForm && uniqueUser
    }
}

const test = () => {

}

// 当 nodejs 直接运行一个文件时, require.main 会被设为它的 module
// 所以可以通过如下检测确定一个文件是否直接运行
if (require.main === module) {
    test()
}

module.exports = User
