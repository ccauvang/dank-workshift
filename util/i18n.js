const { join } = require('path');
const i18n = require('i18n');
require('dotenv').config();

i18n.configure({
    locales: ['vi', 'en'],
    directory: join(__dirname, '..', 'locales'),
    defaultLocale: process.env.LANGUAGE,
    retryInDefaultLocale: true,
    objectNotation: true,
    // register: global,

    logWarnFn: function (msg) {
        console.log('warn', msg);
    },

    logErrorFn: function (msg) {
        console.log('erro', msg);
    },

    missingKeyFn: function (locale, value) {
        return value;
    },

    mustacheConfig: {
        tags: ['{{', '}}'],
        disable: false
    }
});

i18n.setLocale(process.env.LANGUAGE);

module.exports = {
    ie: i18n,
    setLocale: function (lang) {
        i18n.setLocale(lang);
    }
};