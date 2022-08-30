import { Alert, Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import { regnUtFormuegrunnlagVerdier } from '~src/components/vilkårOgGrunnlagForms/formue/FormueFormUtils';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import saksbehandlingMessages from '~src/pages/saksbehandling/søknadsbehandling/formue/formue-nb';
import { Formuegrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuegrunnlag';
import { FormueStatus, FormueVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { SøknadInnhold } from '~src/types/Søknad';
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

function saksbehandlingfakta(
    info: Formuegrunnlag | undefined,
    harEktefelle: boolean,
    formatMessage: MessageFormatter<typeof messages>
): Fakta[] {
    return [
        {
            tittel: formatMessage('formue.verdiPåBolig'),
            verdi: info?.søkersFormue?.verdiIkkePrimærbolig,
            epsVerdi: info?.epsFormue?.verdiIkkePrimærbolig,
        },
        {
            tittel: formatMessage('formue.verdiPåEiendom'),
            verdi: info?.søkersFormue?.verdiEiendommer,
            epsVerdi: info?.epsFormue?.verdiEiendommer,
        },
        {
            tittel: formatMessage('formue.verdiPåKjøretøy'),
            verdi: info?.søkersFormue?.verdiKjøretøy,
            epsVerdi: info?.epsFormue?.verdiKjøretøy,
        },
        {
            tittel: formatMessage('formue.innskuddsbeløp'),
            verdi: info?.søkersFormue?.innskudd,
            epsVerdi: info?.epsFormue?.innskudd,
        },
        {
            tittel: formatMessage('formue.verdipapirbeløp'),
            verdi: info?.søkersFormue?.verdipapir,
            epsVerdi: info?.epsFormue?.verdipapir,
        },
        {
            tittel: formatMessage('formue.kontanter'),
            verdi: info?.søkersFormue?.kontanter,
            epsVerdi: info?.epsFormue?.kontanter,
        },
        {
            tittel: formatMessage('formue.skylderNoenSøkerPengerBeløp'),
            verdi: info?.søkersFormue?.pengerSkyldt,
            epsVerdi: info?.epsFormue?.pengerSkyldt,
        },
        {
            tittel: formatMessage('formue.depositumsBeløp'),
            verdi: info?.søkersFormue?.depositumskonto,
            epsVerdi: info?.epsFormue?.depositumskonto,
        },
    ].map((f) =>
        formuelinje({
            harEktefelle: harEktefelle,
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
        const søkersFormueFraSøknad = regnUtFormuegrunnlagVerdier(
            props.formue.vurderinger[0]?.grunnlag.søkersFormue ?? null
        );

        if (props.ektefelle.fnr && props.formue.vurderinger[0]?.grunnlag.epsFormue) {
            return søkersFormueFraSøknad + regnUtFormuegrunnlagVerdier(props.formue.vurderinger[0].grunnlag.epsFormue);
        }

        return søkersFormueFraSøknad;
    }, [props.formue.vurderinger[0]?.grunnlag.søkersFormue, props.formue.vurderinger[0]?.grunnlag.epsFormue]);

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<FormueFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.formue.vurderinger.length === 0 ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
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
                                            {props.ektefelle.fnr && (
                                                <span className={classNames(styles.eps, styles.breakPls)}>
                                                    {formatMessage('formue.heading.eps')}
                                                </span>
                                            )}
                                        </div>
                                    ),
                                },
                                ...saksbehandlingfakta(
                                    props.formue.vurderinger[0]?.grunnlag,
                                    props.ektefelle.fnr !== null,
                                    formatMessage
                                ),
                                FaktaSpacing,
                                {
                                    tittel: formatMessage('formue.totalt'),
                                    verdi: formatCurrency(totalFormue),
                                },
                                FaktaSpacing,
                                {
                                    tittel: formatMessage('formue.label.borSøkerMedEktefelle'),
                                    verdi: props.ektefelle.fnr !== null ? 'Ja' : 'Nei',
                                },
                                ...(props.ektefelle.fnr
                                    ? [
                                          {
                                              tittel: formatMessage('formue.label.ektefellesFødselsnummer'),
                                              verdi: props.ektefelle.fnr,
                                          },
                                      ]
                                    : []),
                                FaktaSpacing,
                            ]}
                        />
                        <div>
                            {props.formue.resultat === FormueStatus.VilkårOppfylt ? (
                                <>
                                    <Heading size="small" level="5">
                                        {formatMessage('formue.vilkårOppfylt')}
                                    </Heading>
                                    <p>{formatMessage('formue.vilkårOppfyltGrunn')}</p>
                                </>
                            ) : props.formue.resultat === FormueStatus.VilkårIkkeOppfylt ? (
                                <>
                                    <p>{formatMessage('formue.vilkårIkkeOppfylt')}</p>
                                    <p>{formatMessage('formue.vilkårIkkeOppfyltGrunn')}</p>
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
        />
    );
};
