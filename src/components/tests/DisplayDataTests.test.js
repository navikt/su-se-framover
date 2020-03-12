import React from 'react';
import { create } from 'react-test-renderer';
import DisplayDataFromApplic from '../DisplayDataFromApplic.jsx';
import Oppholdstillatelse from '../../søknad/steg/Oppholdstillatelse';
import InntektPensjonFormue from "../../søknad/steg/InntektPensjonFormue";

// prettier-ignore
const correctState = {forNAV: {målform: 'Bokmål', erPassSjekket: true, søkerMøttPersonlig: true, harFullmektigMøtt: false, merknader: 'Alt er fint'}, boforhold: {borSammenMed: ['Ektefelle/Partner/Samboer', 'Barn over 18'], delerBolig: true, delerBoligMed: [{ navn: 'Pluto', fødselsnummer: '12345678901' }, { navn: 'Jupiter', fødselsnummer: '10987654321' }]}, utenlandsopphold: {utenlandsopphold: true, registrertePerioder: [{ utreisedato: '2020-02-01', innreisedato: '2020-02-02' }], planlagtUtenlandsopphold: true, planlagtePerioder: [{ utreisedato: '2020-02-04', innreisedato: '2020-02-06' }]}, oppholdstillatelse: { harVarigOpphold: false, søktOmForlengelse: true, utløpsDato: '2020-02-21' }, personopplysninger: {fnr: '12345678901', fornavn: 'Planet', poststed: 'Melk', bokommune: 'Veien', etternavn: 'Planetetus', flyktning: true, bruksenhet: 'H105', mellomnavn: 'Planetus', postnummer: '0985', borFastINorge: true, gateadresse: 'Melkeveien 5', telefonnummer: '12345678', statsborgerskap: 'Solen, Uranus'}, inntektPensjonFormue: {sumInntektOgPensjon: 750, formueBeløp: 100, harPensjon: true, harSosialStønad: false, framsattKravAnnenYtelse: true, pensjonsOrdning: [{ beløp: 250, ordning: 'PensjonsOrdningen' }], harFinansFormue: false, annenFormueEiendom: [{ typeFormue: 'Hytte', skattetakst: 50 }], harFormueEiendom: true, harAnnenFormue: true, harInntekt: true, harDepositumskonto: false, framsattKravAnnenYtelseBegrunnelse: 'penjon', inntektBeløp: 500}};

// prettier-ignore
const stateWithError = {forNAV: {målform: 'Nynorsk', erPassSjekket: true, søkerMøttPersonlig: true, harFullmektigMøtt: false, merknader: 'Alt er fint'}, boforhold: {borSammenMed: ['Ektefelle/Partner/Samboer', 'Barn over 18'], delerBolig: true, delerBoligMed: [{ navn: 'Pluto', fødselsnummer: '12345678901' }, { navn: 'Jupiter', fødselsnummer: '10987654321' }]}, utenlandsopphold: {utenlandsopphold: true, registrertePerioder: [{ utreisedato: '2020-02-01', innreisedato: '2020-02-02' }], planlagtUtenlandsopphold: true, planlagtePerioder: [{ utreisedato: '2020-02-04', innreisedato: '2020-02-06' }]}, oppholdstillatelse: { harVarigOpphold: false, søktOmForlengelse: true, utløpsDato: '2020-02-21' }, personopplysninger: {fnr: '12345678901', fornavn: 'Planet', poststed: 'Melk', bokommune: 'Veien', etternavn: 'Planetetus', flyktning: true, bruksenhet: 'H105', mellomnavn: 'Planetus', postnummer: '0985', borFastINorge: true, gateadresse: 'Melkeveien 5', telefonnummer: '12345678', statsborgerskap: 'Solen, Uranus'}, inntektPensjonFormue: {sumInntektOgPensjon: 750, formueBeløp: 100, harPensjon: true, harSosialStønad: false, framsattKravAnnenYtelse: true, pensjonsOrdning: [{ beløp: 250, ordning: 'PensjonsOrdningen' }], harFinansFormue: false, annenFormueEiendom: [{ typeFormue: 'Hytte', skattetakst: 50 }], harFormueEiendom: true, harAnnenFormue: true, harInntekt: true, harDepositumskonto: false, framsattKravAnnenYtelseBegrunnelse: 'penjon', inntektBeløp: 500}};

expect.extend({
    isNumber(received, number){
        console.log("number", number)
        const bool = typeof number === "number";
        console.log("bool", bool)
        if(bool){
            return {
                message: () => 'The input given is a number',
                pass: true
            }
        }else{
            return {
                message: () => 'The input given is not a number',
                pass: false
            }
        }
    }
};

describe('Tests related to displaying data from a filled application', () => {

    test('Should match its snapshot', () => {
        const component = create(<DisplayDataFromApplic state={correctState} />);
        expect(component.toJSON()).toMatchSnapshot();
    });

    //Tall som kan begynne med null, vil fortsatt bli behandlet som strings
    test('JSON values that are numbers, should not be strings ', () => {
        const inntektPensjonFormue = create(<InntektPensjonFormue state={correctState} />);
        console.log(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue)

        if(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harPensjon
        || inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harInntekt){
            expect().isNumber(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.sumInntektOgPensjon)
        }

        if(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harPensjon){
            inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.pensjonsOrdning.forEach(
                obj => expect().isNumber(obj.beløp)
            )
        }

        if(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harInntekt){
            expect().isNumber(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.inntektBeløp)
        }

        if(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harFormueEiendom
            || inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harFinansFormue){
            expect().isNumber(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.formueBeløp)
        }

        if(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harAnnenFormue){
            inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.annenFormueEiendom.forEach(
                obj => expect().isNumber(obj.skattetakst)
            )
        }

        if(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.harDepositumskonto){
            expect().isNumber(inntektPensjonFormue.toTree().props.state.inntektPensjonFormue.depositumBeløp)
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
