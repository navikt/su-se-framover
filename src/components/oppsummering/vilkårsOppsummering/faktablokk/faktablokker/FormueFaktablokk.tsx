import classNames from 'classnames';
import AlertStripe from 'nav-frontend-alertstriper';
import { Element } from 'nav-frontend-typografi';
import React, { useMemo } from 'react';
import { IntlShape } from 'react-intl';

import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import saksbehandlingMessages from '~pages/saksbehandling/søknadsbehandling/formue/formue-nb';
import { Behandlingsinformasjon, FormueStatus } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';
import { formatCurrency } from '~utilsLOL/format/formatUtils';
import {
    kalkulerFormueFraSøknad,
    regnUtFormueVerdier,
    totalVerdiKjøretøy,
} from '~utilsLOL/søknadsbehandling/formue/formueUtils';
import { delerBoligMedFormatted } from '~utilsLOL/søknadsbehandling/søknadsbehandlingUtils';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~utilsLOL/søknadsbehandling/vilkår/vilkårUtils';

import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { Fakta, FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';
import { FaktablokkProps } from './faktablokkUtils';

export const FormueFaktablokk = (props: FaktablokkProps) => {
    const { intl } = useI18n({ messages });

    const totalFormueFraSøknad = useMemo(() => {
        const søkersFormueFraSøknad = kalkulerFormueFraSøknad(props.søknadInnhold.formue);

        if (props.søknadInnhold.ektefelle) {
            return søkersFormueFraSøknad + kalkulerFormueFraSøknad(props.søknadInnhold.ektefelle.formue);
        }

        return søkersFormueFraSøknad;
    }, [props.søknadInnhold.formue]);

    const message = (s: keyof typeof messages) => intl.formatMessage({ id: s });

    return (
        <div>
            <Faktablokk
                tittel={message('display.fraSøknad')}
                fakta={[
                    {
                        tittel: message('formue.tittel'),
                        verdi: (
                            <div
                                className={classNames(styles.formueForBrukerOgEps, styles.formueForBrukerOgEpsHeading)}
                            >
                                <span className={styles.søker}>{message('formue.heading.søker')}</span>
                                {props.søknadInnhold.boforhold.ektefellePartnerSamboer !== null && (
                                    <span className={classNames(styles.eps, styles.breakPls)}>
                                        {message('formue.heading.eps')}
                                    </span>
                                )}
                            </div>
                        ),
                    },
                    ...søknadsfakta(props.søknadInnhold, intl),
                    FaktaSpacing,
                    {
                        tittel: intl.formatMessage({ id: 'formue.totalt' }),
                        verdi: formatCurrency(totalFormueFraSøknad),
                    },
                    FaktaSpacing,
                    {
                        tittel: message('formue.delerBoligMed'),
                        verdi: props.søknadInnhold.boforhold.delerBoligMed
                            ? delerBoligMedFormatted(props.søknadInnhold.boforhold.delerBoligMed)
                            : intl.formatMessage({ id: 'formue.delerBoligMed.ingen' }),
                    },
                    ...(props.søknadInnhold.boforhold.ektefellePartnerSamboer === null
                        ? []
                        : [
                              {
                                  tittel: message('formue.epsFnr'),
                                  verdi: props.søknadInnhold.boforhold.ektefellePartnerSamboer.fnr,
                              },
                          ]),
                ]}
            />
        </div>
    );
};

function søknadsfakta(innhold: SøknadInnhold, intl: IntlShape): Fakta[] {
    const message = (s: keyof typeof messages) => intl.formatMessage({ id: s });

    return [
        {
            tittel: message('formue.verdiPåBolig'),
            verdi: innhold.formue.verdiPåBolig,
            epsVerdi: innhold.ektefelle?.formue.verdiPåBolig,
        },
        {
            tittel: message('formue.verdiPåEiendom'),
            verdi: innhold.formue.verdiPåEiendom,
            epsVerdi: innhold.ektefelle?.formue.verdiPåBolig,
        },
        {
            tittel: message('formue.verdiPåKjøretøy'),
            verdi: innhold.formue.kjøretøy ? totalVerdiKjøretøy(innhold.formue.kjøretøy) : 0,
            epsVerdi: innhold.ektefelle?.formue.kjøretøy ? totalVerdiKjøretøy(innhold.ektefelle.formue.kjøretøy) : 0,
        },
        {
            tittel: message('formue.innskuddsbeløp'),
            verdi: innhold.formue.innskuddsBeløp,
            epsVerdi: innhold.ektefelle?.formue.innskuddsBeløp,
        },
        {
            tittel: message('formue.verdipapirbeløp'),
            verdi: innhold.formue.verdipapirBeløp,
            epsVerdi: innhold.ektefelle?.formue.verdipapirBeløp,
        },
        {
            tittel: message('formue.kontanter'),
            verdi: innhold.formue.kontanterBeløp,
            epsVerdi: innhold.ektefelle?.formue.kontanterBeløp,
        },
        {
            tittel: message('formue.skylderNoenSøkerPengerBeløp'),
            verdi: innhold.formue.skylderNoenMegPengerBeløp,
            epsVerdi: innhold.ektefelle?.formue.skylderNoenMegPengerBeløp,
        },
        {
            tittel: message('formue.depositumsBeløp'),
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

function saksbehandlingfakta(info: Behandlingsinformasjon['formue'], intl: IntlShape): Fakta[] {
    const message = (s: keyof typeof messages) => intl.formatMessage({ id: s });

    return [
        {
            tittel: message('formue.verdiPåBolig'),
            verdi: info?.verdier?.verdiIkkePrimærbolig,
            epsVerdi: info?.epsVerdier?.verdiIkkePrimærbolig,
        },
        {
            tittel: message('formue.verdiPåEiendom'),
            verdi: info?.verdier?.verdiEiendommer,
            epsVerdi: info?.epsVerdier?.verdiEiendommer,
        },
        {
            tittel: message('formue.verdiPåKjøretøy'),
            verdi: info?.verdier?.verdiKjøretøy,
            epsVerdi: info?.epsVerdier?.verdiKjøretøy,
        },
        {
            tittel: message('formue.innskuddsbeløp'),
            verdi: info?.verdier?.innskudd,
            epsVerdi: info?.epsVerdier?.innskudd,
        },
        {
            tittel: message('formue.verdipapirbeløp'),
            verdi: info?.verdier?.verdipapir,
            epsVerdi: info?.epsVerdier?.verdipapir,
        },
        {
            tittel: message('formue.kontanter'),
            verdi: info?.verdier?.kontanter,
            epsVerdi: info?.epsVerdier?.kontanter,
        },
        {
            tittel: message('formue.skylderNoenSøkerPengerBeløp'),
            verdi: info?.verdier?.pengerSkyldt,
            epsVerdi: info?.epsVerdier?.pengerSkyldt,
        },
        {
            tittel: message('formue.depositumsBeløp'),
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

function formuelinje(f: { harEktefelle: boolean; tittel: string; verdi: number; epsVerdi: number }) {
    return {
        tittel: f.tittel,
        verdi: f.harEktefelle ? (
            <div className={styles.formueForBrukerOgEps}>
                <span className={styles.søker}>{formatCurrency(f.verdi ?? 0)}</span>
                <span className={styles.eps}>{formatCurrency(f.epsVerdi ?? 0)}</span>
            </div>
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
    const { intl } = useI18n({
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

    const message = (s: keyof typeof messages) => intl.formatMessage({ id: s });
    const saksbehandlingMessage = (s: keyof typeof saksbehandlingMessages) => intl.formatMessage({ id: s });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<FormueFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.formue === null ? (
                    <AlertStripe type="info">{message('display.ikkeVurdert')}</AlertStripe>
                ) : (
                    <div>
                        <Faktablokk
                            tittel={message('display.fraSaksbehandling')}
                            fakta={[
                                {
                                    tittel: message('formue.tittel'),
                                    verdi: (
                                        <div
                                            className={classNames(
                                                styles.formueForBrukerOgEps,
                                                styles.formueForBrukerOgEpsHeading
                                            )}
                                        >
                                            <span className={styles.søker}>{message('formue.heading.søker')}</span>
                                            {props.formue.borSøkerMedEPS && (
                                                <span className={classNames(styles.eps, styles.breakPls)}>
                                                    {message('formue.heading.eps')}
                                                </span>
                                            )}
                                        </div>
                                    ),
                                },
                                ...saksbehandlingfakta(props.formue, intl),
                                FaktaSpacing,
                                {
                                    tittel: message('formue.totalt'),
                                    verdi: formatCurrency(totalFormue),
                                },
                                FaktaSpacing,
                                {
                                    tittel: saksbehandlingMessage('input.label.borSøkerMedEktefelle'),
                                    verdi: props.formue.borSøkerMedEPS ? 'Ja' : 'Nei',
                                },
                                ...(props.ektefelle.fnr
                                    ? [
                                          {
                                              tittel: saksbehandlingMessage('input.label.ektefellesFødselsnummer'),
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
                                    <Element>{saksbehandlingMessage('display.vilkårOppfylt')}</Element>
                                    <p>{saksbehandlingMessage('display.vilkårOppfyltGrunn')}</p>
                                </>
                            ) : props.formue.status === FormueStatus.VilkårIkkeOppfylt ? (
                                <>
                                    <p>{saksbehandlingMessage('display.vilkårIkkeOppfylt')}</p>
                                    <p>{saksbehandlingMessage('display.vilkårIkkeOppfyltGrunn')}</p>
                                </>
                            ) : (
                                <>
                                    <p>{message('fraSøknad.uavklart')}</p>
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
