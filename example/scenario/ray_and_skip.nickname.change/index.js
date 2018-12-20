const UserData = require('../../data/user');
const Executer = require('../../executer');
const {Mode} = require('../../../').Constant;
const Launcher = require('../../launcher');

module.exports = {
    name: "同时修改ray&&skip昵称",
    launcher: () => [
        Launcher.Mobile(UserData.ray),
        Launcher.Mobile(UserData.skip)
    ],
    preScenarios: (session) => [
        {
            scene: require('../user.info.get'),
            session: session[0]
        },
        {
            scene: require('../user.info.get'),
            session: session[1]
        }
    ],
    scenes: (session) => [
        {
            mode: Mode.PARALLEL,
            scenes: [
                {
                    executer: Executer.Mobile,
                    method: "user.nickname.reset",
                    timeout: 5000,
                    session: session[0],
                    request: async(steps) => {
                        return {
                            oldNickname: steps(-2).response.nickname,
                            newNickname: `${steps(-2).response.nickname}～`
                        }
                    }
                },
                {
                    executer: Executer.Mobile,
                    method: "user.nickname.reset",
                    timeout: 5000,
                    session: session[1],
                    request: async(steps) => {
                        return {
                            oldNickname: steps(-1).response.nickname,
                            newNickname: `${steps(-1).response.nickname}～`
                        }
                    }
                }
            ],
            response: async function(response, steps) {
                console.log(`用户信息:${JSON.stringify(response)}`)
            }
        }
    ]
}