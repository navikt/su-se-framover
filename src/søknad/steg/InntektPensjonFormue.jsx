import React, { useState } from 'react';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { getRandomSmiley } from '../../hooks/getRandomEmoji';
import { stringToBoolean } from '../../components/FormElements';

const InntektPensjonFormue = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    const updateFunction = name => value => updateField(name, value);

    function framsattKravAnnenYtelseInput() {
        if (state.framsattKravAnnenYtelse) {
            return (
                <InputFields
                    labelText="Hva slags ytelse/pensjon?"
                    id={fields.framsattKravAnnenYtelseBegrunnelse.htmlId}
                    value={state.framsattKravAnnenYtelseBegrunnelse || ''}
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
                    id={fields.inntektsBeløp.htmlId}
                    bredde="M"
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
                    id={fields.formueBeløp.htmlId}
                    bredde="M"
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
                                        onChange={value => updateFormueEiendomType(value, index)}
                                    />
                                    <InputFields
                                        labelText="Skattetakst"
                                        id={`${item.key}-skattetakst`}
                                        value={item.skattetakst || ''}
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
                                        onChange={value => updatePensjonsOrdning(value, index)}
                                    />
                                    <InputFields
                                        id={`${item.key}-beløp`}
                                        labelText={'Brutto beløp per år'}
                                        value={item.beløp || ''}
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
                onChange={e => updateField('framsattKravAnnenYtelse', e.target.value)}
                state={state.framsattKravAnnenYtelse}
            />
            {framsattKravAnnenYtelseInput()}

            <JaNeiSpørsmål
                fieldName="harInntekt"
                legend="Har du arbeidsinntekt/personinntekt?"
                onChange={e => updateField('harInntekt', e.target.value)}
                state={state.harInntekt}
            />

            {inntektInput()}

            <JaNeiSpørsmål
                fieldName="harPensjon"
                legend="Har du pensjon?"
                onChange={e => radioChanged('harPensjon', e.target.value)}
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
                        onChange={e => updateField('harFormueEiendom', e.target.value)}
                        state={state.harFormueEiendom}
                    />
                    <JaNeiSpørsmål
                        legend="Har du finansformue?"
                        fieldName="harFinansFormue"
                        onChange={e => updateField('harFinansFormue', e.target.value)}
                        state={state.harFinansFormue}
                    />
                </div>
                {totalbeløpFormue()}
                <JaNeiSpørsmål
                    legend="Har du annen formue/eiendom?"
                    fieldName="harAnnenFormue"
                    onChange={e => radioChanged('harAnnenFormue', e.target.value)}
                    state={state.harAnnenFormue}
                />
                {harAnnenFormueEiendom()}

                <div>
                    <Systemtittel>Depositumskonto</Systemtittel>
                    <JaNeiSpørsmål
                        legend="Har søker depositumskonto?"
                        fieldName="harDepositumskonto"
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
                onChange={e => updateField('harSosialStønad', e.target.value)}
                state={state.harSosialStønad}
            />

            {feilmeldinger.length > 0 && (
                <Feiloppsummering tittel={`Vennligst fyll ut mangler ${getRandomSmiley()}`} feil={feilmeldinger} />
            )}
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
    framsattKravAnnenYtelse: { label: 'framsattKravAnnenYtelse', htmlId: 'framsattKravAnnenYtelse' },
    framsattKravAnnenYtelseBegrunnelse: {
        label: 'framsattKravAnnenYtelseBegrunnelse',
        htmlId: 'framsattKravAnnenYtelseBegrunnelse'
    },
    harInntekt: {
        label: 'harInntekt',
        htmlId: 'harInntekt'
    },
    inntektsBeløp: { label: 'inntektsBeløp', htmlId: 'inntektsBeløp' },
    pensjon: { label: 'pensjon', htmlId: 'pensjon' },
    formue: { label: 'formue', htmlId: 'formue' },
    finansformue: { label: 'finansformue', htmlId: 'finansformue' },
    annenFormue: { label: 'annenFormue', htmlId: 'annenFormue' },
    formueBeløp: { label: 'formueBeløp', htmlId: 'formueBeløp' },
    typeFormue: { label: 'typeFormue', htmlId: 'typeFormue' },
    skattetakst: { label: 'skattetakst', htmlId: 'skattetakst' },
    harDepositumskonto: { label: 'harDepositumskonto', htmlId: 'harDepositumskonto' },
    depositumBeløp: { label: 'depositumBeløp', htmlId: 'depositumBeløp' },
    harSosialStønad: { label: 'harSosialStønad', htmlId: 'harSosialStønad' }
};

function validateFormValues(formValues) {
    const tempErrors = [];
    const pensjonsOrdningErrors = [];
    const tempAnnenFormueEiendomArray = [];

    tempErrors.push(...framsattKravAnnenYtelseValidering(formValues));
    tempErrors.push(...framsattKravAnnenYtelseBegrunnelseValidering(formValues));
    tempErrors.push(...arbeidsInntektValidering(formValues));
    tempErrors.push(...arbeidsBeløpValidering(formValues));
    tempErrors.push(...pensjonValidering(formValues));
    tempErrors.push(...pensjonsOrdningValidering(formValues, pensjonsOrdningErrors));
    tempErrors.push(...finansformueValidering(formValues));
    tempErrors.push(...formueValidering(formValues));
    tempErrors.push(...formueBeløpValidering(formValues));
    tempErrors.push(...annenFormue(formValues));
    tempErrors.push(...annenFormueEiendomArray(formValues, tempAnnenFormueEiendomArray));
    tempErrors.push(...harSøkerDepositumskontoValidering(formValues));
    tempErrors.push(...depositumsBeløpValidering(formValues));
    tempErrors.push(...sosialStønadValidering(formValues));

    return tempErrors;
}

function framsattKravAnnenYtelseValidering(formValues) {
    const krav = formValues.framsattKravAnnenYtelse;
    let feilmelding = '';

    if (krav === undefined) {
        feilmelding +=
            'Vennligst velg om søker har fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.framsattKravAnnenYtelse.htmlId, feilmelding }];
        }
    }
    return [];
}

function framsattKravAnnenYtelseBegrunnelseValidering(formValues) {
    const begrunnelse = formValues.framsattKravAnnenYtelseBegrunnelse;
    let feilmelding = '';

    if (formValues.framsattKravAnnenYtelse) {
        if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(begrunnelse) || begrunnelse === undefined) {
            feilmelding +=
                'Vennligst oppgi hva slags ytelse/pensjon søker mottar. Kan ikke inneholde tall eller spesialtegn';
        }
        if (feilmelding.length > 0) {
            return [
                {
                    skjemaelementId: fields.framsattKravAnnenYtelseBegrunnelse.htmlId,
                    feilmelding
                }
            ];
        }
    }
    return [];
}

