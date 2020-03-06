import React, { useState } from 'react';
import { RadioGruppe, Radio, Feiloppsummering } from 'nav-frontend-skjema';
import { Systemtittel } from 'nav-frontend-typografi';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import { Hovedknapp } from 'nav-frontend-knapper';
import { getRandomSmiley } from '../../hooks/getRandomEmoji';

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
                                name="målform"
                                label="Bokmål"
                                value="Bokmål"
                                checked={state.målform === 'Bokmål'}
                                onChange={e => updateField('målform', e.target.value)}
                            />
                            <Radio
                                name="målform"
                                label="Nynorsk"
                                value="Nynorsk"
                                checked={state.målform === 'Nynorsk'}
                                onChange={e => updateField('målform', e.target.value)}
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
                            fieldName="søkerMøttPersonlig"
                            legend="Har søker møtt personlig?"
                            state={state.søkerMøttPersonlig}
                            onChange={e => updateField('søkerMøttPersonlig', e.target.value)}
                        />
                    </div>
                    <div style={{ marginRight: '2em' }}>
                        <JaNeiSpørsmål
                            fieldName="harFullmektigMøtt"
                            legend="Har fullmektig møtt?"
                            state={state.harFullmektigMøtt}
                            onChange={e => updateField('harFullmektigMøtt', e.target.value)}
                        />
                    </div>
                    <div>
                        <JaNeiSpørsmål
                            fieldName="erPassSjekket"
                            legend="Er originalt(e) pass sjekket for stempel?"
                            state={state.erPassSjekket}
                            onChange={e => updateField('erPassSjekket', e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <InputFields
                labelText="Merknader"
                value={state.forNAVmerknader || ''}
                onChange={updateFunction('forNAVmerknader')}
            />
            {feilmeldinger.length > 0 && (
                <Feiloppsummering tittel={`Vennligst fyll ut mangler ${getRandomSmiley()}`} feil={feilmeldinger} />
            )}
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

const container = {
    display: 'flex'
};

export const validateForNAV = {
    validateFormValues
};

export default ForNAV;
