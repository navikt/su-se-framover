const fields = {
    framsattKravAnnenYtelse: { label: 'framsattKravAnnenYtelse', htmlId: 'framsattKravAnnenYtelse' },
    framsattKravAnnenYtelseBegrunnelse: {
        label: 'framsattKravAnnenYtelseBegrunnelse',
        htmlId: 'framsattKravAnnenYtelseBegrunnelse'
    },
    harInntekt: {
        label: 'harInntekt',
        htmlId: 'harInntekt'
    },
    inntektsBeløp: { label: 'inntektsBeløp', htmlId: 'inntektsBeløp' },
    harPensjon: { label: 'harPensjon', htmlId: 'harPensjon' },
    formue: { label: 'formue', htmlId: 'formue' },
    finansformue: { label: 'finansformue', htmlId: 'finansformue' },
    annenFormue: { label: 'annenFormue', htmlId: 'annenFormue' },
    formueBeløp: { label: 'formueBeløp', htmlId: 'formueBeløp' },
    typeFormue: { label: 'typeFormue', htmlId: 'typeFormue' },
    skattetakst: { label: 'skattetakst', htmlId: 'skattetakst' },
    harDepositumskonto: { label: 'harDepositumskonto', htmlId: 'harDepositumskonto' },
    depositumBeløp: { label: 'depositumBeløp', htmlId: 'depositumBeløp' },
    harSosialStønad: { label: 'harSosialStønad', htmlId: 'harSosialStønad' }
};

function validateFormValues(formValues) {
    const tempErrors = [];
    const pensjonsOrdningErrors = [];
    const tempAnnenFormueEiendomArray = [];

    tempErrors.push(...framsattKravAnnenYtelseValidering(formValues));
    tempErrors.push(...framsattKravAnnenYtelseBegrunnelseValidering(formValues));
    tempErrors.push(...arbeidsInntektValidering(formValues));
    tempErrors.push(...arbeidsBeløpValidering(formValues));
    tempErrors.push(...pensjonValidering(formValues));
    tempErrors.push(...pensjonsOrdningValidering(formValues, pensjonsOrdningErrors));
    tempErrors.push(...finansformueValidering(formValues));
    tempErrors.push(...formueValidering(formValues));
    tempErrors.push(...formueBeløpValidering(formValues));
    tempErrors.push(...annenFormue(formValues));
    tempErrors.push(...annenFormueEiendomArray(formValues, tempAnnenFormueEiendomArray));
    tempErrors.push(...harSøkerDepositumskontoValidering(formValues));
    tempErrors.push(...depositumsBeløpValidering(formValues));
    tempErrors.push(...sosialStønadValidering(formValues));

    return tempErrors;
}

function framsattKravAnnenYtelseValidering(formValues) {
    const krav = formValues.framsattKravAnnenYtelse;
    let feilmelding = '';

    if (krav === undefined) {
        feilmelding +=
            'Vennligst velg om søker har fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.framsattKravAnnenYtelse.htmlId, feilmelding }];
        }
    }
    return [];
}

function framsattKravAnnenYtelseBegrunnelseValidering(formValues) {
    const begrunnelse = formValues.framsattKravAnnenYtelseBegrunnelse;
    let feilmelding = '';

    if (formValues.framsattKravAnnenYtelse) {
        if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(begrunnelse) || begrunnelse === undefined) {
            feilmelding +=
                'Vennligst oppgi hva slags ytelse/pensjon søker mottar. Kan ikke inneholde tall eller spesialtegn';
        }
        if (feilmelding.length > 0) {
            return [
                {
                    skjemaelementId: fields.framsattKravAnnenYtelseBegrunnelse.htmlId,
                    feilmelding
                }
            ];
        }
    }
    return [];
}

function arbeidsInntektValidering(formValues) {
    const harInntekt = formValues.harInntekt;
    let feilmelding = '';

    if (harInntekt === undefined) {
        feilmelding += 'Vennligst velg om søker har arbeids/person-inntekt';

        if (feilmelding.length > 0) {
            return [
                {
                    skjemaelementId: fields.harInntekt.htmlId,
                    feilmelding
                }
            ];
        }
    }
    return [];
}

function arbeidsBeløpValidering(formValues) {
    const arbeidsBeløp = formValues.inntektBeløp;
    let feilmelding = '';

    if (formValues.harInntekt) {
        if (!/^(\d{1,30})$/.test(arbeidsBeløp) || arbeidsBeløp === undefined) {
            feilmelding += 'Vennligst tast inn arbeids/pensjon-inntekt beløp';

            if (feilmelding.length > 0) {
                return [{ skjemaelementId: fields.inntektsBeløp.htmlId, feilmelding }];
            }
        }
    }
    return [];
}

