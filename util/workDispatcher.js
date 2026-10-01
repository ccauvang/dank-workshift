const { workProcess } = require('../workprocess/processWorkMgs');
const { processFarm } = require('../workprocess/processFarm');
const { processNPCSummon } = require('../workprocess/processNPCSummon');
require('dotenv').config();

// add new processor = add 1 line here
const PROCESSORS = [
    { name: 'workShift', run: workProcess,     events: ['create'] },
    { name: 'farm',      run: processFarm,     events: ['create', 'update'] },
    { name: 'npcSummon', run: processNPCSummon, events: ['create', 'update'] },
];

/**
 * Pass Dank message through all processors for that event.
 * Each processor fail alone, no kill others.
 * @param {object} message - Discord message.
 * @param {'create'|'update'} [event='create'] - Which event call this.
 */
function processDankMessage(message, event = 'create') {
    if (!message?.author) return Promise.resolve();
    if (message.author.id != process.env.IDBOTDISCORD) return Promise.resolve();

    return Promise.all(
        PROCESSORS
            .filter(p => p.events.includes(event))
            .map(p =>
                Promise.resolve()
                    .then(() => p.run(message))
                    .catch(err => console.error(`[${p.name}] process fail:`, err))
            )
    );
}

module.exports = { processDankMessage };