function arbeidsInntektValidering(formValues) {
    const harInntekt = formValues.harInntekt;
    let feilmelding = '';

    if (harInntekt === undefined) {
        feilmelding += 'Vennligst velg om søker har arbeids/person-inntekt';

        if (feilmelding.length > 0) {
            return [
                {
                    skjemaelementId: fields.harInntekt.htmlId,
                    feilmelding
                }
            ];
        }
    }
    return [];
}

function arbeidsBeløpValidering(formValues) {
    const arbeidsBeløp = formValues.inntektBeløp;
    let feilmelding = '';

    if (formValues.harInntekt) {
        if (!/^(\d{1,30})$/.test(arbeidsBeløp) || arbeidsBeløp === undefined) {
            feilmelding += 'Vennligst tast inn arbeids/pensjon-inntekt beløp';

            if (feilmelding.length > 0) {
                return [{ skjemaelementId: fields.inntektsBeløp.htmlId, feilmelding }];
            }
        }
    }
    return [];
}

function pensjonValidering(formValues) {
    const pensjon = formValues.harPensjon;
    let feilmelding = '';

    if (pensjon === undefined) {
        feilmelding += 'Vennligst velg om søker har pensjon';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.pensjon.htmlId, feilmelding }];
        }
    }
    return [];
}

