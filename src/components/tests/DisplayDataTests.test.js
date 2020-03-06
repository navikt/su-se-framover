import React from 'react';
import { create } from 'react-test-renderer';
import DisplayDataFromApplic from '../DisplayDataFromApplic.jsx';
import Oppholdstillatelse from '../../søknad/steg/Oppholdstillatelse';

const correctState = {
    forNAV: {
        målform: 'Bokmål',
        erPassSjekket: true,
        søkerMøttPersonlig: true,
        harFullmektigMøtt: false,
        forNAVmerknader: 'Alt er fint'
    },
    boforhold: {
        borSammenMed: ['esp', 'over18'],
        delerBolig: true,
        delerBoligMed: [
            { navn: 'Pluto', fødselsnummer: '12345678901' },
            { navn: 'Jupiter', fødselsnummer: '10987654321' }
        ]
    },
    utenlandsopphold: {
        utenlandsopphold: true,
        registrertePerioder: [{ utreisedato: '2020-02-01', innreisedato: '2020-02-02' }],
        planlagtUtenlandsopphold: true,
        planlagtePerioder: [{ utreisedato: '2020-02-04', innreisedato: '2020-02-06' }]
    },
    oppholdstillatelse: { harVarigOpphold: false, søktOmForlengelse: true, utløpsDato: '2020-02-21' },
    personopplysninger: {
        fnr: '12345678901',
        fornavn: 'Planet',
        poststed: 'Melk',
        bokommune: 'Veien',
        etternavn: 'Planetetus',
        flyktning: true,
        bruksenhet: 'H105',
        mellomnavn: 'Planetus',
        postnummer: '0985',
        bofastnorge: true,
        gateadresse: 'Melkeveien 5',
        telefonnummer: '12345678',
        statsborgerskap: 'Solen, Uranus'
    },
    inntektPensjonFormue: {
        sumInntektOgPensjon: 750,
        formueBeløp: '100',
        harPensjon: true,
        harSosialStønad: false,
        framsattKravAnnenYtelse: true,
        pensjonsOrdning: [{ beløp: '250', ordning: 'PensjonsOrdningen' }],
        harFinansFormue: false,
        annenFormueEiendom: [{ typeFormue: 'Hytte', skattetakst: '50' }],
        harFormueEiendom: true,
        harAnnenFormue: true,
        harInntekt: true,
        harDepositumskonto: false,
        framsattKravAnnenYtelseBegrunnelse: 'penjon',
        inntektBeløp: '500'
    }
};

const stateWithError = {
    forNAV: {
        målform: 'Nynorsk',
        erPassSjekket: true,
        søkerMøttPersonlig: true,
        harFullmektigMøtt: false,
        forNAVmerknader: 'Alt er fint'
    },
    boforhold: {
        borSammenMed: ['esp', 'over18'],
        delerBolig: true,
        delerBoligMed: [
            { navn: 'Pluto', fødselsnummer: '12345678901' },
            { navn: 'Jupiter', fødselsnummer: '10987654321' }
        ]
    },
    utenlandsopphold: {
        utenlandsopphold: true,
        registrertePerioder: [{ utreisedato: '2020-02-01', innreisedato: '2020-02-02' }],
        planlagtUtenlandsopphold: true,
        planlagtePerioder: [{ utreisedato: '2020-02-04', innreisedato: '2020-02-06' }]
    },
    oppholdstillatelse: { harVarigOpphold: false, søktOmForlengelse: true, utløpsDato: '2020-02-21' },
    personopplysninger: {
        fnr: '12345678901',
        fornavn: 'Planet',
        poststed: 'Melk',
        bokommune: 'Veien',
        etternavn: 'Planetetus',
        flyktning: true,
        bruksenhet: 'H105',
        mellomnavn: 'Planetus',
        postnummer: '0985',
        bofastnorge: true,
        gateadresse: 'Melkeveien 5',
        telefonnummer: '12345678',
        statsborgerskap: 'Solen, Uranus'
    },
    inntektPensjonFormue: {
        sumInntektOgPensjon: 750,
        formueBeløp: '100',
        harPensjon: true,
        harSosialStønad: false,
        framsattKravAnnenYtelse: true,
        pensjonsOrdning: [{ beløp: '250', ordning: 'PensjonsOrdningen' }],
        harFinansFormue: false,
        annenFormueEiendom: [{ typeFormue: 'Hytte', skattetakst: '50' }],
        harFormueEiendom: true,
        harAnnenFormue: true,
        harInntekt: true,
        harDepositumskonto: false,
        framsattKravAnnenYtelseBegrunnelse: 'penjon',
        inntektBeløp: '500'
    }
};

describe('Tests related to displaying data from a filled application', () => {
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

    test('Tests that two DisplayDataFromApplic components with a difference in målform are not equal', () => {
        const component = create(<DisplayDataFromApplic state={correctState} />);
        const component2 = create(<DisplayDataFromApplic state={stateWithError} />);

        expect(component.toJSON()).not.toEqual(component2.toJSON());
    });

    test('tests that we use primitive booleans', () => {
        const component = create(<Oppholdstillatelse state={correctState} />);

        expect(component.toTree().props.state.oppholdstillatelse.harVarigOpphold).toBe(false);
    });
});
