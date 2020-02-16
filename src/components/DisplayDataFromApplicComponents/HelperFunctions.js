 export  const jaNeiSpørsmål = (state) => {
        if (state === 'true') {
            return 'Ja';
        } else if (state === 'false') {
            return 'Nei';
        } else {
            return '';
        }
    }

    export  const reverseString = (str) =>  {
        const splitString = str.split('-');
        const reverseArray = splitString.reverse();
        const joinedString = reverseArray.join('-');
        return joinedString;
    }
