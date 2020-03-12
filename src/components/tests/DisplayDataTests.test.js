import React from 'react';
import { create } from 'react-test-renderer';
import DisplayDataFromApplic from '../DisplayDataFromApplic.jsx';
import Oppholdstillatelse from '../../søknad/steg/Oppholdstillatelse';
import InntektPensjonFormue from '../../søknad/steg/InntektPensjonFormue';

// prettier-ignore
const correctState = { personopplysninger: { fnr: "12345678910",  fornavn: "kake",  mellomnavn: "kjeks", etternavn: "mannen", telefonnummer: "12345678", gateadresse: "gaten", postnummer: "0050", poststed: "Oslo", bruksenhet: "50", bokommune: "Oslo", flyktning: true, borFastINorge: true, statsborgerskap: "NOR"}, boforhold: {delerBolig: true, borSammenMed: ["Ektefelle/Partner/Samboer", "Andre personer over 18 år"], delerBoligMed: [{fnr: "12345678910", navn: "voksen jensen"}, {fnr: "10987654321", navn: "voksen hansen"}]}, utenlandsopphold: {utenlandsopphold: true, registrertePerioder: [{utreisedato: "2020-03-10", innreisedato: "2020-03-10"}], planlagteUtenlandsopphold: true, planlagtePerioder: [{utreisedato: "2020-06-01", innreisedato: "2020-06-20"}]}, oppholdstillatelse: {harVarigOpphold: false, utløpsdato: "2020-03-10", søktOmForlengelse: true}, inntektPensjonFormue: {framsattKravAnnenYtelse: true, framsattKravAnnenYtelseBegrunnelse: "annen ytelse begrunnelse", harInntekt: true, inntektBeløp: 2500, harPensjon: true, pensjonsOrdning: [{ordning: "KLP", beløp: 2000}, {ordning: "SPK", beløp: 5000}], sumInntektOgPensjon: 7000, harFormueEiendom: true, harFinansFormue: true, formueBeløp: 1000, harAnnenFormue: true, annenFormue: [{typeFormue: "juveler", skattetakst: 2000}]}, forNav: {målform: "Bokmål", søkerMøttPersonlig: true, harFullmektigMøtt: false, erPassSjekket: true, merknader: "intet å bemerke"}}
// prettier-ignore
const stateWithError = { personopplysninger: { fnr: "12345678910",  fornavn: "kae",  mellomnavn: "kjeks", etternavn: "mannen", telefonnummer: "12345678", gateadresse: "gaten", postnummer: "0050", poststed: "Oslo", bruksenhet: "50", bokommune: "Oslo", flyktning: true, borFastINorge: true, statsborgerskap: "NOR"}, boforhold: {delerBolig: true, borSammenMed: ["Ektefelle/Partner/Samboer", "Andre personer over 18 år"], delerBoligMed: [{fnr: "12345678910", navn: "voksen jensen"}, {fnr: "10987654321", navn: "voksen hansen"}]}, utenlandsopphold: {utenlandsopphold: true, registrertePerioder: [{utreisedato: "2020-03-10", innreisedato: "2020-03-10"}], planlagteUtenlandsopphold: true, planlagtePerioder: [{utreisedato: "2020-06-01", innreisedato: "2020-06-20"}]}, oppholdstillatelse: {harVarigOpphold: false, utløpsdato: "2020-03-10", søktOmForlengelse: true}, inntektPensjonFormue: {framsattKravAnnenYtelse: true, framsattKravAnnenYtelseBegrunnelse: "annen ytelse begrunnelse", harInntekt: true, inntektBeløp: 2500, harPensjon: true, pensjonsOrdning: [{ordning: "KLP", beløp: 2000}, {ordning: "SPK", beløp: 5000}], sumInntektOgPensjon: 7000, harFormueEiendom: true, harFinansFormue: true, formueBeløp: 1000, harAnnenFormue: true, annenFormue: [{typeFormue: "juveler", skattetakst: 2000}]}, forNav: {målform: "Bokmål", søkerMøttPersonlig: true, harFullmektigMøtt: false, erPassSjekket: true, merknader: "intet å bemerke"}}

expect.extend({
    isNumber(received, number) {
        console.log('number', number);
        const bool = typeof number === 'number';
        console.log('bool', bool);
        if (bool) {
            return {
                message: () => 'The input given is a number',
                pass: true
            };
        } else {
            return {
                message: () => 'The input given is not a number',
                pass: false
            };
        }
    }
});

describe('Tests related to displaying data from a filled application', () => {
    test('Should match its snapshot', () => {
        const component = create(<DisplayDataFromApplic state={correctState} />);
        expect(component).toMatchSnapshot();
    });

    //Tall som kan begynne med null, vil fortsatt bli behandlet som strings
    test('JSON values that are numbers, should not be strings ', () => {
        const inntektPensjonFormue = create(<InntektPensjonFormue state={correctState} />);
        console.log(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue);

        if (
            inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harPensjon ||
            inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harInntekt
        ) {
            expect().isNumber(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.sumInntektOgPensjon);
        }

        if (inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harPensjon) {
            inntektPensjonFormue
                .toTree()
                .props.state.inntektPensjonFormue.pensjonsOrdning.forEach(obj => expect().isNumber(obj.beløp));
        }

        if (inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harInntekt) {
            expect().isNumber(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.inntektBeløp);
        }

        if (
            inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harFormueEiendom ||
            inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harFinansFormue
        ) {
            expect().isNumber(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.formueBeløp);
        }

        if (inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harAnnenFormue) {
            inntektPensjonFormue
                .toTree()
                .props.state.inntektPensjonFormue.annenFormue.forEach(obj => expect().isNumber(obj.skattetakst));
        }

        if (inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harDepositumskonto) {
            expect().isNumber(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.depositumBeløp);
        }
    });

    test('Tests that the incoming state has the correct properties', () => {
        const component = create(<DisplayDataFromApplic state={correctState} />);

        expect(component.toTree().props.state).toHaveProperty(
            'forNav' &&
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
