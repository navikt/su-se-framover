import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import React from 'react';

const DisplayDataFromApplic = ({ state }) => {
    console.log(state);

    //-----------Personopplysninger---------------
    const Personopplysninger = () => {
        return (
            <div style={{ marginBottom: '2em' }}>
                <Undertittel style={{ marginBottom: '1em' }}>Personopplysninger</Undertittel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Fødselsnummer: </span>
                    <span>{state.personopplysninger.fnr}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Fornavn:</span>
                    <span>{state.personopplysninger.fornavn}</span>
                    <span style={{ marginBottom: '1em' }}>Mellomnavn:</span>
                    <span>{state.personopplysninger.mellomnavn}</span>
                    <span style={{ marginBottom: '1em' }}>Etternavn:</span>
                    <span>{state.personopplysninger.etternavn}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '1em' }}>
                    <span>Telefonnummer:</span>
                    <span>{state.personopplysninger.telefonnummer}</span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Gateadresse:</span>
                    <span>{state.personopplysninger.gateadresse}</span>
                    <span>Bruksenhet:</span>
                    <span>{state.personopplysninger.bruksenhet}</span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Postnummer:</span>
                    <span>{state.personopplysninger.postnummer}</span>
                    <span style={{ marginBottom: '1em' }}>Poststed:</span>
                    <span>{state.personopplysninger.poststed}</span>
                    <span>Bokommune:</span>
                    <span>{state.personopplysninger.bokommune}</span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span>Søkers statsborkerskap:</span>
                    <span>{state.personopplysninger.statsborgerskap}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Er søker registrert som flyktning?</span>
                    <span>{jaNeiSpørsmål(state.personopplysninger.flyktning)}</span>
                    <span>Bor søker fast i Norge?</span>
                    <span>{jaNeiSpørsmål(state.personopplysninger.bofastnorge)}</span>
                </div>
            </div>
        );
    };

    //-----------Boforhold-----------------------------------------
    //-------------------------------------------------------------
    const Boforhold = () => {
        return (
            <div style={{ marginBottom: '2em' }}>
                <Undertittel style={{ marginBottom: '1em' }}>Boforhold</Undertittel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Deler søker bolig med en annen voksen?</span>
                    <span>{jaNeiSpørsmål(state.boforhold.delerDuBolig)}</span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {state.boforhold.borSammenMed > 0 && (
                        <>
                            <span>Søker deler bolig med:</span>
                            <span>{borSammenMed()}</span>
                        </>
                    )}
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {state.boforhold.delerDuBolig === 'true' && (
                        <>
                            <span>Opplysninger:</span>
                            <span>{opplysningerOmAnnenVoksen()}</span>
                        </>
                    )}
                </div>
            </div>
        );

        function borSammenMed() {
            const array = state.boforhold.borSammenMed;
            let string = '';

            for (let i = 0; i < array.length; i++) {
                if (i === array.length - 1) {
                    array[i] === 'esp' ? (string += 'Ektefelle/Samboer/Partner') : (string += '');
                    array[i] === 'over18' ? (string += 'Barnover 18') : (string += '');
                    array[i] === 'annenPerson' ? (string += 'Andre personer over 18') : (string += '');
                } else {
                    array[i] === 'esp' ? (string += 'Ektefelle/Samboer/Partner, ') : (string += '');
                    array[i] === 'over18' ? (string += 'Barnover 18, ') : (string += '');
                    array[i] === 'annenPerson' ? (string += 'Andre personer over 18, ') : (string += '');
                }
            }
            return string;
        }

        function opplysningerOmAnnenVoksen() {
            const array = state.boforhold.delerBoligMed;

            return (
                <ol>
                    {array.map((person, index) => (
                        <li style={{ marginBottom: '1em' }} key={index}>
                            {index + 1}. Fødselsnummer: {person.fødselsnummer}, Navn: {person.navn}
                        </li>
                    ))}
                </ol>
            );
        }
    };

    //-----------Utenlandsopphold----------------------------------
    //-------------------------------------------------------------
    const Utenlandsopphold = () => {
        return (
            <div style={{ marginBottom: '2em' }}>
                <Undertittel style={{ marginBottom: '1em' }}>Utenlandsopphold</Undertittel>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {state.utenlandsopphold.utenlandsopphold === 'true' && (
                        <>
                            <label>Utenlandsopphold:</label>
                            <label> {utenlandsopphold()}</label>
                        </>
                    )}
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {state.utenlandsopphold.planlagtUtenlandsopphold === 'true' && (
                        <>
                            <span>Planlagt utenlandsopphold:</span>
                            <span>{planlagtUtenlandsopphold()}</span>
                        </>
                    )}
                </div>
            </div>
        );

        function utenlandsopphold() {
            const array = state.utenlandsopphold.utenlandsoppholdArray;

            return (
                <ol>
                    {array.map((utenlandsoppholdRow, index) => (
                        <li style={{ marginBottom: '1em' }} key={index}>
                            {reverseString(utenlandsoppholdRow.utreisedato)}&nbsp;- &nbsp;
                            {reverseString(utenlandsoppholdRow.innreisedato)}
                        </li>
                    ))}
                </ol>
            );
        }

        function planlagtUtenlandsopphold() {
            const array = state.utenlandsopphold.planlagtUtenlandsoppholdArray;

            return (
                <ol>
                    {array.map((utenlandsoppholdRow, index) => (
                        <li style={{ marginBottom: '1em' }} key={index}>
                            {reverseString(utenlandsoppholdRow.utreisedato)}&nbsp;- &nbsp;
                            {reverseString(utenlandsoppholdRow.innreisedato)}
                        </li>
                    ))}
                </ol>
            );
        }
    };

    //-----------Oppholdstillatelse--------------------------------
    //-------------------------------------------------------------
    const Oppholdstillatelse = () => {
        return (
            <div style={{ marginBottom: '2em' }}>
                <Undertittel style={{ marginBottom: '1em' }}>Opplysninger om oppholdstillatelse</Undertittel>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span>Har søker varig oppholdstillatelse: </span>
                    <span>{jaNeiSpørsmål(state.oppholdstillatelse.varigopphold)}</span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {state.oppholdstillatelse.varigopphold === 'false' && (
                        <>
                            <span>Utløpsdato: </span>
                            <span>{reverseString(state.oppholdstillatelse.oppholdstillatelseUtløpsdato)}</span>
                        </>
                    )}
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span>Har søker søkt om forlengelse?</span>
                    <span>{jaNeiSpørsmål(state.oppholdstillatelse.soektforlengelse)}</span>
                </div>
            </div>
        );
    };
    //-------Inntekt, Pensjon og formue----------------------------
    //-------------------------------------------------------------
    const InntektPensjonFormue = () => {
        return (
            <div style={{ marginBottom: '2em' }}>
                <Undertittel style={{ marginBottom: '1em' }}>Inntekt, pensjon, og formue</Undertittel>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>
                        Har søker fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort?
                    </span>
                    <span>{søkerSøktOmAnnenYtelse()}</span>
                    <span>Hva slags ytelse/pensjon</span>
                    <span>
                        {state.inntektPensjonFormue.kravannenytelse === 'true'
                            ? state.inntektPensjonFormue.kravannenytelseBegrunnelse
                            : ''}
                    </span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Har du arbeidsinntekt/personinntekt?</span>
                    <span>{jaNeiSpørsmål(state.inntektPensjonFormue.arbeidselleranneninntekt)}</span>
                    <span style={{ marginBottom: '1em' }}>Brutto beløp per år:</span>
                    <span>{state.inntektPensjonFormue.arbeidselleranneninntektBegrunnelse}</span>
                    <span style={{ marginBottom: '1em' }}>Har du pensjon?</span>
                    <span>{state.inntektPensjonFormue.hardupensjon === 'true' && søkerHarPensjon()}</span>
                    <span>Sum inntekt:</span>
                    <span>{state.inntektPensjonFormue.sumInntekt}</span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Har du formue/eiendom</span>
                    <span>{jaNeiSpørsmål(state.inntektPensjonFormue.harduformueeiendom)}</span>
                    <span style={{ marginBottom: '1em' }}>Har du finansformue?</span>
                    <span>{jaNeiSpørsmål(state.inntektPensjonFormue.hardufinansformue)}</span>
                    <span style={{ marginBottom: '1em' }}>
                        {state.inntektPensjonFormue.harduformueeiendom === 'true' ||
                        state.inntektPensjonFormue.hardufinansformue === 'true' ? (
                            <span>Totalbeløp formue: </span>
                        ) : (
                            ''
                        )}
                    </span>
                    <span>
                        {state.inntektPensjonFormue.harduformueeiendom === 'true' ||
                        state.inntektPensjonFormue.hardufinansformue === 'true'
                            ? state.inntektPensjonFormue.formueBeløp
                            : ''}
                    </span>
                    <span style={{ marginBottom: '1em' }}>Har du annen formue/eiendom</span>
                    <span>{jaNeiSpørsmål(state.inntektPensjonFormue.harduannenformueeiendom)}</span>
                    <span>{state.inntektPensjonFormue.harduannenformueeiendom === 'true' ? <span>-</span> : ''}</span>
                    <span>
                        {state.inntektPensjonFormue.harduannenformueeiendom === 'true'
                            ? søkerHarAnnenFormueEiendom()
                            : ''}
                    </span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span>
                        Mottar du eller ektefellen/samboer, eller har du eller han/hun i løpet av de siste tre månedene
                        mottatt sosialstønad til livsopphold?
                    </span>
                    <span>{jaNeiSpørsmål(state.inntektPensjonFormue.sosialstonad)}</span>
                </div>
            </div>
        );

        function søkerSøktOmAnnenYtelse() {
            if (state.inntektPensjonFormue.kravannenytelse === 'true') {
                return 'Ja';
            } else if (state.inntektPensjonFormue.kravannenytelse === 'false') {
                return 'Nei';
            } else {
                return '';
            }
        }

        function søkerHarPensjon() {
            const array = state.inntektPensjonFormue.pensjonsOrdning;
            return (
                <ol>
                    {array.map((pensjonsOrdningRow, index) => (
                        <li style={{ marginBottom: '1em' }} key={index}>
                            Ordning: {pensjonsOrdningRow.ordning}, Beløp: {pensjonsOrdningRow.beløp}
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
                        <li style={{ marginBottom: '1em' }} key={index}>
                            Type formue: {annenFormueEiendomRow.typeFormue}, Skattetakst:{' '}
                            {annenFormueEiendomRow.skattetakst}
                        </li>
                    ))}
                </ol>
            );
        }
    };

    //-----------For NAV-------------------------------------------
    //-------------------------------------------------------------
    const ForNAV = () => {
        return (
            <div style={{ marginBottom: '2em' }}>
                <Undertittel style={{ marginBottom: '1em' }}>For NAV</Undertittel>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span>Hvilket målform ønsker du svaret i?</span>
                    <span>{state.forNAV.maalform}</span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>Har søker møtt personlig?</span>
                    <span>{jaNeiSpørsmål(state.forNAV.personligmote)}</span>
                    <span style={{ marginBottom: '1em' }}>Har fullmektig møtt?</span>
                    <span>{jaNeiSpørsmål(state.forNAV.fullmektigmote)}</span>
                    <span style={{ marginBottom: '1em' }}>Er originalt(e) pass sjekket for stempel?</span>
                    <span>{jaNeiSpørsmål(state.forNAV.passsjekk)}</span>
                </div>
                <div style={{ marginBottom: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <span style={{ marginBottom: '1em' }}>
                        {state.forNAV.forNAVmerknader !== undefined && state.forNAV.forNAVmerknader.length > 0 ? (
                            <span>Merknader:</span>
                        ) : (
                            ''
                        )}
                    </span>
                    <span>
                        {state.forNAV.forNAVmerknader !== undefined && state.forNAV.forNAVmerknader.length > 0 ? (
                            <span>{state.forNAV.forNAVmerknader}</span>
                        ) : (
                            ''
                        )}
                    </span>
                </div>
            </div>
        );
    };

    function jaNeiSpørsmål(state) {
        if (state === 'true') {
            return 'Ja';
        } else if (state === 'false') {
            return 'Nei';
        } else {
            return '';
        }
    }

    function reverseString(str) {
        const splitString = str.split('-');
        const reverseArray = splitString.reverse();
        const joinedString = reverseArray.join('-');
        return joinedString;
    }

    return (
        <div>
            <Systemtittel style={{ marginBottom: '1em' }}>Oppsumerings side</Systemtittel>
            <Personopplysninger />
            <Boforhold />
            <Utenlandsopphold />
            <Oppholdstillatelse />
            <InntektPensjonFormue />
            <ForNAV />
        </div>
    );
};

export default DisplayDataFromApplic;
