import React, { useState } from 'react';
import { Knapp } from 'nav-frontend-knapper';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import Lenke from 'nav-frontend-lenker';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { Checkbox, CheckboxGruppe } from 'nav-frontend-skjema';
import { Systemtittel, Ingress } from 'nav-frontend-typografi';
import { Hovedknapp } from 'nav-frontend-knapper';
import { stringToBoolean, displayErrorMessageOnInputField } from '../../HelperFunctions';
import { validateBoforhold } from "../validering/BoforholdValidering";

const Boforhold = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    function updatedArray(sourceArray, target) {
        if (target.checked) {
            return [...sourceArray, target.value];
        } else {
            return sourceArray.filter(item => item !== target.value);
        }
    }

    function boSammenMedUpdate(target) {
        updateField('borSammenMed', state => updatedArray(state, target));
    }

    function addInputFields() {
        const values = state.delerBoligMed;
        values.push({ navn: '', fnr: '' });
        updateField('delerBoligMed', values);
    }

    function updateEPSnavn(navn, index) {
        const ESPnavn = { ...state.delerBoligMed[index] };
        ESPnavn.navn = navn;

        const tempNavn = [...state.delerBoligMed.slice(0, index), ESPnavn, ...state.delerBoligMed.slice(index + 1)];
        updateField('delerBoligMed', tempNavn);
    }

    function oppdaterFødselsnummer(fnr, index) {
        const ESPfødselsnummer = { ...state.delerBoligMed[index] };
        ESPfødselsnummer.fnr = fnr;

        const tempFødselsnummer = [
            ...state.delerBoligMed.slice(0, index),
            ESPfødselsnummer,
            ...state.delerBoligMed.slice(index + 1)
        ];
        updateField('delerBoligMed', tempFødselsnummer);
    }

    function personDelerBolig() {
        if (state.delerBolig) {
            return (
                <CheckboxGruppe legend="Hvem deler søker bolig med?"
                                feil={displayErrorMessageOnInputField(feilmeldinger,
                                    "borSammenMed")}>
                    <Checkbox
                        name="boligdeler"
                        label="Ektefelle/Partner/Samboer"
                        value="Ektefelle/Partner/Samboer"
                        checked={state.borSammenMed.includes('Ektefelle/Partner/Samboer')}
                        onChange={e => boSammenMedUpdate(e.target)}
                    />
                    <Checkbox
                        name="boligdeler"
                        label="Barn over 18 år"
                        value="Barn over 18"
                        checked={state.borSammenMed.includes('Barn over 18')}
                        onChange={e => boSammenMedUpdate(e.target)}
                    />
                    <Checkbox
                        name="boligdeler"
                        label="Andre personer over 18 år"
                        value="Andre personer over 18 år"
                        checked={state.borSammenMed.includes('Andre personer over 18 år')}
                        onChange={e => boSammenMedUpdate(e.target)}
                    />
                </CheckboxGruppe>
            );
        }
    }

    function tillegsInfoESP() {
        if (state.delerBolig) {
            return (
                <div style={{ marginBottom: '2em' }}>
                    <Ingress>Opplysninger om ektefellen/samboer/annen voksen person hvis dere bor sammen</Ingress>
                    {state.delerBoligMed
                        .map((item, index) => ({ ...item, key: index }))
                        .map((item, index) => {
                            return (
                                <div key={item.key} style={container}>
                                    <InputFields
                                        id={`${item.key}-fnr`}
                                        labelText={'Fødselsnummer'}
                                        value={item.fnr}
                                        feil={displayErrorMessageOnInputField(feilmeldinger, `${item.key}-fnr`)}
                                        onChange={value => oppdaterFødselsnummer(value, index)}
                                    />
                                    <InputFields
                                        id={`${item.key}-navn`}
                                        labelText={'Navn'}
                                        value={item.navn}
                                        feil={displayErrorMessageOnInputField(feilmeldinger, `${item.key}-navn`)}
                                        onChange={value => updateEPSnavn(value, index)}
                                    />

                                    {state.delerBoligMed.length > 1 && (
                                        <Lenke
                                            type="button"
                                            style={fjernInnputKnappStyle}
                                            onClick={() =>
                                                fjernValgtInputFelt(state.delerBoligMed, 'delerBoligMed', index)
                                            }
                                        >
                                            Fjern felt
                                        </Lenke>
                                    )}
                                </div>
                            );
                        })}
                    <div>
                        <Knapp onClick={() => addInputFields()}>Legg til flere</Knapp>
                    </div>
                </div>
            );
        }
    }

    function fjernValgtInputFelt(state, field, index) {
        const tempField = [...state.slice(0, index), ...state.slice(index + 1)];
        updateField(field, tempField);
    }

    return (
        <div>
            <Systemtittel>Boforhold</Systemtittel>
            <div>
                <div style={container}>
                    <span style={{ marginRight: '1em' }}>
                        <JaNeiSpørsmål
                            fieldName="delerBolig"
                            legend="Deler søker bolig med en annen voksen?"
                            state={state.delerBolig}
                            feil={displayErrorMessageOnInputField(feilmeldinger, "delerBolig")}
                            onChange={e => {
                                updateField('delerBolig', e.target.value);
                                prepareState(stringToBoolean(e.target.value));
                            }}
                        />
                    </span>
                    {personDelerBolig()}
                </div>
                {tillegsInfoESP()}
            </div>
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    function prepareState(delerBolig) {
        if (delerBolig) {
            updateField('borSammenMed', []);
            updateField('delerBoligMed', [{ navn: '', fnr: '' }]);
        } else {
            updateField('borSammenMed', null);
            updateField('delerBoligMed', null);
        }
    }

    function validateForm() {
        const errors = validateBoforhold.validateFormValues(state);
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

const fjernInnputKnappStyle = {
    alignSelf: 'center'
};

export default Boforhold;
