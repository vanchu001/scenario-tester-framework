const Executer = require('../../../').Executer;

module.exports = class extends Executer{
    constructor(session) {
        super(session);
        this._session = session;
    }

    async run(method, requestParams) {
        switch(method) {
            case 'user.info.get':
                if (this._session == undefined) throw new Error('you must login first');
                
                return {
                    id: Math.random(),
                    age: 25,
                    nickname: this._session
                }
            case 'user.nickname.reset':
                if (this._session == undefined) throw new Error('you must login first');
                return {
                    newNickname: requestParams.newNickname,
                    oldNickname: requestParams.oldNickname
                }
            default:
                return {method};
        }

    }
}
