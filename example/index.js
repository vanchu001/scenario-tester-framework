const Tester = require('../');

async function init() {
    //每个场景测试前调用该函数
    console.log('初始化钩子');
}

async function fini() {
    //每个场景测试完成后调用该函数
    console.log('结束钩子');
}

~(async () => {
    Tester.start({
        scenarioFolder      : __dirname + '/scenario', 
        defaultExecuter     : require('./executer').Default,
        hook: {
            init            : init,
            fini            : fini
        }
    })
})();
