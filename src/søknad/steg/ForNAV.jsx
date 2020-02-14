import React, { useState } from 'react';
import { RadioGruppe, Radio, Feiloppsummering } from 'nav-frontend-skjema';
import { Systemtittel } from 'nav-frontend-typografi';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import { Hovedknapp } from 'nav-frontend-knapper';

const ForNAV = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    const updateFunction = name => value => updateField(name, value);

    return (
        <div>
            <div>
                <Systemtittel>Språkform</Systemtittel>
                <div>
                    <RadioGruppe legend="Hvilken målform ønsker du i svaret?">
                        <div>
                            <Radio
                                name="maalform"
                                label="Bokmål"
                                value="Bokmål"
                                checked={state.maalform === 'Bokmål'}
                                onChange={e => updateField('maalform', e.target.value)}
                            />
                            <Radio
                                name="maalform"
                                label="Nynorsk"
                                value="Nynorsk"
                                checked={state.maalform === 'Nynorsk'}
                                onChange={e => updateField('maalform', e.target.value)}
                            />
                        </div>
                    </RadioGruppe>
                </div>
            </div>
            <div>
                <Systemtittel>For NAV</Systemtittel>
                <div style={container}>
                    <div style={{ marginRight: '2em' }}>
                        <JaNeiSpørsmål
                            fieldName="personligmote"
                            legend="Har søker møtt personlig?"
                            state={state.personligmote}
                            onChange={e => updateField('personligmote', e.target.value)}
                        />
                    </div>
                    <div style={{ marginRight: '2em' }}>
                        <JaNeiSpørsmål
                            fieldName="fullmektigmote"
                            legend="Har fullmektig møtt?"
                            state={state.fullmektigmote}
                            onChange={e => updateField('fullmektigmote', e.target.value)}
                        />
                    </div>
                    <div>
                        <JaNeiSpørsmål
                            fieldName="passsjekk"
                            legend="Er originalt(e) pass sjekket for stempel?"
                            state={state.passsjekk}
                            onChange={e => updateField('passsjekk', e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <InputFields
                labelText="Merknader"
                value={state.forNAVmerknader || ''}
                onChange={updateFunction('forNAVmerknader')}
            />
            {feilmeldinger.length > 0 && <Feiloppsummering tittel={'Vennligst fyll ut mangler'} feil={feilmeldinger} />}
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    //------------Lett Validering-----------------------
    function validateForm() {
        const formValues = state;
        const errors = validateFormValues(formValues);
        console.log(errors);
        setFeilmeldinger(errors);
        if (errors.length === 0) {
            onClick();
        }
    }
};

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
    const målform = formValues.maalform;
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
    const personligmote = formValues.personligmote;
    let feilmelding = '';

    if (personligmote === undefined) {
        feilmelding += 'Vennligst velg om søker har møtt personlig';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.møttPersonlig.htmlId, feilmelding }];
    }
    return [];
}

function fullmektigMøttValidering(formValues) {
    const fullmektigmote = formValues.fullmektigmote;
    let feilmelding = '';

    if (fullmektigmote === undefined) {
        feilmelding += 'Vennligst velg om fullmektig har møtt';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.fullmektigMøtt.htmlId, feilmelding }];
    }
    return [];
}

function passSjekketValidering(formValues) {
    const passsjekk = formValues.passsjekk;
    let feilmelding = '';

    if (passsjekk === undefined) {
        feilmelding += 'Vennligst velg om pass er sjekket';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.passSjekket.htmlId, feilmelding }];
    }
    return [];
}

const container = {
    display: 'flex'
};

export const validateForNAV = {
    validateFormValues
};

export default ForNAV;
