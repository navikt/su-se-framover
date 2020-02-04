import React, {useState} from 'react';

import Stegindikator from 'nav-frontend-stegindikator';
import { Panel } from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import Personopplysninger from "./soknadComponents/Personopplysninger";
import Boforhold from "./soknadComponents/Boforhold";
import { useHistory } from "react-router-dom";


function Soknad(){
	const history = useHistory();

	const [state, setState] = useState({
		borSammenMed: [],
		delerBoligMed: [{navn:'', fødselsnummer:''}],
		utenlandsoppholdArray: [{utreisedato: '', innreisedato:''}],
		pensjonsOrdning: [{ordning: '', beløp: ''}]

	})
	const [stage, setStage] = useState(0)

	const updateFunction = name => value => updateFieldInState(name, value)

	const updateFieldInState = (field, newState) => {
		setState(state => ({
			...state,
			[field]: newState
		}))
	}

	function ShowActiveComponent(){
		if(stage === 0){
			return Personopplysninger(state, setState, updateFunction, updateFieldInState)
		}else if(stage === 1){
			return Boforhold(state, setState, updateFunction, updateFieldInState, addInputFields)
		}else{
			return (<div>
				<p>goofed</p>
			</div>)
		}
	}

	function addInputFields(field){
		if(field === state.delerBoligMed){
			const values = state.delerBoligMed
			values.push({navn:'', fødselsnummer:''})
			updateFieldInState("delerBoligMed", values)

		}else if(field === state.utenlandsoppholdArray){
			const values = state.utenlandsoppholdArray
			values.push({utreisedato:'', innreisedato:''})
			updateFieldInState("utenlandsoppholdArray", values)

		}else if(field === state.planlagtUtenlandsopphold){
			const values = state.planlagtUtenlandsopphold
			values.push({utreisedato:'', innreisedato:''})
			updateFieldInState("planlagtUtenlandsopphold", values)

		}else if(field === state.pensjonsOrdning) {
			const values = state.pensjonsOrdning
			values.push({ordning:'', beløp:''})
			updateFieldInState("pensjonsOrdning", values)
		}
	}

	return(
		<>
			<Panel border>
				<Stegindikator
					steg={[
						{"label": "Personopplysninger"},
						{"label": "Boforhold"},
						{"label": "Utenlandsopphold"},
						{"label": "Oppholdstillatelse",},
						{"label": "Inntekt, pensjon og formue"},
						{"label": "For NAV"},
						{"label": "Send søknad"}
					]}
					onChange={(index) => setStage(index)}
					visLabel
				/>
				<div>
					<SkjemaGruppe>
						{
							ShowActiveComponent()
						}
					</SkjemaGruppe>
				</div>
				<Hovedknapp onClick={lol}>Neste</Hovedknapp>
            </Panel>
		</>
	)

	function lol() {
		console.log(state)
		history.push("/saker", state)
	}
}
export default Soknad;
