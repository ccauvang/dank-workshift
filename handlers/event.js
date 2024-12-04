const { readdirSync } = require('fs');

module.exports = (client) => {
    const files = readdirSync('./events/').filter((files) => files.endsWith('.js'));
    files.forEach((file) => {
        try {
            const eventName = file.substring(0, file.indexOf('.js'));
            const event = require(`../events/${file}`);
            client.on(eventName, event.bind(null, client));
        } catch (error) {
            console.log(error);
        }
    });
};