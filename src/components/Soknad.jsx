import React from 'react';

import { Innholdstittel } from 'nav-frontend-typografi';
import Stegindikator from 'nav-frontend-stegindikator';
import { Panel } from 'nav-frontend-paneler';
import { Input } from 'nav-frontend-skjema';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import { CheckboxGruppe, Checkbox } from 'nav-frontend-skjema';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useHistory, useLocation } from "react-router-dom";

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
					<div style={containerLeft}>
						<SkjemaGruppe>
							<Input label="Fornavn" />
							<Input label="Etternavn" />
							<div style={container}>
								<Input label="Postnummer"/>
								<Input label="Poststed" />
							</div>
							<Input label="Statsborgerskap" />
							<RadioGruppe legend="Sivilstand">
								<Radio name="sivilstand" label={'Ugift'} />
								<Radio name="sivilstand" label={'Samboer'} />
								<Radio name="sivilstand" label={'Gift'} />
								<Radio name="sivilstand" label={'Registrert partner'} />
								<Radio name="sivilstand" label={'Separert'} />
								<Radio name="sivilstand" label={'Skilt'} />
								<Radio name="sivilstand" label={'Enke/enkemann'} />
								<Radio name="sivilstand" label={'Bor sammen med annen voksen'} />
							</RadioGruppe>
							<div style={container}>
							<RadioGruppe legend="Bor du fast i Norge?" style={containerLeft}>
                                <Radio name="bofastnorge" label={'Ja'} />
                                <Radio name="bofastnorge" label={'Nei'} />
                            </RadioGruppe>
                            <RadioGruppe legend="Har du oppholdt deg i utlandet i løpet av de siste 90 dagene?" style={containerRight}>
                                <Radio name="utenlandsopphold" label={'Ja'} />
                                <Radio name="utenlandsopphold" label={'Nei'} />
                            </RadioGruppe>
                            </div>
						</SkjemaGruppe>
					</div>
					<div style={containerRight}>
						<SkjemaGruppe>
							<Input label="Fødselsnummer" />
							<Input label="Telefonnummer" />
							<Input label="Kommune" />
							<RadioGruppe legend="Er du registrert som flyktning?" style={containerLeft}>
                                 <Radio name="flyktning" label={'Ja'} />
                                 <Radio name="flyktning" label={'Nei'} />
                             </RadioGruppe>
							 <RadioGruppe legend="Har du tenkt å oppholde deg i utlandet i mer enn 90 dager i løpet av de kommende 12 mnd?" style={containerLeft}>
                                 <Radio name="utenlandsplan" label={'Ja'} />
                                 <Radio name="utenlandsplan" label={'Nei'} />
                             </RadioGruppe>
						</SkjemaGruppe>
					</div>
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
const containerLeft = {
    width: '50%'
}
const containerRight = {
    width: '50%'
}
