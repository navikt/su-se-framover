import { BodyShort } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
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
            <OppsummeringPar
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
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiBolig' })}
                verdi={søker.verdiIkkePrimærbolig}
                triple={eps?.verdiIkkePrimærbolig}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiEiendom' })}
                verdi={søker.verdiEiendommer}
                triple={eps?.verdiEiendommer}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiKjøretøy' })}
                verdi={søker.verdiKjøretøy}
                triple={eps?.verdiKjøretøy}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.innskudd' })}
                verdi={søker.innskudd}
                triple={eps?.innskudd}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiPapir' })}
                verdi={søker.verdipapir}
                triple={eps?.verdipapir}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.stårNoenIGjeldTilDeg' })}
                verdi={søker.pengerSkyldt}
                triple={eps?.pengerSkyldt}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.kontanter' })}
                verdi={søker.kontanter}
                triple={eps?.kontanter}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={intl.formatMessage({ id: 'gjeldendeformue.depositum' })}
                verdi={søker.depositumskonto}
                triple={eps?.depositumskonto}
            />
        </div>
    );
};

export default FormuevilkårOppsummering;
