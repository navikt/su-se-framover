// endrer på tekstinnholdet for oppsumerings-siden
export const jaNeiSpørsmål = state => {
    if (state) {
        return 'Ja';
    } else if (state === false) {
        return 'Nei';
    } else {
        return '';
    }
};

//Dato input fra state "2020-12-25" -> "25-12-2020"
export const reverseDateString = str => {
    if (str !== undefined) {
        const splitString = str.split('-');
        const reverseArray = splitString.reverse();
        const joinedString = reverseArray.join('-');
        return joinedString;
    }
};

//replaces white spaces and dots in an array with nothing
//only to be used for visual presentation for numbers.
//array should contain an object with a field named 'beløp'
export const replace = arr => {
    const newArray = [];
    if (arr.length > 0) {
        arr.forEach(obj => newArray.push(obj.beløp.replace(/\s/g, '').replace(/\./g, '')));
        return newArray;
    }
};

export const isStringBoolean = target => {
    return typeof target === 'string' && (target.toLowerCase() === 'true' || target.toLowerCase() === 'false');
};

export const stringToBoolean = value => {
    return value === 'true';
};

export const displayErrorMessageOnInputField = (feilmeldinger, skjemaElementLabel) => {
    let melding = '';
    feilmeldinger.forEach(obj => {
        if (obj.skjemaelementId === skjemaElementLabel) {
            melding = obj.feilmelding;
        }
    });
    return melding;
};

export const isJsonObject = str => {
    str = JSON.stringify(str);
    try {
        const obj = JSON.parse(str);
        if (typeof obj !== 'object') {
            return false;
        }
    } catch (e) {
        console.log('ERROR');
        return false;
    }
    console.log('returning true');
    return true;
};

//makes a date object out of a date string. String in format 'yyyy-MM-dd'
export const makeDate = dateString => {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    return new Date(year, month, day);
};
