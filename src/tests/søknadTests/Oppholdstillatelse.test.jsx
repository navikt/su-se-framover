import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { JaNeiSpørsmål } from '../../components/FormElements';
import React from 'react';
import Oppholdstillatelse from '../../pages/søknad-owned/steg/Oppholdstillatelse';

import Hovedknapp from 'nav-frontend-knapper/lib/hovedknapp';

configure({ adapter: new Adapter() });

describe('Tests for the application', () => {
    //expect(wrapper.render().html()).toEqual('eqweewewqeqw')
    //console.log(wrapper.debug())

    test('should render only 1 component with an empty oppholdstillatelse page', () => {
        const state = {};
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Oppholdstillatelse state={state} updateField={updateField()} onClick={onclick} />);
        expect(wrapper.exists(JaNeiSpørsmål)).toBeTruthy();
        expect(wrapper.find(JaNeiSpørsmål)).toHaveLength(1);
    });

    test('renders full form when varigOpphold is false', () => {
        const state = { harVarigOpphold: false };
        const updateField = jest.fn();
        const onclick = jest.fn();

        const wrapper = mount(<Oppholdstillatelse state={state} updateField={updateField()} onClick={onclick} />);
        expect(wrapper.exists(JaNeiSpørsmål)).toBeTruthy();
        expect(wrapper.find(JaNeiSpørsmål)).toHaveLength(2);
        expect(wrapper.exists('[className="nav-datovelger"]')).toBeTruthy();
    });

    test('validation errors on extra questions', () => {
        const state = { harVarigOpphold: false };
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Oppholdstillatelse state={state} updateField={updateField()} onClick={onclick} />);
        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();
        expect(
            wrapper.text().includes('Oppholdstillatelsens utløpsdato må oppgis. Den må være på format dd.mm.åååå')
        ).toBeTruthy();
        expect(wrapper.text().includes('Vennligst velg om søker har søkt om forlengelse')).toBeTruthy();
    });
});
