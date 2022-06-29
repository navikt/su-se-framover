import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import {
    FormueVilkår,
    VurderingsperiodeFormue,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import * as DateUtils from '~src/utils/date/dateUtils';

import messages from './formuevilkåroppsummering-nb';
import * as styles from './formuevilkåroppsummering.module.less';

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
    const { formatMessage } = useI18n({ messages });
    const søker = vurdering.grunnlag.søkersFormue;
    const eps = vurdering.grunnlag.epsFormue;

    return (
        <div>
            <OppsummeringPar
                className={styles.gjeldendePeriode}
                label={formatMessage('gjeldendeformue.gjeldendePeriode')}
                verdi={DateUtils.formatPeriode(vurdering.periode)}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={''}
                verdi={formatMessage('gjeldendeformue.søker')}
                triple={eps ? formatMessage('gjeldendeformue.eps') : undefined}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={formatMessage('gjeldendeformue.verdiBolig')}
                verdi={søker.verdiIkkePrimærbolig}
                triple={eps?.verdiIkkePrimærbolig}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={formatMessage('gjeldendeformue.verdiEiendom')}
                verdi={søker.verdiEiendommer}
                triple={eps?.verdiEiendommer}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={formatMessage('gjeldendeformue.verdiKjøretøy')}
                verdi={søker.verdiKjøretøy}
                triple={eps?.verdiKjøretøy}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={formatMessage('gjeldendeformue.innskudd')}
                verdi={søker.innskudd}
                triple={eps?.innskudd}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={formatMessage('gjeldendeformue.verdiPapir')}
                verdi={søker.verdipapir}
                triple={eps?.verdipapir}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={formatMessage('gjeldendeformue.stårNoenIGjeldTilDeg')}
                verdi={søker.pengerSkyldt}
                triple={eps?.pengerSkyldt}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={formatMessage('gjeldendeformue.kontanter')}
                verdi={søker.kontanter}
                triple={eps?.kontanter}
            />
            <OppsummeringPar
                className={styles.oppsummeringstriple}
                label={formatMessage('gjeldendeformue.depositum')}
                verdi={søker.depositumskonto}
                triple={eps?.depositumskonto}
            />
        </div>
    );
};

export default FormuevilkårOppsummering;
