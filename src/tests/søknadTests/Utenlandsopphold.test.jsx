import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Hovedknapp } from 'nav-frontend-knapper';
import React from 'react';
import Utenlandsopphold from '../../pages/søknad-owned/steg/Utenlandsopphold';
import { JaNeiSpørsmål } from '../../components/FormElements';

configure({ adapter: new Adapter() });

describe('Tests for the application', () => {
    //expect(wrapper.render().html()).toEqual('eqweewewqeqw')
    //console.log(wrapper.debug())

    test('should render only 2 component with an empty Utenlandsopphold state', () => {
        const state = {};
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Utenlandsopphold state={state} updateField={updateField()} onClick={onclick} />);
        expect(wrapper.exists(JaNeiSpørsmål)).toBeTruthy();
        expect(wrapper.find(JaNeiSpørsmål)).toHaveLength(2);
    });

    test('displays validation errors for if no user input given on starting form', () => {
        const state = {};
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Utenlandsopphold state={state} updateField={updateField()} onClick={onclick} />);

        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();

        expect(wrapper.text().includes('Vennligst velg utenlandsopphold')).toBeTruthy();
        expect(wrapper.text().includes('Vennligst velg planlagt utenlandsopphold')).toBeTruthy();
    });

    test('date inputs displayed when user inputs Ja', () => {
        const state = {
            utenlandsopphold: true,
            planlagtUtenlandsopphold: true,
            registrertePerioder: [{ utreisedato: '', innreisedato: '' }],
            planlagtePerioder: [{ utreisedato: '', innreisedato: '' }]
        };
        const mock = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Utenlandsopphold state={state} updateField={mock} onClick={onclick} />);
        expect(wrapper.exists('[className="nav-datovelger"]')).toBeTruthy();
    });

    test('displays validation errors empty dates', () => {
        const state = {
            utenlandsopphold: true,
            planlagtUtenlandsopphold: true,
            registrertePerioder: [{ utreisedato: '', innreisedato: '' }],
            planlagtePerioder: [{ utreisedato: '', innreisedato: '' }]
        };
        const mock = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Utenlandsopphold state={state} updateField={mock} onClick={onclick} />);

        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();

        expect(wrapper.text().includes('Utreisedato må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Innreisedato må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Planlagt utreisedato må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Planlagt innreisedato kan ikke være tom')).toBeTruthy();
    });
});
