import React, {useState} from 'react';

import Stegindikator from 'nav-frontend-stegindikator';
import { Panel } from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import Personopplysninger from "./soknadComponents/Personopplysninger";
import Boforhold from "./soknadComponents/Boforhold";
import Utenlandsopphold from "./soknadComponents/Utenlandsopphold"
import Oppholdstillatelse from "./soknadComponents/Oppholdstillatelse";
import { useHistory } from "react-router-dom";


function Soknad(){
	const history = useHistory();

	const [state, setState] = useState({
		borSammenMed: [],
		delerBoligMed: [{navn:'', fødselsnummer:''}],
		utenlandsoppholdArray: [{utreisedato: '', innreisedato: ''}],
		PlanlagtUtenlandsoppholdArray: [{planlagtUtreisedato: '', planlagtInnreisedato: ''}],
		pensjonsOrdning: [{ordning: '', beløp: ''}]

	})
	const [stage, setStage] = useState({stage: 0, hovedKnappTekst: "Neste"})

	const updateFunction = name => value => updateFieldInState(name, value)

	const updateFieldInState = (field, newState) => {
		setState(state => ({
			...state,
			[field]: newState
		}))
	}

	function ShowActiveComponent(){
		if(stage.stage === 0){
			return <Personopplysninger state={state}
									   updateFunction={updateFunction}
									   updateFieldInState={updateFieldInState}
			/>
		}else if(stage.stage === 1){
			return <Boforhold state={state}
							  setState={setState}
							  updateFieldInState={updateFieldInState}
			/>
		}else if(stage.stage === 2){
			return <Utenlandsopphold state={state}
									 updateFieldInState={updateFieldInState}
			/>
		}else if(stage.stage === 3){
			return <Oppholdstillatelse state={state}
									   updateFunction={updateFunction}
									   updateFieldInState={updateFieldInState}
			/>
		}else{
			return (<div>
				<p>goofed</p>
			</div>)
		}


	}

	function addInputFields(field){
		if(field === state.pensjonsOrdning) {
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
					onChange={(index) => setStage(stage => ({
						...stage,
							stage: index
					}))}
					visLabel
					aktivtSteg={stage.stage}
				/>
				<div>
					<SkjemaGruppe>
						{
							ShowActiveComponent()
						}
					</SkjemaGruppe>
				</div>
				<Hovedknapp onClick={lol}>{getButtonText()}</Hovedknapp>
            </Panel>
		</>
	)

	function getButtonText(){
		if(stage.stage <= 5){
			return "Neste"
		}else{
			return "send søknad"
		}
	}

	function addToStage(){
		setStage(stage => ({
			...stage,
			stage: stage.stage + 1
		}))
	}
	function sendSøknad(){
		console.log("Sender søknad")
		history.push("/saker")
	}

	function lol() {
		if(stage.stage <= 5){
			addToStage()
		}else{
			sendSøknad()
		}
	}
}

export default Soknad;
