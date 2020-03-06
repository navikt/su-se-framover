import React, { useEffect, useState } from 'react';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { getRandomSmiley } from '../../hooks/getRandomEmoji';

const InntektPensjonFormue = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    const updateFunction = name => value => updateField(name, value);

    function kravannenytelseInput() {
        if (state.kravannenytelse) {
            return (
                <InputFields
                    labelText="Hva slags ytelse/pensjon?"
                    id={fields.kravannenytelseBegrunnelse.htmlId}
                    value={state.kravannenytelseBegrunnelse || ''}
                    onChange={updateFunction('kravannenytelseBegrunnelse')}
                />
            );
        }
    }

    function arbeidselleranneninntektInput() {
        if (state.arbeidselleranneninntekt) {
            return (
                <InputFields
                    labelText="Brutto beløp per år:"
                    id={fields.arbeidsBeløp.htmlId}
                    bredde="M"
                    value={state.arbeidselleranneninntektBegrunnelse || ''}
                    onChange={updateFunction('arbeidselleranneninntektBegrunnelse')}
                />
            );
        }
    }

    function totalbeløpFormue() {
        if (state.harduformueeiendom || state.hardufinansformue) {
            return (
                <InputFields
                    labelText="Totalbeløp formue: "
                    id={fields.formueBeløp.htmlId}
                    bredde="M"
                    value={state.formueBeløp || ''}
                    onChange={updateFunction('formueBeløp')}
                />
            );
        }
    }

    function depositumBeløp() {
        if (state.søkerHarDepositumskonto) {
            return (
                <InputFields
                    labelText="Beløp:"
                    value={state.depositumBeløp || ''}
                    bredde={'M'}
                    onChange={updateFunction('depositumBeløp')}
                />
            );
        }
    }

    function harAnnenFormueEiendom() {
        if (state.harduannenformueeiendom) {
            return (
                <div style={{ marginBottom: '1em' }}>
                    {state.annenFormueEiendom
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
                                        value={item.skattetakst}
                                        onChange={value => updateFormueEiendomSkattetakst(value, index)}
                                    />
                                    {state.annenFormueEiendom.length > 1 && (
                                        <Lenke
                                            style={fjernInnputKnappStyle}
                                            onClick={() =>
                                                fjernValgtInputFelt(
                                                    state.annenFormueEiendom,
                                                    'annenFormueEiendom',
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
                    <Knapp onClick={() => addInputFieldsAnnenFormueEiendom()}>
                        Legg til flere formue/eiendom felter
                    </Knapp>
                </div>
            );
        }
    }

    function addInputFieldsAnnenFormueEiendom() {
        const values = state.annenFormueEiendom;
        values.push({ typeFormue: '', skattetakst: '' });
        updateField('annenFormueEiendom', values);
    }

    function updateFormueEiendomType(kilde, index) {
        const type = { ...state.annenFormueEiendom[index] };
        type.typeFormue = kilde;

        const tempType = [
            ...state.annenFormueEiendom.slice(0, index),
            type,
            ...state.annenFormueEiendom.slice(index + 1)
        ];
        updateField('annenFormueEiendom', tempType);
    }

    function updateFormueEiendomSkattetakst(kilde, index) {
        const skattetakst = { ...state.annenFormueEiendom[index] };
        skattetakst.skattetakst = kilde;

        const tempSkattetakst = [
            ...state.annenFormueEiendom.slice(0, index),
            skattetakst,
            ...state.annenFormueEiendom.slice(index + 1)
        ];
        updateField('annenFormueEiendom', tempSkattetakst);
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
        if (state.hardupensjon) {
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
                                        value={item.ordning}
                                        onChange={value => updatePensjonsOrdning(value, index)}
                                    />
                                    <InputFields
                                        id={`${item.key}-beløp`}
                                        labelText={'Brutto beløp per år'}
                                        value={item.beløp}
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

        if (state.arbeidselleranneninntekt) {
            if (
                state.arbeidselleranneninntektBegrunnelse !== undefined &&
                state.arbeidselleranneninntektBegrunnelse.length >= 1
            ) {
                beløp += parseInt(state.arbeidselleranneninntektBegrunnelse);
            }
        }

        if (state.hardupensjon) {
            beløp += adderInntekter(
                state.pensjonsOrdning.map(item => parseInt(item.beløp, 10)).filter(item => !isNaN(item))
            );
        }

        useEffect(() => {
            updateField('sumInntekt', beløp);
        }, [beløp]);

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
                fieldName="kravannenytelse"
                legend="Har du fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort?"
                onChange={e => updateField('kravannenytelse', e.target.value)}
                state={state.kravannenytelse}
            />
            {kravannenytelseInput()}

            <JaNeiSpørsmål
                fieldName="arbeidselleranneninntekt"
                legend="Har du arbeidsinntekt/personinntekt?"
                onChange={e => updateField('arbeidselleranneninntekt', e.target.value)}
                state={state.arbeidselleranneninntekt}
            />

            {arbeidselleranneninntektInput()}

            <JaNeiSpørsmål
                fieldName="hardupensjon"
                legend="Har du pensjon?"
                onChange={e => updateField('hardupensjon', e.target.value)}
                state={state.hardupensjon}
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
                        fieldName="harduformueeiendom"
                        onChange={e => updateField('harduformueeiendom', e.target.value)}
                        state={state.harduformueeiendom}
                    />
                    <JaNeiSpørsmål
                        legend="Har du finansformue?"
                        fieldName="hardufinansformue"
                        onChange={e => updateField('hardufinansformue', e.target.value)}
                        state={state.hardufinansformue}
                    />
                </div>
                {totalbeløpFormue()}
                <JaNeiSpørsmål
                    legend="Har du annen formue/eiendom?"
                    fieldName="harduannenformueeiendom"
                    onChange={e => updateField('harduannenformueeiendom', e.target.value)}
                    state={state.harduannenformueeiendom}
                />
                {harAnnenFormueEiendom()}

                <div>
                    <Systemtittel>Depositumskonto</Systemtittel>
                    <JaNeiSpørsmål
                        legend="Har søker depositumskonto?"
                        fieldName="søkerHarDepositumskonto"
                        onChange={e => updateField('søkerHarDepositumskonto', e.target.value)}
                        state={state.søkerHarDepositumskonto}
                    />

                    {depositumBeløp()}
                </div>

                {/*tilsvarende spørsmål for ektefelle/samboer/partner/etc. */}
            </div>
            <Systemtittel>Opplysninger om økonomisk sosialhjelp</Systemtittel>
            <JaNeiSpørsmål
                legend="Mottar du eller ektefellen/samboer eller har du eller han/hun i løpet av de siste tre månedene mottatt sosialstønad til livsopphold?"
                fieldName="sosialstonad"
                onChange={e => updateField('sosialstonad', e.target.value)}
                state={state.sosialstonad}
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
    kravannenytelse: { label: 'kravannenytelse', htmlId: 'kravannenytelse' },
    kravannenytelseBegrunnelse: {
        label: 'kravannenytelseBegrunnelse',
        htmlId: 'kravannenytelseBegrunnelse'
    },
    arbeidselleranneninntekt: {
        label: 'arbeidselleranneninntekt',
        htmlId: 'arbeidselleranneninntekt'
    },
    arbeidsBeløp: { label: 'arbeidsBeløp', htmlId: 'arbeidsBeløp' },
    pensjon: { label: 'pensjon', htmlId: 'pensjon' },
    formue: { label: 'formue', htmlId: 'formue' },
    finansformue: { label: 'finansformue', htmlId: 'finansformue' },
    annenFormueEiendom: { label: 'annenFormueEiendom', htmlId: 'annenFormueEiendom' },
    formueBeløp: { label: 'formueBeløp', htmlId: 'formueBeløp' },
    typeFormue: { label: 'typeFormue', htmlId: 'typeFormue' },
    skattetakst: { label: 'skattetakst', htmlId: 'skattetakst' },
    søkerHarDepositumsKonto: { label: 'søkerHarDepositumsKonto', htmlId: 'søkerHarDepositumsKonto' },
    depositumBeløp: { label: 'depositumBeløp', htmlId: 'depositumBeløp' },
    sosialstonad: { label: 'sosialstonad', htmlId: 'sosialstonad' }
};

function validateFormValues(formValues) {
    const tempErrors = [];
    const pensjonsOrdningErrors = [];
    const tempAnnenFormueEiendomArray = [];

    tempErrors.push(...kravannenytelseValidering(formValues));
    tempErrors.push(...kravannenytelseBegrunnelseValidering(formValues));
    tempErrors.push(...arbeidsInntektValidering(formValues));
    tempErrors.push(...arbeidsBeløpValidering(formValues));
    tempErrors.push(...pensjonValidering(formValues));
    tempErrors.push(...pensjonsOrdningValidering(formValues, pensjonsOrdningErrors));
    tempErrors.push(...finansformueValidering(formValues));
    tempErrors.push(...formueValidering(formValues));
    tempErrors.push(...formueBeløpValidering(formValues));
    tempErrors.push(...annenFormueEiendom(formValues));
    tempErrors.push(...annenFormueEiendomArray(formValues, tempAnnenFormueEiendomArray));
    tempErrors.push(...harSøkerDepositumskontoValidering(formValues));
    tempErrors.push(...depositumsBeløpValidering(formValues));
    tempErrors.push(...sosialStønadValidering(formValues));

    return tempErrors;
}

function kravannenytelseValidering(formValues) {
    const krav = formValues.kravannenytelse;
    let feilmelding = '';

    if (krav === undefined) {
        feilmelding +=
            'Vennligst velg om søker har fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.kravannenytelse.htmlId, feilmelding }];
        }
    }
    return [];
}

function kravannenytelseBegrunnelseValidering(formValues) {
    const begrunnelse = formValues.kravannenytelseBegrunnelse;
    let feilmelding = '';

    if (formValues.kravannenytelse) {
        if (!/^([a-zæøåA-ZÆØÅ.,\s]{1,255})$/.test(begrunnelse) || begrunnelse === undefined) {
            feilmelding +=
                'Vennligst oppgi hva slags ytelse/pensjon søker mottar. Kan ikke inneholde tall eller spesialtegn';
        }
        if (feilmelding.length > 0) {
            return [
                {
                    skjemaelementId: fields.kravannenytelseBegrunnelse.htmlId,
                    feilmelding
                }
            ];
        }
    }
    return [];
}

function arbeidsInntektValidering(formValues) {
    const arbeidselleranneninntekt = formValues.arbeidselleranneninntekt;
    let feilmelding = '';

    if (arbeidselleranneninntekt === undefined) {
        feilmelding += 'Vennligst velg om søker har arbeids/person-inntekt';

        if (feilmelding.length > 0) {
            return [
                {
                    skjemaelementId: fields.arbeidselleranneninntekt.htmlId,
                    feilmelding
                }
            ];
        }
    }
    return [];
}

function arbeidsBeløpValidering(formValues) {
    const arbeidsBeløp = formValues.arbeidselleranneninntektBegrunnelse;
    let feilmelding = '';

    if (formValues.arbeidselleranneninntekt) {
        if (!/^(\d{1,30})$/.test(arbeidsBeløp) || arbeidsBeløp === undefined) {
            feilmelding += 'Vennligst tast inn arbeids/pensjon-inntekt beløp';

            if (feilmelding.length > 0) {
                return [{ skjemaelementId: fields.arbeidsBeløp.htmlId, feilmelding }];
            }
        }
    }
    return [];
}

function pensjonValidering(formValues) {
    const pensjon = formValues.hardupensjon;
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

    if (formValues.hardupensjon === true) {
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
    const formue = formValues.harduformueeiendom;
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
    const finansformue = formValues.hardufinansformue;
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

    if (formValues.harduformueeiendom === true || formValues.hardufinansformue === true) {
        if (!/^(\d{1,30})$/.test(formueBeløp) || formueBeløp === undefined) {
            feilmelding += 'Vennligst tast inn totalbeløp for formue';

            if (feilmelding.length > 0) {
                return [{ skjemaelementId: fields.formueBeløp.htmlId, feilmelding }];
            }
        }
    }
    return [];
}

function annenFormueEiendom(formValues) {
    const annenFormueEiendom = formValues.harduannenformueeiendom;
    let feilmelding = '';

    if (annenFormueEiendom === undefined) {
        feilmelding += 'Vennligst velg om søker har annen formue/eiendom';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.annenFormueEiendom.htmlId, feilmelding }];
        }
    }
    return [];
}

function annenFormueEiendomArray(formValues, errorsArray) {
    const annenFormueEiendom = formValues.annenFormueEiendom;

    if (formValues.harduannenformueeiendom === true) {
        annenFormueEiendom.map((item, index) => {
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
    const depositumskonto = formValues.søkerHarDepositumskonto;
    let feilmelding = '';

    if (depositumskonto === undefined) {
        feilmelding += 'Vennligst velg om søker har depositumskonto';

        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.søkerHarDepositumsKonto.htmlId, feilmelding }];
        }
    }

    return [];
}

function depositumsBeløpValidering(formValues) {
    const søkerHarDepositumskonto = formValues.søkerHarDepositumskonto;
    let feilmelding = '';

    if (søkerHarDepositumskonto === true) {
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
    const sosial = formValues.sosialstonad;
    let feilmelding = '';

    if (sosial === undefined) {
        feilmelding += 'Vennligst velg om søker mottar sosial stønad';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.sosialstonad.htmlId, feilmelding }];
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
