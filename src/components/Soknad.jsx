import React from 'react';

import Stegindikator from 'nav-frontend-stegindikator';
import { Panel } from 'nav-frontend-paneler';
import { Input, CheckboxGruppe, Checkbox, Textarea } from 'nav-frontend-skjema';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { useHistory } from "react-router-dom";
import { Undertittel, Systemtittel } from 'nav-frontend-typografi';

function Soknad(){
	const history = useHistory();
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
				<div style={container}>
					<SkjemaGruppe>
						<Systemtittel>Personlige opplysninger</Systemtittel>
						<Input label="Fødselsnummer" />
						<div style={container}>
							<Input label="Fornavn" />
							<Input label="Mellomnavn" />
							<Input label="Etternavn" />
						</div>
						<Input label="Telefonnummer" />
						<div style={container}>
							<Input label="Gateadresse"/>
							<Input label="Bruksenhet" />
						</div>
						<div style={container}>
							<Input label="Postnummer"/>
							<Input label="Poststed" />
							<Input label="Bokommune" />
						</div>
						<Input label="Statsborgerskap" />
						<RadioGruppe legend="Er du registrert som flyktning?" style={container}>
							<Radio name="flyktning" label={'Ja'} />
							<Radio name="flyktning" label={'Nei'} />
						</RadioGruppe>
						<RadioGruppe legend="Bor du fast i Norge?" style={container}>
							<Radio name="bofastnorge" label={'Ja'} />
							<Radio name="bofastnorge" label={'Nei'} />
						</RadioGruppe>
						<Systemtittel>Boforhold</Systemtittel>
						<RadioGruppe legend="Deler du bolig med en annen voksen?">
							<Radio name="delerdubolig" label="Ja" />
							<Radio name="delerdubolig" label="Nei" />
						</RadioGruppe>
						<CheckboxGruppe legend="Hvem deler du bolig med?">
							<Checkbox name="boligdeler" label="Ektefelle/Partner" />
							<Checkbox name="boligdeler" label="Samboer" />
							<Checkbox name="boligdeler" label="Barn over 18 år" />
							<Checkbox name="boligdeler" label="Andre personer over 18 år" />
						</CheckboxGruppe>
						
						<Undertittel>Opplysninger om ektefellen/samboer/annen voksen person hvis dere bor sammen</Undertittel>
						<div style={container}>
							<Input label="Navn"/>
							<Input label="Fødselsnummer"/>
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
						<div style={container}>
							<Input label="Fra hvilken ordning mottar du pensjon?" />
							<Input label="Brutto beløp per år" />
						</div>
						<Knapp>Legg til flere pensjonsordninger</Knapp>
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
				<Hovedknapp onClick={() => history.push("/")}>Neste</Hovedknapp>
            </Panel>
		</>
	)
}
export default Soknad;

const container = {
	display: 'flex'
}
