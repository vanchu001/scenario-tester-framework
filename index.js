const Scenario = require('./src/scenario');

module.exports = class {
    static get Executer() {
        return require('./src/executer');
    }

    static get Constant() {
        return require('./src/constant');
    }

    static async start({scenarios, defaultExecuter, hook:{init, fini}}) {
        for (let _ of scenarios) {
            let {name, launcher, preScenarios, scenes} = require(_);
            let scenario = new Scenario({
                scenes,
                launcher,
                defaultExecuter, 
                preScenarios
            });

            describe(name, function() {
                before(async function() {
                    this.timeout(30000);
                    if (init != undefined) await init();
                })

                it('', async function() {
                    this.timeout(scenario.timeout);
                    await scenario.run();
                })

                after(async function() {
                    this.timeout(30000);
                    if (fini != undefined) await fini();
                })
            });
        }
    }
}