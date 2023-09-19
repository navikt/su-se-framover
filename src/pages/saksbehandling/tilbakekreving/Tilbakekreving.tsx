import * as RemoteData from '@devexperts/remote-data-ts';
import { Accordion, Button, Heading, Panel } from '@navikt/ds-react';
import AccordionItem from '@navikt/ds-react/esm/accordion/AccordionItem';
import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

import { hentSisteFerdigbehandledeKravgrunnlag } from '~src/api/tilbakekrevingApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { Grunnlagsperiode, Kravgrunnlag } from '~src/types/Kravgrunnlag';
import { formatMonthYear } from '~src/utils/date/dateUtils';

import messages from './Tilbakekreving-nb';
import styles from './Tilbakekreving.module.less';

const Tilbakekreving = () => {
    const { formatMessage } = useI18n({ messages });
    const { sak } = useOutletContext<SaksoversiktContext>();
    const [status, hentKravgrunnlag] = useApiCall(hentSisteFerdigbehandledeKravgrunnlag);

    useEffect(() => {
        hentKravgrunnlag({ sakId: sak.id });
    }, []);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.tilbakekrevingHeading} size="large">
                    {formatMessage('page.heading')}
                </Heading>
            </div>

            <div className={styles.mainContentContainer}>
                {RemoteData.isSuccess(status) && <KanTilbakekreves sakId={sak.id} kravgrunnlag={status.value} />}
                {RemoteData.isFailure(status) && <KanIkkeTilbakekreves sakId={sak.id} />}
            </div>
        </div>
    );
};

const KanTilbakekreves = (props: { sakId: string; kravgrunnlag: Kravgrunnlag }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            <Panel className={styles.panelContentContainer}>
                <div>
                    <Heading size="medium">{formatMessage('tilbakekreving.kanTilbakekreves.heading')}</Heading>
                    <Heading size="small">{formatMessage('tilbakekreving.kanTilbakekreves.text')}</Heading>
                </div>

                <div className={styles.knappContainer}>
                    <LinkAsButton
                        variant="secondary"
                        href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                    >
                        {formatMessage('knapp.tilbake')}
                    </LinkAsButton>
                    <Button>{formatMessage('tilbakekreving.kanTilbakekreves.ny')}</Button>
                </div>
            </Panel>
            <OppsummeringAvKravgrunnlag kravgrunnlag={props.kravgrunnlag} />
        </>
    );
};

const OppsummeringAvKravgrunnlag = (props: { kravgrunnlag: Kravgrunnlag; visSomEnkeltPanel?: boolean }) => {
    const { formatMessage } = useI18n({ messages });

    if (props.visSomEnkeltPanel) {
        return (
            <div>
                <OppsummeringAvKravgrunnlagMetaInfo kravgrunnlag={props.kravgrunnlag} />
                <OppsummeringAvGrunnlagsPerioder grunnlagsperiode={props.kravgrunnlag.grunnlagsperiode} />
            </div>
        );
    } else {
        return (
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('kravgrunnlag.tittel')}
            >
                <OppsummeringAvKravgrunnlagMetaInfo kravgrunnlag={props.kravgrunnlag} />
                <OppsummeringAvGrunnlagsPerioder grunnlagsperiode={props.kravgrunnlag.grunnlagsperiode} />
            </Oppsummeringspanel>
        );
    }
};

const OppsummeringAvKravgrunnlagMetaInfo = (props: { kravgrunnlag: Kravgrunnlag }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.kravgrunnlagOppsummeringContainer}>
            <OppsummeringPar
                label={formatMessage('kravgrunnlag.id')}
                verdi={props.kravgrunnlag.eksternKravgrunnlagsId}
                retning="vertikal"
            />

            <OppsummeringPar
                label={formatMessage('kravgrunnlag.vedtakId')}
                verdi={props.kravgrunnlag.eksternVedtakId}
                retning="vertikal"
            />
            <OppsummeringPar
                label={formatMessage('kravgrunnlag.status')}
                verdi={props.kravgrunnlag.status}
                retning="vertikal"
            />
            <OppsummeringPar
                label={formatMessage('kravgrunnlag.kontrollfelt')}
                verdi={props.kravgrunnlag.kontrollfelt}
                retning="vertikal"
            />
        </div>
    );
};

