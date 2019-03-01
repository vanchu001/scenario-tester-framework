const Constant = require('../constant');

const Scenario = class {
    constructor({scenes, defaultExecuter, preScenarios = undefined, launcher = undefined, session = undefined, record = undefined}) {
        this._executer = new Map();
        this._scenes = scenes;
        this._preScenarios = preScenarios;
        this._defaultExecuter = defaultExecuter;
        this._launcher = launcher;
        this._session = session;
        this._record = record === undefined ? new Record() : record;
    }

    get timeout() {
        let timeout = 0;
        if (this._preScenarios != undefined) {
            for (let preScenario of this._preScenarios([])) {
                let {scene: {preScenarios: subPreScenarios, scenes: subScenes}} = preScenario;
                let {timeout: subTimeout} = new Scenario({
                    scenes: subScenes,
                    preScenarios: subPreScenarios,
                    session: []
                });
                timeout += subTimeout;
            }
        }

        if (this._scenes != undefined) {
            for (let _ of this._scenes([])) {
                switch(_.mode) {
                    case Constant.Mode.PARALLEL:
                        timeout += _.scenes.reduce((prev, curr) => {
                            prev += this._getSceneTimeout(curr)
                            return prev;
                        }, 0);
                        break;
                    case Constant.Mode.SERIAL:
                    default:
                        timeout += this._getSceneTimeout(_);
                        break;
                }
            }
        }
        return timeout;
    }

    _getSceneTimeout(scene) {
        let {timeout = 5000} = scene;
        return timeout;
    }

    async run() {
        let record = this._record;

        //step1. 创建session
        let session = undefined;
        if (this._session != undefined) {
            session = this._session;
        }
        else if (this._launcher != undefined) {
            let launcher = this._launcher();
            if (launcher instanceof Array) {
                session = await Promise.all(launcher);
            }
            else if (launcher instanceof Promise) {
                session = await launcher;
            }
        }

        //step2. 执行preScenarios
        if (this._preScenarios != undefined) {
            for (let preScenario of this._preScenarios(session)) {
                let {scene: {preScenarios: subPreScenarios, scenes: subScenes} , session: subSession} = preScenario;
                let scenario = new Scenario({
                    scenes: subScenes,
                    session: subSession == undefined ? session : subSession,
                    defaultExecuter: this._defaultExecuter, 
                    preScenarios: subPreScenarios,
                    undefined, 
                    undefined,
                    record: record.length === 0 ? new Record() : new Record(record.get(-1))
                });
                let subRecord = await scenario.run();
                record.add(subRecord.get(-1))
            }
        }

        //step3. 执行scenes
        if (this._scenes != undefined) {
            for (let _ of this._scenes(session)) {
                let result = undefined;
                switch(_.mode) {
                    case Constant.Mode.PARALLEL:
                        result = await Promise.all(
                            _.scenes.map(
                                scene => this._run(
                                    scene.method,
                                    scene.executer != undefined ? scene.executer : this._defaultExecuter,
                                    this._getSceneTimeout(scene),
                                    scene.session != undefined ? scene.session : session,
                                    scene.request != undefined ? scene.request : undefined,
                                    (index) => record.get(index)
                                )
                            )
                        );

                        if (_.response != undefined) {
                            await _.response(
                                result.map(_ => _.response), 
                                (index) => record.get(index), 
                                result.every(_ => _.error == undefined) ? undefined : result.map(_ => _.error)
                            );
                        }
                        break;
                    case Constant.Mode.SERIAL:
                    default:
                        result = await this._run(
                            _.method,
                            _.executer != undefined ? _.executer : this._defaultExecuter,
                            this._getSceneTimeout(_),
                            _.session != undefined ? _.session : session,
                            _.request != undefined ? _.request : undefined,
                            (index) => record.get(index)
                        );
                        if (_.response != undefined) {
                            await _.response(
                                result.response, 
                                (index) => record.get(index), 
                                result.error
                            );
                        }
                        break;
                }
                
                record.add(result);
            }
        }

        return record;
    }

    async _run(method, executer, timeout, session, request, scenarioRecord) {
        let requestParams = null;
        if (request != undefined) requestParams = await request((index) => scenarioRecord(index));

        let result = undefined;
        try {
            result = await new Promise(async (resolve ,reject) => {
                setTimeout(() => reject(`method ${method} timeout`), timeout);
                try {
                    return resolve(await (new executer(session)).run(method, requestParams, timeout));
                }
                catch(error) {
                    return reject(error);
                }
            })
        }
        catch(error) {
            return {
                request: requestParams,
                response: result,
                error
            }
        }

        return {
            request: requestParams,
            response: result
        }
    }
}

class Record {
    constructor(...dataset) {
        this._dataset = dataset;
    }

    add(record) {
        this._dataset.push(record);
    }

    get(index = undefined) {
        if (index == undefined) {
            index = this._dataset.length - 1;
        }
        else if(index < 0) {
            index = this._dataset.length + index;
        }

        if (this._dataset.length < 0 || index >= this._dataset.length) {
            throw new Error(`invalid index ${index}`);
        }
        return this._dataset[index];
    }
}

module.exports = Scenario;