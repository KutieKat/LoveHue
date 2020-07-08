const empty = (value) => {
    if (typeof value === 'string') {
        if (value.length === 0)
            return true;
        return false;
    }
    else {
        if (typeof value === 'undefined')
            throw new Error('Value must not be undefined!');
        throw new Error('Value must be a string!');
    }
};

const containsBlankSpace = (value) => {
    if (typeof value === 'string') {
        if (value.indexOf(' ') > -1)
            return true;
        return false;
    }
    else {
        if (typeof value === 'undefined')
            throw new Error('Value must not be undefined!');
        throw new Error('Value must be a string!');
    }
};

const containsSpecialCharacters = (value) => {
    if (typeof value === 'string') {
        const format = /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/;

        if(format.test(value))
            return true;
        return false;
    }
    else {
        if (typeof value === 'undefined')
            throw new Error('Value must not be undefined!');
        throw new Error('Value must be a string!');
    }
};

const equals = (value1, value2) => {
    return value1 === value2;
};

module.exports = Object.freeze({
    empty,
    containsBlankSpace,
    containsSpecialCharacters,
    equals
});