import { BodyLong, GuidePanel, Heading, Ingress, Link, Panel } from '@navikt/ds-react';
import { useState } from 'react';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useUserContext } from '~src/context/userContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import { Rolle } from '~src/types/LoggedInUser';
import { loggUmamiEvent } from '~src/utils/umami.ts';
import messages from './nb';
import styles from './søknadsvelger.module.less';

const Søknadsvelger = () => {
    const user = useUserContext();
    const { formatMessage } = useI18n({ messages });
    const isPapirsøknad = location.search.includes('papirsoknad');
    const [, setOpen] = useState(false);

    if (user.roller.includes(Rolle.Saksbehandler) || user.roller.includes(Rolle.Veileder)) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <GuidePanel>
                        <BodyLong>
                            {formatMessage('velg-grupper', {
                                strong: (text) => <strong>{text}</strong>,
                                br: () => <br />,
                            })}
                        </BodyLong>
                        <BodyLong size="small">
                            {formatMessage('veileder-info')}
                            <Link
                                target="_blank"
                                href="https://navno.sharepoint.com/sites/fag-og-ytelser-regelverk-og-rutiner/SitePages/Supplerende%20st%C3%B8nad.aspx?web=1"
                            >
                                servicerutine
                            </Link>
                        </BodyLong>
                    </GuidePanel>

                    <Heading className={styles.tittel} level="1" size="xlarge" spacing>
                        {formatMessage('velg-tittel')}
                    </Heading>
                    <Ingress spacing>{formatMessage('velg-undertittel')}</Ingress>

                    <div className={styles.linkgruppe}>
                        <Panel border>
                            <Heading level="2" size="medium">
                                {formatMessage('velg-alder-tittel')}
                            </Heading>
                            <Ingress>{formatMessage('alder-beskrivelse')}</Ingress>

                            <LinkAsButton
                                variant="secondary"
                                href={Routes.soknadtema.createURL({
                                    papirsøknad: isPapirsøknad,
                                    soknadstema: Routes.URL_TEMA_ALDER,
                                })}
                            >
                                {formatMessage('alder-lenke')}
                            </LinkAsButton>
                        </Panel>
                        <Panel border>
                            <Heading level="2" size="medium">
                                {formatMessage('velg-ufør-tittel')}
                            </Heading>
                            <Ingress>{formatMessage('ufør-beskrivelse')}</Ingress>
                            <LinkAsButton
                                variant="secondary"
                                href={Routes.soknadtema.createURL({
                                    papirsøknad: isPapirsøknad,
                                    soknadstema: Routes.URL_TEMA_UFØRE,
                                })}
                            >
                                {formatMessage('ufør-lenke')}
                            </LinkAsButton>
                        </Panel>
                        <Panel border>
                            <Heading level="2" size="medium">
                                {formatMessage('velg-kontrollsamtale-tittel')}
                            </Heading>
                            <Ingress>{formatMessage('kontrollsamtale-beskrivelse')}</Ingress>
                            <LinkAsButton
                                variant="secondary"
                                href={Routes.kontrollsamtaleUtfylling.createURL({
                                    step: KontrollsamtaleSteg.PersonligOppmøte,
                                })}
                                onClick={() => {
                                    loggUmamiEvent('kontrollsamtale-lenke-klikket', {});
                                    setOpen(true);
                                }}
                            >
                                {formatMessage('kontrollsamtaleSkjema-lenke')}
                            </LinkAsButton>
                        </Panel>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }
};

export default Søknadsvelger;
