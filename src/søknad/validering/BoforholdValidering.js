const fields = {
    delerBolig: { label: 'delerBolig', htmlId: 'delerBolig' },
    borSammenMed: { label: 'borSammenMed', htmlId: 'borSammenMed' },
    delerBoligMed: { label: 'delerBoligMed', htmlId: 'delerBoligMed' }
};

function validateFormValues(formValues) {
    const tempErrors = [];
    const delerBoligMedErrors = [];
    tempErrors.push(...delerBoligValidering(formValues));
    tempErrors.push(...borSammenMedValidering(formValues));
    tempErrors.push(...delerBoligMedValidering(formValues, delerBoligMedErrors));

    return tempErrors;
}

function delerBoligValidering(formValues) {
    const delerBolig = formValues.delerBolig;
    let feilmelding = '';

    if (delerBolig === undefined) {
        feilmelding += 'Vennligst velg boforhold';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.delerBolig.htmlId, feilmelding }];
    }
    return [];
}

function borSammenMedValidering(formValues) {
    const borSammenMed = formValues.borSammenMed;
    let feilmelding = '';

    if (formValues.delerBolig) {
        if (
            !borSammenMed.includes('Ektefelle/Partner/Samboer') &&
            !borSammenMed.includes('Barn over 18') &&
            !borSammenMed.includes('Andre personer over 18 år')
        ) {
            feilmelding += 'Vennligst velg hvem søker bor med';
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.borSammenMed.htmlId, feilmelding }];
        }
    }
    return [];
}

function delerBoligMedValidering(formValues, errorsArray) {
    const delerBoligMedArray = formValues.delerBoligMed;

    if (formValues.delerBolig) {
        delerBoligMedArray.map((item, index) => {
            if (item.navn.trim().length === 0) {
                errorsArray.push({
                    skjemaelementId: `${index}-navn`,
                    feilmelding: 'Navn må fylles ut'
                });
            }
            if (item.fnr.trim().length === 0) {
                errorsArray.push({
                    skjemaelementId: `${index}-fnr`,
                    feilmelding: 'Fødselsnummer må fylles ut'
                });
            } else if (!/^\d{11}$/.test(item.fnr.trim())) {
                errorsArray.push({
                    skjemaelementId: `${index}-fnr`,
                    feilmelding: 'Fødselsnummer må være 11 siffer. Lengde på fnr: ' + item.fnr.trim().length
                });
            } else if (item.fnr.trim().length > 11) {
                errorsArray.push({
                    skjemaelementId: `${index}-fnr`,
                    feilmelding: 'Fødselsnummer må være 11 siffer. Lenge på fødselsnummer: ' + item.fnr.trim().length
                });
            }
        });
    }
    return errorsArray;
}

export const validateBoforhold = {
    validateFormValues
};
