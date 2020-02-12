import React, { useState } from 'react';
import { RadioGruppe, Radio, Feiloppsummering } from 'nav-frontend-skjema';
import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import { InputFields } from '../FormElements';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';

const InntektPensjonFormue = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);

    const updateFunction = name => value => updateField(name, value);

    function kravannenytelseInput() {
        if (state.kravannenytelse === 'true') {
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
        if (state.arbeidselleranneninntekt === 'true') {
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

    const TotalbeløpFormue = () =>
        (state.harduformueeiendom === 'true' || state.hardufinansformue === 'true') && (
            <InputFields
                labelText="Totalbeløp formue: "
                id={fields.formueBeløp.htmlId}
                bredde="M"
                value={state.formueBeløp || ''}
                onChange={updateFunction('formueBeløp')}
            />
        );

    function harAnnenFormueEiendom() {
        if (state.harduannenformueeiendom === 'true') {
            return (
                <div style={{ marginBottom: '1em' }}>
                    {state.annenFormueEiendom
                        .map((item, index) => ({ ...item, key: index }))
                        .map((item, index) => {
                            return (
                                <div key={item.key} style={container}>
                                    <InputFields
                                        labelText="Type formue/eiendom"
                                        id={`${item.key}-typeFormue`}
                                        value={item.typeFormue}
                                        onChange={value => updateFormueEiendomType(value, index)}
                                    />
                                    <InputFields
                                        labelText="skattetakst"
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
        if (state.hardupensjon === 'true') {
            return (
                <div style={{ marginBottom: '1em' }}>
                    {state.pensjonsOrdning
                        .map((item, index) => ({ ...item, key: index }))
                        .map((item, index) => {
                            return (
                                <div key={item.key} style={container}>
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

        if (state.arbeidselleranneninntekt === 'true') {
            if (
                state.arbeidselleranneninntektBegrunnelse !== undefined &&
                state.arbeidselleranneninntektBegrunnelse.length >= 1
            ) {
                beløp += parseInt(state.arbeidselleranneninntektBegrunnelse);
            }
        }

        if (state.hardupensjon === 'true') {
            beløp += adderInntekter(
                state.pensjonsOrdning.map(item => parseInt(item.beløp, 10)).filter(item => !isNaN(item))
            );
        }

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
            <div>
                <RadioGruppe legend="Har du fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort?">
                    <Radio
                        name="kravannenytelse"
                        label="Ja"
                        value="true"
                        checked={state.kravannenytelse === 'true'}
                        onChange={e => updateField('kravannenytelse', e.target.value)}
                    />
                    <Radio
                        name="kravannenytelse"
                        label="Nei"
                        value="false"
                        checked={state.kravannenytelse === 'false'}
                        onChange={e => updateField('kravannenytelse', e.target.value)}
                    />
                </RadioGruppe>
                {kravannenytelseInput()}
            </div>

            <div style={{ marginBottom: '1em' }}>
                <div>
                    <RadioGruppe legend="Har du arbeidsinntekt/personinntekt?">
                        <Radio
                            name="arbeidselleranneninntekt"
                            label="Ja"
                            value="true"
                            checked={state.arbeidselleranneninntekt === 'true'}
                            onChange={e => updateField('arbeidselleranneninntekt', e.target.value)}
                        />
                        <Radio
                            name="arbeidselleranneninntekt"
                            label="Nei"
                            value="false"
                            checked={state.arbeidselleranneninntekt === 'false'}
                            onChange={e => updateField('arbeidselleranneninntekt', e.target.value)}
                        />
                    </RadioGruppe>
                    {arbeidselleranneninntektInput()}
                </div>
                <div>
                    <RadioGruppe legend="Har du pensjon?">
                        <Radio
                            name="hardupensjon"
                            label="Ja"
                            value="true"
                            checked={state.hardupensjon === 'true'}
                            onChange={e => updateField('hardupensjon', e.target.value)}
                        />
                        <Radio
                            name="hardupensjon"
                            label="Nei"
                            value="false"
                            checked={state.hardupensjon === 'false'}
                            onChange={e => updateField('hardupensjon', e.target.value)}
                        />
                    </RadioGruppe>

                    {søkerHarPensjon()}
                </div>
                {søkerHarInntekt()}
            </div>

            {/* <Systemtittel>Pensjon og annen inntekt for ektefelle/samboer</Systemtittel>
            TODO */}
            <div>
                <Systemtittel>Opplysninger om formue</Systemtittel>
                <div style={container}>
                    <RadioGruppe legend="Har du formue/eiendom?">
                        <Radio
                            name="harduformueeiendom"
                            label="Ja"
                            value="true"
                            checked={state.harduformueeiendom === 'true'}
                            onChange={e => updateField('harduformueeiendom', e.target.value)}
                        />
                        <Radio
                            name="harduformueeiendom"
                            label="Nei"
                            value="false"
                            checked={state.harduformueeiendom === 'false'}
                            onChange={e => updateField('harduformueeiendom', e.target.value)}
                        />
                    </RadioGruppe>
                    &nbsp;
                    <RadioGruppe legend="Har du finansformue?">
                        <Radio
                            name="hardufinansformue"
                            label="Ja"
                            value="true"
                            checked={state.hardufinansformue === 'true'}
                            onChange={e => updateField('hardufinansformue', e.target.value)}
                        />
                        <Radio
                            name="hardufinansformue"
                            label="Nei"
                            value="false"
                            checked={state.hardufinansformue === 'false'}
                            onChange={e => updateField('hardufinansformue', e.target.value)}
                        />
                    </RadioGruppe>
                </div>
                <TotalbeløpFormue />
                <div>
                    <RadioGruppe legend="Har du annen formue/eiendom?">
                        <Radio
                            name="harduannenformueeiendom"
                            label="Ja"
                            value="true"
                            checked={state.harduannenformueeiendom === 'true'}
                            onChange={e => updateField('harduannenformueeiendom', e.target.value)}
                        />
                        <Radio
                            name="harduannenformueeiendom"
                            label="Nei"
                            value="false"
                            checked={state.harduannenformueeiendom === 'false'}
                            onChange={e => updateField('harduannenformueeiendom', e.target.value)}
                        />
                    </RadioGruppe>
                    {harAnnenFormueEiendom()}
                </div>
                {/*tilsvarende spørsmål for ektefelle/samboer/partner/etc. */}
            </div>
            <div>
                <Systemtittel>Opplysninger om økonomisk sosialhjelp</Systemtittel>
                <RadioGruppe legend="Mottar du eller ektefellen/samboer eller har du eller han/hun i løpet av de siste tre månedene mottatt sosialstønad til livsopphold?">
                    <Radio
                        name="sosialstonad"
                        label="Ja"
                        value="true"
                        checked={state.sosialstonad === 'true'}
                        onChange={e => updateField('sosialstonad', e.target.value)}
                    />
                    <Radio
                        name="sosialstonad"
                        label="Nei"
                        value="false"
                        checked={state.sosialstonad === 'false'}
                        onChange={e => updateField('sosialstonad', e.target.value)}
                    />
                </RadioGruppe>
            </div>
            {feilmeldinger.length > 0 && <Feiloppsummering tittel={'Vennligst fyll ut mangler'} feil={feilmeldinger} />}
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
    console.log(begrunnelse);
    if (formValues.kravannenytelse === 'true') {
        if (!/^([a-øA-Ø.,]{1,255})$/.test(begrunnelse) || begrunnelse === undefined) {
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

    if (formValues.arbeidselleranneninntekt === 'true') {
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

    if (formValues.hardupensjon === 'true') {
        tempPensjonsOrdningArray.map((item, index) => {
            if (!/^([a-øA-Ø.,]{1,255})$/.test(item.ordning)) {
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

    if (formValues.harduformueeiendom === 'true' || formValues.hardufinansformue === 'true') {
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

    if (formValues.harduannenformueeiendom === 'true') {
        annenFormueEiendom.map((item, index) => {
            if (!/^([a-øA-Ø0-9.,\s]{1,255})$/.test(item.typeFormue)) {
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

const container = {
    display: 'flex'
};

const fjernInnputKnappStyle = {
    alignSelf: 'center'
};

export const validateInntektPensjonFormue = {
    validateFormValues
};

export default InntektPensjonFormue;
