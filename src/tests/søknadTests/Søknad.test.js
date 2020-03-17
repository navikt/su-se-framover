import {fireEvent, render} from "@testing-library/react";
import React from "react";
import {JaNeiSpørsmål} from "../../components/FormElements";

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
});
