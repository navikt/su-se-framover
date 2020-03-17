import React, {useEffect, useState} from 'react';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import { JaNeiSpørsmål } from '../../components/FormElements.jsx';
import { Systemtittel, Element } from 'nav-frontend-typografi';
import Datovelger from 'nav-datovelger';
import 'nav-datovelger/dist/datovelger/styles/datovelger.css';
import { stringToBoolean } from '../../HelperFunctions';
import { validateUtenlandsopphold } from "../validering/UtenlandsoppholdValidering";
import { displayErrorMessageOnInputField } from "../../HelperFunctions";

const Utenlandsopphold = ({ state, updateField, onClick }) => {
    console.log(state)
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

    let x = undefined;
    if(state.utenlandsopphold){
         x = addDaysBetweenTwoDates(state.registrertePerioder)
    }
    let y = undefined;
    if(state.planlagtUtenlandsopphold){
         y = addDaysBetweenTwoDates(state.planlagtePerioder)
    }

    useEffect(() => {
        if(x !== undefined){
        updateField("antallRegistrerteDager", x)
        }

        if(y !== undefined){
            updateField("antallPlanlagteDager", y)
        }
    }, [x, y])

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
                                            <p style={/*TODO:RIKTIG FARGE PÅ FEILMELDING*/{color: 'red'}}>
                                                {displayErrorMessageOnInputField(feilmeldinger, `${index}-utreisedato`)}
                                            </p>
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
                                            <p style={/*TODO:RIKTIG FARGE PÅ FEILMELDING*/{color: 'red'}}>
                                                {displayErrorMessageOnInputField(feilmeldinger, `${index}-innreisedato`)}
                                            </p>
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
                        {<p style={/*TODO:RIKTIG FARGE PÅ FEILMELDING*/{color: 'red'}}>
                            {displayErrorMessageOnInputField(feilmeldinger, `utreiseFørInnreise`)}
                        </p>}
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
                                            <p style={/*TODO:RIKTIG FARGE PÅ FEILMELDING*/{color: 'red'}}>
                                                {displayErrorMessageOnInputField(feilmeldinger, `${index}-utreisedato-planlagt`)}
                                            </p>
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
                                            <p style={/*TODO:RIKTIG FARGE PÅ FEILMELDING*/{color: 'red'}}>
                                                {displayErrorMessageOnInputField(feilmeldinger, `${index}-innreisedato-planlagt`)}
                                            </p>
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
                        {<p style={/*TODO:RIKTIG FARGE PÅ FEILMELDING*/{color: 'red'}}>
                            {displayErrorMessageOnInputField(feilmeldinger, `planlagtUtreiseFørInnreise`)}
                        </p>}
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
                feil={displayErrorMessageOnInputField(feilmeldinger, "utenlandsopphold")}
                onChange={e => radioChanged('utenlandsopphold', e.target.value)}
            />
            <div style={{ marginBottom: '2em' }}>{utenlandsoppholdFelter()}</div>

            <JaNeiSpørsmål
                fieldName="planlagtUtenlandsopphold"
                legend="Har du planer å reise til utlandet?"
                state={state.planlagtUtenlandsopphold}
                feil={displayErrorMessageOnInputField(feilmeldinger, "planlagtUtenlandsopphold")}
                onChange={e => radioChanged('planlagtUtenlandsopphold', e.target.value)}
            />
            <div>{planlagtUtenlandsoppholdFelter()}</div>
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    function radioChanged(propName, value) {
        updateField(propName, value);
        prepareState(stringToBoolean(value), propName);
    }

    function prepareState(value, propName) {
        if (propName === 'utenlandsopphold') {
            if (value) {
                updateField('registrertePerioder', [{ utreisedato: '', innreisedato: '' }]);
            } else {
                updateField('registrertePerioder', null);
            }
        }
        if (propName === 'planlagtUtenlandsopphold') {
            if (value) {
                updateField('planlagtePerioder', [{ utreisedato: '', innreisedato: '' }]);
            } else {
                updateField('planlagtePerioder', null);
            }
        }
    }

    function validateForm() {
        console.log(state);
        const errors = validateUtenlandsopphold.validateFormValues(state);
        console.log(errors);
        setFeilmeldinger(errors);
        if (errors.length === 0) {
            onClick();
        }
    }
};

const addDaysBetweenTwoDates = state => {
    let antallDager = 0;

    if(state !== undefined){
        state.map(item => {
            const utreisedato = item.utreisedato;
            const innreisedato = item.innreisedato;

            antallDager += numberOfDaysBetweeenTwoDates(utreisedato, innreisedato);
        });
        if (isNaN(antallDager)) {
            return 'Fyll ut alle dato-felter for å regne antall dager';
        } else {
            return antallDager - state.length;
        }
    }
};

const numberOfDaysBetweeenTwoDates = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((makeDate(date2) - makeDate(date1)) / oneDay);
};

const makeDate = dateString => {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    return new Date(year, month, day);
};

const container = {
    display: 'flex',
    marginBottom: '1em'
};

const fjernInnputKnappStyle = {
    alignSelf: 'center'
};

export default Utenlandsopphold;
