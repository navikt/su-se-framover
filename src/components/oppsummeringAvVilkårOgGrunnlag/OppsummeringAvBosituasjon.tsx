import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Bosituasjon } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvBosituasjon = (props: { bosituasjon: Bosituasjon[]; visesIVedtak?: boolean }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            <ul>
                {props.bosituasjon.map((b) => (
                    <li
                        key={`${b.periode.fraOgMed}-${b.periode.tilOgMed}`}
                        className={classNames({
                            [styles.grunnlagslisteAsGrid]: !props.visesIVedtak,
                            [styles.grunnlagslisteAsFlex]: props.visesIVedtak,
                        })}
                    >
                        <OppsummeringPar
                            label={formatMessage('bosituasjon.sats')}
                            verdi={formatMessage(`bosituasjon.${b.sats as `ORDINÆR` | 'HØY'}`)}
                        />
                        <OppsummeringPar label={formatMessage('periode')} verdi={formatPeriode(b.periode)} />
                        <OppsummeringPar
                            label={formatMessage('bosituasjon.harEPS')}
                            verdi={formatMessage(`bool.${b.fnr !== null}`)}
                        />
                        {b.fnr !== null && (
                            <>
                                <OppsummeringPar label={formatMessage('bosituasjon.eps.fnr')} verdi={b.fnr} />
                                <OppsummeringPar
                                    label={formatMessage('bosituasjon.eps.erEpsUførFlyktning')}
                                    verdi={formatMessage(`bool.${b.ektemakeEllerSamboerUførFlyktning !== null}`)}
                                />
                            </>
                        )}
                        <OppsummeringPar
                            label={formatMessage('bosituasjon.delerBolig')}
                            verdi={formatMessage(`bool.${b.delerBolig !== null}`)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OppsummeringAvBosituasjon;
