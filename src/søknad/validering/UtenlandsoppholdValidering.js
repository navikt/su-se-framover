const fields = {
    utenlandsopphold: { label: 'utenlandsopphold', htmlId: 'utenlandsopphold' },
    utreiseFørInnreise: {label: "utreiseFørInnreise", htmlId: "utreiseFørInnreise"},
    planlagtUtenlandsopphold: {
        label: 'planlagtUtenlandsopphold',
        htmlId: 'planlagtUtenlandsopphold'
    },
    planlagtUtreiseFørInnreise: {label: "planlagtUtreiseFørInnreise", htmlId: "planlagtUtreiseFørInnreise" }
};

function validateFormValues(formValues) {
    const tempErrors = [];
    const utenlandsoppholdErrors = [];
    const planlagtUtenlandsoppholdErrors = [];
    tempErrors.push(...validateDates(formValues));
    tempErrors.push(...utenlandsoppholdValidering(formValues));
    tempErrors.push(...utenlandsoppholdFelterValidering(formValues, utenlandsoppholdErrors));
    tempErrors.push(...validatePlanlagtDates(formValues));
    tempErrors.push(...planlagtUtenlandsoppholdValidering(formValues));
    tempErrors.push(...planlagtUtenlandsoppholdFelterValidering(formValues, planlagtUtenlandsoppholdErrors));

    return tempErrors;
}

const makeDate = dateString => {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    return new Date(year, month, day);
};

const dates = (utreiseDato, innreiseDato) => {
    const aDate = makeDate(utreiseDato);
    const bDate = makeDate(innreiseDato);
    return aDate.getTime() > bDate.getTime();
};

function validateDates(formValues) {
    const errorsArray = [];
    const tempUtenlandsoppholdArray = formValues.registrertePerioder;

    if (formValues.utenlandsopphold) {
        const x = tempUtenlandsoppholdArray
            .map(item => {
                const utreise = item.utreisedato;
                const innreise = item.innreisedato;

                const result = dates(utreise, innreise);

                if (result) {
                    const feilmelding = 'Utreisedato kan ikke være før innreisedato';

                    return { skjemaelementId: fields.utreiseFørInnreise.htmlId, feilmelding };
                }
            })
            .filter(item => item !== undefined);
        return x;
    }
    return errorsArray;
}

function utenlandsoppholdValidering(formValues) {
    const utenlandsopphold = formValues.utenlandsopphold;
    let feilmelding = '';

    if (utenlandsopphold === undefined) {
        feilmelding += 'Vennligst velg utenlandsopphold';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.utenlandsopphold.htmlId, feilmelding }];
    }
    return [];
}

function utenlandsoppholdFelterValidering(formValues, errorsArray) {
    const tempUtenlandsoppholdArray = formValues.registrertePerioder;

    if (formValues.utenlandsopphold) {
        tempUtenlandsoppholdArray.map((item, index) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.utreisedato)) {
                if (item.utreisedato === '' || item.utreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-utreisedato`,
                        feilmelding: 'Utreisedato må fylles ut'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-utreisedato`,
                        feilmelding: 'Utreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.innreisedato)) {
                if (item.innreisedato === '' || item.innreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-innreisedato`,
                        feilmelding: 'Innreisedato må fylles ut'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-innreisedato`,
                        feilmelding: 'Innreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
        });
    }
    return errorsArray;
}

function validatePlanlagtDates(formValues) {
    const errorsArray = [];
    const tempUtenlandsoppholdArray = formValues.planlagtePerioder;

    if (formValues.planlagtUtenlandsopphold) {
        const x = tempUtenlandsoppholdArray
            .map(item => {
                const utreise = item.utreisedato;
                const innreise = item.innreisedato;
                const result = dates(utreise, innreise);

                if (result) {
                    const feilmelding = 'Planlagt utreisedato kan ikke være før planlagt innreisedato';
                    return { skjemaelementId: fields.planlagtUtreiseFørInnreise.htmlId, feilmelding };
                }
            })
            .filter(item => item !== undefined);
        return x;
    }
    return errorsArray;
}

function planlagtUtenlandsoppholdValidering(formValues) {
    const planlagtUtenlandsopphold = formValues.planlagtUtenlandsopphold;
    let feilmelding = '';

    if (planlagtUtenlandsopphold === undefined) {
        feilmelding += 'Vennligst velg planlagt utenlandsopphold';
    }
    if (feilmelding.length > 0) {
        return [
            {
                skjemaelementId: fields.planlagtUtenlandsopphold.htmlId,
                feilmelding
            }
        ];
    }
    return [];
}

function planlagtUtenlandsoppholdFelterValidering(formValues, errorsArray) {
    const tempPlanlagtUtenlandsoppholdArray = formValues.planlagtePerioder;

    if (formValues.planlagtUtenlandsopphold) {
        tempPlanlagtUtenlandsoppholdArray.map((item, index) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.utreisedato)) {
                if (item.utreisedato === '' || item.innreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-utreisedato-planlagt`,
                        feilmelding: 'Planlagt utreisedato må fylles ut'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-utreisedato-planlagt`,
                        feilmelding: 'Planlagt utreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.innreisedato)) {
                if (item.innreisedato === '' || item.innreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-innreisedato-planlagt`,
                        feilmelding: 'Planlagt innreisedato kan ikke være tom'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-innreisedato-planlagt`,
                        feilmelding: 'Planlagt innreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
        });
    }
    return errorsArray;
}

export const validateUtenlandsopphold = {
    validateFormValues
};