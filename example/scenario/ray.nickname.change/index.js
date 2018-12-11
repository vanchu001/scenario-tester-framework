const UserData = require('../../data/user');
const Executer = require('../../executer');
const {Mode} = require('../../../').Constant;
const Launcher = require('../../launcher');

module.exports = {
    name: "修改ray昵称",
    launcher: [
        Launcher.Mobile(UserData.ray),
        Launcher.Manage(UserData.admin)
    ],
    preScenarios: (session) => [
        {
            scene: require('../user.nickname.change'),
            session
        }
    ]
}