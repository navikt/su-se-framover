import {configure, mount} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import {Hovedknapp} from "nav-frontend-knapper";
import React from "react";
import InntektPensjonFormue from "../../pages/søknad/steg/InntektPensjonFormue";

configure({adapter: new Adapter()});

describe('Tests for the application', () => {
    //expect(wrapper.render().html()).toEqual('eqweewewqeqw')
    //console.log(wrapper.debug())

    test("validation errors with no user input", () => {
        const state = {};
        const updateField = jest.fn();
        const onclick = () => {};
        const wrapper = mount(<InntektPensjonFormue state={state} updateField={updateField()} onClick={onclick} />)

        wrapper.find(Hovedknapp).simulate('click')
        wrapper.update()

        expect(wrapper.text().includes("Vennligst velg om søker har fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort")).toBeTruthy();
        expect(wrapper.text().includes("Vennligst velg om søker har arbeids/person-inntekt")).toBeTruthy();
        expect(wrapper.text().includes("Vennligst velg om søker har pensjon")).toBeTruthy();
        expect(wrapper.text().includes("Vennligst velg om søker har formue/eiendom")).toBeTruthy();
        expect(wrapper.text().includes("Vennligst velg om søker har finansformue")).toBeTruthy();
        expect(wrapper.text().includes("Vennligst velg om søker har annen harFormueEiendom/eiendom")).toBeTruthy();
        expect(wrapper.text().includes("Vennligst velg om søker har depositumskonto")).toBeTruthy();
        expect(wrapper.text().includes("Vennligst velg om søker mottar sosial stønad")).toBeTruthy();
    })

    test("kravAnnenYtelse input displays if user hits radio 'Ja' ", () => {
        const state = {framsattKravAnnenYtelse: true};
        const updateField = jest.fn();
        const onclick = () => {};
        const wrapper = mount(<InntektPensjonFormue state={state} updateField={updateField()} onClick={onclick} />)
        expect(wrapper.text().includes("Hva slags ytelse/pensjon?")).toBeTruthy();
    })

    test("arbeids-inntekt input displays if user hits radio 'Ja' ", () => {
        const state = {harInntekt: true};
        const updateField = jest.fn();
        const onclick = () => {};
        const wrapper = mount(<InntektPensjonFormue state={state} updateField={updateField()} onClick={onclick} />)
        expect(wrapper.text().includes("Brutto beløp per år:")).toBeTruthy();
    })

    test("pensjons inntekt input displays if user hits radio 'Ja' ", () => {
        const state = {harPensjon: true, pensjonsOrdning: [{ordning: "", beløp: ""}]};
        const updateField = jest.fn();
        const onclick = () => {};
        const wrapper = mount(<InntektPensjonFormue state={state} updateField={updateField()} onClick={onclick} />)
        expect(wrapper.text().includes("Fra hvilken ordning mottar søker pensjon?")).toBeTruthy();
        expect(wrapper.text().includes("Brutto beløp per år")).toBeTruthy();
    })

    test("total beløp formue input displays if user hits radio 'Ja' on formue/eiendom", () => {
        const state = {harFormueEiendom: true};
        const updateField = jest.fn();
        const onclick = () => {};
        const wrapper = mount(<InntektPensjonFormue state={state} updateField={updateField()} onClick={onclick} />)
        expect(wrapper.text().includes("Totalbeløp formue:")).toBeTruthy();
    })

    test("total beløp formue input displays if user hits radio 'Ja' on finansformue ", () => {
        const state = {harFinansFormue: true};
        const updateField = jest.fn();
        const onclick = () => {};
        const wrapper = mount(<InntektPensjonFormue state={state} updateField={updateField()} onClick={onclick} />)
        expect(wrapper.text().includes("Totalbeløp formue:")).toBeTruthy();
    })

    test("annen formue input displays if user hits radio 'Ja' ", () => {
        const state = {harAnnenFormue: true, annenFormue: [{typeFormue: "", skattetakst: ""}]};
        const updateField = jest.fn();
        const onclick = () => {};
        const wrapper = mount(<InntektPensjonFormue state={state} updateField={updateField()} onClick={onclick} />)
        expect(wrapper.text().includes("Type formue/eiendom")).toBeTruthy();
        expect(wrapper.text().includes("Skattetakst")).toBeTruthy();
    })

    test("depositums input displays if user hits radio 'Ja' ", () => {
        const state = {harDepositumskonto: true};
        const updateField = jest.fn();
        const onclick = () => {};
        const wrapper = mount(<InntektPensjonFormue state={state} updateField={updateField()} onClick={onclick} />)
        expect(wrapper.text().includes("Beløp:")).toBeTruthy();
    })


})