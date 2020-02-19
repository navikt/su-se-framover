import React from 'react';
import { EtikettSuksess } from 'nav-frontend-etiketter';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';
import useFetch from '../hooks/useFetch';

function PersonInfoBar({ fnr }) {
    const url = '/person?ident=' + fnr;
    const { data } = useFetch({ url });
    const person = data ? data : {};
    console.log('person', person);
    return (
        <div>
            <Ekspanderbartpanel
                tittel={
                    <div style={{ display: 'flex' }}>
                        <div>
                            <EtikettSuksess>Kjønn-ikon</EtikettSuksess>
                        </div>
                        &nbsp; &nbsp; &nbsp; &nbsp;
                        <div style={{ display: 'flex' }}>
                            <div>
                                <Undertittel>
                                    {person ? (person.fornavn, person.mellomnavn, person.etternavn) : ''} (45)
                                </Undertittel>
                                <Normaltekst>12345678901</Normaltekst>
                            </div>
                        </div>
                        <div>heiehi</div>
                    </div>
                }
                tittelProps="normaltekst"
                border
            >
{/*                <div>
                    <div>
                        <Undertittel>Bostedsadresse</Undertittel>
                        <Normaltekst>Gatenavn 5</Normaltekst>
                        <Normaltekst>0697 Oslo</Normaltekst>
                    </div>

                    <div>
                        <Undertittel>Sivilstand</Undertittel>
                        <Normaltekst>Gift</Normaltekst>
                    </div>

                    <div>
                        <Undertittel>Kontakt</Undertittel>
                        <Normaltekst>12345678</Normaltekst>
                        <Normaltekst>epost@epost.no (epost-metadata-kilde-epost-metadata-oppdatert)</Normaltekst>
                    </div>

                    <div>
                        <Undertittel>Statsborgerskap</Undertittel>
                        <Normaltekst>Norsk, engelsk, Svensk</Normaltekst>
                    </div>

                    <div>
                        <Undertittel>Fødsel</Undertittel>
                        <Normaltekst>Oslo, Norge</Normaltekst>
                        <Normaltekst>08.05.2020</Normaltekst>
                    </div>

                    <div>
                        <Undertittel>Oppholdstillatelse</Undertittel>
                        <Normaltekst>01.01.2020 - 31.12.2020</Normaltekst>
                    </div>

                    <div>
                        <Undertittel>Personstatus</Undertittel>
                        <Normaltekst>Jeg er en status</Normaltekst>
                    </div>
                </div>
                    */}
            </Ekspanderbartpanel>
        </div>
    );

}


                {/*
const bar = {
    display: 'flex',
    flexDirection: 'row'
};

const element = {
    margin: '1%'
};*/}

export default PersonInfoBar;
