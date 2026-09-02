const core = require('../../../core/info/help');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'info.help.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^help', '^h'],
    async run(message, lang, args) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang, args);
    }
};