import React, { useState } from 'react';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Systemtittel } from 'nav-frontend-typografi';
import { InputFields, JaNeiSpørsmål } from '../../../components/FormElements';
import { Hovedknapp } from 'nav-frontend-knapper';
import { validateForNAV } from '../validering/ForNAVValidering';
import { displayErrorMessageOnInputField } from '../../../HelperFunctions';

const ForNAV = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    const updateFunction = name => value => updateField(name, value);

    return (
        <div>
            <div>
                <Systemtittel>Språkform</Systemtittel>
                <div>
                    <RadioGruppe
                        legend="Hvilken målform ønsker du i svaret?"
                        feil={displayErrorMessageOnInputField(feilmeldinger, 'målform')}
                    >
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
                            feil={displayErrorMessageOnInputField(feilmeldinger, 'møttPersonlig')}
                            onChange={e => updateField('søkerMøttPersonlig', e.target.value)}
                        />
                    </div>
                    <div style={{ marginRight: '2em' }}>
                        <JaNeiSpørsmål
                            fieldName="harFullmektigMøtt"
                            legend="Har fullmektig møtt?"
                            state={state.harFullmektigMøtt}
                            feil={displayErrorMessageOnInputField(feilmeldinger, 'fullmektigMøtt')}
                            onChange={e => updateField('harFullmektigMøtt', e.target.value)}
                        />
                    </div>
                    <div>
                        <JaNeiSpørsmål
                            fieldName="erPassSjekket"
                            legend="Er originalt(e) pass sjekket for stempel?"
                            state={state.erPassSjekket}
                            feil={displayErrorMessageOnInputField(feilmeldinger, 'passSjekket')}
                            onChange={e => updateField('erPassSjekket', e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <InputFields labelText="Merknader" value={state.merknader || ''} onChange={updateFunction('merknader')} />
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    function validateForm() {
        const errors = validateForNAV.validateFormValues(state);
        console.log(errors);
        setFeilmeldinger(errors);
        if (errors.length === 0) {
            onClick();
        }
    }
};

const container = {
    display: 'flex'
};

export default ForNAV;
