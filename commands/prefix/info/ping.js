// commands/prefix/info/ping.js
const core = require('../../../core/info/ping');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'ping',
    aliases: ['pi'],
    description: 'info.ping.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(), // still "info", depth doesn't matter
    usage: ['^ping'],
    async run(message, lang) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang);
    }
};