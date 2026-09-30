const core = require('../../../core/info/myinfo');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'myinfo',
    aliases: ['whoami', 'me'],
    description: 'info.myinfo.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^myinfo', '^whoami', '^me'],
    async run(message, lang) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang);
    }
};