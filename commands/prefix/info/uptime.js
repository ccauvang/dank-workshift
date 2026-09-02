const core = require('../../../core/info/uptime');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'uptime',
    aliases: ['up', 'live'],
    description: 'info.uptime.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^uptime'],
    async run(message, lang) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang);
    }
};