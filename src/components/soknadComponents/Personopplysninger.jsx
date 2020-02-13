import React, { useState } from 'react';
import { Systemtittel } from 'nav-frontend-typografi';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { InputFields, JaNeiSpørsmål } from '../FormElements';
import { Hovedknapp } from 'nav-frontend-knapper';

const Personopplysninger = ({ state, updateField, onClick }) => {
    const updateFunction = name => value => updateField(name, value);
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    return (
        <div>
            <Systemtittel>Personlige opplysninger</Systemtittel>
            <div>
                <InputFields
                    labelText="Fødselsnummer"
                    value={state.fnr || ''}
                    bredde="S"
                    id={fields.fnr.htmlId}
                    onChange={updateFunction('fnr')}
                />
            </div>
            <div style={inputFieldsStyle}>
                <InputFields
                    labelText="Fornavn"
                    value={state.fornavn || ''}
                    style={{ minWidth: '13em' }}
                    id={fields.fornavn.htmlId}
                    onChange={updateFunction('fornavn')}
                />
                <InputFields
                    labelText="Mellomnavn"
                    value={state.mellomnavn || ''}
                    style={{ minWidth: '13em' }}
                    onChange={updateFunction('mellomnavn')}
                />
                <InputFields
                    labelText="Etternavn"
                    value={state.etternavn || ''}
                    id={fields.etternavn.htmlId}
                    style={{ minWidth: '13em' }}
                    onChange={updateFunction('etternavn')}
                />
            </div>
            <div>
                <InputFields
                    labelText="Telefonnummer"
                    value={state.telefonnummer || ''}
                    bredde="S"
                    id={fields.telefonnummer.htmlId}
                    onChange={updateFunction('telefonnummer')}
                />
            </div>
            <div style={container}>
                <InputFields
                    labelText="Gateadresse"
                    value={state.gateadresse || ''}
                    style={{ minWidth: '30em' }}
                    id={fields.gateadresse.htmlId}
                    onChange={updateFunction('gateadresse')}
                />
                <InputFields
                    labelText="Bruksenhet"
                    value={state.bruksenhet || ''}
                    onChange={updateFunction('bruksenhet')}
                />
            </div>
            <div style={container}>
                <InputFields
                    labelText="Postnummer"
                    value={state.postnummer || ''}
                    bredde="XS"
                    id={fields.postnummer.htmlId}
                    onChange={updateFunction('postnummer')}
                />
                <InputFields
                    labelText="Poststed"
                    value={state.poststed || ''}
                    id={fields.poststed.htmlId}
                    onChange={updateFunction('poststed')}
                />
                <InputFields
                    labelText="Bokommune"
                    value={state.bokommune || ''}
                    id={fields.bokommune.htmlId}
                    onChange={updateFunction('bokommune')}
                />
            </div>
            <div style={{ marginBottom: '1em' }}>
                <InputFields
                    labelText={'Søkers statsborgerskap (alle)'}
                    bredde={'M'}
                    value={state.statsborgerskap || ''}
                    onChange={updateFunction('statsborgerskap')}
                />
            </div>
            <div style={container}>
                <span style={{ marginRight: '3em' }}>
                    <JaNeiSpørsmål
                        fieldName="flyktning"
                        legend="Er søker registrert som flyktning?"
                        state={state.flyktning}
                        onChange={e => updateField('flyktning', e.target.value)}
                    />
                </span>
                <JaNeiSpørsmål
                    fieldName="bofastnorge"
                    legend="Bor søker fast i Norge?"
                    state={state.bofastnorge}
                    onChange={e => updateField('bofastnorge', e.target.value)}
                />
            </div>
            {feilmeldinger.length > 0 && <Feiloppsummering tittel={'Vennligst fyll ut mangler'} feil={feilmeldinger} />}
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    //------------Lett Validering-----------------------
    function validateForm() {
        const formValues = state;
        const errors = validateFormValues(formValues);
        setFeilmeldinger(errors);
        console.log(state);
        if (errors.length === 0) {
            onClick();
        }
    }
};

const inputFieldsStyle = {
    display: 'flex',
    justifyContent: 'space-between'
};

const container = {
    display: 'flex'
};

const fields = {
    fnr: { label: 'fødselsnummer', htmlId: 'fødselsnummer' },
    fornavn: { label: 'navn', htmlId: 'navn' },
    etternavn: { label: 'etternavn', htmlId: 'etternavn' },
    telefonnummer: { label: 'telefonnummer', htmlId: 'telefonnummer' },
    gateadresse: { label: 'gateadresse', htmlId: 'gateadresse' },
    postnummer: { label: 'postnummer', htmlId: 'postnummer' },
    poststed: { label: 'poststed', htmlId: 'poststed' },
    bokommune: { label: 'bokommune', htmlId: 'bokommune' },
    statsborgerskap: { label: 'statsborgerskap', htmlId: 'statsborgerskap' },
    flyktning: { label: 'flyktning', htmlId: 'flyktning' },
    bofastnorge: { label: 'bofastnorge', htmlId: 'bofastnorge' }
};

function validateFormValues(formValues) {
    const tempErrors = [];
    tempErrors.push(...fnrValidation(formValues));
    tempErrors.push(...fornavnValidering(formValues));
    tempErrors.push(...etternavnValidering(formValues));
    tempErrors.push(...telefonnummerValidering(formValues));
    tempErrors.push(...gateadresseValidering(formValues));
    tempErrors.push(...postnummerValidering(formValues));
    tempErrors.push(...poststedValidering(formValues));
    tempErrors.push(...statsborgerskapValidering(formValues));
    tempErrors.push(...bokommuneValidering(formValues));
    tempErrors.push(...flyktningValidering(formValues));
    tempErrors.push(...borFastNorgeValidering(formValues));

    return tempErrors;
}

function fnrValidation(formValues) {
    const fnr = formValues.fnr;
    let feilmelding = '';
    if (!/^\d{11}$/.test(fnr)) {
        if (fnr === undefined || fnr === '') {
            feilmelding += 'Fødselsnummer må fylles ut';
        } else {
            feilmelding += 'Fødselsnummer må være 11 siffer. Lengde på fnr: ' + fnr.length;
        }
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.fnr.htmlId, feilmelding }];
    }
    return [];
}

