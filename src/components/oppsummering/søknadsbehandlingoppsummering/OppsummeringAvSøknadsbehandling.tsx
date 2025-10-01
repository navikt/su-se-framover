import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader , Textarea } from '@navikt/ds-react';
import classNames from 'classnames';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Controller , useForm } from '~node_modules/react-hook-form';
import * as PdfApi from '~src/api/pdfApi';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext.tsx';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { useApiCall, useBrevForhåndsvisning , useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes.ts';
import { Sak, Sakstype } from '~src/types/Sak.ts';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { formatDate } from '~src/utils/date/dateUtils';
import { formatPeriode } from '~src/utils/periode/periodeUtils';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';

import ApiErrorAlert from '../../apiErrorAlert/ApiErrorAlert';
import UnderkjenteAttesteringer from '../../underkjenteAttesteringer/UnderkjenteAttesteringer';
import UføreVarsler from '../OppsummeringAvAldersvurdering/OppsummeringAvAldersvurdering';
import OppsummeringAvBeregningOgSimulering from '../oppsummeringAvBeregningOgsimulering/OppsummeringAvBeregningOgSimulering';
import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, { Oppsummeringsfarge, Oppsummeringsikon } from '../oppsummeringspanel/Oppsummeringspanel';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '../sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';

import messages from './OppsummeringAvSøknadsbehandling-nb';
import styles from './OppsummeringAvSøknadsbehandling.module.less';



interface FormData {
    fritekst: string;
}

