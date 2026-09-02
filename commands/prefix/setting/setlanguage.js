const core = require('../../../core/setting/setlanguage');
const { buildCtxFromMessage } = require('../../../util/buildCtx');

module.exports = {
    name: 'setlanguage',
    aliases: ['setlocale', 'lang', 'setlang'],
    description: 'setting.setlanguage.description',
    cooldown: 10,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^setlanguage', '^setlocal'],
    async run(message, lang) {
        const ctx = buildCtxFromMessage(message);
        return core.run.call(this, ctx, lang);
    }
};