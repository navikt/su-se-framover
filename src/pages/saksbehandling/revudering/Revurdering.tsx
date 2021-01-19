import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { Beregning } from '~types/Beregning';
import { Sak } from '~types/Sak';

import { RevurderingSteg } from '../types';

import EndringAvFradrag from './endringAvFradrag/EndringAvFradrag';
import RevurderingsOppsummering from './oppsummering/RevurderingsOppsummering';
import messages from './revurdering-nb';
import styles from './revurdering.module.less';
import { createRevurderingsPath, getInnvilgedeBehandlinger } from './revurderingUtils';
import ValgAvPeriode from './valgAvPeriode/ValgAvPeriode';

export interface RevurderingFormData {
    fom: Nullable<Date>;
    tom: Nullable<Date>;
    gammelBeregning: Nullable<Beregning>;
    forventetInntekt: Nullable<number>;
    //TODO: muligens må fjernes når vi finner ut mer om hvordan brev skal fungere for revurdering
    behandlingId: Nullable<string>;
}

const Revurdering = (props: { sak: Sak }) => {
    const intl = useI18n({ messages });
    const [formData, setFormData] = useState<RevurderingFormData>({
        fom: null,
        tom: null,
        gammelBeregning: null,
        forventetInntekt: null,
        behandlingId: null,
    });

    const byttDato = (fom: Date | [Date, Date] | null, tom: Date | [Date, Date] | null) => {
        setFormData((formData) => ({
            ...formData,
            fom: Array.isArray(fom) ? fom[0] : fom,
            tom: Array.isArray(tom) ? tom[0] : tom,
        }));
    };

    const leggTilVerdi = (
        keynavn: 'gammelBeregning' | 'forventetInntekt' | 'behandlingId',
        value: string | Beregning | number
    ) => {
        setFormData((formData) => ({
            ...formData,
            [keynavn]: value,
        }));
    };

    if (props.sak.utbetalinger.length === 0) {
        return (
            <div className={styles.revurderingContainer}>
                <Innholdstittel className={styles.tittel}>
                    {intl.formatMessage({ id: 'revurdering.tittel' })}
                </Innholdstittel>
                <div className={styles.mainContentContainer}>
                    <div>
                        <Feilmelding className={styles.feilmelding}>
                            {intl.formatMessage({ id: 'revurdering.kanIkkeRevurdere' })}
                        </Feilmelding>
                    </div>
                    <div className={styles.knappContainer}>
                        <Link className="knapp" to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                            {intl.formatMessage({ id: 'knapp.avslutt' })}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Switch>
                <Route path={createRevurderingsPath(props.sak.id, RevurderingSteg.Periode)}>
                    <ValgAvPeriode
                        sak={props.sak}
                        sakId={props.sak.id}
                        innvilgedeBehandlinger={getInnvilgedeBehandlinger(props.sak)}
                        førsteUtbetalingISak={new Date(props.sak.utbetalinger[0].fraOgMed)}
                        sisteUtbetalingISak={
                            new Date(props.sak.utbetalinger[props.sak.utbetalinger.length - 1].tilOgMed)
                        }
                        periode={{ fraOgMed: formData.fom, TilOgMed: formData.tom }}
                        byttDato={byttDato}
                    />
                </Route>
                <Route path={createRevurderingsPath(props.sak.id, RevurderingSteg.EndringAvFradrag)}>
                    <EndringAvFradrag
                        sakId={props.sak.id}
                        periode={{ fom: formData.fom, tom: formData.tom }}
                        innvilgedeBehandlinger={getInnvilgedeBehandlinger(props.sak)}
                        leggTilVerdi={leggTilVerdi}
                    />
                </Route>
                <Route path={createRevurderingsPath(props.sak.id, RevurderingSteg.Oppsummering)}>
                    <RevurderingsOppsummering
                        sakId={props.sak.id}
                        gammelBeregning={formData.gammelBeregning}
                        forventetInntekt={formData.forventetInntekt}
                        //TODO: muligens må fjernes når vi finner ut mer om hvordan brev skal fungere for revurdering
                        behandlingId={formData.behandlingId}
                    />
                </Route>
            </Switch>
        </div>
    );
};

export default Revurdering;
