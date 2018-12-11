const walk = require('klaw-sync');
const Scenario = require('./src/scenario');

module.exports = class {
    static get Executer() {
        return require('./src/executer');
    }

    static get Constant() {
        return require('./src/constant');
    }

    static async start({scenarioFolder, defaultExecuter, hook:{init, fini}}) {
        for (let {path: configPath} of walk(scenarioFolder, {nodir: true})) {
            let {name, launcher, preScenarios, scenes} = require(configPath);
            let scenario = new Scenario({
                scenes,
                launcher,
                defaultExecuter, 
                preScenarios,
                init, 
                fini
            });

            describe(name, function() {
                it('', async function() {
                    this.timeout(scenario.timeout);
                    await scenario.run();
                })
            });
        }
    }
}