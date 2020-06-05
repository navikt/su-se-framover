import React, { useState } from 'react';
import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import { InputFields, JaNeiSpørsmål } from '../../../components/FormElements';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { stringToBoolean } from '../../../HelperFunctions';
import { validateInntektPensjonFormue } from '../validering/InntektPensjonFormueValidering';
import { displayErrorMessageOnInputField } from '../../../HelperFunctions';

const InntektPensjonFormue = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    const updateFunction = name => value => updateField(name, value);

    function framsattKravAnnenYtelseInput() {
        if (state.framsattKravAnnenYtelse) {
            return (
                <InputFields
                    labelText="Hva slags ytelse/pensjon?"
                    value={state.framsattKravAnnenYtelseBegrunnelse || ''}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'framsattKravAnnenYtelseBegrunnelse')}
                    onChange={updateFunction('framsattKravAnnenYtelseBegrunnelse')}
                />
            );
        }
    }

    function inntektInput() {
        if (state.harInntekt) {
            return (
                <InputFields
                    labelText="Brutto beløp per år:"
                    bredde="M"
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'inntektsBeløp')}
                    value={state.inntektBeløp || ''}
                    onChange={value => updateField('inntektBeløp', value)}
                />
            );
        }
    }

    function totalbeløpFormue() {
        if (state.harFormueEiendom || state.harFinansFormue) {
            return (
                <InputFields
                    labelText="Totalbeløp formue: "
                    bredde="M"
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'formueBeløp')}
                    value={state.formueBeløp || ''}
                    onChange={value => updateField('formueBeløp', value)}
                />
            );
        }
    }

    function depositumBeløp() {
        if (state.harDepositumskonto) {
            return (
                <InputFields
                    labelText="Beløp:"
                    value={state.depositumBeløp || ''}
                    bredde={'M'}
                    feil={displayErrorMessageOnInputField(feilmeldinger, 'depositumBeløp')}
                    onChange={e => updateField('depositumBeløp', e)}
                />
            );
        }
    }

    function harAnnenFormueEiendom() {
        if (state.harAnnenFormue) {
            return (
                <div style={{ marginBottom: '1em' }}>
                    {state.annenFormue
                        .map((item, index) => ({ ...item, key: index }))
                        .map((item, index) => {
                            return (
                                <div key={item.key} style={{ display: 'flex' }}>
                                    <InputFields
                                        labelText="Type formue/eiendom"
                                        id={`${item.key}-typeFormue`}
                                        value={item.typeFormue}
                                        feil={displayErrorMessageOnInputField(feilmeldinger, `${item.key}-typeFormue`)}
                                        onChange={value => updateFormueEiendomType(value, index)}
                                    />
                                    <InputFields
                                        labelText="Skattetakst"
                                        id={`${item.key}-skattetakst`}
                                        value={item.skattetakst || ''}
                                        feil={displayErrorMessageOnInputField(feilmeldinger, `${item.key}-skattetakst`)}
                                        onChange={value => updateFormueEiendomSkattetakst(value, index)}
                                    />
                                    {state.annenFormue.length > 1 && (
                                        <Lenke
                                            style={fjernInnputKnappStyle}
                                            onClick={() => fjernValgtInputFelt(state.annenFormue, 'annenFormue', index)}
                                        >
                                            Fjern felt
                                        </Lenke>
                                    )}
                                </div>
                            );
                        })}
                    <Knapp onClick={() => addInputFieldsAnnenFormueEiendom()}>
                        Legg til flere formue/eiendom felter
                    </Knapp>
                </div>
            );
        }
    }

    function addInputFieldsAnnenFormueEiendom() {
        const values = state.annenFormue;
        values.push({ typeFormue: '', skattetakst: '' });
        updateField('annenFormue', values);
    }

    function updateFormueEiendomType(kilde, index) {
        const type = { ...state.annenFormue[index] };
        type.typeFormue = kilde;

        const tempType = [...state.annenFormue.slice(0, index), type, ...state.annenFormue.slice(index + 1)];
        updateField('annenFormue', tempType);
    }

    function updateFormueEiendomSkattetakst(kilde, index) {
        const skattetakst = { ...state.annenFormue[index] };
        skattetakst.skattetakst = kilde;

        const tempSkattetakst = [
            ...state.annenFormue.slice(0, index),
            skattetakst,
            ...state.annenFormue.slice(index + 1)
        ];
        updateField('annenFormue', tempSkattetakst);
    }

    function updatePensjonsOrdning(kilde, index) {
        const ordning = { ...state.pensjonsOrdning[index] };
        ordning.ordning = kilde;

        const tempPensjonsOrdning = [
            ...state.pensjonsOrdning.slice(0, index),
            ordning,
            ...state.pensjonsOrdning.slice(index + 1)
        ];
        updateField('pensjonsOrdning', tempPensjonsOrdning);
    }

    function updatePensjonsOrdningsBeløp(kilde, index) {
        const beløp = { ...state.pensjonsOrdning[index] };
        beløp.beløp = kilde;

        const tempPensjonsOrdning = [
            ...state.pensjonsOrdning.slice(0, index),
            beløp,
            ...state.pensjonsOrdning.slice(index + 1)
        ];
        updateField('pensjonsOrdning', tempPensjonsOrdning);
    }

    function fjernValgtInputFelt(state, field, index) {
        const tempField = [...state.slice(0, index), ...state.slice(index + 1)];
        updateField(field, tempField);
    }

    function addInputFields() {
        const values = state.pensjonsOrdning;
        values.push({ ordning: '', beløp: '' });
        updateField('pensjonsOrdning', values);
    }

    function søkerHarPensjon() {
        if (state.harPensjon) {
            return (
                <div style={{ marginBottom: '1em' }}>
                    {state.pensjonsOrdning
                        .map((item, index) => ({ ...item, key: index }))
                        .map((item, index) => {
                            return (
                                <div key={item.key} style={{ display: 'flex' }}>
                                    <InputFields
                                        id={`${item.key}-ordning`}
                                        labelText={'Fra hvilken ordning mottar søker pensjon?'}
                                        value={item.ordning || ''}
                                        feil={displayErrorMessageOnInputField(feilmeldinger, `${item.key}-ordning`)}
                                        onChange={value => updatePensjonsOrdning(value, index)}
                                    />
                                    <InputFields
                                        id={`${item.key}-beløp`}
                                        labelText={'Brutto beløp per år'}
                                        value={item.beløp || ''}
                                        feil={displayErrorMessageOnInputField(feilmeldinger, `${item.key}-beløp`)}
                                        onChange={value => updatePensjonsOrdningsBeløp(value, index)}
                                    />
                                    {state.pensjonsOrdning.length > 1 && (
                                        <Lenke
                                            style={fjernInnputKnappStyle}
                                            onClick={() =>
                                                fjernValgtInputFelt(state.pensjonsOrdning, 'pensjonsOrdning', index)
                                            }
                                        >
                                            Fjern felt
                                        </Lenke>
                                    )}
                                </div>
                            );
                        })}
                    <Knapp onClick={() => addInputFields()}>Legg til flere pensjonsordninger</Knapp>
                </div>
            );
        }
    }

    function søkerHarInntekt() {
        let beløp = 0;

        if (state.harInntekt) {
            if (state.inntektBeløp !== undefined) {
                state.inntektBeløp = state.inntektBeløp.replace(/\s/g, '').replace(/\./g, '');
                beløp += parseInt(state.inntektBeløp);
            }
        }

        if (state.harPensjon) {
            beløp += adderInntekter(
                state.pensjonsOrdning.map(item => parseInt(item.beløp.replace(/\s/g, '').replace(/\./g, ''), 10))
            );
        }
        state['sumInntektOgPensjon'] = beløp;

        return (
            <Undertittel>
                Sum Inntekt: {beløp}
                <hr />
            </Undertittel>
        );
    }

    return (
        <div>
            <Systemtittel>Pensjon og annen inntekt</Systemtittel>

            <JaNeiSpørsmål
                fieldName="framsattKravAnnenYtelse"
                legend="Har du fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort?"
                feil={displayErrorMessageOnInputField(feilmeldinger, `framsattKravAnnenYtelse`)}
                onChange={e => updateField('framsattKravAnnenYtelse', e.target.value)}
                state={state.framsattKravAnnenYtelse}
            />
            {framsattKravAnnenYtelseInput()}

            <JaNeiSpørsmål
                fieldName="harInntekt"
                legend="Har du arbeidsinntekt/personinntekt?"
                feil={displayErrorMessageOnInputField(feilmeldinger, `harInntekt`)}
                onChange={e => updateField('harInntekt', e.target.value)}
                state={state.harInntekt}
            />

            {inntektInput()}

            <JaNeiSpørsmål
                fieldName="harPensjon"
                legend="Har du pensjon?"
                onChange={e => radioChanged('harPensjon', e.target.value)}
                feil={displayErrorMessageOnInputField(feilmeldinger, `harPensjon`)}
                state={state.harPensjon}
            />

            {søkerHarPensjon()}

            <div style={{ marginBottom: '1em' }}>{søkerHarInntekt()}</div>

            {/* <Systemtittel>Pensjon og annen inntekt for ektefelle/samboer</Systemtittel>
            TODO */}
            <div>
                <Systemtittel>Opplysninger om formue</Systemtittel>
                <div style={formueContainer}>
                    <JaNeiSpørsmål
                        legend="Har du formue/eiendom?"
                        fieldName="harFormueEiendom"
                        feil={displayErrorMessageOnInputField(feilmeldinger, `formue`)}
                        onChange={e => updateField('harFormueEiendom', e.target.value)}
                        state={state.harFormueEiendom}
                    />
                    <JaNeiSpørsmål
                        legend="Har du finansformue?"
                        fieldName="harFinansFormue"
                        feil={displayErrorMessageOnInputField(feilmeldinger, `finansformue`)}
                        onChange={e => updateField('harFinansFormue', e.target.value)}
                        state={state.harFinansFormue}
                    />
                </div>
                {totalbeløpFormue()}
                <JaNeiSpørsmål
                    legend="Har du annen formue/eiendom?"
                    fieldName="harAnnenFormue"
                    feil={displayErrorMessageOnInputField(feilmeldinger, `annenFormue`)}
                    onChange={e => radioChanged('harAnnenFormue', e.target.value)}
                    state={state.harAnnenFormue}
                />
                {harAnnenFormueEiendom()}

                <div>
                    <Systemtittel>Depositumskonto</Systemtittel>
                    <JaNeiSpørsmål
                        legend="Har søker depositumskonto?"
                        fieldName="harDepositumskonto"
                        feil={displayErrorMessageOnInputField(feilmeldinger, `harDepositumskonto`)}
                        onChange={e => updateField('harDepositumskonto', e.target.value)}
                        state={state.harDepositumskonto}
                    />

                    {depositumBeløp()}
                </div>

                {/*tilsvarende spørsmål for ektefelle/samboer/partner/etc. */}
            </div>
            <Systemtittel>Opplysninger om økonomisk sosialhjelp</Systemtittel>
            <JaNeiSpørsmål
                legend="Mottar du eller ektefellen/samboer eller har du eller han/hun i løpet av de siste tre månedene mottatt sosialstønad til livsopphold?"
                fieldName="harSosialStønad"
                feil={displayErrorMessageOnInputField(feilmeldinger, `harSosialStønad`)}
                onChange={e => updateField('harSosialStønad', e.target.value)}
                state={state.harSosialStønad}
            />
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    );

    function adderInntekter(beløp) {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        return beløp.reduce(reducer, 0);
    }

    function radioChanged(propName, value) {
        updateField(propName, value);
        prepareState(stringToBoolean(value), propName);
    }

    function prepareState(value, propName) {
        if (propName === 'harPensjon') {
            if (value) {
                updateField('pensjonsOrdning', [{ ordning: '', beløp: '' }]);
            } else {
                updateField('pensjonsOrdning', null);
            }
        }
        if (propName === 'harAnnenFormue') {
            if (value) {
                updateField('annenFormue', [{ typeFormue: '', skattetakst: '' }]);
            } else {
                updateField('annenFormue', null);
            }
        }
    }

    function validateForm() {
        const errors = validateInntektPensjonFormue.validateFormValues(state);
        setFeilmeldinger(errors);
        if (errors.length === 0) {
            onClick();
        }
    }
};

const formueContainer = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
};

const fjernInnputKnappStyle = {
    alignSelf: 'center'
};

export default InntektPensjonFormue;
