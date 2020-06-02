//----------------------------------------------------------------------------------
//---------------------Validering
//----------------------------------------------------------------------------------
const fields = {
    målform: { label: 'målform', htmlId: 'målform' },
    møttPersonlig: { label: 'møttPersonlig', htmlId: 'møttPersonlig' },
    fullmektigMøtt: { label: 'fullmektigMøtt', htmlId: 'fullmektigMøtt' },
    passSjekket: { label: 'passSjekket', htmlId: 'passSjekket' }
};

function validateFormValues(formValues) {
    const tempErrors = [];

    tempErrors.push(...målformValidering(formValues));
    tempErrors.push(...møttPersonligValidering(formValues));
    tempErrors.push(...fullmektigMøttValidering(formValues));
    tempErrors.push(...passSjekketValidering(formValues));

    return tempErrors;
}

function målformValidering(formValues) {
    const målform = formValues.målform;
    let feilmelding = '';

    if (målform === undefined) {
        feilmelding += 'Vennligst velg målform';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.målform.htmlId, feilmelding }];
    }
    return [];
}

function møttPersonligValidering(formValues) {
    const søkerMøttPersonlig = formValues.søkerMøttPersonlig;
    let feilmelding = '';

    if (søkerMøttPersonlig === undefined) {
        feilmelding += 'Vennligst velg om søker har møtt personlig';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.møttPersonlig.htmlId, feilmelding }];
    }
    return [];
}

function fullmektigMøttValidering(formValues) {
    const harFullmektigMøtt = formValues.harFullmektigMøtt;
    let feilmelding = '';

    if (harFullmektigMøtt === undefined) {
        feilmelding += 'Vennligst velg om fullmektig har møtt';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.fullmektigMøtt.htmlId, feilmelding }];
    }
    return [];
}

function passSjekketValidering(formValues) {
    const erPassSjekket = formValues.erPassSjekket;
    let feilmelding = '';

    if (erPassSjekket === undefined) {
        feilmelding += 'Vennligst velg om pass er sjekket';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.passSjekket.htmlId, feilmelding }];
    }
    return [];
}

export const validateForNAV = {
    validateFormValues
};
