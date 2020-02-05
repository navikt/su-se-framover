import React from "react";
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import {Systemtittel} from "nav-frontend-typografi";
import {InputFields} from "../FormElements";
import Lukknapp from "nav-frontend-lukknapp";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";


const InntektPensjonFormue = ({state, updateFunction, updateFieldInState, onClick}) => {

	function kravannenytelseInput(){
		if(state.kravannenytelse === "true"){
		return <InputFields labelText="Hva slags ytelse/pensjon?"
							value={state.kravannenytelseBegrunnelse || ''}
							onChange={updateFunction("kravannenytelseBegrunnelse")}

		/>
		}
	}

	function arbeidselleranneninntektInput(){
		if(state.arbeidselleranneninntekt === "true"){
			return <InputFields labelText="Brutto beløp per år:"
								value={state.arbeidselleranneninntektBegrunnelse || ''}
								onChange={updateFunction("arbeidselleranneninntektBegrunnelse")}
			/>
		}
	}

	function personHarFormue(){
		if(state.harduformueeiendom === "true" || state.hardufinansformue === "true"){
			return (
				<InputFields labelText="Beløp"
							 value={state.formueBeløp || ''}
							 onChange={updateFunction("formueBeløp")}
				/>
			)
		}
	}

	function updatePensjonsOrdning(kilde, index){
		const ordning = {...state.pensjonsOrdning[index]}
		ordning.ordning = kilde

		const tempPensjonsOrdning = [...state.pensjonsOrdning.slice(0,index), ordning, ...state.pensjonsOrdning.slice(index+1)]
		updateFieldInState("pensjonsOrdning", tempPensjonsOrdning)
	}

	function updatePensjonsOrdningsBeløp(kilde, index){
		const beløp = {...state.pensjonsOrdning[index]}
		beløp.beløp = kilde

		const tempPensjonsOrdning = [...state.pensjonsOrdning.slice(0,index), beløp, ...state.pensjonsOrdning.slice(index+1)]
		updateFieldInState("pensjonsOrdning", tempPensjonsOrdning)
	}

	function fjernValgtInputFelt(state, field, index){
		const tempField = [...state.slice(0,index), ...state.slice(index+1)]
		updateFieldInState(field, tempField)
	}

	function addInputFields(){
			const values = state.pensjonsOrdning
			values.push({ordning:'', beløp:''})
			updateFieldInState("pensjonsOrdning", values)
	}

	function søkerHarPensjon(){
		if(state.hardupensjon === "true"){
			return (
				<div>
					{
						state.pensjonsOrdning.map((item, index)=> ({...item, key:index}))
							.map((item, index) => {
									return (
										<div key={item.key} style={container}>

											<InputFields id={`${item.key}-ordning`}
														 labelText={"Fra hvilken ordning mottar du pensjon?:"}
														 value={item.ordning}
														 onChange={(value) => updatePensjonsOrdning(value,index)}
											/>

											<InputFields id={`${item.key}-beløp`}
														 labelText={"Brutto beløp per år"}
														 value={item.beløp}
														 onChange={(value) => updatePensjonsOrdningsBeløp(value,index)}
											/>



											<Lukknapp type="button" style={fjernInnputKnappStyle}
													  onClick={() => fjernValgtInputFelt(state.pensjonsOrdning, "pensjonsOrdning", index)}>Lukk</Lukknapp>
										</div>
									)
								}
							)
					}
					<Knapp onClick={() => addInputFields()}>Legg til flere pensjonsordninger</Knapp>
				</div>
			)
		}
	}

    return (
        <div>
            <Systemtittel>Pensjon og annen inntekt</Systemtittel>
			<div>
				<RadioGruppe legend="Har du fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort?">
					<Radio name="kravannenytelse"
						   label="Ja"
						   value="true"
						   checked={state.kravannenytelse === "true"}
						   onChange={(e => updateFieldInState("kravannenytelse", e.target.value))}
					/>
					<Radio name="kravannenytelse"
						   label="Nei"
						   value="false"
						   checked={state.kravannenytelse === "false"}
						   onChange={(e => updateFieldInState("kravannenytelse", e.target.value))}
					/>
				</RadioGruppe>
				{
					kravannenytelseInput()
				}
			</div>

			<div style={container}>
				<div>
					<RadioGruppe legend="Har du arbeidsinntekt/personinntekt?" >
						<Radio name="arbeidselleranneninntekt"
							   label="Ja"
							   value="true"
							   checked={state.arbeidselleranneninntekt === "true"}
							   onChange={(e => updateFieldInState("arbeidselleranneninntekt", e.target.value))}
						/>
						<Radio name="arbeidselleranneninntekt"
							   label="Nei"
							   value="false"
							   checked={state.arbeidselleranneninntekt === "false"}
							   onChange={(e => updateFieldInState("arbeidselleranneninntekt", e.target.value))}
						/>
					</RadioGruppe>
					{
						arbeidselleranneninntektInput()
					}
				</div>
				&nbsp;
				<div>
					<RadioGruppe legend="Har du pensjon?">
						<Radio name="hardupensjon"
							   label="Ja"
							   value="true"
							   checked={state.hardupensjon === "true"}
							   onChange={(e => updateFieldInState("hardupensjon", e.target.value))}
						/>
						<Radio name="hardupensjon"
							   label="Nei"
							   value="false"
							   checked={state.hardupensjon === "false"}
							   onChange={(e => updateFieldInState("hardupensjon", e.target.value))}
						/>
					</RadioGruppe>
					&nbsp;
					{
						søkerHarPensjon()
					}
				</div>
			</div>
            <InputFields labelText="Sum arbeidsinntekt/personinntekt, kapitalinntekt og pensjon"
						 value={state.sumPersoninntekt || ''}
						 onChange={updateFunction("sumPersoninntekt")}
			/>
            {/* <Systemtittel>Pensjon og annen inntekt for ektefelle/samboer</Systemtittel>
			TODO */}
			<div>
				<Systemtittel>Opplysninger om formue</Systemtittel>
				<div style={container}>
					<RadioGruppe legend="Har du formue/eiendom?">
						<Radio name="harduformueeiendom"
							   label="Ja"
							   value="true"
							   checked={state.harduformueeiendom === "true"}
							   onChange={(e => updateFieldInState("harduformueeiendom", e.target.value))}
						/>
						<Radio name="harduformueeiendom"
							   label="Nei"
							   value="false"
							   checked={state.harduformueeiendom === "false"}
							   onChange={(e => updateFieldInState("harduformueeiendom", e.target.value))}
						/>
					</RadioGruppe>
					&nbsp;
					<RadioGruppe legend="Har du finansformue?">
						<Radio name="hardufinansformue"
							   label="Ja"
							   value="true"
							   checked={state.hardufinansformue === "true"}
							   onChange={(e => updateFieldInState("hardufinansformue", e.target.value))}
						/>
						<Radio name="hardufinansformue"
							   label="Nei"
							   value="false"
							   checked={state.hardufinansformue === "false"}
							   onChange={(e => updateFieldInState("hardufinansformue", e.target.value))}
						/>
					</RadioGruppe>
				</div>
				{
					personHarFormue()
				}
				<div>
					<RadioGruppe legend="Har du annen formue/eiendom?">
						<Radio name="harduannenformueeiendom"
							   label="Ja"
							   value="true"
							   checked={state.harduannenformueeiendom === "true"}
							   onChange={(e => updateFieldInState("harduannenformueeiendom", e.target.value))}
						/>
						<Radio name="harduannenformueeiendom"
							   label="Nei"
							   value="false"
							   checked={state.harduannenformueeiendom === "false"}
							   onChange={(e => updateFieldInState("harduannenformueeiendom", e.target.value))}
						/>
					</RadioGruppe>
					<div style={container}>
						<InputFields labelText="Type formue/eiendom"
									 value={state.typeFormue || ''}
									 onChange={updateFunction("typeFormue")}
						/>
						<InputFields labelText="Samlet skattetakst"
									 value={state.samletSkattetakst || ''}
									 onChange={updateFunction("samletSkattetakst")}
						/>
					</div>
				</div>
				{/*tilsvarende spørsmål for ektefelle/samboer/partner/etc. */}
			</div>
			<div>
				<Systemtittel>Opplysninger om økonomisk sosialhjelp</Systemtittel>
				<RadioGruppe legend="Mottar du eller ektefellen/samboer eller har du eller han/hun i løpet av de siste tre månedene mottatt sosialstønad til livsopphold?">
					<Radio name="sosialstonad"
						   label="Ja"
						   value="true"
						   checked={state.sosialstonad === "true"}
						   onChange={(e => updateFieldInState("sosialstonad", e.target.value))}
					/>
					<Radio name="sosialstonad"
						   label="Nei"
						   value="false"
						   checked={state.sosialstonad === "false"}
						   onChange={(e => updateFieldInState("sosialstonad", e.target.value))}
					/>
				</RadioGruppe>
			</div>
			<Hovedknapp onClick={onClick}>Neste</Hovedknapp>
        </div>
    )
}

const container = {
	display: 'flex'
}

const fjernInnputKnappStyle = {
	alignSelf: 'center'
}


export default InntektPensjonFormue;