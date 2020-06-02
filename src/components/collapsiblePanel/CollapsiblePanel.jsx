import React, { useState } from 'react';
import NavFrontendChevron from 'nav-frontend-chevron';
import classNames from 'classnames';
import {
    Section,
    StyledDiv,
    TextHeader,
    FlexDiv,
    MarginBottomDiv,
    HeaderRow,
    HeaderDiv,
    UndertittelStyled,
    MarginRightDiv
} from './StyledComponents';
import {
    AirplaneIcon,
    EmailIcon,
    FemaleIcon,
    HeartIcon,
    HomeIcon,
    IDCard,
    PhoneIcon,
    StackedCoinsIcon,
    WorldIcon,
    LocationPinIcon,
    PersonIcon
} from '../../assets/Icons';

export const CollapsiblePanel = ({ personInfo }) => {
    const [state, setState] = useState(false);
    const [firstRender, setFirstRender] = useState(true);

    const firstRenderDone = () => {
        setFirstRender(false);
    };

    const togglePanel = () => {
        firstRenderDone();
        setState(state => !state);
    };

    function displayKjønn() {
        return FemaleIcon();
    }

    function displayFullName() {
        let name = '';
        name += personInfo.personopplysninger.fornavn + ' ';
        if (personInfo.personopplysninger.mellomnavn) {
            name += personInfo.personopplysninger.mellomnavn + ' ';
        }
        name += personInfo.personopplysninger.etternavn;

        return <span style={{ marginRight: '0.5em' }}>{name}</span>;
    }

    function displayAlder() {
        return <span style={{ marginRight: '1em' }}>{67}</span>;
    }

    function displayFødselsnummer() {
        return (
            <span>
                {IDCard()} {personInfo.personopplysninger.fnr}
            </span>
        );
    }

    function displaySivilstand() {
        if (personInfo.boforhold.borSammenMed.includes('Ektefelle/Partner/Samboer')) {
            return <span>Gift/Partner/Samboer</span>;
        } else {
            return <span>Ugift</span>;
        }
    }

    function displayStatsborgerskap() {
        return <span>{personInfo.personopplysninger.statsborgerskap}</span>;
    }

    function displayNAVKontor() {
        return (
            <span>
                <p>Nav-kontor / ingen</p>
            </span>
        );
    }

    function displayCorrectChevron() {
        if (state) {
            return <NavFrontendChevron type={'ned'} style={{ alignSelf: 'center' }} />;
        } else {
            return <NavFrontendChevron type={'opp'} style={{ alignSelf: 'center' }} />;
        }
    }

    function displayAddress() {
        return (
            <div>
                <div>{personInfo.personopplysninger.gateadresse}</div>
                <div>{personInfo.personopplysninger.bruksenhet ? personInfo.personopplysninger.bruksenhet : ''}</div>
                <div>
                    {personInfo.personopplysninger.postnummer} {personInfo.personopplysninger.poststed}
                </div>
            </div>
        );
    }

    function displayEmail() {
        return (
            <div>
                <div>min.epost@yahoo.com</div>
            </div>
        );
    }

    function displayPhoneNumber() {
        return <div>{personInfo.personopplysninger.telefonnummer}</div>;
    }

    function displayKontonummer() {
        return <div>12048023135</div>;
    }

    function displayFamilie() {
        return (
            <div>
                <p>Gift (18.06.2011)</p>
                <p>Kake dame (55)</p>
                <p>12345678901</p>
                <p>Bor med bruker</p>
            </div>
        );
    }

    function displayCollapsiblePanelBody() {
        return (
            <StyledDiv className={classNames(firstRender ? 'closed' : state ? 'open' : 'closing')}>
                <Section>
                    <UndertittelStyled>Kontaktinformasjon</UndertittelStyled>

                    <FlexDiv>
                        <MarginRightDiv>{HomeIcon(24)}</MarginRightDiv>
                        <MarginBottomDiv>
                            <div>
                                <TextHeader>bostedsadresse</TextHeader>
                            </div>
                            <MarginBottomDiv>{displayAddress()}</MarginBottomDiv>
                        </MarginBottomDiv>
                    </FlexDiv>

                    <FlexDiv>
                        <MarginRightDiv>{EmailIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>E-post</TextHeader>
                            </div>
                            <MarginBottomDiv>{displayEmail()}</MarginBottomDiv>
                        </div>
                    </FlexDiv>

                    <FlexDiv>
                        <MarginRightDiv>{PhoneIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>Telefon</TextHeader>
                            </div>
                            <MarginBottomDiv>{displayPhoneNumber()}</MarginBottomDiv>
                        </div>
                    </FlexDiv>

                    <FlexDiv>
                        <MarginRightDiv>{PhoneIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>Telefon til bruk for NAV</TextHeader>
                            </div>
                            <MarginBottomDiv>
                                <div>476 66 372 (Mobil)</div>
                                <div>21 11 61 67 (Hjem)</div>
                                <div>22 88 75 61 (Jobb)</div>
                            </MarginBottomDiv>
                        </div>
                    </FlexDiv>

                    <FlexDiv>
                        <MarginRightDiv>{StackedCoinsIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>Kontonummer</TextHeader>
                            </div>
                            <MarginBottomDiv>{displayKontonummer()}</MarginBottomDiv>
                        </div>
                    </FlexDiv>
                </Section>

                <Section>
                    <UndertittelStyled>Familie</UndertittelStyled>
                    <FlexDiv>
                        <MarginRightDiv>{HeartIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>Sivilstand</TextHeader>
                            </div>
                            <MarginBottomDiv>{displayFamilie()}</MarginBottomDiv>
                        </div>
                    </FlexDiv>

                    <FlexDiv>
                        <MarginRightDiv>{WorldIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>Fødeland</TextHeader>
                            </div>
                            <MarginBottomDiv>
                                <p>Norge</p>
                            </MarginBottomDiv>
                        </div>
                    </FlexDiv>

                    <FlexDiv>
                        <MarginRightDiv>{PersonIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>Personstatus</TextHeader>
                            </div>
                            <MarginBottomDiv>
                                <p>Status</p>
                            </MarginBottomDiv>
                        </div>
                    </FlexDiv>

                    <FlexDiv>
                        <MarginRightDiv>{LocationPinIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>Oppholdstillatelse(r), historikk</TextHeader>
                            </div>
                            <MarginBottomDiv>
                                <p>opphold</p>
                            </MarginBottomDiv>
                        </div>
                    </FlexDiv>

                    <FlexDiv>
                        <MarginRightDiv>{AirplaneIcon()}</MarginRightDiv>
                        <div>
                            <div>
                                <TextHeader>Inn- og utvandring</TextHeader>
                            </div>
                            <MarginBottomDiv>
                                <p>innvandring</p>
                                <p>utvandring</p>
                            </MarginBottomDiv>
                        </div>
                    </FlexDiv>
                </Section>
            </StyledDiv>
        );
    }

    return (
        <div>
            <HeaderDiv onClick={() => togglePanel()}>
                <FlexDiv>
                    <div style={{ marginRight: '0.5em', display: 'flex', alignItems: 'center' }}>{displayKjønn()}</div>
                    <HeaderRow>
                        <div style={{ marginRight: '0.5em', display: 'flex', alignItems: 'center' }}>
                            {displayFullName()}
                            {displayAlder()}
                            {displayFødselsnummer()}
                        </div>

                        <div style={{ display: 'flex', flexFlow: 'row wrap' }}>{displayStatsborgerskap()}</div>
                    </HeaderRow>
                </FlexDiv>

                <FlexDiv>
                    <HeaderRow>
                        <MarginBottomDiv>{displaySivilstand()}</MarginBottomDiv>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{displayNAVKontor()}</div>
                    </HeaderRow>
                    {displayCorrectChevron()}
                </FlexDiv>
            </HeaderDiv>
            {displayCollapsiblePanelBody()}
        </div>
    );
};