function fornavnValidering(formValues) {
    const fornavn = formValues.fornavn;
    let feilmelding = '';
    if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(fornavn) || fornavn === undefined) {
        feilmelding += 'Fornavn må fylles ut. Feltet kan ikke inneholde tall eller spesialtegn';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.fornavn.htmlId, feilmelding }];
    }
    return [];
}

function etternavnValidering(formValues) {
    const etternavn = formValues.etternavn;
    let feilmelding = '';
    if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(etternavn) || etternavn === undefined) {
        feilmelding += 'Etternavn må fylles ut. Etternavn kan ikke inneholde tall eller spesialtegn';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.etternavn.htmlId, feilmelding }];
    }
    return [];
}

function telefonnummerValidering(formValues) {
    const tlfNummer = formValues.telefonnummer;
    let feilmelding = '';

    // Regex for kun norske telefonnummer
    if (!/^\d{8}$/.test(tlfNummer)) {
        if (tlfNummer === undefined || tlfNummer === '') {
            feilmelding += 'Telefonnummer må fylles ut';
        } else {
            feilmelding += 'Telefonnummer må være 8 siffer. Lengde på nummer: ' + tlfNummer.length;
        }
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.telefonnummer.htmlId, feilmelding }];
    }
    return [];
}

function gateadresseValidering(formValues) {
    const gate = formValues.gateadresse;
    let feilmelding = '';
    if (!/^([a-zæøåA-ZÆØÅ.\s\d-]{1,255})$/.test(gate) || gate === undefined) {
        feilmelding += 'Gateadresse må fylles ut';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.gateadresse.htmlId, feilmelding }];
    }
    return [];
}

function postnummerValidering(formValues) {
    const postnummer = formValues.postnummer;
    let feilmelding = '';

    // postnummer med 4 siffer.
    if (!/^\d{4}$/.test(postnummer)) {
        if (postnummer === undefined || postnummer === '') {
            feilmelding += 'Postnummer må fylles ut';
        } else {
            feilmelding += 'Postnummer må være 4 siffer. Lengde på nummer: ' + postnummer.length;
        }
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.postnummer.htmlId, feilmelding }];
    }
    return [];
}

function poststedValidering(formValues) {
    const poststed = formValues.poststed;
    let feilmelding = '';
    if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(poststed) || poststed === undefined) {
        feilmelding += 'Poststed må fylles ut';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.poststed.htmlId, feilmelding }];
    }
    return [];
}

function bokommuneValidering(formValues) {
    const bokommune = formValues.bokommune;
    let feilmelding = '';
    if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(bokommune) || bokommune === undefined) {
        feilmelding += 'Bokommune må fylles ut';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.bokommune.htmlId, feilmelding }];
    }
    return [];
}

function statsborgerskapValidering(formValues) {
    const statsborgerskap = formValues.statsborgerskap;
    let feilmelding = '';
    if (statsborgerskap === '' || statsborgerskap === undefined) {
        feilmelding += 'Vennligst tast inn statsborgerskap';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.statsborgerskap.htmlId, feilmelding }];
    }
    return [];
}

function flyktningValidering(formValues) {
    const flyktning = formValues.flyktning;
    let feilmelding = '';

    if (flyktning === undefined) {
        feilmelding += 'Vennligst velg flyktning status';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.flyktning.htmlId, feilmelding }];
    }
    return [];
}

function borFastNorgeValidering(formValues) {
    const bofastnorge = formValues.bofastnorge;
    let feilmelding = '';

    if (bofastnorge === undefined) {
        feilmelding += 'Vennligst velg bo-status';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.bofastnorge.htmlId, feilmelding }];
    }
    return [];
}

export const validatePersonopplysninger = {
    validateFormValues
};

export default Personopplysninger;
