import * as RemoteData from '@devexperts/remote-data-ts';
import { Gender, PersonCard } from '@navikt/nap-person-card';
import { useFormik } from 'formik';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Feiloppsummering, RadioPanelGruppe, Select, Textarea } from 'nav-frontend-skjema';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React, { useMemo, useState } from 'react';

import * as Routes from '~/lib/routes';
import { fetchBrev } from '~api/pdfApi';
import { Person } from '~api/personApi';
import { PersonAdvarsel } from '~components/PersonAdvarsel';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { erAvslått, erIverksatt, erTilAttestering } from '~features/behandling/behandlingUtils';
import { getGender, showName } from '~features/person/personUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { mapToVilkårsinformasjon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { VisSimulering } from '~pages/saksbehandling/simulering/simulering';
import VisBeregning from '~pages/saksbehandling/steg/beregning/VisBeregning';
import Søkefelt from '~pages/saksbehandling/søkefelt/Søkefelt';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import messages from './attestering-nb';
import styles from './attestering.module.less';

const VilkårsOppsummering = (props: { behandling: Behandling }) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(props.behandling.behandlingsinformasjon);

    return (
        <div>
            <Innholdstittel className={styles.tittel}>Vilkårsvurderinger</Innholdstittel>
            {vilkårsinformasjon.map((v) => (
                <VilkårsvurderingInfoLinje
                    type={v.vilkårtype}
                    status={v.status}
                    key={v.vilkårtype}
                    begrunnelse={v.begrunnelse}
                />
            ))}
        </div>
    );
};

const VilkårsvurderingInfoLinje = (props: {
    type: Vilkårtype;
    status: VilkårVurderingStatus;
    begrunnelse?: Nullable<string>;
}) => {
    return (
        <div className={styles.infolinjeContainer}>
            <div className={styles.infolinje}>
                <span className={styles.statusContainer}>
                    <VilkårvurderingStatusIcon className={styles.statusIcon} status={props.status} />
                </span>
                <div>
                    <span className={styles.infotittel}>{vilkårTittelFormatted(props.type)}:</span>
                    <p>{props.begrunnelse ?? ''}</p>
                </div>
            </div>
        </div>
    );
};

