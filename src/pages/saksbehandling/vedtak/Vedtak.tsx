import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Innholdstittel } from 'nav-frontend-typografi/';
import React from 'react';
import { Link } from 'react-router-dom';

import { erAvslått, erTilAttestering, harBeregning } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { createVilkårUrl, mapToVilkårsinformasjon } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes.ts';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { Behandlingsstatus } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import { BehandlingStatus } from '../behandlingsoppsummering/behandlingsoppsummering';
import VisBeregningOgSimulering from '../steg/beregningOgSimulering/BeregningOgSimulering';
import VilkårsOppsummering from '../vilkårsOppsummering/VilkårsOppsummering';

import messages from './vedtak-nb';
import styles from './vedtak.module.less';

type Props = {
    sak: Sak;
};

const Vedtak = (props: Props) => {
    const { sak } = props;
    const intl = useI18n({ messages });

    const dispatch = useAppDispatch();
    const { sendtTilAttesteringStatus } = useAppSelector((s) => s.sak);
    const { sakId, behandlingId } = routes.useRouteParams<typeof routes.saksoversiktValgtBehandling>();
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);

    if (!behandling) {
        return <AlertStripe type="feil">{intl.formatMessage({ id: 'feilmelding.fantIkkeBehandlingsId' })}</AlertStripe>;
    }

    if (erTilAttestering(behandling)) {
        return (
            <AlertStripeSuksess className={styles.vedtakSendtTilAttesteringAlertStripe}>
                <p>{intl.formatMessage({ id: 'vedtak.sendtTilAttestering' })}</p>
                <Link to={routes.saksoversiktIndex.createURL()}>
                    {intl.formatMessage({ id: 'vedtak.sendtTilAttestering.lenkeSaksoversikt' })}
                </Link>
            </AlertStripeSuksess>
        );
    }

    const vilkårUrl = (vilkårType: Vilkårtype) => {
        return createVilkårUrl({
            sakId: sakId,
            behandlingId: behandlingId,
            vilkar: vilkårType,
        });
    };

    const sisteVurderteVilkår = mapToVilkårsinformasjon(behandling.behandlingsinformasjon)
        .reverse()
        .find((vilkår) => vilkår.status !== VilkårVurderingStatus.IkkeVurdert);

    if (behandling.status === Behandlingsstatus.SIMULERT || erAvslått(behandling)) {
        return (
            <div className={styles.vedtakContainer}>
                <div>
                    <div className={styles.tittelContainer}>
                        <Innholdstittel className={styles.pageTittel}>
                            {intl.formatMessage({ id: 'page.tittel' })}
                        </Innholdstittel>
                    </div>

                    <BehandlingStatus sakId={sak.id} behandling={behandling} />

                    <VilkårsOppsummering
                        søknadInnhold={behandling.søknad.søknadInnhold}
                        behandlingsinformasjon={behandling.behandlingsinformasjon}
                    />

                    {harBeregning(behandling) ? (
                        <VisBeregningOgSimulering sak={sak} behandling={behandling} />
                    ) : (
                        <>{intl.formatMessage({ id: 'feilmelding.ikkeGjortEnBeregning' })}</>
                    )}
                </div>
                <div className={styles.navigeringContainer}>
                    <Link
                        to={
                            erAvslått(behandling) && behandling.status !== Behandlingsstatus.BEREGNET_AVSLAG
                                ? vilkårUrl(sisteVurderteVilkår?.vilkårtype ?? Vilkårtype.PersonligOppmøte)
                                : vilkårUrl(Vilkårtype.Beregning)
                        }
                        className="knapp"
                    >
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Link>
                    <Hovedknapp
                        spinner={RemoteData.isPending(sendtTilAttesteringStatus)}
                        onClick={() =>
                            dispatch(sakSlice.sendTilAttestering({ sakId: sak.id, behandlingId: behandlingId }))
                        }
                        htmlType="button"
                    >
                        {intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                    </Hovedknapp>
                </div>
                {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                    <AlertStripeFeil>
                        <div>
                            {intl.formatMessage({ id: 'feilmelding.sendingFeilet' })}
                            <p>
                                {intl.formatMessage({ id: 'feilmelding.errorkode' })}{' '}
                                {sendtTilAttesteringStatus.error.statusCode}
                            </p>
                        </div>
                    </AlertStripeFeil>
                )}
            </div>
        );
    }

    return <div>{intl.formatMessage({ id: 'behandling.ikkeFerdig' })}</div>;
};

export default Vedtak;