function pensjonValidering(formValues) {
    const pensjon = formValues.harPensjon;
    let feilmelding = '';

    if (pensjon === undefined) {
        feilmelding += 'Vennligst velg om søker har pensjon';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.harPensjon.htmlId, feilmelding }];
        }
    }
    return [];
}

function pensjonsOrdningValidering(formValues, errorsArray) {
    const tempPensjonsOrdningArray = formValues.pensjonsOrdning;

    if (formValues.harPensjon === true) {
        tempPensjonsOrdningArray.map((item, index) => {
            if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(item.ordning)) {
                if (item.ordning === '' || item.ordning === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-ordning`,
                        feilmelding: 'Ordning må fylles ut'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-ordning`,
                        feilmelding: 'Ordning kan ikke inneholde tall eller spesialtegn'
                    });
                }
            }
            if (!/^(\d{1,30})$/.test(item.beløp)) {
                if (item.beløp === '' || item.beløp === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-beløp`,
                        feilmelding: 'Beløp må fylles ut'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-beløp`,
                        feilmelding: 'Beløp kan kun inneholde tall'
                    });
                }
            }
        });
    }
    return errorsArray;
}

function formueValidering(formValues) {
    const formue = formValues.harFormueEiendom;
    let feilmelding = '';

    if (formue === undefined) {
        feilmelding += 'Vennligst velg om søker har formue/eiendom';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.formue.htmlId, feilmelding }];
        }
    }
    return [];
}

function finansformueValidering(formValues) {
    const finansformue = formValues.harFinansFormue;
    let feilmelding = '';

    if (finansformue === undefined) {
        feilmelding += 'Vennligst velg om søker har finansformue';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.finansformue.htmlId, feilmelding }];
    }
    return [];
}

function formueBeløpValidering(formValues) {
    const formueBeløp = formValues.formueBeløp;
    let feilmelding = '';

    if (formValues.harFormueEiendom === true || formValues.harFinansFormue === true) {
        if (!/^(\d{1,30})$/.test(formueBeløp) || formueBeløp === undefined) {
            feilmelding += 'Vennligst tast inn totalbeløp for harFormueEiendom';

            if (feilmelding.length > 0) {
                return [{ skjemaelementId: fields.formueBeløp.htmlId, feilmelding }];
            }
        }
    }
    return [];
}

function annenFormue(formValues) {
    const annenFormue = formValues.harAnnenFormue;
    let feilmelding = '';

    if (annenFormue === undefined) {
        feilmelding += 'Vennligst velg om søker har annen harFormueEiendom/eiendom';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.annenFormue.htmlId, feilmelding }];
        }
    }
    return [];
}

function annenFormueEiendomArray(formValues, errorsArray) {
    const annenFormue = formValues.annenFormue;

    if (formValues.harAnnenFormue === true) {
        annenFormue.map((item, index) => {
            if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(item.typeFormue)) {
                errorsArray.push({
                    skjemaelementId: `${index}-typeFormue`,
                    feilmelding: 'Type harFormueEiendom må fylles ut'
                });
            }
            if (!/^(\d{1,30})$/.test(item.skattetakst)) {
                errorsArray.push({
                    skjemaelementId: `${index}-skattetakst`,
                    feilmelding: 'Skattetakst må fylles ut, og kan kun inneholde tall'
                });
            }
        });
    }
    return errorsArray;
}

function harSøkerDepositumskontoValidering(formValues) {
    const depositumskonto = formValues.harDepositumskonto;
    let feilmelding = '';

    if (depositumskonto === undefined) {
        feilmelding += 'Vennligst velg om søker har depositumskonto';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.harDepositumskonto.htmlId, feilmelding }];
        }
    }

    return [];
}

function depositumsBeløpValidering(formValues) {
    const harDepositumskonto = formValues.harDepositumskonto;
    let feilmelding = '';

    if (harDepositumskonto === true) {
        const beløp = formValues.depositumBeløp;

        if (!/^(\d{1,30})$/.test(beløp)) {
            feilmelding += 'Depositum beløp kan ikke være tom, og kan kun inneholde tall';
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.depositumBeløp.htmlId, feilmelding }];
        }
    }
    return [];
}

function sosialStønadValidering(formValues) {
    const sosial = formValues.harSosialStønad;
    let feilmelding = '';

    if (sosial === undefined) {
        feilmelding += 'Vennligst velg om søker mottar sosial stønad';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.harSosialStønad.htmlId, feilmelding }];
    }
    return [];
}

export const validateInntektPensjonFormue = {
    validateFormValues
};
