import React, { useState } from 'react';
import { Systemtittel } from 'nav-frontend-typografi';
import { Hovedknapp } from 'nav-frontend-knapper';
import Datovelger from 'nav-datovelger';
import { JaNeiSpørsmål } from '../../../components/FormElements';
import { validateOppholdstillatelse } from '../validering/OppholdstillatelseValidering';
import { displayErrorMessageOnInputField } from '../../../HelperFunctions';

const Oppholdstillatelse = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);
    console.log(state);
    const updateFunction = name => value => updateField(name, value);

    function midlertidigOppholdstillatelse() {
        if (!state.harVarigOpphold && state.harVarigOpphold !== undefined) {
            return (
                <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: '1em' }}>
                        <label>Utløpsdato</label>
                        <Datovelger.Datovelger
                            input={{
                                placeholder: 'dd.mm.åååå'
                            }}
                            valgtDato={state.utløpsdato}
                            onChange={updateFunction('utløpsdato')}
                        />

                        <p style={/*TODO:RIKTIG FARGE PÅ FEILMELDING*/ { color: 'red' }}>
                            {displayErrorMessageOnInputField(feilmeldinger, 'utløpsdato')}
                        </p>
                    </div>
                    <JaNeiSpørsmål
                        fieldName="søktOmForlengelse"
                        legend="Har søker søkt om forlengelse?"
                        state={state.søktOmForlengelse}
                        feil={displayErrorMessageOnInputField(feilmeldinger, 'søktOmForlengelse')}
                        onChange={e => updateField('søktOmForlengelse', e.target.value)}
                    />
                </div>
            );
        }
    }

    return (
        <div>
            <Systemtittel>Opplysninger om oppholdstillatelse</Systemtittel>
            <div>
                <JaNeiSpørsmål
                    fieldName="harVarigOpphold"
                    legend="Har søker varig oppholdstillatelse?"
                    state={state.harVarigOpphold}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'harVarigOpphold')}
                    onChange={e => updateField('harVarigOpphold', e.target.value)}
                />
                <div>{midlertidigOppholdstillatelse()}</div>
            </div>
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    //------------Lett Validering-----------------------
    function validateForm() {
        const errors = validateOppholdstillatelse.validateFormValues(state);
        console.log(errors);
        setFeilmeldinger(errors);
        if (errors.length === 0) {
            onClick();
        }
    }
};

export default Oppholdstillatelse;
