import { lastDayOfMonth } from 'date-fns';
import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { Link, Route, Switch, useHistory } from 'react-router-dom';

import * as revurderingSlice from '~features/revurdering/revurdering.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { useAppDispatch } from '~redux/Store';
import { FradragTilhører, Periode } from '~types/Fradrag';
import { Revurdering as RevurderingType } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import { FradragFormData } from '../steg/beregningOgSimulering/beregning/FradragInputs';
import { RevurderingSteg } from '../types';

import EndringAvFradrag from './endringAvFradrag/EndringAvFradrag';
import RevurderingsOppsummering from './oppsummering/RevurderingsOppsummering';
import messages from './revurdering-nb';
import styles from './revurdering.module.less';
import {
    createRevurderingsPath,
    erPeriodenFremoverITid,
    erRevurderingSimulert,
    harKunEnBehandlingInnenforRevurderingsperiode,
} from './revurderingUtils';
import ValgAvPeriode from './valgAvPeriode/ValgAvPeriode';
import { VisFeilmelding } from './VisFeilMelding';

export interface RevurderingFormData {
    periode: Nullable<{
        fraOgMed: Date;
        tilOgMed: Date;
    }>;
    revurdering: Nullable<RevurderingType>;
}

const Revurdering = (props: { sak: Sak }) => {
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [formData, setFormData] = useState<RevurderingFormData>({
        periode: null,
        revurdering: null,
    });

    const revurderingHarGyldigPeriode = (periode: Nullable<Periode>): periode is Nullable<Periode> & Periode => {
        if (!periode) {
            return false;
        }

        return (
            erPeriodenFremoverITid(periode) &&
            harKunEnBehandlingInnenforRevurderingsperiode(props.sak.behandlinger, periode)
        );
    };

    const opprettRevurderingHvisPeriodenErGyldig = async (periode: Nullable<Periode>) => {
        if (revurderingHarGyldigPeriode(periode)) {
            const response = await dispatch(
                revurderingSlice.opprettRevurdering({
                    sakId: props.sak.id,
                    periode: periode,
                })
            );

            if (revurderingSlice.opprettRevurdering.fulfilled.match(response)) {
                setFormData({
                    periode: periode,
                    revurdering: response.payload,
                });

                history.push(
                    Routes.revurderValgtSak.createURL({
                        sakId: props.sak.id,
                        steg: RevurderingSteg.EndringAvFradrag,
                    })
                );
            }
        }
    };

    const beregnOgSimulerRevurdering = async (fradrag: FradragFormData[]) => {
        if (!formData.periode || !formData.revurdering) return;

        const response = await dispatch(
            revurderingSlice.beregnOgSimuler({
                sakId: props.sak.id,
                revurderingId: formData.revurdering.id,
                //valdiering sikrer at feltet ikke er null
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                periode: {
                    fraOgMed: formData?.periode.fraOgMed.toISOString(),
                    tilOgMed: lastDayOfMonth(formData.periode.tilOgMed).toISOString(),
                },
                fradrag: fradrag.map((f: FradragFormData) => ({
                    periode:
                        f.periode?.fraOgMed && f.periode.tilOgMed
                            ? { fraOgMed: f.periode.fraOgMed, tilOgMed: f.periode.tilOgMed }
                            : null,
                    beløp: Number.parseInt(f.beløp!, 10),
                    type: f.type!,
                    utenlandskInntekt: f.fraUtland
                        ? {
                              beløpIUtenlandskValuta: Number.parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
                              valuta: f.utenlandskInntekt.valuta,
                              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
                          }
                        : null,
                    tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                })),
            })
        );
        if (revurderingSlice.beregnOgSimuler.fulfilled.match(response)) {
            setFormData((values) => ({ ...values, revurdering: response.payload }));

            history.push(
                Routes.revurderValgtSak.createURL({ sakId: props.sak.id, steg: RevurderingSteg.Oppsummering })
            );
        }
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
                        sakId={props.sak.id}
                        førsteUtbetalingISak={new Date(props.sak.utbetalinger[0].fraOgMed)}
                        sisteUtbetalingISak={
                            new Date(props.sak.utbetalinger[props.sak.utbetalinger.length - 1].tilOgMed)
                        }
                        opprettRevurderingHvisPeriodenErGyldig={opprettRevurderingHvisPeriodenErGyldig}
                        periode={formData.periode}
                    />
                </Route>
                <Route path={createRevurderingsPath(props.sak.id, RevurderingSteg.EndringAvFradrag)}>
                    {formData.periode && formData.revurdering ? (
                        <EndringAvFradrag
                            sakId={props.sak.id}
                            periode={formData.periode}
                            revurdering={formData.revurdering}
                            beregnOgSimulerRevurdering={beregnOgSimulerRevurdering}
                        />
                    ) : (
                        <VisFeilmelding forrigeURL={createRevurderingsPath(props.sak.id, RevurderingSteg.Periode)} />
                    )}
                </Route>
                <Route path={createRevurderingsPath(props.sak.id, RevurderingSteg.Oppsummering)}>
                    {formData.revurdering && erRevurderingSimulert(formData.revurdering) ? (
                        <RevurderingsOppsummering sakId={props.sak.id} revurdering={formData.revurdering} />
                    ) : (
                        <VisFeilmelding
                            forrigeURL={createRevurderingsPath(props.sak.id, RevurderingSteg.EndringAvFradrag)}
                        />
                    )}
                </Route>
            </Switch>
        </div>
    );
};

export default Revurdering;