const OppsummeringAvGrunnlagsPerioder = (props: { grunnlagsperiode: Grunnlagsperiode[] }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Heading size="small">{formatMessage('kravgrunnlag.grunnlagsperiode.tittel')}</Heading>

            <Accordion variant="neutral">
                {props.grunnlagsperiode.map((periode) => (
                    <AccordionItem key={`${periode.periode.fraOgMed}-${periode.periode.tilOgMed}`}>
                        <Accordion.Header className={styles.accordionHeader}>
                            {`${formatMonthYear(periode.periode.fraOgMed)} - ${formatMonthYear(
                                periode.periode.tilOgMed,
                            )}`}
                        </Accordion.Header>

                        <Accordion.Content>
                            <div>
                                <OppsummeringPar
                                    label={formatMessage('kravgrunnlag.grunnlagsperiode.beløpSkattMnd')}
                                    verdi={periode.beløpSkattMnd}
                                    retning="vertikal"
                                />
                            </div>
                            <hr></hr>
                            {periode.grunnlagsbeløp.map((beløp, i) => (
                                <li key={i} className={styles.grunnlagsbeløperContainer}>
                                    <div className={styles.grunnlagsbeløpContainer}>
                                        <OppsummeringPar
                                            label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.kode')}
                                            verdi={beløp.kode}
                                            retning="vertikal"
                                        />
                                        <OppsummeringPar
                                            label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.type')}
                                            verdi={beløp.type}
                                            retning="vertikal"
                                        />
                                    </div>

                                    <div className={styles.grunnlagsbeløpContainer}>
                                        <OppsummeringPar
                                            label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.skatteProsent')}
                                            verdi={beløp.skatteProsent}
                                            retning="vertikal"
                                        />
                                    </div>

                                    <div className={styles.grunnlagsbeløpContainer}>
                                        <OppsummeringPar
                                            label={formatMessage(
                                                'kravgrunnlag.grunnlagsperiode.beløp.beløpNyUtbetaling',
                                            )}
                                            verdi={beløp.beløpNyUtbetaling}
                                            retning="vertikal"
                                        />
                                        <OppsummeringPar
                                            label={formatMessage(
                                                'kravgrunnlag.grunnlagsperiode.beløp.beløpTidligereUtbetaling',
                                            )}
                                            verdi={beløp.beløpTidligereUtbetaling}
                                            retning="vertikal"
                                        />
                                    </div>
                                    <div className={styles.grunnlagsbeløpContainer}>
                                        <OppsummeringPar
                                            label={formatMessage(
                                                'kravgrunnlag.grunnlagsperiode.beløp.beløpSkalTilbakekreves',
                                            )}
                                            verdi={beløp.beløpSkalTilbakekreves}
                                            retning="vertikal"
                                        />
                                        <OppsummeringPar
                                            label={formatMessage(
                                                'kravgrunnlag.grunnlagsperiode.beløp.beløpSkalIkkeTilbakekreves',
                                            )}
                                            verdi={beløp.beløpSkalIkkeTilbakekreves}
                                            retning="vertikal"
                                        />
                                    </div>
                                </li>
                            ))}
                        </Accordion.Content>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

const KanIkkeTilbakekreves = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Panel border className={styles.panelContentContainer}>
            <div>
                <Heading size="medium">{formatMessage('tilbakekreving.kanIkkeTilbakekreves.heading')}</Heading>
                <Heading size="small">{formatMessage('tilbakekreving.kanIkkeTilbakekreves.text')}</Heading>
            </div>

            <LinkAsButton variant="secondary" href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                {formatMessage('knapp.tilbake')}
            </LinkAsButton>
        </Panel>
    );
};

export default Tilbakekreving;
