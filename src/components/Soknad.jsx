import React, { useState } from 'react';

import Stegindikator from 'nav-frontend-stegindikator';
import { Panel } from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import Personopplysninger from './soknadComponents/Personopplysninger';
import Boforhold from './soknadComponents/Boforhold';
import Utenlandsopphold from './soknadComponents/Utenlandsopphold';
import Oppholdstillatelse from './soknadComponents/Oppholdstillatelse';
import InntektPensjonFormue from './soknadComponents/InntektPensjonFormue';
import ForNAV from './soknadComponents/ForNAV';
import OppsumeringOgSend from './soknadComponents/OppsumeringOgSend';
import './soknad.less';

function Soknad({ config }) {
    const [stage, setStage] = useState(0);

    const [state, setState] = useState({
        personopplysninger: {},
        boforhold: {
            borSammenMed: [],
            delerBoligMed: [{ navn: '', fødselsnummer: '' }]
        },
        utenlandsopphold: {
            utenlandsoppholdArray: [{ utreisedato: '', innreisedato: '' }],
            planlagtUtenlandsoppholdArray: [{ utreisedato: '', innreisedato: '' }]
        },
        oppholdstillatelse: {},
        inntektPensjonFormue: {
            pensjonsOrdning: [{ ordning: '', beløp: '' }],
            annenFormueEiendom: [{ typeFormue: '', skattetakst: '' }]
        },
        forNAV: {}
    });

    function addToStage() {
        setStage(stage => stage + 1);
    }

    const updateFunction = name => value => updateField(setState)(name, value);

    const updateField = updateFunction => (stateToChange, value) => {
        updateFunction(state => ({
            ...state,
            [stateToChange]: typeof value === 'function' ? value(state[stateToChange]) : value
        }));
    };

    function ShowActiveComponent() {
        if (stage === 0) {
            return (
                <Personopplysninger
                    state={state.personopplysninger}
                    updateField={updateField(updateFunction('personopplysninger'))}
                    onClick={addToStage}
                />
            );
        } else if (stage === 1) {
            return (
                <Boforhold
                    state={state.boforhold}
                    updateField={updateField(updateFunction('boforhold'))}
                    onClick={addToStage}
                />
            );
        } else if (stage === 2) {
            return (
                <Utenlandsopphold
                    state={state.utenlandsopphold}
                    updateField={updateField(updateFunction('utenlandsopphold'))}
                    onClick={addToStage}
                />
            );
        } else if (stage === 3) {
            return (
                <Oppholdstillatelse
                    state={state.oppholdstillatelse}
                    updateField={updateField(updateFunction('oppholdstillatelse'))}
                    onClick={addToStage}
                />
            );
        } else if (stage === 4) {
            return (
                <InntektPensjonFormue
                    state={state.inntektPensjonFormue}
                    updateField={updateField(updateFunction('inntektPensjonFormue'))}
                    onClick={addToStage}
                />
            );
        } else if (stage === 5) {
            return (
                <ForNAV state={state.forNAV} updateField={updateField(updateFunction('forNAV'))} onClick={addToStage} />
            );
        } else if (stage === 6) {
            return <OppsumeringOgSend state={state} config={config} />;
        } else {
            return (
                <div>
                    <p>goofed</p>
                </div>
            );
        }
    }

    return (
        <>
            <Panel border style={{ width: '45em' }}>
                <Stegindikator
                    style={{ marginBottom: '1em' }}
                    steg={[
                        { label: 'Personopplysninger' },
                        { label: 'Boforhold' },
                        { label: 'Utenlandsopphold' },
                        { label: 'Oppholdstillatelse' },
                        { label: 'Inntekt, pensjon og formue' },
                        { label: 'For NAV' },
                        { label: 'Send søknad' }
                    ]}
                    onChange={index => setStage(index)}
                    aktivtSteg={stage}
                />
                <div className="søknadBody">
                    <SkjemaGruppe>{ShowActiveComponent()}</SkjemaGruppe>
                </div>
            </Panel>
        </>
    );
}

export default Soknad;
