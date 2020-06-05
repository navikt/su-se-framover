import React from 'react';
import Boforhold from '../../pages/søknad-owned/steg/Boforhold';
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
import { mount } from 'enzyme';
import { InputFields, JaNeiSpørsmål } from '../../components/FormElements';
import { CheckboxGruppe } from 'nav-frontend-skjema';
import Hovedknapp from 'nav-frontend-knapper/lib/hovedknapp';

configure({ adapter: new Adapter() });

describe('Tests for the application', () => {
    //expect(wrapper.render().html()).toEqual('eqweewewqeqw')
    //console.log(wrapper.debug())

    test('should render only 1 component with an empty Boforhold state', () => {
        const state = {};
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Boforhold state={state} updateField={updateField()} onClick={onclick} />);
        expect(wrapper.exists(JaNeiSpørsmål)).toBeTruthy();
        expect(wrapper.exists(CheckboxGruppe)).toBeFalsy();
        expect(wrapper.exists(InputFields)).toBeFalsy();
    });

    test('renders full form when delerBolig is true', () => {
        const state = { delerBolig: true, borSammenMed: [], delerBoligMed: [{ navn: '', fnr: '' }] };
        const updateField = jest.fn();
        const onclick = jest.fn();

        const wrapper = mount(<Boforhold state={state} updateField={updateField()} onClick={onclick} />);
        expect(wrapper.exists(JaNeiSpørsmål)).toBeTruthy();
        expect(wrapper.exists(CheckboxGruppe)).toBeTruthy();
        expect(wrapper.exists(InputFields)).toBeTruthy();
    });

    test('borSammenMed and delerboligMed should be Falsy if delerBolig is false', () => {
        const state = { delerBolig: false };
        const updateField = jest.fn();
        const onclick = jest.fn();

        const wrapper = mount(<Boforhold state={state} updateField={updateField()} onClick={onclick} />);
        expect(wrapper.exists(JaNeiSpørsmål)).toBeTruthy();
        expect(wrapper.exists(CheckboxGruppe)).toBeFalsy();
        expect(wrapper.exists(InputFields)).toBeFalsy();
    });

    test('Should trigger validation error if user doesnt answer first question', () => {
        const state = {};
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Boforhold state={state} updateField={updateField()} onClick={onclick} />);

        expect(wrapper.exists(JaNeiSpørsmål)).toBeTruthy();
        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();
        expect(wrapper.text().includes('Vennligst velg boforhold')).toBeTruthy();
    });

    test('Should trigger validation errors with no information given from non-starting display components', () => {
        const state = { delerBolig: true, borSammenMed: [], delerBoligMed: [{ navn: '', fnr: '' }] };
        const updateField = jest.fn();
        const onclick = jest.fn();
        const wrapper = mount(<Boforhold state={state} updateField={updateField()} onClick={onclick} />);

        expect(wrapper.exists(CheckboxGruppe)).toBeTruthy();
        wrapper.find(Hovedknapp).simulate('click');
        wrapper.update();
        expect(wrapper.exists('[feil="Vennligst velg hvem søker bor med"]')).toBeTruthy();
        expect(wrapper.text().includes('Fødselsnummer må fylles ut')).toBeTruthy();
        expect(wrapper.text().includes('Navn må fylles ut')).toBeTruthy();
    });
});
