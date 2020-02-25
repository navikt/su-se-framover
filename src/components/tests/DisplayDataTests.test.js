import React from 'react';
import { create } from 'react-test-renderer';
import DisplayDataFromApplic from '../DisplayDataFromApplic.jsx';

const correctState = {
    forNAV: {
        maalform: 'Bokmål',
        passsjekk: 'true',
        personligmote: 'true',
        fullmektigmote: 'false',
        forNAVmerknader: 'Alt er fint'
    },
    boforhold: {
        borSammenMed: ['esp', 'over18'],
        delerDuBolig: 'true',
        delerBoligMed: [
            { navn: 'Pluto', fødselsnummer: '12345678901' },
            { navn: 'Jupiter', fødselsnummer: '10987654321' }
        ]
    },
    utenlandsopphold: {
        utenlandsopphold: 'true',
        utenlandsoppholdArray: [{ utreisedato: '2020-02-01', innreisedato: '2020-02-02' }],
        planlagtUtenlandsopphold: 'true',
        planlagtUtenlandsoppholdArray: [{ utreisedato: '2020-02-04', innreisedato: '2020-02-06' }]
    },
    oppholdstillatelse: { varigopphold: 'false', soektforlengelse: 'true', oppholdstillatelseUtløpsdato: '2020-02-21' },
    personopplysninger: {
        fnr: '12345678901',
        fornavn: 'Planet',
        poststed: 'Melk',
        bokommune: 'Veien',
        etternavn: 'Planetetus',
        flyktning: 'true',
        bruksenhet: 'H105',
        mellomnavn: 'Planetus',
        postnummer: '0985',
        bofastnorge: 'true',
        gateadresse: 'Melkeveien 5',
        telefonnummer: '12345678',
        statsborgerskap: 'Solen, Uranus'
    },
    inntektPensjonFormue: {
        sumInntekt: 750,
        formueBeløp: '100',
        hardupensjon: 'true',
        sosialstonad: 'false',
        kravannenytelse: 'true',
        pensjonsOrdning: [{ beløp: '250', ordning: 'PensjonsOrdningen' }],
        hardufinansformue: 'false',
        annenFormueEiendom: [{ typeFormue: 'Hytte', skattetakst: '50' }],
        harduformueeiendom: 'true',
        harduannenformueeiendom: 'true',
        arbeidselleranneninntekt: 'true',
        søkerHarDepositumskonto: 'false',
        kravannenytelseBegrunnelse: 'penjon',
        arbeidselleranneninntektBegrunnelse: '500'
    }
};

const stateWithError = {
    forNAV: {
        maalform: 'Nynorsk',
        passsjekk: 'true',
        personligmote: 'true',
        fullmektigmote: 'false',
        forNAVmerknader: 'Alt er fint'
    },
    boforhold: {
        borSammenMed: ['esp', 'over18'],
        delerDuBolig: 'true',
        delerBoligMed: [
            { navn: 'Pluto', fødselsnummer: '12345678901' },
            { navn: 'Jupiter', fødselsnummer: '10987654321' }
        ]
    },
    utenlandsopphold: {
        utenlandsopphold: 'true',
        utenlandsoppholdArray: [{ utreisedato: '2020-02-01', innreisedato: '2020-02-02' }],
        planlagtUtenlandsopphold: 'true',
        planlagtUtenlandsoppholdArray: [{ utreisedato: '2020-02-04', innreisedato: '2020-02-06' }]
    },
    oppholdstillatelse: { varigopphold: 'false', soektforlengelse: 'true', oppholdstillatelseUtløpsdato: '2020-02-21' },
    personopplysninger: {
        fnr: '12345678901',
        fornavn: 'Planet',
        poststed: 'Melk',
        bokommune: 'Veien',
        etternavn: 'Planetetus',
        flyktning: 'true',
        bruksenhet: 'H105',
        mellomnavn: 'Planetus',
        postnummer: '0985',
        bofastnorge: 'true',
        gateadresse: 'Melkeveien 5',
        telefonnummer: '12345678',
        statsborgerskap: 'Solen, Uranus'
    },
    inntektPensjonFormue: {
        sumInntekt: 750,
        formueBeløp: '100',
        hardupensjon: 'true',
        sosialstonad: 'false',
        kravannenytelse: 'true',
        pensjonsOrdning: [{ beløp: '250', ordning: 'PensjonsOrdningen' }],
        hardufinansformue: 'false',
        annenFormueEiendom: [{ typeFormue: 'Hytte', skattetakst: '50' }],
        harduformueeiendom: 'true',
        harduannenformueeiendom: 'true',
        arbeidselleranneninntekt: 'true',
        søkerHarDepositumskonto: 'false',
        kravannenytelseBegrunnelse: 'penjon',
        arbeidselleranneninntektBegrunnelse: '500'
    }
};

describe('Tests related to displaying data from a filled application', () => {
    test('Component matches its snapshot', () => {
        const component = create(<DisplayDataFromApplic state={correctState} />);
        expect(component.toJSON()).toMatchSnapShot();
    });

    test('Tests that the incoming state has the correct properties', () => {
        const component = create(<DisplayDataFromApplic state={correctState} />);

        expect(component.toTree().props.state).toHaveProperty(
            'forNAV' &&
                'boforhold' &&
                'inntektPensjonFormue' &&
                'personopplysninger' &&
                'utenlandsopphold' &&
                'oppholdstillatelse'
        );
    });

    test('Tests that the component has exactly 7 children', () => {
        const component = create(<DisplayDataFromApplic state={correctState} />);

        //the component should have 7 children.
        expect(component.toJSON().children.length).toBe(7);
    });

    test('Tests that two DisplayDataFromApplic components with one difference are not equal', () => {
        const component = create(<DisplayDataFromApplic state={correctState} />);
        const component2 = create(<DisplayDataFromApplic state={stateWithError} />);

        expect(component.toJSON()).not.toEqual(component2.toJSON());
    });
});
