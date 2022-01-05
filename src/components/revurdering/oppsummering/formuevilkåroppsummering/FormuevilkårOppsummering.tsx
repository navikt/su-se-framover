import { BodyShort } from '@navikt/ds-react';
import React from 'react';

import { Oppsummeringsverdi } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~lib/i18n';
import { FormueVilkår, VurderingsperiodeFormue } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import * as DateUtils from '~utils/date/dateUtils';

import messages from './formuevilkåroppsummering-nb';
import styles from './formuevilkåroppsummering.module.less';

const FormuevilkårOppsummering = (props: { gjeldendeFormue: FormueVilkår }) => (
    <ul>
        {props.gjeldendeFormue.vurderinger.map((vurdering) => (
            <li key={vurdering.id}>
                <Formuevurdering vurdering={vurdering} />
            </li>
        ))}
    </ul>
);

export const Formuevurdering = ({ vurdering }: { vurdering: VurderingsperiodeFormue }) => {
    const { intl } = useI18n({ messages });
    const søker = vurdering.grunnlag.søkersFormue;
    const eps = vurdering.grunnlag.epsFormue;

    return (
        <div className={styles.oppsummeringsContainer}>
            <Oppsummeringsverdi
                className={styles.gjeldendePeriode}
                label={intl.formatMessage({ id: 'gjeldendeformue.gjeldendePeriode' })}
                verdi={DateUtils.formatPeriode(vurdering.periode)}
            />
            <div className={styles.titler}>
                <BodyShort className={styles.formueVerdiTittel}>
                    {intl.formatMessage({ id: 'gjeldendeformue.søker' })}
                </BodyShort>
                {eps && (
                    <BodyShort className={styles.formueVerdiTittel}>
                        {intl.formatMessage({ id: 'gjeldendeformue.eps' })}
                    </BodyShort>
                )}
            </div>
            <Oppsummeringsverdi
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiBolig' })}
                verdi={søker.verdiIkkePrimærbolig}
                triple={eps?.verdiIkkePrimærbolig}
            />
            <Oppsummeringsverdi
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiEiendom' })}
                verdi={søker.verdiEiendommer}
                triple={eps?.verdiEiendommer}
            />
            <Oppsummeringsverdi
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiKjøretøy' })}
                verdi={søker.verdiKjøretøy}
                triple={eps?.verdiKjøretøy}
            />
            <Oppsummeringsverdi
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.innskudd' })}
                verdi={søker.innskudd}
                triple={eps?.innskudd}
            />
            <Oppsummeringsverdi
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiPapir' })}
                verdi={søker.verdipapir}
                triple={eps?.verdipapir}
            />
            <Oppsummeringsverdi
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.stårNoenIGjeldTilDeg' })}
                verdi={søker.pengerSkyldt}
                triple={eps?.pengerSkyldt}
            />
            <Oppsummeringsverdi
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.kontanter' })}
                verdi={søker.kontanter}
                triple={eps?.kontanter}
            />
            <Oppsummeringsverdi
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.depositum' })}
                verdi={søker.depositumskonto}
                triple={eps?.depositumskonto}
            />
        </div>
    );
};

export default FormuevilkårOppsummering;
