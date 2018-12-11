const UserData = require('../../data/user');
const Executer = require('../../executer');
const {Mode} = require('../../../').Constant;
const Launcher = require('../../launcher');

module.exports = {
    name: "修改昵称",
    launcher: [
        Launcher.Mobile(UserData.skip),
        Launcher.Manage(UserData.admin)
    ],
    preScenarios: (session) => [
        {
            scene: require('../user.info.get'),
            session: session[0]
        }
    ],
    scenes: (session) => [
        {
            mode: Mode.SERIAL,
            executer: Executer.Mobile,
            method: "user.nickname.reset",
            timeout: 5000,
            session: session[0],
            request: async(steps) => {
                return {
                    oldNickname: steps(-1).response.nickname,
                    newNickname: `${steps(-1).response.nickname}～`
                }
            },
            response: async function(response, steps) {
                console.log(`用户信息:${JSON.stringify(response)}`)
            }
        },
        {
            mode: Mode.SERIAL,
            executer: Executer.Manage,
            method: "admin.nickname.check",
            timeout: 5000,
            session: session[1],
            request: async(steps) => {
                return {
                    userId: steps(-2).response.id,
                }
            },
            response: async function(response, steps) {
                console.log(`管理端检查用户昵称:${JSON.stringify(response)}`)
            }
        }
    ]
}