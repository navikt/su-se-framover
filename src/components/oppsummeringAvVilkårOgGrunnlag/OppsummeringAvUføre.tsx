import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    UføreResultat,
    UføreVilkår,
    VurderingsperiodeUføre,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvUførevilkår = (props: { uførevilkår: Nullable<UføreVilkår>; visesIVedtak?: boolean }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            <OppsummeringPar
                className={classNames(styles.oppsummeringAvResultat)}
                label={formatMessage('uførhet.vilkår.resultat')}
                verdi={formatMessage(props.uførevilkår?.resultat ?? 'uførhet.vilkår.ikkeVurdert')}
            />
            <ul>
                {props.uførevilkår?.vurderinger?.map((u) => (
                    <li
                        key={u.id}
                        className={classNames({
                            [styles.grunnlagslisteAsGrid]: !props.visesIVedtak,
                            [styles.grunnlagslisteAsFlex]: props.visesIVedtak,
                        })}
                    >
                        <VurderingsperiodeUføreOppsummering vurderingsperiodeUføre={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeUføreOppsummering = (props: { vurderingsperiodeUføre: VurderingsperiodeUføre }) => {
    const { formatMessage } = useI18n({ messages });

    switch (props.vurderingsperiodeUføre.resultat) {
        case UføreResultat.VilkårOppfylt:
            return (
                <>
                    <OppsummeringPar
                        label={formatMessage('uførhet.vilkår.erOppfylt')}
                        verdi={formatMessage('grunnlagOgVilkår.oppfylt.ja')}
                    />
                    <OppsummeringPar
                        label={formatMessage('periode')}
                        verdi={formatPeriode(props.vurderingsperiodeUføre.periode)}
                    />
                    <OppsummeringPar
                        label={formatMessage('uførhet.grunnlag.uføregrad')}
                        verdi={`${props.vurderingsperiodeUføre.grunnlag?.uføregrad}%`}
                    />
                    <OppsummeringPar
                        label={formatMessage('uførhet.grunnlag.forventetInntekt')}
                        verdi={props.vurderingsperiodeUføre.grunnlag?.forventetInntekt}
                    />
                </>
            );
        case UføreResultat.VilkårIkkeOppfylt:
            return (
                <>
                    <OppsummeringPar
                        label={formatMessage('uførhet.vilkår.erOppfylt')}
                        verdi={formatMessage('grunnlagOgVilkår.ikkeOppfylt.nei')}
                    />
                    <OppsummeringPar
                        label={formatMessage('periode')}
                        verdi={formatPeriode(props.vurderingsperiodeUføre.periode)}
                    />
                </>
            );
        case UføreResultat.HarUføresakTilBehandling:
            return (
                <>
                    <OppsummeringPar
                        label={formatMessage('uførhet.vilkår.erOppfylt')}
                        verdi={formatMessage('grunnlagOgVilkår.uavklart')}
                    />
                    <OppsummeringPar
                        label={formatMessage('periode')}
                        verdi={formatPeriode(props.vurderingsperiodeUføre.periode)}
                    />
                </>
            );
    }
};

export default OppsummeringAvUførevilkår;
