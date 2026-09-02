const core = require('../../../core/setting/setprefix');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'setprefix',
    aliases: ['prefix', 'pre'],
    description: 'setting.setprefix.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^setprefix'],
    async run(message, lang) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang);
    }
};