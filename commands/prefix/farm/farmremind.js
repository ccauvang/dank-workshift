const core = require('../../../core/farm/farmremind');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'farmremind',
    aliases: ['fr', 'farmr'],
    description: 'farm.farmremind.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^farmremind', '^fr'],
    async run(message, lang) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang);
    }
};