const core = require('../../../core/fish/npcsremind');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'npcsremind',
    aliases: ['npcs', 'npcsr'],
    description: 'fish.npcsremind.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^npcsremind', '^npcs', '^npcsr'],
    async run(message, lang) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang);
    }
};