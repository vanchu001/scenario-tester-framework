const Executer = require('../../../').Executer;

module.exports = class extends Executer{
    constructor(session) {
        super(session);
        this._session = session;
    }

    async run(method, requestParams, timeout) {
        switch(method) {
            case 'admin.nickname.check':
                if (this._session == undefined) throw new Error('you must login first');
                return {
                    userId: requestParams.userId,
                    state: 'ok'
                }
            default:
                return {method};
        }

    }
}
