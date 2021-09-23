import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader } from '@navikt/ds-react';
import { Textarea } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi/';
import React, { useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import * as PdfApi from '~api/pdfApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Søknadsbehandlingoppsummering from '~components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';
import {
    erAvslått,
    erUnderkjent,
    erSimulert,
    erBeregnetAvslag,
    erVilkårsvurderingerVurdertAvslag,
} from '~utils/behandling/behandlingUtils';
import { createVilkårUrl, mapToVilkårsinformasjon } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import messages from './sendTilAttesteringPage-nb';
import styles from './sendTilAttesteringPage.module.less';

type Props = {
    sak: Sak;
};

const SendTilAttesteringPage = (props: Props) => {
    const { sak } = props;
    const { intl } = useI18n({ messages });

    const dispatch = useAppDispatch();
    const { sendtTilAttesteringStatus } = useAppSelector((s) => s.sak);
    const { sakId, behandlingId } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);

    const [fritekst, setFritekst] = useState('');
    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst);

    const history = useHistory();

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
        return <Alert variant="error">{intl.formatMessage({ id: 'feilmelding.fantIkkeBehandlingsId' })}</Alert>;
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

                    <Søknadsbehandlingoppsummering sak={sak} behandling={behandling} />
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
                        {RemoteData.isFailure(brevStatus) && (
                            <Alert variant="error">{intl.formatMessage({ id: 'feilmelding.brevhentingFeilet' })}</Alert>
                        )}
                        <Button
                            variant="secondary"
                            className={styles.visBrevKnapp}
                            type="button"
                            onClick={() => {
                                lastNedBrev({
                                    sakId,
                                    behandlingId: behandling.id,
                                    fritekst,
                                });
                            }}
                            size="small"
                        >
                            {intl.formatMessage({ id: 'knapp.vis' })}
                            {RemoteData.isPending(brevStatus) && <Loader />}
                        </Button>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    <Link to={tilbakeUrl} className="knapp">
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Link>
                    <Button
                        onClick={async () => {
                            const response = await dispatch(
                                sakSlice.sendTilAttestering({
                                    sakId: sak.id,
                                    behandlingId: behandlingId,
                                    fritekstTilBrev: fritekst,
                                })
                            );
                            if (sakSlice.sendTilAttestering.fulfilled.match(response)) {
                                const message = intl.formatMessage({ id: 'vedtak.sendtTilAttestering' });
                                history.push(Routes.createSakIntroLocation(message, sak.id));
                            }
                        }}
                        type="button"
                    >
                        {intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                        {RemoteData.isPending(sendtTilAttesteringStatus) && <Loader />}
                    </Button>
                </div>
                {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                    <ApiErrorAlert error={sendtTilAttesteringStatus.error} />
                )}
            </div>
        );
    }

    return <div>{intl.formatMessage({ id: 'behandling.ikkeFerdig' })}</div>;
};

export default SendTilAttesteringPage;
