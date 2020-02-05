import React, {useState} from 'react';

import Stegindikator from 'nav-frontend-stegindikator';
import { Panel } from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import Personopplysninger from "./soknadComponents/Personopplysninger";
import Boforhold from "./soknadComponents/Boforhold";
import Utenlandsopphold from "./soknadComponents/Utenlandsopphold"
import Oppholdstillatelse from "./soknadComponents/Oppholdstillatelse";
import InntektPensjonFormue from "./soknadComponents/InntektPensjonFormue";
import ForNAV from "./soknadComponents/ForNAV";
import OppsumeringOgSend from "./soknadComponents/OppsumeringOgSend";

function Soknad({config}){
	const [stage, setStage] = useState(0)

	const [state, setState] = useState({
		borSammenMed: [],
		delerBoligMed: [{navn:'', fødselsnummer:''}],
		utenlandsoppholdArray: [{utreisedato: '', innreisedato: ''}],
		PlanlagtUtenlandsoppholdArray: [{planlagtUtreisedato: '', planlagtInnreisedato: ''}],
		pensjonsOrdning: [{ordning: '', beløp: ''}]

	})

	const updateFunction = name => value => updateFieldInState(name, value)

	const updateFieldInState = (field, newState) => {
		setState(state => ({
			...state,
			[field]: newState
		}))
	}

	function addToStage(){
		setStage(stage => stage+1)
	}

	function ShowActiveComponent(){
		if(stage === 0){
			return <Personopplysninger state={state}
									   updateFunction={updateFunction}
									   updateFieldInState={updateFieldInState}
									   onClick={addToStage}
			/>
		}else if(stage === 1){
			return <Boforhold state={state}
							  setState={setState}
							  updateFieldInState={updateFieldInState}
							  onClick={addToStage}
			/>
		}else if(stage === 2){
			return <Utenlandsopphold state={state}
									 updateFieldInState={updateFieldInState}
									 onClick={addToStage}
			/>
		}else if(stage === 3){
			return <Oppholdstillatelse state={state}
									   updateFunction={updateFunction}
									   updateFieldInState={updateFieldInState}
									   onClick={addToStage}
			/>
		}else if(stage === 4){
			return <InntektPensjonFormue state={state}
										 setState={setState}
										 updateFunction={updateFunction}
										 updateFieldInState={updateFieldInState}
										 onClick={addToStage}
			/>
		}else if(stage === 5){
			return <ForNAV state={state}
						   setState={setState}
						   updateFunction={updateFunction}
						   updateFieldInState={updateFieldInState}
						   onClick={addToStage}

			/>
		}else if(stage === 6){
			return <OppsumeringOgSend state={state}
									  config={config}
			/>
		}else{
			return (<div>
				<p>goofed</p>
			</div>)
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
					aktivtSteg={stage}
				/>
				<div>
					<SkjemaGruppe>
						{
							ShowActiveComponent()
						}
					</SkjemaGruppe>
				</div>

            </Panel>
		</>
	)

}

export default Soknad;