const VisDersomSimulert = (props: { sak: Sak; behandling: Behandling }) => {
    if (props.behandling.beregning && !erAvslått(props.behandling)) {
        return (
            <div className={styles.beregningOgOppdragContainer}>
                <div className={styles.beregningContainer}>
                    <VisBeregning
                        beregning={props.behandling.beregning}
                        forventetinntekt={props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt ?? 0}
                    />
                </div>
                <div>
                    <Innholdstittel>Oppdragssimulering</Innholdstittel>
                    <VisSimulering sak={props.sak} behandling={props.behandling} />
                </div>
            </div>
        );
    }
    return <>Det er ikke gjort en beregning</>;
};
enum Grunn {
    FEIL_I_BEREGNING = 'FEIL_I_BEREGNING',
    FEIL_I_PERIODE = 'FEIL_I_PERIODE',
}
interface FormData {
    beslutning?: boolean;
    grunn?: string;
    begrunnelse?: string;
}
const Attestering = () => {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const attesteringStatus = useAppSelector((s) => s.sak.attesteringStatus);
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.attestering>();
    const { søker, sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));

    if (!RemoteData.isSuccess(sak)) {
        return <AlertStripe type="feil">Fant ikke sak</AlertStripe>;
    }
    const behandling = sak.value.behandlinger.find((x) => x.id === urlParams.behandlingId);
    if (!behandling) {
        return <AlertStripe type="feil">Fant ikke behandlingsid</AlertStripe>;
    }
    const formik = useFormik<FormData>({
        initialValues: {},
        onSubmit: (values) => {
            if (values.beslutning) {
                dispatch(
                    sakSlice.startAttestering({
                        sakId: sak.value.id,
                        behandlingId: behandling.id,
                    })
                );
                return;
            }

            if (values.begrunnelse) {
                dispatch(
                    sakSlice.attesteringUnderkjenn({
                        sakId: sak.value.id,
                        behandlingId: behandling.id,
                        begrunnelse: values.begrunnelse,
                    })
                );
            }
        },
        validationSchema: yup.object<FormData>({
            beslutning: yup.boolean().required(),
            grunn: yup.mixed<keyof typeof Grunn>().when('beslutning', {
                is: false,
                then: yup.mixed<keyof typeof Grunn>().oneOf([Grunn.FEIL_I_BEREGNING, Grunn.FEIL_I_PERIODE]).required(),
            }),

            begrunnelse: yup.string(),
        }),
        validateOnChange: hasSubmitted,
    });

    const { errors } = formik;
    if (!erTilAttestering(behandling) && !erIverksatt(behandling)) {
        return <div>Behandlingen er ikke klar for attestering.</div>;
    }

    const gender = useMemo<Gender>(() => getGender(søker), [søker._tag]);

    return (
        <>
            <div className={styles.headerContainer}>
                {pipe(
                    søker,
                    RemoteData.fold(
                        () => null,
                        () => null,
                        () => null,
                        (s: Person) => (
                            <>
                                <PersonCard
                                    fodselsnummer={s.fnr}
                                    gender={gender}
                                    name={showName(s)}
                                    renderLabelContent={(): JSX.Element => <PersonAdvarsel person={s} />}
                                />
                                <Søkefelt />
                            </>
                        )
                    )
                )}
            </div>
            <div>
                <div className={styles.vedtakContainer}>
                    <Innholdstittel>Vedtak</Innholdstittel>
                    <div>
                        {!erAvslått(behandling) && <AlertStripeSuksess>{behandling.status}</AlertStripeSuksess>}
                        {erAvslått(behandling) && <AlertStripeFeil>{behandling.status}</AlertStripeFeil>}
                    </div>
                    <div>
                        <VilkårsOppsummering behandling={behandling} />
                    </div>
                    <div>
                        <VisDersomSimulert sak={sak.value} behandling={behandling} />
                    </div>
                    <div>
                        <Innholdstittel>Vis brev kladd</Innholdstittel>
                        <Knapp
                            onClick={() =>
                                fetchBrev(sak.value.id, urlParams.behandlingId).then((res) => {
                                    if (res.status === 'ok') window.open(URL.createObjectURL(res.data));
                                })
                            }
                        >
                            Last ned brev
                        </Knapp>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    {erTilAttestering(behandling) && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formik.handleSubmit();
                                setHasSubmitted(true);
                            }}
                        >
                            <RadioPanelGruppe
                                className={styles.sats}
                                name={intl.formatMessage({ id: 'attestering.beslutning' })}
                                legend={intl.formatMessage({ id: 'attestering.beslutning' })}
                                radios={[
                                    {
                                        label: intl.formatMessage({ id: 'attestering.beslutning.godkjenn' }),
                                        value: 'godkjenn',
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'attestering.beslutning.revurder' }),
                                        value: 'revurder',
                                    },
                                ]}
                                checked={
                                    formik.values.beslutning
                                        ? 'godkjenn'
                                        : formik.values.beslutning === false
                                        ? 'revurder'
                                        : undefined
                                }
                                onChange={(_, value) =>
                                    formik.setValues({ ...formik.values, beslutning: value === 'godkjenn' })
                                }
                                feil={errors.beslutning}
                            />
                            {formik.values.beslutning === false && (
                                <>
                                    <Select
                                        label="Velg grunn"
                                        onChange={(value) =>
                                            formik.setValues({ ...formik.values, grunn: value.target.value })
                                        }
                                        value={formik.values.grunn ?? ''}
                                        feil={errors.grunn}
                                    >
                                        <option value=""> Grunn </option>
                                        {Object.values(Grunn).map((grunn, index) => (
                                            <option value={grunn} key={index}>
                                                {grunn}
                                            </option>
                                        ))}
                                    </Select>

                                    <Textarea
                                        label="Begrunnelse"
                                        name="begrunnelse"
                                        value={formik.values.begrunnelse ?? ''}
                                        feil={formik.errors.begrunnelse}
                                        onChange={formik.handleChange}
                                    />
                                </>
                            )}
                            <Feiloppsummering
                                className={styles.feiloppsummering}
                                tittel={'Feiloppsummering'}
                                feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                hidden={!formikErrorsHarFeil(formik.errors)}
                            />
                            <Knapp
                                spinner={RemoteData.isPending(attesteringStatus)}
                                className={styles.sendInnAttestering}
                            >
                                {intl.formatMessage({ id: 'attestering.knapp.send' })}
                            </Knapp>
                        </form>
                    )}
                    {RemoteData.isSuccess(attesteringStatus) && <p>Attestering utført!</p>}
                </div>
            </div>
        </>
    );
};

export default Attestering;
