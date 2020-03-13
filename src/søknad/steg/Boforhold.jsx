import React, { useState } from 'react';
import { Knapp } from 'nav-frontend-knapper';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import Lenke from 'nav-frontend-lenker';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { Checkbox, CheckboxGruppe } from 'nav-frontend-skjema';
import { Systemtittel, Ingress } from 'nav-frontend-typografi';
import { Hovedknapp } from 'nav-frontend-knapper';
import { getRandomSmiley } from '../../hooks/getRandomEmoji';
import { stringToBoolean } from '../../components/FormElements';

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
                <CheckboxGruppe legend="Hvem deler søker bolig med?">
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
                                        onChange={value => oppdaterFødselsnummer(value, index)}
                                    />
                                    <InputFields
                                        id={`${item.key}-navn`}
                                        labelText={'Navn'}
                                        value={item.navn}
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
            {feilmeldinger.length > 0 && (
                <Feiloppsummering tittel={`Vennligst fyll ut mangler ${getRandomSmiley()}`} feil={feilmeldinger} />
            )}
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
    delerBolig: { label: 'delerBolig', htmlId: 'delerBolig' },
    borsammenmed: { label: 'borsammenmed', htmlId: 'borsammenmed' },
    delerboligmed: { label: 'delerboligmed', htmlId: 'delerboligmed' }
};

function validateFormValues(formValues) {
    const tempErrors = [];
    const delerBoligMedErrors = [];
    tempErrors.push(...delerBoligValidering(formValues));
    tempErrors.push(...borSammenMedValidering(formValues));
    tempErrors.push(...delerBoligMedValidering(formValues, delerBoligMedErrors));

    return tempErrors;
}

function delerBoligValidering(formValues) {
    const delerBolig = formValues.delerBolig;
    let feilmelding = '';

    if (delerBolig === undefined) {
        feilmelding += 'Vennligst velg boforhold';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.delerBolig.htmlId, feilmelding }];
    }
    return [];
}

function borSammenMedValidering(formValues) {
    const borSammenMed = formValues.borSammenMed;
    let feilmelding = '';

    if (formValues.delerBolig) {
        if (
            !borSammenMed.includes('Ektefelle/Partner/Samboer') &&
            !borSammenMed.includes('Barn over 18') &&
            !borSammenMed.includes('Andre personer over 18 år')
        ) {
            feilmelding += 'Vennligst velg hvem søker bor med';
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.borsammenmed.htmlId, feilmelding }];
        }
    }
    return [];
}

function delerBoligMedValidering(formValues, errorsArray) {
    const delerBoligMedArray = formValues.delerBoligMed;

    if (formValues.delerBolig) {
        delerBoligMedArray.map((item, index) => {
            if (item.navn.trim().length === 0) {
                errorsArray.push({
                    skjemaelementId: `${index}-navn`,
                    feilmelding: 'Navn må fylles ut'
                });
            }
            if (item.fnr.trim().length === 0) {
                errorsArray.push({
                    skjemaelementId: `${index}-fnr`,
                    feilmelding: 'Fødselsnummer må fylles ut'
                });
            } else if (item.fnr.trim().length > 11) {
                errorsArray.push({
                    skjemaelementId: `${index}-fnr`,
                    feilmelding: 'Fødselsnummer må være 11 siffer. Lenge på fødselsnummer: ' + item.fnr.trim().length
                });
            }
        });
    }
    return errorsArray;
}

const container = {
    display: 'flex'
};

const fjernInnputKnappStyle = {
    alignSelf: 'center'
};

export const validateBoforhold = {
    validateFormValues
};

export default Boforhold;
