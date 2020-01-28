import React, {useState} from 'react';
import Tekstomrade from 'nav-frontend-tekstomrade';
import {Checkbox, Textarea } from 'nav-frontend-skjema';
import { Innholdstittel, Undertittel } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import Knapp from 'nav-frontend-knapper';
import "./vilkorsprov.less";

function Vilkarsprov() {

	const [state, setState] = useState({
		uførevilkår: {checked: false, begrunnelse: ''},
		flyktning: {checked: false, begrunnelse: ''},
		boTidOgOpphold: {checked: false, begrunnelse: ''},
		oppholdstillatelse: {checked: false, begrunnelse: ''},
		personligOppmøte: {checked: false, begrunnelse: ''},
		sivilstatus: {checked: false, begrunnelse: ''},
		formue: {checked: false, begrunnelse: ''}
	})
	
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
								 checkboxOnChange={setChecked}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.uførevilkår.begrunnelse}
								 textAreaOnChange={setTextAreaOnChange}
						/>
						<Section checkboxLabel={"§28 Flyktning"}
								 sectionText={"For å kunne motta Supplerende stønad for uføre må brukeren ha status som flyktning." +
								 				" Bla bla bla henhold til Utlendingsloven §28 blah blah"}
								 stateToChange={"flyktning"}
								 checkboxOnChange={setChecked}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.flyktning.begrunnelse}
								 textAreaOnChange={setTextAreaOnChange}
						/>
						<Section checkboxLabel={"§x-y Botid og opphold"}
								 sectionText={"For å kunne motta Supplerende stønad for uføre må brukeren være bosatt og oppholde" +
								 				" seg i Norge. Bla bla maksimal lengde på utlandsopphold " +
								 				"90 dager, bla bla mister retten til  motta bla bla"}
								 stateToChange={"boTidOgOpphold"}
								 checkboxOnChange={setChecked}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.boTidOgOpphold.begrunnelse}
								 textAreaOnChange={setTextAreaOnChange}
						/>
						<Section checkboxLabel={"§x-y Personlig oppmøte"}
								 sectionText={"For å kunne motta Supplerende stønad for uføre må brukeren ha møtt opp personlig"}
								 stateToChange={"personligOppmøte"}
								 checkboxOnChange={setChecked}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.personligOppmøte.begrunnelse}
								 textAreaOnChange={setTextAreaOnChange}
						/>
						<Section checkboxLabel={"§x-y Oppholdstillatelse"}
								 sectionText={"Brukeren må ha gyldig oppholdstillatelse i riket. blah blah"}
								 stateToChange={"oppholdstillatelse"}
								 checkboxOnChange={setChecked}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.oppholdstillatelse.begrunnelse}
								 textAreaOnChange={setTextAreaOnChange}
						/>
						<Section checkboxLabel={"§x-y Sivilstatus"}
								 sectionText={"Søker er enslig."}
								 stateToChange={"sivilstatus"}
								 checkboxOnChange={setChecked}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.sivilstatus.begrunnelse}
								 textAreaOnChange={setTextAreaOnChange}
						/>
						<Section checkboxLabel={"§x-y Formue"}
								 sectionText={"Brukeren må ha formue under 0,5G. Bla bla bla depositumskonto bla bla bla hytte og sånt"}
								 stateToChange={"formue"}
								 checkboxOnChange={setChecked}
								 textAreaLabel={"Begrunnelse"}
								 textAreaValue={state.formue.begrunnelse}
								 textAreaOnChange={setTextAreaOnChange}
						/>
					</div>
				</Panel>
				<div>
					<Knapp htmlType="submit">Lagre</Knapp>
					<Knapp>Neste</Knapp>
				</div>
			</form>
		</div>
	)

	function handleSubmit(event) {
		event.preventDefault()
		console.log("submitting")
		console.log(state)
	}

	function setChecked(stateToChange, checked) {
		setState((state) => (
			{...state, [stateToChange]: {...state[stateToChange], checked}}
		))
	}

	function setTextAreaOnChange(stateToChange, begrunnelse) {
		setState((state) => (
			{...state, [stateToChange]: {...state[stateToChange], begrunnelse}}
		))
	}
}

function Section({checkboxLabel, stateToChange, checkboxOnChange, sectionText, textAreaLabel, textAreaValue, textAreaOnChange}){
	return(
		<div className="section">
			<Checkbox label={<Undertittel>{checkboxLabel}</Undertittel>}
					  onChange={(e => checkboxOnChange(stateToChange, e.target.checked))}/>
			<div>
				<div>
					<Tekstomrade>{sectionText}</Tekstomrade>
				</div>
				<div>
					<Textarea label={textAreaLabel} value={textAreaValue} onChange={e => textAreaOnChange(stateToChange, e.target.value)}
									 />
				</div>
			</div>

		</div>
	)
}

export default Vilkarsprov;