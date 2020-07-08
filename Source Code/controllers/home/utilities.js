const moment = require('moment');

const ajax = (req) => {
    return req.xhr;
};

const getRelativeTimeString = (timeString) => {
    let relativeTimeString = moment(timeString).fromNow();    
    let replacements = [
        {
            originalString: ['day', 'days'],
            replacementString: 'ngày'
        },
        {
            originalString: ['hour', 'hours'],
            replacementString: 'giờ'
        },
        {
            originalString: ['minute', 'minutes'],
            replacementString: 'phút'
        },
        {
            originalString: ['second', 'seconds'],
            replacementString: 'giây'
        },
        {
            originalString: ['ago'],
            replacementString: 'trước'
        },
        {
            originalString: ['few'],
            replacementString: 'một vài'
        },
        {
            originalString: ['a', 'an', '1n'],
            replacementString: '1'
        }
    ];

    if (relativeTimeString.indexOf('days') > 1) {
        if (parseInt(relativeTimeString) > 3) {
            return `${ moment(timeString).format('DD/MM/YYYY') }, lúc ${ moment(timeString).format('hh:mm') }`;
        }
        else {
            replacements.forEach(replacement => {
                const { originalString, replacementString } = replacement;
        
                originalString.forEach(str => {
                  if (relativeTimeString.includes(str)) {
                      relativeTimeString = relativeTimeString.replace(str, replacementString);
                  }
                });
            });
        
            return relativeTimeString;
        }
    }
};

module.exports = Object.freeze({
    ajax,
    getRelativeTimeString
});