import { Alert } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import OppsummeringAvFormueVilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFormue';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import saksbehandlingMessages from '~src/pages/saksbehandling/søknadsbehandling/formue/formue-nb';
import { FormueVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { SøknadInnhold } from '~src/types/Søknadinnhold';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { delerBoligMedFormatted } from '~src/utils/søknadsbehandling/søknadsbehandlingUtils';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { Fakta, FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import * as styles from './faktablokker.module.less';
import { FaktablokkProps } from './faktablokkUtils';

export const FormueFaktablokk = (props: FaktablokkProps) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <Faktablokk
                tittel={formatMessage('display.fraSøknad')}
                fakta={[
                    {
                        tittel: formatMessage('formue.tittel'),
                        verdi: (
                            <div
                                className={classNames(styles.formueForBrukerOgEps, styles.formueForBrukerOgEpsHeading)}
                            >
                                <span className={styles.søker}>{formatMessage('formue.heading.søker')}</span>
                                {props.søknadInnhold.boforhold.ektefellePartnerSamboer !== null && (
                                    <span className={classNames(styles.eps, styles.breakPls)}>
                                        {formatMessage('formue.heading.eps')}
                                    </span>
                                )}
                            </div>
                        ),
                    },
                    ...søknadsfakta(props.søknadInnhold, formatMessage),
                    FaktaSpacing,
                    {
                        tittel: formatMessage('formue.delerBoligMed'),
                        verdi: props.søknadInnhold.boforhold.delerBoligMed
                            ? delerBoligMedFormatted(props.søknadInnhold.boforhold.delerBoligMed)
                            : formatMessage('formue.delerBoligMed.ingen'),
                    },
                    ...(props.søknadInnhold.boforhold.ektefellePartnerSamboer === null
                        ? []
                        : [
                              {
                                  tittel: formatMessage('formue.epsFnr'),
                                  verdi: props.søknadInnhold.boforhold.ektefellePartnerSamboer.fnr,
                              },
                          ]),
                ]}
            />
        </div>
    );
};

const IGNORER_VERDI = 'IGNORER_VERDI' as const;

function søknadsfakta(innhold: SøknadInnhold, formatMessage: MessageFormatter<typeof messages>): Fakta[] {
    return [
        {
            tittel: formatMessage('formue.verdiPåBolig'),
            verdi: innhold.formue.verdiPåBolig,
            epsVerdi: innhold.ektefelle?.formue.verdiPåBolig,
        },
        {
            tittel: formatMessage('formue.verdiPåEiendom'),
            verdi: innhold.formue.verdiPåEiendom,
            epsVerdi: innhold.ektefelle?.formue.verdiPåBolig,
        },
        ...(innhold.formue.kjøretøy?.map((k) => ({
            tittel: `${formatMessage('formue.verdiPåKjøretøy')} (${k.kjøretøyDeEier})`,
            verdi: k.verdiPåKjøretøy,
            epsVerdi: IGNORER_VERDI,
        })) ?? []),
        ...(innhold.ektefelle?.formue.kjøretøy?.map((k) => ({
            tittel: `${formatMessage('formue.verdiPåKjøretøy')} (${k.kjøretøyDeEier})`,
            verdi: IGNORER_VERDI,
            epsVerdi: k.verdiPåKjøretøy,
        })) ?? []),
        {
            tittel: formatMessage('formue.innskuddsbeløp'),
            verdi: innhold.formue.innskuddsBeløp,
            epsVerdi: innhold.ektefelle?.formue.innskuddsBeløp,
        },
        {
            tittel: formatMessage('formue.verdipapirbeløp'),
            verdi: innhold.formue.verdipapirBeløp,
            epsVerdi: innhold.ektefelle?.formue.verdipapirBeløp,
        },
        {
            tittel: formatMessage('formue.kontanter'),
            verdi: innhold.formue.kontanterBeløp,
            epsVerdi: innhold.ektefelle?.formue.kontanterBeløp,
        },
        {
            tittel: formatMessage('formue.skylderNoenSøkerPengerBeløp'),
            verdi: innhold.formue.skylderNoenMegPengerBeløp,
            epsVerdi: innhold.ektefelle?.formue.skylderNoenMegPengerBeløp,
        },
        {
            tittel: formatMessage('formue.depositumsBeløp'),
            verdi: innhold.formue.depositumsBeløp,
            epsVerdi: innhold.ektefelle?.formue.depositumsBeløp,
        },
    ].map((f) =>
        formuelinje({
            harEktefelle: innhold.ektefelle !== null,
            tittel: f.tittel,
            verdi: f.verdi ?? 0,
            epsVerdi: f.epsVerdi ?? 0,
        })
    );
}

function formuelinje(f: {
    harEktefelle: boolean;
    tittel: string;
    verdi: number | typeof IGNORER_VERDI;
    epsVerdi: number | typeof IGNORER_VERDI;
}) {
    return {
        tittel: f.tittel,
        verdi: f.harEktefelle ? (
            <div className={styles.formueForBrukerOgEps}>
                <span className={styles.søker}>{f.verdi === IGNORER_VERDI ? '-' : formatCurrency(f.verdi ?? 0)}</span>
                <span className={styles.eps}>
                    {f.epsVerdi === IGNORER_VERDI ? '-' : formatCurrency(f.epsVerdi ?? 0)}
                </span>
            </div>
        ) : f.verdi === IGNORER_VERDI ? (
            '-'
        ) : (
            formatCurrency(f.verdi ?? 0)
        ),
    };
}

export const FormueVilkårsblokk = (props: {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    formue: FormueVilkår;
}) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<FormueFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.formue.vurderinger.length === 0 ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <OppsummeringAvFormueVilkår formue={props.formue} visesIVedtak />
                )
            }
        />
    );
};
