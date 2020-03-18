import {fireEvent, render} from "@testing-library/react";
import React from "react";
import {JaNeiSpørsmål} from "../../components/FormElements";
import {displayErrorMessageOnInputField} from "../../HelperFunctions";

describe('Tests related to functionally for the application', () => {
    test('Tests that a clicked JaNeiSpørsmål component is checked and gives us Boolean value as result', () => {
        const fieldName = "radioTestGruppe"
        const legend = "Tekst for radio gruppe"
        const onChange = () => {}
        const state = {}
        const component = render(<JaNeiSpørsmål fieldName={fieldName} legend={legend} onChange={onChange} state={state}/>)

        fireEvent(component.getAllByRole("radio")[0], new MouseEvent('click'))
        expect(component.getAllByRole("radio")[0].checked).toBe(true)
        expect(component.getAllByRole("radio")[1].checked).toBe(false)

        fireEvent(component.getAllByRole("radio")[1], new MouseEvent('click'))
        expect(component.getAllByRole("radio")[0].checked).toBe(false)
        expect(component.getAllByRole("radio")[1].checked).toBe(true)
    });

    test('returns the error value for a field when it has corresponding id', () => {
        const feilmelding = [{skjemaelementId: "1", feilmelding: "her er det en feil"}];
        const fun = displayErrorMessageOnInputField(feilmelding, "1");
        expect(fun).toBe("her er det en feil");
    })

    test('does not return an error when array constains id for another field', () => {
        const feilmelding = [{skjemaelementId: "2", feilmelding: "her er det en feil"}];
        const fun = displayErrorMessageOnInputField(feilmelding, "1");
        expect(fun).toBeFalsy;
    })

    test('does not return an error when there is none', () => {
        const feilmelding = [];
        const fun = displayErrorMessageOnInputField(feilmelding, "1");
        expect(fun).toBeFalsy;
    })




});
