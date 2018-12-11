module.exports = class Executer {
    constructor(session){}
    
    async run(method, requestParams) {
        throw new Error(`"run" method is expected to be implemented in subclass`);
    }
}