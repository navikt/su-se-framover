import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe, { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Textarea } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi/';
import React, { useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import * as PdfApi from '~api/pdfApi';
import {
    erAvslått,
    erUnderkjent,
    erSimulert,
    erBeregnetAvslag,
    harBeregning,
    erVilkårsvurderingerVurdertAvslag,
} from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { createVilkårUrl, mapToVilkårsinformasjon } from '~features/saksoversikt/utils';
import { useBrevForhåndsvisning, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
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
        return <AlertStripe type="feil">{intl.formatMessage({ id: 'feilmelding.fantIkkeBehandlingsId' })}</AlertStripe>;
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
                        grunnlagsdataOgVilkårsvurderinger={behandling.grunnlagsdataOgVilkårsvurderinger}
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
                        {RemoteData.isFailure(brevStatus) && (
                            <AlertStripe type="feil">
                                {intl.formatMessage({ id: 'feilmelding.brevhentingFeilet' })}
                            </AlertStripe>
                        )}
                        <Knapp
                            className={styles.visBrevKnapp}
                            htmlType="button"
                            onClick={() => {
                                lastNedBrev({
                                    sakId,
                                    behandlingId: behandling.id,
                                    fritekst,
                                });
                            }}
                            spinner={RemoteData.isPending(brevStatus)}
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
