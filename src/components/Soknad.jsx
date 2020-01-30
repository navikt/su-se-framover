import React, {useState} from 'react';

import Stegindikator from 'nav-frontend-stegindikator';
import { Panel } from 'nav-frontend-paneler';
import { Input, CheckboxGruppe, Checkbox, Textarea } from 'nav-frontend-skjema';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { useHistory } from "react-router-dom";
import { Undertittel, Systemtittel } from 'nav-frontend-typografi';
import {InputFields} from "./FormElements";

function Soknad(){
	const history = useHistory();

	const [state, setState] = useState({
		fnr: '',
		borSammenMed: [],
		pensjonsOrdning: [{ordning: '', beløp: ''}]
	})

	const updateFieldInState = (field, newState) => {
		setState(state => ({
			...state,
			[field]: newState
		}))
	}

	function lol() {
		console.log(state)
	}

	function boSammenMedUpdate(target){
	setState(state =>({
		...state,
			borSammenMed: updatedArray(state.borSammenMed, target)
	}))
	}

	function updatedArray(sourceArray, target){
		if(target.checked){
			return [...sourceArray, target.value]
		}else{
			return sourceArray.filter(item => item !== target.value)
		}
	}

	function addPensjonsOrgningsInput(){
		const values = [...state.pensjonsOrdning]
		values.push({ordning:'', beløp:''})
		console.log(values)
		updateFieldInState("pensjonsOrdning", values)
	}

	function updatePensjonsOrgning(kilde, index){
		const ordning = {...state.pensjonsOrdning[index]}
		ordning.ordning = kilde

		const tempInntekter = [...state.pensjonsOrdning.slice(0,index), ordning, ...state.pensjonsOrdning.slice(index+1)]
		updateFieldInState("pensjonsOrdning", tempInntekter)
	}

	function updatePensjonsOrgningsBeløp(kilde, index){
		const beløp = {...state.pensjonsOrdning[index]}
		beløp.beløp = kilde

		const tempInntekter = [...state.pensjonsOrdning.slice(0,index), beløp, ...state.pensjonsOrdning.slice(index+1)]
		updateFieldInState("pensjonsOrdning", tempInntekter)
	}


	function personDelerBolig(){
		if(state.delerDuBolig === "true"){
			return (
				<CheckboxGruppe legend="Hvem deler du bolig med?">
					<Checkbox name="boligdeler" label="Ektefelle/Partner/Samboer" value="esp" onChange={(e => boSammenMedUpdate(e.target))}/>
					<Checkbox name="boligdeler" label="Barn over 18 år" value="over18" onChange={(e => boSammenMedUpdate(e.target))}/>
					<Checkbox name="boligdeler" label="Andre personer over 18 år" value="annenPerson" onChange={(e => boSammenMedUpdate(e.target))}/>
				</CheckboxGruppe>
			)
		}
	}

	function tillegsInfoDelerBolig(){
		if(state.delerDuBolig === "true"){
			return (
				<div>
					<Undertittel>Opplysninger om ektefellen/samboer/annen voksen person hvis dere bor sammen</Undertittel>
					<div style={container}>
						<InputFields labelText="Navn"/>
						<InputFields labelText="Fødselsnummer"/>
					</div>
				</div>
			)
		}
	}

	return(
		<>
			<Panel border>
				<Stegindikator
					steg={[
						{"label": "Personopplysninger","aktiv": true},
						{"label": "Oppholdstillatelse"},
						{"label": "Inntekt og pensjon"},
						{"label": "Formue"},
						{"label": "Send søknad"}
					]}
					onChange={(index) => {
						history.push("/");
					}}
					visLabel
				/>
				<div>
					<SkjemaGruppe>
						<div>
							<Systemtittel>Personlige opplysninger</Systemtittel>
							<div>
								<Input label="Fødselsnummer" onChange={(e => updateFieldInState("fnr", e.target.value))}/>
							</div>
							<div style={container}>
								<InputFields labelText="Fornavn" />
								<InputFields labelText="Mellomnavn" />
								<InputFields labelText="Etternavn" />
							</div>
							<div>
								<Input label="Telefonnummer" />
							</div>
							<div style={container}>
								<InputFields labelText="Gateadresse"/>
								<InputFields labelText="Bruksenhet" />
							</div>
							<div style={container}>
								<InputFields labelText="Postnummer"/>
								<InputFields labelText="Poststed" />
								<InputFields labelText="Bokommune" />
							</div>
							<div>
								<Input label="Statsborgerskap" />
							</div>
							<div style={container}>
								<RadioGruppe legend="Er du registrert som flyktning?"   >
									<Radio name="flyktning" label={'Ja'} value="true"  onChange={(e => updateFieldInState("flyktning", e.target.value))}/>
									<Radio name="flyktning" label={'Nei'} value="false" onChange={(e => updateFieldInState("flyktning", e.target.value))}/>
								</RadioGruppe>
								&nbsp;
								<RadioGruppe legend="Bor du fast i Norge?" >
									<Radio name="bofastnorge" label={'Ja'} />
									<Radio name="bofastnorge" label={'Nei'} />
								</RadioGruppe>
							</div>
						</div>

						<div>
							<Systemtittel>Boforhold</Systemtittel>
							<div>
								<div style={container}>
									<RadioGruppe legend="Deler du bolig med en annen voksen?">
										<Radio name="delerDubolig" label="Ja" value="true" onChange={(e => updateFieldInState("delerDuBolig", e.target.value))} />
										<Radio name="delerDubolig" label="Nei" value="false" onChange={(e => updateFieldInState("delerDuBolig", e.target.value))}/>
									</RadioGruppe>
									&nbsp;
									{
										personDelerBolig()
									}
								</div>
								{
									tillegsInfoDelerBolig()
								}
							</div>
						</div>
						
						<Systemtittel>Utenlandsopphold</Systemtittel>						
						<RadioGruppe legend="Har du vært utenlands i løpet av de siste 3 månedene?">
							<Radio name="utenlandsopphold" label="Ja" />
							<Radio name="utenlandsopphold" label="Nei" />
						</RadioGruppe>
						<div style={container}>
							<Input label="Utreisedato" />
							<Input label="Innreisedato" />
						</div>
						<Knapp>Legg til flere utenlandsopphold</Knapp>
						<RadioGruppe legend="Har du planer om å reise utenlands?">
							<Radio name="planlagtutenlandsopphold" label="Ja" />
							<Radio name="planlagtutenlandsopphold" label="Nei" />
						</RadioGruppe>
						<div style={container}>
							<Input label="Utreisedato" />
							<Input label="Innreisedato" />
						</div>
						<Knapp>Legg til flere planlagte utenlandsopphold</Knapp>
						
						<Systemtittel>Opplysninger om oppholdstillatelse</Systemtittel>						
						<RadioGruppe legend="Har du varig oppholdstillatelse?">
							<Radio name="varigopphold" label="Ja" />
							<Radio name="varigopphold" label="Nei" />
						</RadioGruppe>
						<Input label="Oppholdstillatelsens utløpsdato" />
						<RadioGruppe legend="Har du søkt om forlengelse?">
							<Radio name="soektforlengelse" label="Ja" />
							<Radio name="soektforlengelse" label="Nei" />
						</RadioGruppe>

						<Systemtittel>Pensjon og annen inntekt</Systemtittel>
						<RadioGruppe legend="Har du fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort?">
							<Radio name="kravannenytelse" label="Ja" />
							<Radio name="kravannenytelse" label="Nei" />
						</RadioGruppe>
						<Input label="Hva slags ytelse/pensjon?" />
						<RadioGruppe legend="Har du arbeidsinntekt/personinntekt?">
							<Radio name="arbeidselleranneninntekt" label="Ja" />
							<Radio name="arbeidselleranneninntekt" label="Nei" />
						</RadioGruppe>
						<Input label="Brutto beløp per år" />
						<RadioGruppe legend="Har du pensjon?">
							<Radio name="hardupensjon" label="Ja" />
							<Radio name="hardupensjon" label="Nei" />
						</RadioGruppe>
						<div>
							{
								state.pensjonsOrdning.map((item, index)=> ({...item, key:index}))
									.map((item, index) => {
											return (
												<div key={item.key} style={container}>

													<InputFields id={`${item.key}-ordning`}
																 labelText={"Fra hvilken ordning mottar du pensjon?:"}
																 value={item.ordning}
																 onChange={(value) => updatePensjonsOrgning(value,index)}
													/>

													<InputFields id={`${item.key}-beløp`}
																 labelText={"Brutto beløp per år"}
																 value={item.beløp}
																 onChange={(value) => updatePensjonsOrgningsBeløp(value,index)}
													/>

												</div>
											)
										}
									)
							}
						</div>
						<Knapp onClick={addPensjonsOrgningsInput}>Legg til flere pensjonsordninger</Knapp>
						<Input label="Sum arbeidsinntekt/personinntekt, kapitalinntekt og pensjon" />

						{/* <Systemtittel>Pensjon og annen inntekt for ektefelle/samboer</Systemtittel>
						TODO */}

						<Systemtittel>Opplysninger om formue</Systemtittel>
						<RadioGruppe legend="Har du formue/eiendom?">
							<Radio name="harduformueeiendom" label="Ja" />
							<Radio name="harduformueeiendom" label="Nei" />
						</RadioGruppe>
						<RadioGruppe legend="Har du finansformue?">
							<Radio name="hardufinansformue" label="Ja" />
							<Radio name="hardufinansformue" label="Nei" />
						</RadioGruppe>
						<Input label="Beløp" />
						<RadioGruppe legend="Har du annen formue/eiendom?">
							<Radio name="harduannenformueeiendom" label="Ja" />
							<Radio name="harduannenformueeiendom" label="Nei" />
						</RadioGruppe>
						<div style={container}>
							<Input label="Type formue/eiendom" />
							<Input label="Samlet skattetakst" />
						</div>
						{/*tilsvarende spørsmål for ektefelle/samboer/partner/etc. */}

						<Systemtittel>Opplysninger om økonomisk sosialhjelp</Systemtittel>
						<RadioGruppe legend="Mottar du eller ektefellen/samboer eller har du eller han/hun i løpet av de siste tre månedene mottatt sosialstønad til livsopphold?">
							<Radio name="sosialstonad" label="Ja" />
							<Radio name="sosialstonad" label="Nei" />
						</RadioGruppe>

						<Systemtittel>Språkform</Systemtittel>
						<RadioGruppe legend="Hvilken målform ønsker du i svaret?">
							<Radio name="maalform" label="Bokmål" />
							<Radio name="maalform" label="Nynorsk" />
						</RadioGruppe>

						<Systemtittel>For NAV</Systemtittel>
						<RadioGruppe legend="Har bruker møtt personlig?">
							<Radio name="personligmote" label="Ja" />
							<Radio name="personligmote" label="Nei" />
						</RadioGruppe>
						<RadioGruppe legend="Har fullmektig møtt?">
							<Radio name="fullmektigmote" label="Ja" />
							<Radio name="fullmektigmote" label="Nei" />
						</RadioGruppe>
						<RadioGruppe legend="Er originalt(e) pass sjekket for stempel?">
							<Radio name="passsjekk" label="Ja" />
							<Radio name="passsjekk" label="Nei" />
						</RadioGruppe>
						<Input label="Merknader" />
						

					</SkjemaGruppe>
				</div>				
				<Hovedknapp onClick={lol}>Neste</Hovedknapp>
            </Panel>
		</>
	)
}
export default Soknad;



const container = {
	display: 'flex'
}

