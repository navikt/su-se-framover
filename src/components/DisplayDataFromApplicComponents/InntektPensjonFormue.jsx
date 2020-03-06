import { Undertittel } from 'nav-frontend-typografi';
import { jaNeiSpørsmål } from './HelperFunctions';
import React from 'react';

const InntektPensjonFormue = ({ state }) => {
    return (
        <div style={headerSpacing}>
            <Undertittel style={elementSpacing}>Inntekt, pensjon, og formue</Undertittel>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>
                    Har søker fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort?
                </span>
                <span>{jaNeiSpørsmål(state.inntektPensjonFormue.kravannenytelse)}</span>
                <span>Hva slags ytelse/pensjon</span>
                <span>
                    {state.inntektPensjonFormue.kravannenytelse
                        ? state.inntektPensjonFormue.kravannenytelseBegrunnelse
                        : ''}
                </span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Har du arbeidsinntekt/personinntekt?</span>
                <span>{jaNeiSpørsmål(state.inntektPensjonFormue.arbeidselleranneninntekt)}</span>
                <span style={elementSpacing}>Brutto beløp per år:</span>
                <span>{state.inntektPensjonFormue.arbeidselleranneninntektBegrunnelse}</span>
                <span style={elementSpacing}>Har du pensjon?</span>
                <span>{state.inntektPensjonFormue.hardupensjon && søkerHarPensjon()}</span>
                <span>Sum inntekt:</span>
                <span>{state.inntektPensjonFormue.sumInntekt}</span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Har du formue/eiendom</span>
                <span>{jaNeiSpørsmål(state.inntektPensjonFormue.harduformueeiendom)}</span>
                <span style={elementSpacing}>Har du finansformue?</span>
                <span>{jaNeiSpørsmål(state.inntektPensjonFormue.hardufinansformue)}</span>
                <span style={elementSpacing}>
                    {state.inntektPensjonFormue.harduformueeiendom || state.inntektPensjonFormue.hardufinansformue ? (
                        <span>Totalbeløp formue:</span>
                    ) : (
                        ''
                    )}
                </span>
                <span>
                    {state.inntektPensjonFormue.harduformueeiendom || state.inntektPensjonFormue.hardufinansformue
                        ? state.inntektPensjonFormue.formueBeløp
                        : ''}
                </span>
                <span style={elementSpacing}>Har du annen formue/eiendom</span>
                <span>{jaNeiSpørsmål(state.inntektPensjonFormue.harduannenformueeiendom)}</span>
                <span>{state.inntektPensjonFormue.harduannenformueeiendom ? <span>-</span> : ''}</span>
                <span>{state.inntektPensjonFormue.harduannenformueeiendom ? søkerHarAnnenFormueEiendom() : ''}</span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Har søker Depositumskonto?</span>
                <span>{jaNeiSpørsmål(state.inntektPensjonFormue.søkerHarDepositumskonto)}</span>
                <span>{state.inntektPensjonFormue.søkerHarDepositumskonto && <span>depositum-beløp:</span>}</span>
                <span>
                    {state.inntektPensjonFormue.søkerHarDepositumskonto && (
                        <span>{state.inntektPensjonFormue.depositumBeløp}</span>
                    )}
                </span>
            </div>

            <div style={sectionGridLayout}>
                <span>
                    Mottar du eller ektefellen/samboer, eller har du eller han/hun i løpet av de siste tre månedene
                    mottatt sosialstønad til livsopphold?
                </span>
                <span>{jaNeiSpørsmål(state.inntektPensjonFormue.sosialstonad)}</span>
            </div>
        </div>
    );

    function søkerHarPensjon() {
        const array = state.inntektPensjonFormue.pensjonsOrdning;
        return (
            <ol>
                {array.map((pensjonsOrdningRow, index) => (
                    <li style={elementSpacing} key={index}>
                        {pensjonsOrdningRow.ordning}, {pensjonsOrdningRow.beløp}
                    </li>
                ))}
            </ol>
        );
    }

    function søkerHarAnnenFormueEiendom() {
        const array = state.inntektPensjonFormue.annenFormueEiendom;
        return (
            <ol>
                {array.map((annenFormueEiendomRow, index) => (
                    <li style={elementSpacing} key={index}>
                        {annenFormueEiendomRow.typeFormue},{annenFormueEiendomRow.skattetakst}
                    </li>
                ))}
            </ol>
        );
    }
};

const sectionGridLayout = {
    marginBottom: '1em',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
};

const headerSpacing = {
    marginBottom: '2em'
};

const elementSpacing = {
    marginBottom: '1em'
};

export default InntektPensjonFormue;
