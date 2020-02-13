import React, { useState } from 'react';
import { Knapp } from 'nav-frontend-knapper';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import Lenke from 'nav-frontend-lenker';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { Checkbox, CheckboxGruppe } from 'nav-frontend-skjema';
import { Systemtittel, Ingress } from 'nav-frontend-typografi';
import { Hovedknapp } from 'nav-frontend-knapper';

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
        values.push({ navn: '', fødselsnummer: '' });
        updateField('delerBoligMed', values);
    }

    function updateEPSnavn(navn, index) {
        const ESPnavn = { ...state.delerBoligMed[index] };
        ESPnavn.navn = navn;

        const tempNavn = [...state.delerBoligMed.slice(0, index), ESPnavn, ...state.delerBoligMed.slice(index + 1)];
        updateField('delerBoligMed', tempNavn);
    }

    function oppdaterFødselsnummer(fødselsnummer, index) {
        const ESPfødselsnummer = { ...state.delerBoligMed[index] };
        ESPfødselsnummer.fødselsnummer = fødselsnummer;

        const tempFødselsnummer = [
            ...state.delerBoligMed.slice(0, index),
            ESPfødselsnummer,
            ...state.delerBoligMed.slice(index + 1)
        ];
        updateField('delerBoligMed', tempFødselsnummer);
    }

    function personDelerBolig() {
        if (state.delerDuBolig === 'true') {
            return (
                <CheckboxGruppe legend="Hvem deler søker bolig med?">
                    <Checkbox
                        name="boligdeler"
                        label="Ektefelle/Partner/Samboer"
                        value="esp"
                        checked={state.borSammenMed.includes('esp')}
                        onChange={e => boSammenMedUpdate(e.target)}
                    />
                    <Checkbox
                        name="boligdeler"
                        label="Barn over 18 år"
                        value="over18"
                        checked={state.borSammenMed.includes('over18')}
                        onChange={e => boSammenMedUpdate(e.target)}
                    />
                    <Checkbox
                        name="boligdeler"
                        label="Andre personer over 18 år"
                        value="annenPerson"
                        checked={state.borSammenMed.includes('annenPerson')}
                        onChange={e => boSammenMedUpdate(e.target)}
                    />
                </CheckboxGruppe>
            );
        }
    }

    function tillegsInfoESP() {
        if (state.delerDuBolig === 'true') {
            return (
                <div style={{ marginBottom: '2em' }}>
                    <Ingress>Opplysninger om ektefellen/samboer/annen voksen person hvis dere bor sammen</Ingress>
                    {state.delerBoligMed
                        .map((item, index) => ({ ...item, key: index }))
                        .map((item, index) => {
                            return (
                                <div key={item.key} style={container}>
                                    <InputFields
                                        id={`${item.key}-fødselsnummer`}
                                        labelText={'Fødselsnummer'}
                                        value={item.fødselsnummer}
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
                            fieldName="delerDuBolig"
                            legend="Deler søker bolig med en annen voksen?"
                            state={state.delerDuBolig}
                            onChange={e => updateField('delerDuBolig', e.target.value)}
                        />
                    </span>
                    {personDelerBolig()}
                </div>
                {tillegsInfoESP()}
            </div>
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
    delerdubolig: { label: 'delerdubolig', htmlId: 'delerdubolig' },
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
    const delerDuBolig = formValues.delerDuBolig;
    let feilmelding = '';

    if (delerDuBolig === undefined) {
        feilmelding += 'Vennligst velg boforhold';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.delerdubolig.htmlId, feilmelding }];
    }
    return [];
}

function borSammenMedValidering(formValues) {
    const borSammenMed = formValues.borSammenMed;
    let feilmelding = '';

    if (formValues.delerDuBolig === 'true') {
        if (
            !borSammenMed.includes('esp') &&
            !borSammenMed.includes('over18') &&
            !borSammenMed.includes('annenPerson')
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

    if (formValues.delerDuBolig === 'true') {
        delerBoligMedArray.map((item, index) => {
            if (item.navn.trim().length === 0) {
                errorsArray.push({
                    skjemaelementId: `${index}-navn`,
                    feilmelding: 'Navn må fylles ut'
                });
            }
            if (item.fødselsnummer.trim().length === 0) {
                errorsArray.push({
                    skjemaelementId: `${index}-fødselsnummer`,
                    feilmelding: 'Fødselsnummer må fylles ut'
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
