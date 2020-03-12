import React, { useEffect, useState } from 'react';
import Tekstomrade from 'nav-frontend-tekstomrade';
import { Checkbox, Textarea } from 'nav-frontend-skjema';
import { Innholdstittel, Undertittel, Element } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import Knapp from 'nav-frontend-knapper';
import './vilkorsprov.less';
import { useHistory } from 'react-router-dom';
import PersonInfoBar from '../components/PersonInfoBar';
import DisplayDataFromApplic from '../components/DisplayDataFromApplic';
import useFetch from '../hooks/useFetch';
import { ToggleKnapp } from 'nav-frontend-toggle';

const initialState = {
    uførevilkår: { checked: false, begrunnelse: '' },
    flyktning: { checked: false, begrunnelse: '' },
    boTidOgOpphold: { checked: false, begrunnelse: '' },
    oppholdstillatelse: { checked: false, begrunnelse: '' },
    personligOppmøte: { checked: false, begrunnelse: '' },
    sivilstatus: { checked: false, begrunnelse: '' },
    formue: { checked: false, begrunnelse: '' }
};

function Vilkarsprov({ state = initialState, setState }) {
    const history = useHistory();
    const sak = history.location.state ? history.location.state.sak : {};
    const url = sak ? '/sak/' + sak.id + '/soknad' : null;
    const { data } = url ? useFetch({ url }) : {};
    const søknad = data ? data : '';

    const [displayState, setDisplayState] = useState({
        vissøknad: false
    });

    const updateDisplayState = () => {
        setDisplayState(displayState => ({
            ...displayState,
            vissøknad: displayState.vissøknad ? false : true
        }));
    };

    useEffect(() => {
        setState(initialState);
    }, []);

    const updateField = (stateToChange, value) => {
        const fieldData = typeof value === 'boolean' ? { checked: value } : { begrunnelse: value };
        setState(state => ({
            ...state,
            [stateToChange]: { ...state[stateToChange], ...fieldData }
        }));
    };

    const handleSubmit = event => {
        event.preventDefault();
        console.log('submitting');
        console.log(state);
    };

    const faktasjekkstyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'left'
    };

    function visSøknadFunction() {
        return displayState.vissøknad ? (
            <div style={{ width: '30%' }}>
                {søknad !== undefined &&
                    søknad[0] !== undefined &&
                    (console.log(JSON.stringify(søknad[0].json)),
                    (
                        <Panel border>
                            <DisplayDataFromApplic state={søknad[0].json} />
                        </Panel>
                    ))}
            </div>
        ) : (
            ''
        );
    }

    return (
        <div className="vilkårsprøving">
            <PersonInfoBar fnr={sak.fnr} />
            <Innholdstittel>Vilkårsprøving</Innholdstittel>
            <ToggleKnapp onClick={() => updateDisplayState()}>Vis søknad</ToggleKnapp>

            <div style={{ display: 'flex' }}>
                <form onSubmit={handleSubmit}>
                    <div style={faktasjekkstyle}>
                        <Panel border>
                            <Section
                                checkboxLabel={'§12-4 - §12-8 Uførhet'}
                                sectionText={
                                    'Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-8 i' +
                                    ' folketrygdloven er oppfylt?'
                                }
                                stateToChange={'uførevilkår'}
                                textAreaLabel={'Begrunnelse'}
                                textAreaValue={state.uførevilkår.begrunnelse}
                                onChange={updateField}
                            />
                            <Section
                                checkboxLabel={'§28 Flyktning'}
                                sectionText={'Har søker flyktningstatus etter Utl.l § 28?'}
                                stateToChange={'flyktning'}
                                textAreaLabel={'Begrunnelse'}
                                textAreaValue={state.flyktning.begrunnelse}
                                onChange={updateField}
                                customizedDisplay={
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Panel border style={{ width: '50%' }}>
                                            <Undertittel>Infomasjon fra søknad</Undertittel>
                                            {/* <Element>Fra søknad: {soknad.flyktning}</Element> */}
                                        </Panel>
                                        <Panel border style={{ width: '50%' }}>
                                            <Undertittel>Infomasjon fra UDI</Undertittel>
                                            <Element>Status som flyktning?: Ja</Element>
                                            <Element>Dato for vedtak: 01.01.2018</Element>
                                        </Panel>
                                    </div>
                                }
                            />
                            <Section
                                checkboxLabel={'§ 3 Oppholdstillatelse/Nordisk statsborger'}
                                sectionText={
                                    'Er søker nordisk statsborger? Har søker varlig oppholdstillatelse? ' +
                                    'Hvis tidsbegrenset oppholdstillatelse; skriv dato for gyldig til'
                                }
                                stateToChange={'boTidOgOpphold'}
                                textAreaLabel={'Begrunnelse'}
                                textAreaValue={state.boTidOgOpphold.begrunnelse}
                                onChange={updateField}
                            />
                            <Section
                                checkboxLabel={'§17 Personlig oppmøte'}
                                sectionText={
                                    'Har søker møtt personlig? Kopi av pass? Har bruker verge? ' +
                                    'Har fullmektig har møtt; sjekk fullmakt og legeattest.'
                                }
                                stateToChange={'personligOppmøte'}
                                textAreaLabel={'Begrunnelse'}
                                textAreaValue={state.personligOppmøte.begrunnelse}
                                onChange={updateField}
                            />
                            <Section
                                checkboxLabel={'§x-y Oppholdstillatelse'}
                                sectionText={
                                    'Stønaden opphører hvis bruker er i utlandet i mer enn 90 dager,' +
                                    'eller hvis summen av dager i utlandet blir over 90 dager i stønadsperioden'
                                }
                                stateToChange={'oppholdstillatelse'}
                                textAreaLabel={'Begrunnelse'}
                                textAreaValue={state.oppholdstillatelse.begrunnelse}
                                onChange={updateField}
                            />
                            <Section
                                checkboxLabel={'§5 Boforhold, sivilstatus'}
                                sectionText={'Søker er enslig.'}
                                stateToChange={'sivilstatus'}
                                textAreaLabel={'Begrunnelse'}
                                textAreaValue={state.sivilstatus.begrunnelse}
                                onChange={updateField}
                            />
                            <Section
                                checkboxLabel={'§8 Formue'}
                                sectionText={
                                    'Er formue over ½ G? Kan ha primærbolig, eller depositumskonto, og en bil.'
                                }
                                stateToChange={'formue'}
                                textAreaLabel={'Begrunnelse'}
                                textAreaValue={state.formue.begrunnelse}
                                onChange={updateField}
                            />
                        </Panel>
                    </div>
                    <div>
                        <Knapp htmlType="submit">Lagre</Knapp>
                        <Knapp onClick={() => history.push('/beregning')}>Neste</Knapp>
                    </div>
                </form>

                {visSøknadFunction()}
            </div>
        </div>
    );
}

const Section = ({
    checkboxLabel,
    stateToChange,
    sectionText,
    textAreaLabel,
    textAreaValue,
    onChange,
    customizedDisplay
}) => {
    return (
        <div className="section">
            <Checkbox
                label={<Undertittel>{checkboxLabel}</Undertittel>}
                onChange={e => onChange(stateToChange, e.target.checked)}
            />
            <Panel>
                <Tekstomrade>{sectionText}</Tekstomrade>
                <>{customizedDisplay}</>
                <Textarea
                    label={textAreaLabel}
                    value={textAreaValue}
                    onChange={e => onChange(stateToChange, e.target.value)}
                />
            </Panel>
        </div>
    );
};

export default Vilkarsprov;
