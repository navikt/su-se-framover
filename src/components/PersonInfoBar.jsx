import React from 'react';
import { EtikettSuksess } from 'nav-frontend-etiketter';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';

const bar = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
};

const element = {
    margin: '1%'
};

function PersonInfoBar({ person }) {
    return (
        <>
            <Ekspanderbartpanel
                tittel={
                    <div style={bar}>
                        <EtikettSuksess>Kjønn-ikon</EtikettSuksess>
                        <Undertittel>
                            {person.fnr} {person.fornavn} {person.etternavn} (45)
                        </Undertittel>
                    </div>
                }
                tittelProps="normaltekst"
                border
            >
                <div className="flex-container" style={bar}>
                    <div style={element}>
                        <Undertittel>Bostedsadresse</Undertittel>
                        <Normaltekst>
                            {person.adresse.gatenavn} {person.adresse.gatenr}
                        </Normaltekst>
                        <Normaltekst>
                            {person.adresse.postnr} {person.adresse.poststed}
                        </Normaltekst>
                    </div>
                    <div style={element}>
                        <Undertittel>Sivilstand</Undertittel>
                        <Normaltekst>{person.sivilstand.status}</Normaltekst>
                        <Normaltekst>{person.sivilstand.partner}</Normaltekst>
                    </div>
                    <div style={element}>
                        <Undertittel>Kontakt</Undertittel>
                        <Normaltekst>{person.telefon}</Normaltekst>
                        <Normaltekst>
                            {person.epost.epost} ({person.epost.metadata.kilde}-{person.epost.metadata.oppdatert})
                        </Normaltekst>
                    </div>
                    <div style={element}>
                        <Undertittel>Statsborgerskap</Undertittel>
                        {person.statsborgerskap.map(statsborgerskap => {
                            return (
                                <>
                                    <Normaltekst>
                                        {statsborgerskap.land} ({statsborgerskap.fom})
                                    </Normaltekst>
                                </>
                            );
                        })}
                    </div>
                    <div style={element}>
                        <Undertittel>Fødsel</Undertittel>
                        <Normaltekst>
                            {person.foedsel.foedested}, {person.foedsel.foedeland}
                        </Normaltekst>
                        <Normaltekst>{person.foedsel.fodselsedato}</Normaltekst>
                    </div>
                    <div style={element}>
                        <Undertittel>Oppholdstillatelse</Undertittel>
                        {person.opphold.map(opphold => {
                            return (
                                <>
                                    <Normaltekst>
                                        {opphold.type} ({opphold.fom}-{opphold.tom})
                                    </Normaltekst>
                                </>
                            );
                        })}
                    </div>
                    <div style={element}>
                        <Undertittel>Personstatus</Undertittel>
                        {person.folkeregisterpersonstatus.map(status => {
                            return (
                                <>
                                    <Normaltekst>
                                        {status.status} ({status.fom}-{status.tom})
                                    </Normaltekst>
                                </>
                            );
                        })}
                    </div>
                </div>
            </Ekspanderbartpanel>
        </>
    );
}

export default PersonInfoBar;
