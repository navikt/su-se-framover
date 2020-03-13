import React, { useState } from 'react';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import { JaNeiSpørsmål } from '../../components/FormElements.jsx';
import { Systemtittel, Element } from 'nav-frontend-typografi';
import { Feiloppsummering } from 'nav-frontend-skjema';
import Datovelger from 'nav-datovelger';
import 'nav-datovelger/dist/datovelger/styles/datovelger.css';
import { getRandomSmiley } from '../../hooks/getRandomEmoji';
import { stringToBoolean } from '../../components/FormElements';

const Utenlandsopphold = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    function addInputField(field, fieldName) {
        const values = field;
        values.push({ utreisedato: '', innreisedato: '' });
        updateField(fieldName, values);
    }

    const updateUtreisedato = ({ ...props }) => updateDate({ dateType: 'utreisedato', ...props });

    const updateInnreisedato = ({ ...props }) => updateDate({ dateType: 'innreisedato', ...props });

    function updateDate({ localState, fieldName, date, dateType, index }) {
        const x = { ...localState[index] };
        x[dateType] = date;
        const tempUtreiseDato = [...localState.slice(0, index), x, ...localState.slice(index + 1)];
        updateField(fieldName, tempUtreiseDato);
    }

    function fjernValgtInputFelt(state, field, index) {
        const tempField = [...state.slice(0, index), ...state.slice(index + 1)];
        updateField(field, tempField);
    }

    function utenlandsoppholdFelter() {
        if (state.utenlandsopphold) {
            return (
                <div>
                    <div>
                        {state.registrertePerioder
                            .map((item, index) => ({ ...item, key: index }))
                            .map((item, index) => {
                                return (
                                    <div key={item.key} style={container}>
                                        <div style={{ marginRight: '1em' }}>
                                            <label className="skjemaelement__label">Utreisedato</label>
                                            <Datovelger.Datovelger
                                                input={{ placeholder: 'dd.mm.åååå', id: `${index}-utreisedato` }}
                                                valgtDato={item.utreisedato}
                                                onChange={date =>
                                                    updateUtreisedato({
                                                        localState: state.registrertePerioder,
                                                        fieldName: 'registrertePerioder',
                                                        date,
                                                        index
                                                    })
                                                }
                                            />
                                        </div>
                                        <div style={{ marginRight: '1em' }}>
                                            <label className="skjemaelement__label">Innreisedato</label>
                                            <Datovelger.Datovelger
                                                input={{ placeholder: 'dd.mm.åååå', id: `${index}-innreisedato` }}
                                                valgtDato={item.innreisedato}
                                                onChange={date =>
                                                    updateInnreisedato({
                                                        localState: state.registrertePerioder,
                                                        fieldName: 'registrertePerioder',
                                                        date,
                                                        index
                                                    })
                                                }
                                            />
                                        </div>
                                        {state.registrertePerioder.length > 1 && (
                                            <Lenke
                                                type="button"
                                                style={fjernInnputKnappStyle}
                                                onClick={() =>
                                                    fjernValgtInputFelt(
                                                        state.registrertePerioder,
                                                        'registrertePerioder',
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
                    <div style={{ display: 'flex' }}>
                        <Element>Antall dager: &nbsp;</Element>
                        <Element>{addDaysBetweenTwoDates(state.registrertePerioder)}</Element>
                    </div>
                    <Knapp
                        style={{ marginTop: '1em' }}
                        onClick={() => addInputField(state.registrertePerioder, 'registrertePerioder')}
                    >
                        Legg til flere utenlandsopphold
                    </Knapp>
                </div>
            );
        }
    }

    //--------------------Planlagt utenlandsopphold ------------------------------
    function planlagtUtenlandsoppholdFelter() {
        if (state.planlagtUtenlandsopphold) {
            return (
                <div style={{ marginBottom: '2em' }}>
                    <div>
                        {state.planlagtePerioder
                            .map((item, index) => ({ ...item, key: index }))
                            .map((item, index) => {
                                return (
                                    <div key={item.key} style={container}>
                                        <div style={{ marginRight: '1em' }}>
                                            <label className="skjemaelement__label">Utreisedato</label>
                                            <Datovelger.Datovelger
                                                input={{
                                                    placeholder: 'dd.mm.åååå',
                                                    id: `${index}-utreisedato-planlagt`
                                                }}
                                                valgtDato={item.utreisedato}
                                                onChange={date =>
                                                    updateUtreisedato({
                                                        localState: state.planlagtePerioder,
                                                        fieldName: 'planlagtePerioder',
                                                        date,
                                                        index
                                                    })
                                                }
                                            />
                                        </div>
                                        <div style={{ marginRight: '1em' }}>
                                            <label className="skjemaelement__label">Innreisedato</label>
                                            <Datovelger.Datovelger
                                                input={{
                                                    placeholder: 'dd.mm.åååå',
                                                    id: `${index}-innreisedato-planlagt`
                                                }}
                                                valgtDato={item.innreisedato}
                                                onChange={date =>
                                                    updateInnreisedato({
                                                        localState: state.planlagtePerioder,
                                                        fieldName: 'planlagtePerioder',
                                                        date,
                                                        index
                                                    })
                                                }
                                            />
                                        </div>
                                        {state.planlagtePerioder.length > 1 && (
                                            <Lenke
                                                type="button"
                                                style={fjernInnputKnappStyle}
                                                onClick={() =>
                                                    fjernValgtInputFelt(
                                                        state.planlagtePerioder,
                                                        'planlagtePerioder',
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
                    <div style={{ display: 'flex' }}>
                        <Element>Antall dager: &nbsp;</Element>
                        <Element>{addDaysBetweenTwoDates(state.planlagtePerioder)}</Element>
                    </div>
                    <Knapp
                        style={{ marginTop: '1em' }}
                        onClick={() => addInputField(state.planlagtePerioder, 'planlagtePerioder')}
                    >
                        Legg til flere planlagt utenlandsopphold
                    </Knapp>
                </div>
            );
        }
    }

    return (
        <div>
            <Systemtittel>Utenlandsopphold</Systemtittel>
            <JaNeiSpørsmål
                fieldName="utenlandsopphold"
                legend="Har du vært i utlandet i løpet av de siste 3 måneder?"
                state={state.utenlandsopphold}
                onChange={e => radioChanged('utenlandsopphold', e.target.value)}
            />
            <div style={{ marginBottom: '2em' }}>{utenlandsoppholdFelter()}</div>

            <JaNeiSpørsmål
                fieldName="planlagtUtenlandsopphold"
                legend="Har du planer å reise til utlandet?"
                state={state.planlagtUtenlandsopphold}
                onChange={e => radioChanged('planlagtUtenlandsopphold', e.target.value)}
            />
            <div>{planlagtUtenlandsoppholdFelter()}</div>
            {feilmeldinger.length > 0 && (
                <Feiloppsummering tittel={`Vennligst fyll ut mangler ${getRandomSmiley()}`} feil={feilmeldinger} />
            )}
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    function radioChanged(propName, value){
    	updateField(propName, value)
    	prepareState(stringToBoolean(value), propName)
    }

     function prepareState(value, propName){
    		if(propName === 'utenlandsopphold'){
    			if(value){
					updateField('registrertePerioder', [{ utreisedato: '', innreisedato: '' }])
    			} else {
    				updateField('registrertePerioder', null)
    			}
    		}
    		if(propName === 'planlagtUtenlandsopphold'){
				if(value){
					updateField('planlagtePerioder', [{ utreisedato: '', innreisedato: '' }])
    			} else {
    				updateField('planlagtePerioder', null)
    			}
    		}
        }

    //------------Lett Validering-----------------------
    function validateForm() {
        const formValues = state;
        console.log(state);
        const errors = validateFormValues(formValues);
        console.log(errors);
        setFeilmeldinger(errors);
        if (errors.length === 0) {
            onClick();
        }
    }
};

const addDaysBetweenTwoDates = state => {
    let x = 0;
    state.map(item => {
        const utreisedato = item.utreisedato;
        const innreisedato = item.innreisedato;

        x += numberOfDaysBetweeenTwoDates(utreisedato, innreisedato);
    });
    if (isNaN(x)) {
        return 'Fyll ut alle dato-felter for å regne antall dager';
    } else {
        return x - state.length;
    }
};

const numberOfDaysBetweeenTwoDates = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((makeDate(date2) - makeDate(date1)) / oneDay);
};

//----------------------------------------------------------------------------------
//---------------------Validering
//----------------------------------------------------------------------------------
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
    const tempUtenlandsoppholdArray = formValues.registrertePerioder;

    if (formValues.utenlandsopphold) {
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
    const tempUtenlandsoppholdArray = formValues.registrertePerioder;

    if (formValues.utenlandsopphold) {
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
    const tempUtenlandsoppholdArray = formValues.planlagtePerioder;

    if (formValues.planlagtUtenlandsopphold) {
        const x = tempUtenlandsoppholdArray
            .map(item => {
                const utreise = item.utreisedato;
                const innreise = item.innreisedato;
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
    const tempPlanlagtUtenlandsoppholdArray = formValues.planlagtePerioder;

    if (formValues.planlagtUtenlandsopphold) {
        tempPlanlagtUtenlandsoppholdArray.map((item, index) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.utreisedato)) {
                if (item.utreisedato === '' || item.innreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-utreisedato-planlagt`,
                        feilmelding: 'Planlagt utreisedato må fylles ut. Den må være på format dd.mm.åååå'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-utreisedato-planlagt`,
                        feilmelding: 'Planlagt utreisedato må være en dato på format dd.mm.åååå'
                    });
                }
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(item.innreisedato)) {
                if (item.innreisedato === '' || item.innreisedato === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-innreisedato-planlagt`,
                        feilmelding: 'Planlagt innreisedato kan ikke være tom. Den må være på format dd.mm.åååå'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-innreisedato-planlagt`,
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
