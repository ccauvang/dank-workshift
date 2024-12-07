const { setLocale, ie } = require('../util/i18n');


module.exports = {
    /**
       * Function formated time seconds.
       * @returns
       * @param {number} inputTimeSecond - Number seconds to format. 
       * @param {string} lang - Language to respone.
       * @param {Boolean|false} typeShort - Type of respond long or short default is long.
      */
    timeFormat: function (inputTimeSecond, lang, typeShort = false) {

        setLocale(lang);

        if (typeof inputTimeSecond != 'number') {
            try {
                parseInt(inputTimeSecond);
            } catch (error) {
                throw Error('input allowed only number');
            }
        };

        let timeRaw = [];
        const timeYears = Math.floor(inputTimeSecond / 31536e3);
        if (timeYears != Infinity) {
            const timeDays = Math.floor((inputTimeSecond % 31536e3) / 86400);
            const timeHours = Math.floor(((inputTimeSecond % 31536e3) % 86400) / 3600);
            const timeMinutes = Math.floor((((inputTimeSecond % 31536e3) % 86400) % 3600) / 60);
            const timeSeconds = Math.floor((((inputTimeSecond % 31536e3) % 86400) % 3600) % 60);

            if (typeShort) {
                timeRaw = [
                    [timeYears, ':'],
                    [timeDays, ':'],
                    [timeHours, ':'],
                    [timeMinutes, ':'],
                    [timeSeconds, ':'],
                ];
            } else {
                timeRaw = [
                    [timeYears, ie.__('timeFormat.years')],
                    [timeDays, ie.__('timeFormat.days')],
                    [timeHours, ie.__('timeFormat.hours')],
                    [timeMinutes, ie.__('timeFormat.minutes')],
                    [timeSeconds, ie.__('timeFormat.seconds')],
                ];
            }
        } else {
            timeRaw = [['Infinity WTF ARE YOU OK?', '']];
        }

        let outputTimeFormat = '';

        timeRaw.forEach(timePice => {

            if (timePice[0] != 0) {
                outputTimeFormat += ' ' + timePice[0] + ' ' + timePice[1];
            }
        });
        return outputTimeFormat.trim();
    }
};