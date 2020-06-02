import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import Personopplysninger from '../../pages/søknad/steg/Personopplysninger';
import { Hovedknapp } from 'nav-frontend-knapper';

configure({ adapter: new Adapter() });

describe('Tests for the application', () => {
    //expect(wrapper.render().html()).toEqual('eqweewewqeqw')
    //console.log(wrapper.debug())

    test('displays validation errors for all mandatory fields when no/missing information is given', () => {
        const state = {};
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Personopplysninger state={state} updateField={updateField()} onClick={onclick} />);

        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();

        expect(wrapper.text().includes('Fødselsnummer må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Fornavn må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Etternavn må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Telefonnummer må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Gateadresse må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Postnummer må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Poststed må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Bokommune må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Vennligst fyll inn statsborgerskap')).toBeTruthy();
        expect(wrapper.text().includes('Vennligst velg flyktning status')).toBeTruthy();
        expect(wrapper.text().includes('Vennligst velg bo-status')).toBeTruthy();
    });

    test('error displayed when fødselsnummer is not equal to 11 digits', () => {
        const state = { fnr: '1234567890' }; //10 digits
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Personopplysninger state={state} updateField={updateField()} onClick={onclick} />);

        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();

        expect(wrapper.text().includes('Fødselsnummer må være 11 siffer. Lengde på fnr: 10')).toBeTruthy();
    });

    test('fødselsnummer with 11 digits gives no validation error', () => {
        const state = { fnr: '12345678901' };
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Personopplysninger state={state} updateField={updateField()} onClick={onclick} />);

        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();

        expect(wrapper.text().includes('Fødselsnummer må være 11 siffer.')).toBeFalsy();
    });

    test('postnummer has to be 4 digits', () => {
        const state = { postnummer: '12345' };
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Personopplysninger state={state} updateField={updateField()} onClick={onclick} />);

        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();

        expect(wrapper.text().includes('Postnummer må være 4 siffer. Lengde på nummer: 5')).toBeTruthy();
    });
});
