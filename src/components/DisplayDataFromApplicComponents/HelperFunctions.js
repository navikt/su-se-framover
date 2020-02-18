// endrer på tekstinnholdet for oppsumerings-siden
export const jaNeiSpørsmål = state => {
    if (state === 'true') {
        return 'Ja';
    } else if (state === 'false') {
        return 'Nei';
    } else {
        return '';
    }
};

//Dato input fra state "2020-12-25" -> "25-12-2020"
export const reverseString = str => {
    const splitString = str.split('-');
    const reverseArray = splitString.reverse();
    const joinedString = reverseArray.join('-');
    return joinedString;
};
