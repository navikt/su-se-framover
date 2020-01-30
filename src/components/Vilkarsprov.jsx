import React, { useEffect } from 'react';
import Tekstomrade from 'nav-frontend-tekstomrade';
import {Checkbox, Textarea } from 'nav-frontend-skjema';
import { Innholdstittel, Undertittel } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import Knapp from 'nav-frontend-knapper';
import "./vilkorsprov.less";
import { useLocation, useHistory} from "react-router-dom";

const initialState = {
	uførevilkår: {checked: false, begrunnelse: ''},
	flyktning: {checked: false, begrunnelse: ''},
	boTidOgOpphold: {checked: false, begrunnelse: ''},
	oppholdstillatelse: {checked: false, begrunnelse: ''},
	personligOppmøte: {checked: false, begrunnelse: ''},
	sivilstatus: {checked: false, begrunnelse: ''},
	formue: {checked: false, begrunnelse: ''}
}

function Vilkarsprov({state = initialState, setState}) {
	const history = useHistory();
	useEffect(() => {
		setState(initialState)
	}, [])

	const updateField = (stateToChange, value) => {
		const fieldData = typeof value === 'boolean'
			? { checked: value }
			: { begrunnelse: value }
		setState(state => ({
			...state,
			[stateToChange]: {...state[stateToChange], ...fieldData}
		}))
	}

	const handleSubmit = event => {
		event.preventDefault()
		console.log("submitting")
		console.log(state)
	}

	return (
		<div className="vilkårsprøving">
			<Innholdstittel>Vilkårsprøving</Innholdstittel>
			<form onSubmit={handleSubmit}>
				<Panel border>
					<div>
						<Section checkboxLabel={"§12-4 - §12-8 Uførhet"}
								 sectionText={"For å kunne motta Supplerende stønad for uføre, må brukeren oppfylle vilkårene " +
								 				"§12-4 til §12-8 i folketrygdloven"}
								 stateToChange={"uførevilkår"}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.uførevilkår.begrunnelse}
								 onChange={updateField}
						/>
						<Section checkboxLabel={"§28 Flyktning"}
								 sectionText={"For å kunne motta Supplerende stønad for uføre må brukeren ha status som flyktning." +
								 				" Bla bla bla henhold til Utlendingsloven §28 blah blah"}
								 stateToChange={"flyktning"}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.flyktning.begrunnelse}
								 onChange={updateField}
						/>
						<Section checkboxLabel={"§x-y Botid og opphold"}
								 sectionText={"For å kunne motta Supplerende stønad for uføre må brukeren være bosatt og oppholde" +
								 				" seg i Norge. Bla bla maksimal lengde på utlandsopphold " +
								 				"90 dager, bla bla mister retten til  motta bla bla"}
								 stateToChange={"boTidOgOpphold"}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.boTidOgOpphold.begrunnelse}
								 onChange={updateField}
						/>
						<Section checkboxLabel={"§x-y Personlig oppmøte"}
								 sectionText={"For å kunne motta Supplerende stønad for uføre må brukeren ha møtt opp personlig"}
								 stateToChange={"personligOppmøte"}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.personligOppmøte.begrunnelse}
								 onChange={updateField}
						/>
						<Section checkboxLabel={"§x-y Oppholdstillatelse"}
								 sectionText={"Brukeren må ha gyldig oppholdstillatelse i riket. blah blah"}
								 stateToChange={"oppholdstillatelse"}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.oppholdstillatelse.begrunnelse}
								 onChange={updateField}
						/>
						<Section checkboxLabel={"§x-y Sivilstatus"}
								 sectionText={"Søker er enslig."}
								 stateToChange={"sivilstatus"}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.sivilstatus.begrunnelse}
								 onChange={updateField}
						/>
						<Section checkboxLabel={"§x-y Formue"}
								 sectionText={"Brukeren må ha formue under 0,5G. Bla bla bla depositumskonto bla bla bla hytte og sånt"}
								 stateToChange={"formue"}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.formue.begrunnelse}
								 onChange={updateField}
						/>
					</div>
				</Panel>
				<div>
					<Knapp htmlType="submit">Lagre</Knapp>
					<Knapp onClick={() => history.push("/beregning")}>Neste</Knapp>
				</div>
			</form>
		</div>
	)
}

const Section = ({
	checkboxLabel,
	stateToChange,
	sectionText,
	textAreaLabel,
	textAreaValue,
	onChange
}) => {
	return (
		<div className="section">
			<Checkbox
				label={<Undertittel>{checkboxLabel}</Undertittel>}
				onChange={e => onChange(stateToChange, e.target.checked)}
			/>
			<Tekstomrade>{sectionText}</Tekstomrade>
			<Textarea
				label={textAreaLabel}
				value={textAreaValue}
				onChange={e => onChange(stateToChange, e.target.value)}
			/>
		</div>
	)
}

export default Vilkarsprov;