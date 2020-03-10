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
        if (!state.harVarigOpphold && state.harVarigOpphold !== undefined) {
            return (
                <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: '1em' }}>
                        <label>Utløpsdato</label>
                        <Datovelger.Datovelger
                            input={{
                                placeholder: 'dd.mm.åååå'
                            }}
                            valgtDato={state.utløpsDato}
                            onChange={updateFunction('utløpsDato')}
                        />
                    </div>
                    <JaNeiSpørsmål
                        fieldName="søktOmForlengelse"
                        legend="Har søker søkt om forlengelse?"
                        state={state.søktOmForlengelse}
                        onChange={e => updateField('søktOmForlengelse', e.target.value)}
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
                    fieldName="harVarigOpphold"
                    legend="Har søker varig oppholdstillatelse?"
                    state={state.harVarigOpphold}
                    onChange={e => updateField('harVarigOpphold', e.target.value)}
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
    harVarigOpphold: { label: 'harVarigOpphold', htmlId: 'harVarigOpphold' },
    utløpsDato: {
        label: 'utløpsDato',
        htmlId: 'utløpsDato'
    },
    søktOmForlengelse: { label: 'søktOmForlengelse', htmlId: 'søktOmForlengelse' }
};

function validateFormValues(formValues) {
    const tempErrors = [];

    tempErrors.push(...varigOppholdstillatelseValidering(formValues));
    tempErrors.push(...oppholdstillatelseUtløpsdatoValidering(formValues));
    tempErrors.push(...søktforlengelseValidering(formValues));

    return tempErrors;
}

function varigOppholdstillatelseValidering(formValues) {
    const varigOppholdstillatelse = formValues.harVarigOpphold;
    let feilmelding = '';

    if (varigOppholdstillatelse === undefined) {
        feilmelding += 'Vennligst velg varig-oppholdstillatelse';
    }
    if (feilmelding.length > 0) {
        return [{ skjemaelementId: fields.harVarigOpphold.htmlId, feilmelding }];
    }
    return [];
}

function oppholdstillatelseUtløpsdatoValidering(formValues) {
    const utløpsDato = formValues.utløpsDato;
    let feilmelding = '';

    if (!formValues.harVarigOpphold) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(utløpsDato)) {
            if (utløpsDato === '' || utløpsDato === undefined) {
                feilmelding += 'Oppholdstillatelsens utløpsdato må oppgis. Den må være på format dd.mm.åååå';
            } else {
                feilmelding += 'Oppholdstillatelsens utløpsdato må være på format dd.mm.åååå';
            }
            if (feilmelding.length > 0) {
                return [
                    {
                        skjemaelementId: fields.utløpsDato.htmlId,
                        feilmelding
                    }
                ];
            }
        }
    }
    return [];
}

function søktforlengelseValidering(formValues) {
    const søktOmForlengelse = formValues.søktOmForlengelse;
    let feilmelding = '';

    if (!formValues.harVarigOpphold) {
        if (søktOmForlengelse === undefined) {
            feilmelding += 'Vennligst velg om søker har søkt om forlengelse';
        }
        if (feilmelding.length > 0) {
            return [{ skjemaelementId: fields.søktOmForlengelse.htmlId, feilmelding }];
        }
    }
    return [];
}

export const validateOppholdstillatelse = {
    validateFormValues
};

export default Oppholdstillatelse;