function pensjonsOrdningValidering(formValues, errorsArray) {
    const tempPensjonsOrdningArray = formValues.pensjonsOrdning;

    if (formValues.harPensjon === true) {
        tempPensjonsOrdningArray.map((item, index) => {
            if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(item.ordning)) {
                if (item.ordning === '' || item.ordning === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-ordning`,
                        feilmelding: 'Ordning må fylles ut'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-ordning`,
                        feilmelding: 'Ordning kan ikke inneholde tall eller spesialtegn'
                    });
                }
            }
            if (!/^(\d{1,30})$/.test(item.beløp)) {
                if (item.beløp === '' || item.beløp === undefined) {
                    errorsArray.push({
                        skjemaelementId: `${index}-beløp`,
                        feilmelding: 'Beløp må fylles ut'
                    });
                } else {
                    errorsArray.push({
                        skjemaelementId: `${index}-beløp`,
                        feilmelding: 'Beløp kan kun inneholde tall'
                    });
                }
            }
        });
    }
    return errorsArray;
}

function formueValidering(formValues) {
    const formue = formValues.harFormueEiendom;
    let feilmelding = '';

    if (formue === undefined) {
        feilmelding += 'Vennligst velg om søker har formue/eiendom';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.formue.htmlId, feilmelding }];
        }
    }
    return [];
}

function finansformueValidering(formValues) {
    const finansformue = formValues.harFinansFormue;
    let feilmelding = '';

    if (finansformue === undefined) {
        feilmelding += 'Vennligst velg om søker har finansformue';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.finansformue.htmlId, feilmelding }];
    }
    return [];
}

function formueBeløpValidering(formValues) {
    const formueBeløp = formValues.formueBeløp;
    let feilmelding = '';

    if (formValues.harFormueEiendom === true || formValues.harFinansFormue === true) {
        if (!/^(\d{1,30})$/.test(formueBeløp) || formueBeløp === undefined) {
            feilmelding += 'Vennligst tast inn totalbeløp for formue';

            if (feilmelding.length > 0) {
                return [{ skjemaelementId: fields.formueBeløp.htmlId, feilmelding }];
            }
        }
    }
    return [];
}

function annenFormue(formValues) {
    const annenFormue = formValues.harAnnenFormue;
    let feilmelding = '';

    if (annenFormue === undefined) {
        feilmelding += 'Vennligst velg om søker har annen formue/eiendom';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.annenFormue.htmlId, feilmelding }];
        }
    }
    return [];
}

function annenFormueEiendomArray(formValues, errorsArray) {
    const annenFormue = formValues.annenFormue;

    if (formValues.harAnnenFormue === true) {
        annenFormue.map((item, index) => {
            if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(item.typeFormue)) {
                errorsArray.push({
                    skjemaelementId: `${index}-typeFormue`,
                    feilmelding: 'Type formue må fylles ut'
                });
            }
            if (!/^(\d{1,30})$/.test(item.skattetakst)) {
                errorsArray.push({
                    skjemaelementId: `${index}-skattetakst`,
                    feilmelding: 'Skattetakst må fylles ut, og kan kun inneholde tall'
                });
            }
        });
    }
    return errorsArray;
}

function harSøkerDepositumskontoValidering(formValues) {
    const depositumskonto = formValues.harDepositumskonto;
    let feilmelding = '';

    if (depositumskonto === undefined) {
        feilmelding += 'Vennligst velg om søker har depositumskonto';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.harDepositumskonto.htmlId, feilmelding }];
        }
    }

    return [];
}

function depositumsBeløpValidering(formValues) {
    const harDepositumskonto = formValues.harDepositumskonto;
    let feilmelding = '';

    if (harDepositumskonto === true) {
        const beløp = formValues.depositumBeløp;

        if (!/^(\d{1,30})$/.test(beløp)) {
            feilmelding += 'Depositum beløp kan ikke være tom, og kan kun inneholde tall';
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.depositumBeløp.htmlId, feilmelding }];
        }
    }
    return [];
}

function sosialStønadValidering(formValues) {
    const sosial = formValues.harSosialStønad;
    let feilmelding = '';

    if (sosial === undefined) {
        feilmelding += 'Vennligst velg om søker mottar sosial stønad';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.harSosialStønad.htmlId, feilmelding }];
    }
    return [];
}

const formueContainer = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
};

const fjernInnputKnappStyle = {
    alignSelf: 'center'
};

export const validateInntektPensjonFormue = {
    validateFormValues
};

export default InntektPensjonFormue;
