const core = require('../../../core/setting/setworkcatch');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'setworkcatch',
    aliases: ['swc', 'wc'],
    description: 'setting.setworkcatch.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^setworkcatch', '^swc'],
    async run(message, lang) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang);
    }
};