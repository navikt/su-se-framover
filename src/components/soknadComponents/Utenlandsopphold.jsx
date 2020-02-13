import React, { useState } from 'react';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import {JaNeiSpørsmål} from "../FormElements.jsx"
import { Systemtittel } from 'nav-frontend-typografi';
import {Feiloppsummering } from 'nav-frontend-skjema';
import Datovelger from 'nav-datovelger';
import 'nav-datovelger/dist/datovelger/styles/datovelger.css';

const Utenlandsopphold = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    function addInputField(field) {
        const values = field;
        if (values === state.utenlandsoppholdArray) {
            values.push({ utreisedato: '', innreisedato: '' });
            updateField(field, values);
        } else if (values === state.planlagtUtenlandsoppholdArray) {
            values.push({ planlagtUtreisedato: '', planlagtInnreisedato: '' });
            updateField('planlagtUtenlandsoppholdArray', values);
        }
    }

    function utenlandsoppholdUtreisedato(dato, index) {
        const utenlandsopphold = { ...state.utenlandsoppholdArray[index] };
        utenlandsopphold.utreisedato = dato;

        const tempUtreiseDato = [
            ...state.utenlandsoppholdArray.slice(0, index),
            utenlandsopphold,
            ...state.utenlandsoppholdArray.slice(index + 1)
        ];
        updateField('utenlandsoppholdArray', tempUtreiseDato);
    }

    function utenlandsoppholdInnreisedato(dato, index) {
        const utenlandsopphold = { ...state.utenlandsoppholdArray[index] };
        utenlandsopphold.innreisedato = dato;

        const tempInnreiseDato = [
            ...state.utenlandsoppholdArray.slice(0, index),
            utenlandsopphold,
            ...state.utenlandsoppholdArray.slice(index + 1)
        ];
        updateField('utenlandsoppholdArray', tempInnreiseDato);
    }

    function fjernValgtInputFelt(state, field, index) {
        const tempField = [...state.slice(0, index), ...state.slice(index + 1)];
        updateField(field, tempField);
    }

    function utenlandsoppholdFelter() {
        if (state.utenlandsopphold === 'true') {
            return (
                <div>
                    <div>
                        {state.utenlandsoppholdArray
                            .map((item, index) => ({ ...item, key: index }))
                            .map((item, index) => {
                                return (
                                    <div key={item.key} style={container}>
                                        <div style={{ marginRight: '1em' }}>
                                            <label className="skjemaelement__label">Utreisedato</label>
                                            <Datovelger.Datovelger
                                                input={{
                                                    placeholder: 'dd.mm.åååå',
                                                    id: `${index}-utreisedato`
                                                }}
                                                valgtDato={item.utreisedato}
                                                onChange={value => utenlandsoppholdUtreisedato(value, index)}
                                            />
                                        </div>
                                        <div style={{ marginRight: '1em' }}>
                                            <label className="skjemaelement__label">Innreisedato</label>
                                            <Datovelger.Datovelger
                                                input={{
                                                    placeholder: 'dd.mm.åååå',
                                                    id: `${index}-innreisedato`
                                                }}
                                                valgtDato={item.innreisedato}
                                                onChange={value => utenlandsoppholdInnreisedato(value, index)}
                                            />
                                        </div>
                                        {state.utenlandsoppholdArray.length > 1 && (
                                            <Lenke
                                                type="button"
                                                style={fjernInnputKnappStyle}
                                                onClick={() =>
                                                    fjernValgtInputFelt(
                                                        state.utenlandsoppholdArray,
                                                        'utenlandsoppholdArray',
                                                        index
                                                    )
                                                }
                                            >
                                                Fjern felt
                                            </Lenke>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                    <Knapp style={{ marginTop: '1em' }} onClick={() => addInputField(state.utenlandsoppholdArray)}>
                        Legg til flere utenlandsopphold
                    </Knapp>
                </div>
            );
        }
    }

    //--------------------Planlagt utenlandsopphold ------------------------------
    function planlagtUtenlandsoppholdUtreisedato(dato, index) {
        const planlagtUtenlandsopphold = {
            ...state.planlagtUtenlandsoppholdArray[index]
        };
        planlagtUtenlandsopphold.planlagtUtreisedato = dato;

        const tempUtreiseDato = [
            ...state.planlagtUtenlandsoppholdArray.slice(0, index),
            planlagtUtenlandsopphold,
            ...state.planlagtUtenlandsoppholdArray.slice(index + 1)
        ];
        updateField('planlagtUtenlandsoppholdArray', tempUtreiseDato);
    }

    function planlagtUtenlandsoppholdInnreisedato(dato, index) {
        const planlagtUtenlandsopphold = {
            ...state.planlagtUtenlandsoppholdArray[index]
        };
        planlagtUtenlandsopphold.planlagtInnreisedato = dato;

        const tempInnreiseDato = [
            ...state.planlagtUtenlandsoppholdArray.slice(0, index),
            planlagtUtenlandsopphold,
            ...state.planlagtUtenlandsoppholdArray.slice(index + 1)
        ];
        updateField('planlagtUtenlandsoppholdArray', tempInnreiseDato);
    }

    function planlagtUtenlandsoppholdFelter() {
        if (state.planlagtUtenlandsopphold === 'true') {
            return (
                <div style={{ marginBottom: '2em' }}>
                    <div>
                        {state.planlagtUtenlandsoppholdArray
                            .map((item, index) => ({ ...item, key: index }))
                            .map((item, index) => {
                                return (
                                    <div key={item.key} style={container}>
                                        <div style={{ marginRight: '1em' }}>
                                            <label className="skjemaelement__label">Utreisedato</label>
                                            <Datovelger.Datovelger
                                                input={{
                                                    placeholder: 'dd.mm.åååå',
                                                    id: `${index}-planlagtUtreisedato`
                                                }}
                                                valgtDato={item.planlagtUtreisedato}
                                                onChange={value => planlagtUtenlandsoppholdUtreisedato(value, index)}
                                            />
                                        </div>
                                        <div style={{ marginRight: '1em' }}>
                                            <label className="skjemaelement__label">Innreisedato</label>
                                            <Datovelger.Datovelger
                                                input={{
                                                    placeholder: 'dd.mm.åååå',
                                                    id: `${index}-planlagtInnreisedato`
                                                }}
                                                valgtDato={item.planlagtInnreisedato}
                                                onChange={value => planlagtUtenlandsoppholdInnreisedato(value, index)}
                                            />
                                        </div>
                                        {state.planlagtUtenlandsoppholdArray.length > 1 && (
                                            <Lenke
                                                type="button"
                                                style={fjernInnputKnappStyle}
                                                onClick={() =>
                                                    fjernValgtInputFelt(
                                                        state.planlagtUtenlandsoppholdArray,
                                                        'planlagtUtenlandsoppholdArray',
                                                        index
                                                    )
                                                }
                                            >
                                                Fjern felt
                                            </Lenke>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                    <Knapp style={{ marginTop: '1em' }}
                        onClick={() => addInputField(state.planlagtUtenlandsoppholdArray)}
                        >Legg til flere planlagt utenlandsopphold</Knapp>
                </div>
            );
        }
    }

    return (
        <div>
            <Systemtittel>Utenlandsopphold</Systemtittel>
            <JaNeiSpørsmål fieldName="utenlandsopphold"
                           legend="Har du vært i utlandet i løpet av de siste 3 måneder?"
                           state={state.utenlandsopphold}
                           onChange={e => updateField('utenlandsopphold', e.target.value)}
            />
            <div style={{ marginBottom: '2em' }}>{utenlandsoppholdFelter()}</div>

            <JaNeiSpørsmål fieldName="planlagtUtenlandsopphold"
                           legend="Har du planer å reise til utlandet?"
                           state={state.planlagtUtenlandsopphold}
                           onChange={e => updateField('planlagtUtenlandsopphold', e.target.value)}
            />
            <div>{planlagtUtenlandsoppholdFelter()}</div>
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
        console.log(state);
        if (errors.length === 0) {
            onClick();
        }
    }
};

const fields = {
    utenlandsopphold: { label: 'utenlandsopphold', htmlId: 'utenlandsopphold' },
    planlagtUtenlandsopphold: {
        label: 'planlagtUtenlandsopphold',
        htmlId: 'planlagtUtenlandsopphold'
    }
};

function validateFormValues(formValues) {
    const tempErrors = [];
    const utenlandsoppholdErrors = [];
    const planlagtUtenlandsoppholdErrors = [];
    tempErrors.push(...validateDates(formValues));
    tempErrors.push(...utenlandsoppholdValidering(formValues));
    tempErrors.push(...utenlandsoppholdFelterValidering(formValues, utenlandsoppholdErrors));
    tempErrors.push(...validatePlanlagtDates(formValues));
    tempErrors.push(...planlagtUtenlandsoppholdValidering(formValues));
    tempErrors.push(...planlagtUtenlandsoppholdFelterValidering(formValues, planlagtUtenlandsoppholdErrors));

    return tempErrors;
}

const makeDate = dateString => {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    return new Date(year, month, day);
};

const dates = (utreiseDato, innreiseDato) => {
    const aDate = makeDate(utreiseDato);
    const bDate = makeDate(innreiseDato);
    return aDate.getTime() > bDate.getTime();
};

function validateDates(formValues) {
    const errorsArray = [];
    const tempUtenlandsoppholdArray = formValues.utenlandsoppholdArray;

    if (formValues.utenlandsopphold === 'true') {
        const x = tempUtenlandsoppholdArray
            .map(item => {
                const utreise = item.utreisedato;
                const innreise = item.innreisedato;

                const result = dates(utreise, innreise);

                if (result) {
                    const feilmelding = 'Utreisedato kan ikke være før innreisedato';

                    return { skjemaelementId: fields.utenlandsopphold.htmlId, feilmelding };
                }
            })
            .filter(item => item !== undefined);
        return x;
    }
    return errorsArray;
}

function utenlandsoppholdValidering(formValues) {
    const utenlandsopphold = formValues.utenlandsopphold;
    let feilmelding = '';

    if (utenlandsopphold === undefined) {
        feilmelding += 'Vennligst velg utenlandsopphold';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.utenlandsopphold.htmlId, feilmelding }];
    }
    return [];
}

function utenlandsoppholdFelterValidering(formValues, errorsArray) {
    const tempUtenlandsoppholdArray = formValues.utenlandsoppholdArray;

    if (formValues.utenlandsopphold === 'true') {
        tempUtenlandsoppholdArray.map((item, index) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.utreisedato)) {
                if (item.utreisedato === '' || item.utreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-utreisedato`,
                        feilmelding: 'Utreisedato må fylles ut. Den må være på format dd.mm.åååå'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-utreisedato`,
                        feilmelding: 'Utreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.innreisedato)) {
                if (item.innreisedato === '' || item.innreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-innreisedato`,
                        feilmelding: 'Innreisedato må fylles ut. Den må være på format dd.mm.åååå'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-innreisedato`,
                        feilmelding: 'Innreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
        });
    }
    return errorsArray;
}

function validatePlanlagtDates(formValues) {
    const errorsArray = [];
    const tempUtenlandsoppholdArray = formValues.planlagtUtenlandsoppholdArray;

    if (formValues.planlagtUtenlandsopphold === 'true') {
        const x = tempUtenlandsoppholdArray
            .map(item => {
                const utreise = item.planlagtUtreisedato;
                const innreise = item.planlagtInnreisedato;
                const result = dates(utreise, innreise);

                if (result) {
                    const feilmelding = 'Planlagt utreisedato kan ikke være før planlagt innreisedato';
                    return { skjemaelementId: fields.planlagtUtenlandsopphold.htmlId, feilmelding };
                }
            })
            .filter(item => item !== undefined);
        return x;
    }
    return errorsArray;
}

function planlagtUtenlandsoppholdValidering(formValues) {
    const planlagtUtenlandsopphold = formValues.planlagtUtenlandsopphold;
    let feilmelding = '';

    if (planlagtUtenlandsopphold === undefined) {
        feilmelding += 'Vennligst velg planlagt utenlandsopphold';
    }
    if (feilmelding.length > 0) {
        return [
            {
                skjemaelementId: fields.planlagtUtenlandsopphold.htmlId,
                feilmelding
            }
        ];
    }
    return [];
}

function planlagtUtenlandsoppholdFelterValidering(formValues, errorsArray) {
    const tempPlanlagtUtenlandsoppholdArray = formValues.planlagtUtenlandsoppholdArray;

    if (formValues.planlagtUtenlandsopphold === 'true') {
        tempPlanlagtUtenlandsoppholdArray.map((item, index) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.planlagtUtreisedato)) {
                if (item.planlagtUtreisedato === '' || item.planlagtUtreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-planlagtUtreisedato`,
                        feilmelding: 'Planlagt utreisedato må fylles ut. Den må være på format dd.mm.åååå'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-planlagtUtreisedato`,
                        feilmelding: 'Planlagt utreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.planlagtInnreisedato)) {
                if (item.planlagtInnreisedato === '' || item.planlagtInnreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-planlagtInnreisedato`,
                        feilmelding: 'Planlagt innreisedato kan ikke være tom. Den må være på format dd.mm.åååå'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-planlagtInnreisedato`,
                        feilmelding: 'Planlagt innreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
        });
    }
    return errorsArray;
}

const container = {
    display: 'flex',
    marginBottom: '1em'
};

const fjernInnputKnappStyle = {
    alignSelf: 'center'
};

export const validateUtenlandsopphold = {
    validateFormValues
};

export default Utenlandsopphold;
