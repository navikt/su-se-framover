import classNames from 'classnames';
import AlertStripe from 'nav-frontend-alertstriper';
import { Element } from 'nav-frontend-typografi';
import React, { useMemo } from 'react';

import { MessageFormatter, useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import saksbehandlingMessages from '~pages/saksbehandling/søknadsbehandling/formue/formue-nb';
import { Behandlingsinformasjon, FormueStatus } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';
import { formatCurrency } from '~utils/format/formatUtils';
import { regnUtFormueVerdier } from '~utils/søknadsbehandling/formue/formueUtils';
import { delerBoligMedFormatted } from '~utils/søknadsbehandling/søknadsbehandlingUtils';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { Fakta, FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';
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

function saksbehandlingfakta(
    info: Behandlingsinformasjon['formue'],
    formatMessage: MessageFormatter<typeof messages>
): Fakta[] {
    return [
        {
            tittel: formatMessage('formue.verdiPåBolig'),
            verdi: info?.verdier?.verdiIkkePrimærbolig,
            epsVerdi: info?.epsVerdier?.verdiIkkePrimærbolig,
        },
        {
            tittel: formatMessage('formue.verdiPåEiendom'),
            verdi: info?.verdier?.verdiEiendommer,
            epsVerdi: info?.epsVerdier?.verdiEiendommer,
        },
        {
            tittel: formatMessage('formue.verdiPåKjøretøy'),
            verdi: info?.verdier?.verdiKjøretøy,
            epsVerdi: info?.epsVerdier?.verdiKjøretøy,
        },
        {
            tittel: formatMessage('formue.innskuddsbeløp'),
            verdi: info?.verdier?.innskudd,
            epsVerdi: info?.epsVerdier?.innskudd,
        },
        {
            tittel: formatMessage('formue.verdipapirbeløp'),
            verdi: info?.verdier?.verdipapir,
            epsVerdi: info?.epsVerdier?.verdipapir,
        },
        {
            tittel: formatMessage('formue.kontanter'),
            verdi: info?.verdier?.kontanter,
            epsVerdi: info?.epsVerdier?.kontanter,
        },
        {
            tittel: formatMessage('formue.skylderNoenSøkerPengerBeløp'),
            verdi: info?.verdier?.pengerSkyldt,
            epsVerdi: info?.epsVerdier?.pengerSkyldt,
        },
        {
            tittel: formatMessage('formue.depositumsBeløp'),
            verdi: info?.verdier?.depositumskonto,
            epsVerdi: info?.epsVerdier?.depositumskonto,
        },
    ].map((f) =>
        formuelinje({
            harEktefelle: info?.borSøkerMedEPS ?? false,
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
    formue: Behandlingsinformasjon['formue'];
    ektefelle: { fnr: Nullable<string> };
}) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    const totalFormue = useMemo(() => {
        if (!props.formue) {
            return 0;
        }
        const søkersFormueFraSøknad = regnUtFormueVerdier(props.formue.verdier);

        if (props.formue.borSøkerMedEPS && props.formue.epsVerdier) {
            return søkersFormueFraSøknad + regnUtFormueVerdier(props.formue.epsVerdier);
        }

        return søkersFormueFraSøknad;
    }, [props.formue?.verdier, props.formue?.epsVerdier]);

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<FormueFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.formue === null ? (
                    <AlertStripe type="info">{formatMessage('display.ikkeVurdert')}</AlertStripe>
                ) : (
                    <div>
                        <Faktablokk
                            tittel={formatMessage('display.fraSaksbehandling')}
                            fakta={[
                                {
                                    tittel: formatMessage('formue.tittel'),
                                    verdi: (
                                        <div
                                            className={classNames(
                                                styles.formueForBrukerOgEps,
                                                styles.formueForBrukerOgEpsHeading
                                            )}
                                        >
                                            <span className={styles.søker}>
                                                {formatMessage('formue.heading.søker')}
                                            </span>
                                            {props.formue.borSøkerMedEPS && (
                                                <span className={classNames(styles.eps, styles.breakPls)}>
                                                    {formatMessage('formue.heading.eps')}
                                                </span>
                                            )}
                                        </div>
                                    ),
                                },
                                ...saksbehandlingfakta(props.formue, formatMessage),
                                FaktaSpacing,
                                {
                                    tittel: formatMessage('formue.totalt'),
                                    verdi: formatCurrency(totalFormue),
                                },
                                FaktaSpacing,
                                {
                                    tittel: formatMessage('input.label.borSøkerMedEktefelle'),
                                    verdi: props.formue.borSøkerMedEPS ? 'Ja' : 'Nei',
                                },
                                ...(props.ektefelle.fnr
                                    ? [
                                          {
                                              tittel: formatMessage('input.label.ektefellesFødselsnummer'),
                                              verdi: props.ektefelle.fnr,
                                          },
                                      ]
                                    : []),
                                FaktaSpacing,
                            ]}
                        />
                        <div>
                            {props.formue.status === FormueStatus.VilkårOppfylt ? (
                                <>
                                    <Element>{formatMessage('display.vilkårOppfylt')}</Element>
                                    <p>{formatMessage('display.vilkårOppfyltGrunn')}</p>
                                </>
                            ) : props.formue.status === FormueStatus.VilkårIkkeOppfylt ? (
                                <>
                                    <p>{formatMessage('display.vilkårIkkeOppfylt')}</p>
                                    <p>{formatMessage('display.vilkårIkkeOppfyltGrunn')}</p>
                                </>
                            ) : (
                                <>
                                    <p>{formatMessage('fraSøknad.uavklart')}</p>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
            begrunnelse={props.info.begrunnelse}
        />
    );
};
