import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading, Label, Loader } from '@navikt/ds-react';
import classNames from 'classnames';
import { pipe } from 'fp-ts/lib/function';
import React, { useMemo } from 'react';

import { ApiError } from '~src/api/apiClient';
import { FeatureToggle } from '~src/api/featureToggleApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import skattegrunnlagMessages from '~src/pages/saksbehandling/skattegrunnlag-nb';
import saksbehandlingMessages from '~src/pages/saksbehandling/søknadsbehandling/formue/formue-nb';
import { FormueStatus } from '~src/types/Behandlingsinformasjon';
import { Formuegrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuegrunnlag';
import { FormueVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { SamletSkattegrunnlag, SkattegrunnlagKategori } from '~src/types/skatt/Skatt';
import { SøknadInnhold } from '~src/types/Søknad';
import { formatDateTime } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { regnUtFormueVerdier } from '~src/utils/søknadsbehandling/formue/formueUtils';
import { delerBoligMedFormatted } from '~src/utils/søknadsbehandling/søknadsbehandlingUtils';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { Fakta, FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import * as styles from './faktablokker.module.less';
import { FaktablokkProps } from './faktablokkUtils';

export const FormueFaktablokk = (props: FaktablokkProps) => {
    const skattemeldingToggle = useFeatureToggle(FeatureToggle.Skattemelding);
    const { formatMessage } = useI18n({ messages: { ...messages, ...skattegrunnlagMessages } });

    const SkatteApiFeilmelding = ({ tittel, error }: { tittel: string; error: ApiError | undefined }) => (
        <div>
            <Label className={styles.overskrift} spacing>
                {tittel}
            </Label>
            <ApiErrorAlert error={error} />
        </div>
    );

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
            {skattemeldingToggle && props.skattegrunnlagBruker && (
                <div className={styles.skattegrunnlag}>
                    <Heading level="2" size="xsmall">
                        {formatMessage('skattegrunnlag.tittel')}
                    </Heading>

                    {pipe(
                        props.skattegrunnlagBruker,
                        RemoteData.fold(
                            () => null,
                            () => <Loader />,
                            (error) => (
                                <SkatteApiFeilmelding tittel={formatMessage('skattegrunnlag.bruker')} error={error} />
                            ),
                            (skattegrunnlag) => (
                                <>
                                    <Label spacing size="small" className={styles.light}>
                                        {formatMessage('skattegrunnlag.lagresIkke')}
                                    </Label>
                                    <Label spacing size="small" className={classNames([styles.light, styles.italic])}>
                                        {formatMessage('skattegrunnlag.hentet', {
                                            dato: formatDateTime(skattegrunnlag.hentetDato),
                                        })}
                                    </Label>
                                    <SkattemeldingFaktablokk
                                        tittel={formatMessage('skattegrunnlag.bruker')}
                                        samletSkattegrunnlag={skattegrunnlag}
                                        formatMessage={formatMessage}
                                    />
                                </>
                            )
                        )
                    )}
                    {props.skattegrunnlagEPS &&
                        pipe(
                            props.skattegrunnlagEPS,
                            RemoteData.fold(
                                () => null,
                                () => <Loader />,
                                (error) => (
                                    <div>
                                        <Label className={styles.overskrift} spacing>
                                            {formatMessage('skattegrunnlag.eps')}
                                        </Label>
                                        <ApiErrorAlert error={error} />
                                    </div>
                                ),
                                (skattegrunnlag) => (
                                    <SkattemeldingFaktablokk
                                        tittel={formatMessage('skattegrunnlag.eps')}
                                        samletSkattegrunnlag={skattegrunnlag}
                                        formatMessage={formatMessage}
                                    />
                                )
                            )
                        )}
                </div>
            )}
        </div>
    );
};

const SkattemeldingFaktablokk = ({
    tittel,
    samletSkattegrunnlag,
    formatMessage,
}: {
    tittel: string;
    samletSkattegrunnlag: SamletSkattegrunnlag;
    formatMessage: (id: keyof typeof messages | keyof typeof skattegrunnlagMessages) => string;
}) => {
    const filtrertSkattefakta = samletSkattegrunnlag.grunnlag
        .filter((skattegrunnlag) => skattegrunnlag.beløp !== 0)
        .filter((skattegrunnlag) => skattegrunnlag.kategori.includes(SkattegrunnlagKategori.FORMUE))
        .map((skattegrunnlag) => ({
            tittel: formatSkattTekniskMessage(skattegrunnlag.navn, formatMessage),
            verdi: skattegrunnlag.beløp.toString(),
        }));

    if (filtrertSkattefakta.length === 0)
        return (
            <div>
                <Label className={styles.overskrift} spacing>
                    {tittel}
                </Label>
                <p>{formatMessage('skattegrunnlag.empty')}</p>
            </div>
        );

    return <Faktablokk tittel={tittel} fakta={filtrertSkattefakta} />;
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
        const søkersFormueFraSøknad = regnUtFormueVerdier(props.formue.vurderinger[0]?.grunnlag.søkersFormue ?? null);

        if (props.ektefelle.fnr && props.formue.vurderinger[0]?.grunnlag.epsFormue) {
            return søkersFormueFraSøknad + regnUtFormueVerdier(props.formue.vurderinger[0].grunnlag.epsFormue);
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
                                    tittel: formatMessage('input.label.borSøkerMedEktefelle'),
                                    verdi: props.ektefelle.fnr !== null ? 'Ja' : 'Nei',
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

/* Hjelpefunksjon for å håndtere att vi får ukjente tekniske navn på formue / inntekt fra skatteetaten */
const formatSkattTekniskMessage = (id: string, formatMessage: (id: keyof typeof skattegrunnlagMessages) => string) => {
    try {
        return formatMessage(id as keyof typeof skattegrunnlagMessages);
    } catch (e) {
        return id;
    }
};
