import React from 'react';
import { CollapsiblePanel } from './collapsiblePanel/CollapsiblePanel';

function PersonInfoBar() {
    const correctState = {
        personopplysninger: {
            fnr: '12345678910',
            fornavn: 'kake',
            mellomnavn: 'kjeks',
            etternavn: 'mannen',
            telefonnummer: '12345678',
            gateadresse: 'gaten',
            postnummer: '0050',
            poststed: 'Oslo',
            bruksenhet: '50',
            bokommune: 'Oslo',
            flyktning: true,
            borFastINorge: true,
            statsborgerskap: 'NOR'
        },
        boforhold: {
            delerBolig: true,
            borSammenMed: ['Ektefelle/Partner/Samboer', 'Andre personer over 18 år'],
            delerBoligMed: [
                { fnr: '12345678910', navn: 'voksen jensen' },
                { fnr: '10987654321', navn: 'voksen hansen' }
            ]
        },
        utenlandsopphold: {
            utenlandsopphold: true,
            antallRegistrerteDager: 11,
            registrertePerioder: [{ utreisedato: '2020-03-10', innreisedato: '2020-03-10' }],
            planlagteUtenlandsopphold: true,
            antallPlanlagteDager: 10,
            planlagtePerioder: [{ utreisedato: '2020-06-01', innreisedato: '2020-06-20' }]
        },
        oppholdstillatelse: { harVarigOpphold: false, utløpsdato: '2020-03-10', søktOmForlengelse: true },
        inntektPensjonFormue: {
            framsattKravAnnenYtelse: true,
            framsattKravAnnenYtelseBegrunnelse: 'annen ytelse begrunnelse',
            harInntekt: true,
            inntektBeløp: 2500,
            harPensjon: true,
            pensjonsOrdning: [
                { ordning: 'KLP', beløp: 2000 },
                { ordning: 'SPK', beløp: 5000 }
            ],
            sumInntektOgPensjon: 7000,
            harFormueEiendom: true,
            harFinansFormue: true,
            formueBeløp: 1000,
            harAnnenFormue: true,
            annenFormue: [{ typeFormue: 'juveler', skattetakst: 2000 }]
        },
        forNav: {
            målform: 'Bokmål',
            søkerMøttPersonlig: true,
            harFullmektigMøtt: false,
            erPassSjekket: true,
            merknader: 'intet å bemerke'
        }
    };

    //  const url = '/person?ident=' + fnr;
    // const { data } = useFetch({ url });
    //eslint-disable-next-line
 //   const person = data ? data : {};
    // console.log('person', person);
    return (
        <div>
            <CollapsiblePanel personInfo={correctState} />
        </div>
    );
}

export default PersonInfoBar;