const OppsummeringAvSøknadsbehandling = (props: {
    sak: Sak;
    behandling: Søknadsbehandling;
    medBrevutkast?: { sakId: string };
}) => {
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();
    const [oppsummeringAvSøknadStatus, oppsummeringAvSøknad] = useAsyncActionCreator(
        SøknadsbehandlingActions.sendTilAttestering,
    );
    const [hentBrevutkastStatus] = useApiCall(PdfApi.fetchBrevutkastForSøknadsbehandling);
    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst);
    const underkjenteAttesteringer = props.behandling.attesteringer.filter((att) => att.underkjennelse != null);
    const { behandlingId = '' } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = props.sak?.behandlinger.find((x: { id: string }) => x.id === behandlingId);
    const initialValues: FormData = { fritekst: behandling?.fritekstTilBrev ?? '' };
    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        'SendTilAttesteringPage',
        ({ fritekst }) => fritekst === initialValues.fritekst,
    );
    const form = useForm({
        defaultValues: draft ?? initialValues,
    });
    useDraftFormSubscribe(form.watch);
    const [showInput, setShowInput] = useState(false);
    const handleSubmit = async (values: FormData) => {
        oppsummeringAvSøknad(
            {
                sakId: props.sak.id,
                behandlingId: props.behandling.id,
                fritekstTilBrev: values.fritekst,
            },
            () => {
                clearDraft();
                const message = formatMessage('vedtak.oppsummeringAvSøknad');
                Routes.navigateToSakIntroWithMessage(navigate, message, props.sak.id);
            },
        );
    };
    return (
        <div className={styles.oppsummeringsContainer}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('oppsummering.søknadsbehandling')}
            >
                <div className={classNames({ [styles.headerContainer]: underkjenteAttesteringer.length > 0 })}>
                    <div className={styles.tilleggsinfoContainer}>
                        <OppsummeringPar
                            label={formatMessage('vurdering.tittel')}
                            verdi={formatMessage(props.behandling.status)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandlet.av')}
                            verdi={props.behandling.saksbehandler ?? formatMessage('feil.fantIkkeSaksbehandlerNavn')}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandling.søknadsdato')}
                            verdi={søknadMottatt(props.behandling.søknad)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandling.saksbehandlingStartet')}
                            verdi={formatDate(props.behandling.opprettet)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('virkningstidspunkt.tittel')}
                            verdi={formatPeriode(props.behandling.stønadsperiode!.periode)}
                            retning={'vertikal'}
                        />
                        {props.behandling.omgjøringsårsak && props.behandling.omgjøringsgrunn && (
                            <>
                                <OppsummeringPar
                                    label={formatMessage('label.årsak')}
                                    verdi={formatMessage(props.behandling.omgjøringsårsak)}
                                    retning={'vertikal'}
                                />
                                <OppsummeringPar
                                    label={formatMessage('label.omgjøring')}
                                    verdi={formatMessage(props.behandling.omgjøringsgrunn)}
                                    retning={'vertikal'}
                                />
                            </>
                        )}
                    </div>
                    {props.medBrevutkast && (
                        <div className={styles.brevContainer}>
                            <div>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() =>
                                        lastNedBrev({
                                            sakId: props.medBrevutkast!.sakId,
                                            behandlingId: props.behandling.id,
                                            fritekst: form.getValues().fritekst,
                                        })
                                    }
                                    loading={RemoteData.isPending(hentBrevutkastStatus)}
                                >
                                    {formatMessage('knapp.vis')}
                                </Button>
                                {RemoteData.isFailure(hentBrevutkastStatus) && (
                                    <ApiErrorAlert error={hentBrevutkastStatus.error} />
                                )}
                                <form className={styles.vedtakContainer} onSubmit={form.handleSubmit(handleSubmit)}>
                                    <div className={styles.fritekstareaOuterContainer}>
                                        <div className={styles.fritekstareaContainer}>
                                            {RemoteData.isFailure(brevStatus) && (
                                                <Alert variant="error">
                                                    {formatMessage('feilmelding.brevhentingFeilet')}
                                                </Alert>
                                            )}{' '}
                                            <div>
                                                {!showInput ? (
                                                    <Button
                                                        variant="secondary"
                                                        className={styles.redigerKnapp}
                                                        type="button"
                                                        onClick={() => {
                                                            setShowInput(true);
                                                        }}
                                                        size="small"
                                                    >
                                                        {formatMessage('knapp.rediger')}
                                                        {RemoteData.isPending(brevStatus) && <Loader />}
                                                    </Button>
                                                ) : (
                                                    <Controller
                                                        control={form.control}
                                                        name="fritekst"
                                                        render={({ field, fieldState }) => (
                                                            <Textarea
                                                                className={styles.fritekst}
                                                                label={formatMessage('input.fritekst.label')}
                                                                error={fieldState.error?.message}
                                                                {...field}
                                                            />
                                                        )}
                                                    />
                                                )}
                                                {RemoteData.isFailure(brevStatus) && (
                                                    <Alert variant="error">
                                                        {formatMessage('feilmelding.brevhentingFeilet')}
                                                    </Alert>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    {underkjenteAttesteringer.length > 0 && (
                        <div className={styles.underkjenteAttesteringerContainer}>
                            <UnderkjenteAttesteringer attesteringer={props.behandling.attesteringer} />
                        </div>
                    )}
                    {props.behandling.aldersvurdering && props.behandling.sakstype === Sakstype.Uføre && (
                        <UføreVarsler a={props.behandling.aldersvurdering} />
                    )}
                    {RemoteData.isFailure(oppsummeringAvSøknadStatus) && (
                        <ApiErrorAlert error={oppsummeringAvSøknadStatus.error} />
                    )}
                </div>

                <div className={styles.sidestiltOppsummeringContainer}>
                    <SidestiltOppsummeringAvVilkårOgGrunnlag
                        grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                        visesSidestiltMed={props.behandling.søknad.søknadInnhold}
                        eksterneGrunnlag={props.behandling.eksterneGrunnlag}
                        sakstype={props.behandling.sakstype}
                    />
                </div>
            </Oppsummeringspanel>

            <OppsummeringAvBeregningOgSimulering
                eksterngrunnlagSkatt={props.behandling.eksterneGrunnlag.skatt}
                beregning={props.behandling.beregning}
                simulering={props.behandling.simulering}
            />
        </div>
    );
};

export default OppsummeringAvSøknadsbehandling;
