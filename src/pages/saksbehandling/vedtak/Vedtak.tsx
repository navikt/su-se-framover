import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Textarea } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi/';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as PdfApi from '~api/pdfApi';
import {
    erAvslått,
    erTilAttestering,
    erUnderkjent,
    erSimulert,
    erBeregnetAvslag,
    harBeregning,
    erVilkårsvurderingerVurdertAvslag,
} from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { createVilkårUrl, mapToVilkårsinformasjon } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes';
import { useAppSelector, useAppDispatch } from '~redux/Store';
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

    const [fritekst, setFritekst] = useState('');
    const [lastNedBrevStatus, setLastNedBrevStatus] = useState<RemoteData.RemoteData<ApiError, null>>(
        RemoteData.initial
    );

    const handleVisBrevClick = async () => {
        if (RemoteData.isPending(lastNedBrevStatus) || !behandling) {
            return;
        }
        setLastNedBrevStatus(RemoteData.pending);

        const res = await PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst(sakId, behandling.id, fritekst);
        if (res.status === 'ok') {
            window.open(URL.createObjectURL(res.data));
            setLastNedBrevStatus(RemoteData.success(null));
        } else {
            setLastNedBrevStatus(RemoteData.failure(res.error));
        }
    };

    const vilkårUrl = (vilkårType: Vilkårtype) => {
        return createVilkårUrl({
            sakId: sakId,
            behandlingId: behandlingId,
            vilkar: vilkårType,
        });
    };

    const sisteVurderteVilkår = behandling
        ? mapToVilkårsinformasjon(behandling.behandlingsinformasjon)
              .reverse()
              .find((vilkår) => vilkår.status !== VilkårVurderingStatus.IkkeVurdert)
        : undefined;

    const tilbakeUrl = useMemo(() => {
        if (behandling && erVilkårsvurderingerVurdertAvslag(behandling) && !erBeregnetAvslag(behandling))
            return vilkårUrl(sisteVurderteVilkår?.vilkårtype ?? Vilkårtype.PersonligOppmøte);

        return vilkårUrl(Vilkårtype.Beregning);
    }, [behandling, sisteVurderteVilkår]);

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

    if (erSimulert(behandling) || erAvslått(behandling) || erUnderkjent(behandling)) {
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
                        behandlingstatus={behandling.status}
                        søknadInnhold={behandling.søknad.søknadInnhold}
                        behandlingsinformasjon={behandling.behandlingsinformasjon}
                    />

                    {harBeregning(behandling) ? (
                        <VisBeregningOgSimulering sak={sak} behandling={behandling} />
                    ) : (
                        intl.formatMessage({ id: 'feilmelding.ikkeGjortEnBeregning' })
                    )}
                </div>
                <div className={styles.fritekstareaOuterContainer}>
                    <div className={styles.fritekstareaContainer}>
                        <Textarea
                            label={intl.formatMessage({ id: 'input.fritekst.label' })}
                            name="fritekst"
                            onChange={(e) => setFritekst(e.target.value)}
                            value={fritekst}
                            className={styles.fritekstarea}
                        />
                        {RemoteData.isFailure(lastNedBrevStatus) && (
                            <AlertStripe type="feil">
                                {intl.formatMessage({ id: 'feilmelding.brevhentingFeilet' })}
                            </AlertStripe>
                        )}
                        <Knapp
                            className={styles.visBrevKnapp}
                            htmlType="button"
                            onClick={handleVisBrevClick}
                            spinner={RemoteData.isPending(lastNedBrevStatus)}
                            mini
                        >
                            {intl.formatMessage({ id: 'knapp.vis' })}
                        </Knapp>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    <Link to={tilbakeUrl} className="knapp">
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Link>
                    <Hovedknapp
                        spinner={RemoteData.isPending(sendtTilAttesteringStatus)}
                        onClick={() =>
                            dispatch(
                                sakSlice.sendTilAttestering({
                                    sakId: sak.id,
                                    behandlingId: behandlingId,
                                    fritekstTilBrev: fritekst,
                                })
                            )
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
