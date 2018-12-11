const UserData = require('../../data/user');
const Executer = require('../../executer');
const {Mode} = require('../../../').Constant;
const Launcher = require('../../launcher');

module.exports = {
    name: "获取用户信息",
    launcher: Launcher.Default(UserData.skip),
    scenes: (session) => [
        {
            mode: Mode.SERIAL,
            executer: Executer.Mobile,
            method: "user.info.get",
            timeout: 5000,
            session,
            request: function(steps) {

            },
            response: async(response, steps) => {
                console.log(`用户信息:${JSON.stringify(response)}`)
            }
        }
    ]
}