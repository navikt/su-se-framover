import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Hovedknapp } from 'nav-frontend-knapper';
import React from 'react';
import ForNAV from '../../pages/søknad/steg/ForNAV';

configure({ adapter: new Adapter() });

describe('Tests for the application', () => {
    //expect(wrapper.render().html()).toEqual('eqweewewqeqw')
    //console.log(wrapper.debug())

    test('validation errors with no user input', () => {
        const state = {};
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<ForNAV state={state} updateField={updateField()} onClick={onclick} />);

        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();

        expect(wrapper.text().includes('Vennligst velg målform')).toBeTruthy();
        expect(wrapper.text().includes('Vennligst velg om søker har møtt personlig')).toBeTruthy();
        expect(wrapper.text().includes('Vennligst velg om fullmektig har møtt')).toBeTruthy();
        expect(wrapper.text().includes('Vennligst velg om pass er sjekket')).toBeTruthy();
    });
});
