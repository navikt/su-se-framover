import React from 'react';
import { EtikettSuksess } from 'nav-frontend-etiketter';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';

const expandBarStyle = {
		display: 'flex',
		flexDirection: 'column',
		flexWrap: 'wrap'
}

function PersonInfoBar({person}){
	return(
	<>
		<Ekspanderbartpanel tittel={
			<div style={expandBarStyle}>
				<EtikettSuksess>Ikon</EtikettSuksess>
				<Undertittel>{person.fnr} {person.fornavn} {person.etternavn} (45)</Undertittel>
			</div>
			} tittelProps="normaltekst" border>
			<div className="flex-container">
				<div>
					<Undertittel>Bostedsadresse</Undertittel>
					<Normaltekst>{person.adresse.gatenavn} {person.adresse.gatenr}</Normaltekst>
					<Normaltekst>{person.adresse.postnr} {person.adresse.poststed}</Normaltekst>
				</div>
				<div>
					<Undertittel>Sivilstand</Undertittel>
					<Normaltekst>{person.sivilstand.status}</Normaltekst>
					<Normaltekst>{person.sivilstand.partner}</Normaltekst>
				</div>
				<div>
					<Undertittel>Kontaktinformasjon</Undertittel>
					<Normaltekst>{person.telefon}</Normaltekst>
					<Normaltekst>{person.epost.epost} ({person.epost.metadata.kilde}-{person.epost.metadata.oppdatert})</Normaltekst>
				</div>
            </div>
        </Ekspanderbartpanel>
	</>
	)
}

export default PersonInfoBar;