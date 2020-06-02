import React, { useEffect, useState } from 'react';
import { Sidetittel, Systemtittel, Element } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import { Label, Input, Textarea, Feiloppsummering } from 'nav-frontend-skjema';
import Knapp from 'nav-frontend-knapper';
import Inntekter from './Inntekter';
import { InputFields } from '../components/FormElements';
import { replace } from '../HelperFunctions';

const initialState = {
    fraMåned: '',
    tilMåned: '',
    sats: '',
    begrunnelse: '',
    inntekter: [{ beløp: '', type: '', kilde: '' }]
};

function Beregning({ state = initialState, setState }) {
    const [validationErrors, setValidationErrors] = useState([]);
    const [errorsCollector, setErrorsCollector] = useState();

    const fields = {
        fraMåned: { label: 'Fra måned', htmlId: 'fra-måned' },
        tilMåned: { label: 'Til måned', htmlId: 'til-måned' },
        sats: { sats: 'Sats', htmlId: 'sats' }
    };

    useEffect(() => {
        setState(initialState);
    }, []);

    const updateFieldInState = (field, newState) => {
        setState(state => ({
            ...state,
            [field]: newState
        }));
    };

    const updateFunction = name => value => updateFieldInState(name, value);

    useEffect(() => {
        if (errorsCollector && errorsCollector.length > 0) {
            setValidationErrors([...validationErrors, ...errorsCollector]);
        }
    }, [errorsCollector]);

    return (
        <div style={{ width: '40%' }}>
            <Sidetittel style={BeregningTittelStyle}>Beregning</Sidetittel>

            <form onSubmit={handleSubmit}>
                <Panel border>
                    <div>
                        <Systemtittel>Periode:</Systemtittel>
                        <div style={DivInputFieldsWrapperStyle}>
                            <InputFields
                                labelText={fields.fraMåned.label}
                                id={fields.fraMåned.htmlId}
                                value={state.fraMåned}
                                onChange={updateFunction('fraMåned')}
                            />
                            <InputFields
                                labelText={'Til måned'}
                                value={state.tilMåned}
                                id={fields.tilMåned.htmlId}
                                onChange={updateFunction('tilMåned')}
                            />
                        </div>
                    </div>

                    <div>
                        <Systemtittel style={{ marginTop: '0.5em' }}>Sats:</Systemtittel>
                        <div style={{ marginBottom: '1em' }}>
                            <InputFieldWithText text={'kr'} value={state.sats} onChange={updateFunction('sats')} />
                            <Textarea
                                label={'Begrunnelse:'}
                                value={state.begrunnelse}
                                onChange={e => updateFieldInState('begrunnelse', e.target.value)}
                            />
                        </div>
                    </div>

                    <Inntekter
                        state={state}
                        updateFieldInState={updateFieldInState}
                        setInntekter={updateFunction('inntekter')}
                        errorsCollector={errorsCollector}
                    />
                    {validationErrors.length > 0 && (
                        <Feiloppsummering tittel={'Vennligst fyll ut mangler'} feil={validationErrors} />
                    )}

                    <hr />
                    <Knapp htmlType="button" onClick={beregnFunction}>
                        Beregn
                    </Knapp>
                    {state.stønadsberegning !== undefined && (
                        <>
                            <Element>Beregnet årlig stønad: {state.stønadsberegning.årsbeløp} kr</Element>
                            <Element>
                                Beregnet månedlig stønad:
                                {(state.stønadsberegning.årsbeløp / 12).toFixed(2)} kr
                            </Element>
                        </>
                    )}
                </Panel>
                <div style={buttonPositonStyle}>
                    <Knapp htmlType="submit">Lagre</Knapp>
                    <Knapp>Neste</Knapp>
                </div>
            </form>
        </div>
    );

    function beregnFunction() {
        let beløp = 0;
        let sats = parseInt(state.sats.replace(/\s/g, '').replace(/\./g, ''));
        if (state.inntekter.length > 0) {
            const arr = replace(state.inntekter);
            beløp += adderInntekter(arr.map(obj => parseInt(obj, 10)).filter(obj => !isNaN(obj)));
        }
        setState(state => ({
            ...state,
            stønadsberegning: { årsbeløp: sats - beløp }
        }));
    }

    function updateInntekterArrayBeforeSubmit() {
        const arr = [];

        state.inntekter.map(obj => {
            obj.beløp = obj.beløp.replace(/\s/g, '').replace(/\./g, '');
            arr.push(obj);
        });

        setState(state => ({
            ...state,
            inntekter: arr
        }));
    }

    function adderInntekter(beløp) {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        return beløp.reduce(reducer, 0);
    }

    function handleSubmit(event) {
        event.preventDefault();
        console.log('submitting');
        updateInntekterArrayBeforeSubmit();
        const formValues = state;
        console.log(formValues);
        validateFormValues(formValues);
        setErrorsCollector([]);
    }

    function validateFormValues(formValues) {
        const errors = [];
        errors.push(...fraMånedValidation(formValues));
        errors.push(...tilMånedValidation(formValues));
        errors.push(...satsValidering(formValues));
        setValidationErrors(errors);
    }

    function fraMånedValidation(formValues) {
        const fraMåned = formValues.fraMåned;
        let feilmelding = '';
        if (!/^\d{2}\/\d{2}$/.test(fraMåned)) {
            feilmelding += 'Fra måned følger ikke formen mm/yy';
        } else {
            if (parseInt(fraMåned.substring(0, 2), 10) > 12) {
                feilmelding += 'Måned må være mindre enn 12';
            }
            if (parseInt(fraMåned.substring(3, 5), 10) < 19) {
                feilmelding += 'År må være høyere enn 19';
            }
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.fraMåned.htmlId, feilmelding }];
        }
        return [];
    }

    function tilMånedValidation(formValues) {
        const tilMåned = formValues.tilMåned;
        let feilmelding = '';
        if (!/^\d{2}\/\d{2}$/.test(tilMåned)) {
            feilmelding += 'Fra måned følger ikke formen mm/yy';
        } else {
            if (parseInt(tilMåned.substring(3, 5), 10) < 19) {
                feilmelding += 'År må være høyere enn 19';
            }

            if (parseInt(tilMåned.substring(3, 5), 10) < parseInt(formValues.fraMåned.substring(3, 5), 10)) {
                feilmelding += 'Til år må være høyere enn fra år';
            }

            if (parseInt(tilMåned.substring(3, 5), 10) === parseInt(formValues.fraMåned.substring(3, 5), 10)) {
                if (parseInt(tilMåned.substring(0, 2), 10) <= parseInt(formValues.fraMåned.substring(0, 2), 10)) {
                    feilmelding += 'til måned må være høyere enn fra måned siden år er lik';
                }
            }
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.tilMåned.htmlId, feilmelding }];
        }
        return [];
    }

    function satsValidering(formValues) {
        const sats = formValues.sats;
        let feilmelding = '';

        if (isNaN(parseInt(sats, 10))) {
            feilmelding += 'Sats må være tall';
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.sats.htmlId, feilmelding }];
        }
        return [];
    }
}

function InputFieldWithText({ text, value, onChange }) {
    const divStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1em'
    };
    const innerDivstyle = {
        flexGrow: '1'
    };
    const labelStyle = {
        marginTop: '1em',
        marginBottom: '0em'
    };

    return (
        <div style={divStyle}>
            <Input value={value} onChange={e => onChange(e.target.value)} />
            <div style={innerDivstyle}>
                <Label style={labelStyle}>{text}</Label>
            </div>
        </div>
    );
}

const DivInputFieldsWrapperStyle = {
    display: 'flex'
};

const BeregningTittelStyle = {
    display: 'flex',
    justifyContent: 'center'
};

const buttonPositonStyle = {
    display: 'flex',
    justifyContent: 'center'
};

export default Beregning;
