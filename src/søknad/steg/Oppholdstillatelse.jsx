import React, { useState } from 'react';
import { Systemtittel } from 'nav-frontend-typografi';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import Datovelger from 'nav-datovelger';
import { JaNeiSpørsmål } from '../../components/FormElements';
import { getRandomSmiley } from '../../hooks/getRandomEmoji';

const Oppholdstillatelse = ({ state, updateField, onClick }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);
    console.log(state);
    const updateFunction = name => value => updateField(name, value);

    function midlertidigOppholdstillatelse() {
        if (!state.varigopphold) {
            return (
                <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: '1em' }}>
                        <label>Utløpsdato</label>
                        <Datovelger.Datovelger
                            input={{
                                placeholder: 'dd.mm.åååå'
                            }}
                            valgtDato={state.oppholdstillatelseUtløpsdato}
                            onChange={updateFunction('oppholdstillatelseUtløpsdato')}
                        />
                    </div>
                    <JaNeiSpørsmål
                        fieldName="soektforlengelse"
                        legend="Har søker søkt om forlengelse?"
                        state={state.soektforlengelse}
                        onChange={e => updateField('soektforlengelse', e.target.value)}
                    />
                </div>
            );
        }
    }

    return (
        <div>
            <Systemtittel>Opplysninger om oppholdstillatelse</Systemtittel>
            <div>
                <JaNeiSpørsmål
                    fieldName="varigopphold"
                    legend="Har søker varig oppholdstillatelse?"
                    state={state.varigopphold}
                    onChange={e => updateField('varigopphold', e.target.value)}
                />
                <div>{midlertidigOppholdstillatelse()}</div>
            </div>
            {feilmeldinger.length > 0 && (
                <Feiloppsummering tittel={`Vennligst fyll ut mangler ${getRandomSmiley()}`} feil={feilmeldinger} />
            )}
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

//----------------------------------------------------------------------------------
//---------------------Validering
//----------------------------------------------------------------------------------
const fields = {
    varigopphold: { label: 'varigopphold', htmlId: 'varigopphold' },
    oppholdstillatelseUtløpsdato: {
        label: 'oppholdstillatelseUtløpsdato',
        htmlId: 'oppholdstillatelseUtløpsdato'
    },
    soektforlengelse: { label: 'soektforlengelse', htmlId: 'soektforlengelse' }
};

function validateFormValues(formValues) {
    const tempErrors = [];

    tempErrors.push(...varigOppholdstillatelseValidering(formValues));
    tempErrors.push(...oppholdstillatelseUtløpsdatoValidering(formValues));
    tempErrors.push(...søktforlengelseValidering(formValues));

    return tempErrors;
}

function varigOppholdstillatelseValidering(formValues) {
    const varigOppholdstillatelse = formValues.varigopphold;
    let feilmelding = '';

    if (varigOppholdstillatelse === undefined) {
        feilmelding += 'Vennligst velg varig-oppholdstillatelse';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.varigopphold.htmlId, feilmelding }];
    }
    return [];
}

function oppholdstillatelseUtløpsdatoValidering(formValues) {
    const oppholdstillatelseUtløpsdato = formValues.oppholdstillatelseUtløpsdato;
    let feilmelding = '';

    if (!formValues.varigopphold) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(oppholdstillatelseUtløpsdato)) {
            if (oppholdstillatelseUtløpsdato === '' || oppholdstillatelseUtløpsdato === undefined) {
                feilmelding += 'Oppholdstillatelsens utløpsdato må oppgis. Den må være på format dd.mm.åååå';
            } else {
                feilmelding += 'Oppholdstillatelsens utløpsdato må være på format dd.mm.åååå';
            }
            if (feilmelding.length > 0) {
                return [
                    {
                        skjemaelementId: fields.oppholdstillatelseUtløpsdato.htmlId,
                        feilmelding
                    }
                ];
            }
        }
    }
    return [];
}

function søktforlengelseValidering(formValues) {
    const soektforlengelse = formValues.soektforlengelse;
    let feilmelding = '';

    if (!formValues.varigopphold) {
        if (soektforlengelse === undefined) {
            feilmelding += 'Vennligst velg om søker har søkt om forlengelse';
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.soektforlengelse.htmlId, feilmelding }];
        }
    }
    return [];
}

export const validateOppholdstillatelse = {
    validateFormValues
};

export default Oppholdstillatelse;
