import React, { useState } from 'react';
import { Systemtittel } from 'nav-frontend-typografi';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import { Hovedknapp } from 'nav-frontend-knapper';
import { displayErrorMessageOnInputField } from '../../HelperFunctions';
import { validatePersonopplysninger } from '../validering/PersonopplysningerValidering';

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
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'fødselsnummer')}
                    onChange={updateFunction('fnr')}
                />
            </div>
            <div style={inputFieldsStyle}>
                <InputFields
                    labelText="Fornavn"
                    value={state.fornavn || ''}
                    style={{ minWidth: '13em' }}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'fornavn')}
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
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'etternavn')}
                    style={{ minWidth: '13em' }}
                    onChange={updateFunction('etternavn')}
                />
            </div>
            <div>
                <InputFields
                    labelText="Telefonnummer"
                    value={state.telefonnummer || ''}
                    bredde="S"
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'telefonnummer')}
                    onChange={updateFunction('telefonnummer')}
                />
            </div>
            <div style={container}>
                <InputFields
                    labelText="Gateadresse"
                    value={state.gateadresse || ''}
                    style={{ minWidth: '30em' }}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'gateadresse')}
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
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'postnummer')}
                    onChange={updateFunction('postnummer')}
                />
                <InputFields
                    labelText="Poststed"
                    value={state.poststed || ''}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'poststed')}
                    onChange={updateFunction('poststed')}
                />
                <InputFields
                    labelText="Bokommune"
                    value={state.bokommune || ''}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'bokommune')}
                    onChange={updateFunction('bokommune')}
                />
            </div>
            <div style={{ marginBottom: '1em' }}>
                <InputFields
                    labelText={'Søkers statsborgerskap (alle)'}
                    bredde={'M'}
                    value={state.statsborgerskap || ''}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'statsborgerskap')}
                    onChange={updateFunction('statsborgerskap')}
                />
            </div>
            <div style={container}>
                <span style={{ marginRight: '3em' }}>
                    <JaNeiSpørsmål
                        fieldName="flyktning"
                        legend="Er søker registrert som flyktning?"
                        state={state.flyktning}
                        feil={displayErrorMessageOnInputField(feilmeldinger, 'flyktning')}
                        onChange={e => updateField('flyktning', e.target.value)}
                    />
                </span>
                <JaNeiSpørsmål
                    fieldName="borFastINorge"
                    legend="Bor søker fast i Norge?"
                    state={state.borFastINorge}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'borFastINorge')}
                    onChange={e => updateField('borFastINorge', e.target.value)}
                />
            </div>
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    function validateForm() {
        const errors = validatePersonopplysninger.validateFormValues(state);
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

export default Personopplysninger;
