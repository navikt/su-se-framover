const fields = {
    harVarigOpphold: { label: 'harVarigOpphold', htmlId: 'harVarigOpphold' },
    utløpsdato: {
        label: 'utløpsdato',
        htmlId: 'utløpsdato'
    },
    søktOmForlengelse: { label: 'søktOmForlengelse', htmlId: 'søktOmForlengelse' }
};

function validateFormValues(formValues) {
    const tempErrors = [];

    tempErrors.push(...varigOppholdstillatelseValidering(formValues));
    tempErrors.push(...oppholdstillatelseUtløpsdatoValidering(formValues));
    tempErrors.push(...søktforlengelseValidering(formValues));

    return tempErrors;
}

function varigOppholdstillatelseValidering(formValues) {
    const varigOppholdstillatelse = formValues.harVarigOpphold;
    let feilmelding = '';

    if (varigOppholdstillatelse === undefined) {
        feilmelding += 'Vennligst velg varig-oppholdstillatelse';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.harVarigOpphold.htmlId, feilmelding }];
    }
    return [];
}

function oppholdstillatelseUtløpsdatoValidering(formValues) {
    const utløpsdato = formValues.utløpsdato;
    let feilmelding = '';

    if (!formValues.harVarigOpphold) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(utløpsdato)) {
            if (utløpsdato === '' || utløpsdato === undefined) {
                feilmelding += 'Oppholdstillatelsens utløpsdato må oppgis. Den må være på format dd.mm.åååå';
            } else {
                feilmelding += 'Oppholdstillatelsens utløpsdato må være på format dd.mm.åååå';
            }
            if (feilmelding.length > 0) {
                return [
                    {
                        skjemaelementId: fields.utløpsdato.htmlId,
                        feilmelding
                    }
                ];
            }
        }
    }
    return [];
}

function søktforlengelseValidering(formValues) {
    const søktOmForlengelse = formValues.søktOmForlengelse;
    let feilmelding = '';

    if (!formValues.harVarigOpphold) {
        if (søktOmForlengelse === undefined) {
            feilmelding += 'Vennligst velg om søker har søkt om forlengelse';
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.søktOmForlengelse.htmlId, feilmelding }];
        }
    }
    return [];
}

export const validateOppholdstillatelse = {
    validateFormValues
};
