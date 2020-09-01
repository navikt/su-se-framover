import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import { RadioPanelGruppe, Feiloppsummering, Select, Textarea } from 'nav-frontend-skjema';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React, { useState } from 'react';

import { Behandling, Behandlingsstatus, Vilkårsvurdering, Vilkårtype } from '~api/behandlingApi';
import { fetchBrev } from '~api/brevApi';
import { Sak } from '~api/sakApi';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { statusIcon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import VisBeregning from '~pages/saksoversikt/beregning/VisBeregning';
import { Simulering } from '~pages/saksoversikt/simulering/simulering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import messages from './attestering-nb';
import styles from './attestering.module.less';

type Props = {
    sak: Sak;
    behandlingId: string;
};

const VilkårsvurderingInfoLinje = (props: { type: Vilkårtype; verdi: Vilkårsvurdering }) => (
    <div className={styles.infolinjeContainer}>
        <div className={styles.infolinje}>
            <span className={styles.statusContainer}>
                <span className={styles.statusIcon}>{statusIcon(props.verdi.status)}</span>
            </span>
            <div>
                <span className={styles.infotittel}>{vilkårTittelFormatted(props.type)}:</span>
                <p>{props.verdi.begrunnelse ? props.verdi.begrunnelse : ''}</p>
            </div>
        </div>
    </div>
);

const VilkårsOppsummering = (props: { behandling: Behandling; sakId: string }) => {
    return (
        <div>
            <Innholdstittel className={styles.tittel}>Vilkårsvurderinger</Innholdstittel>
            {Object.entries(props.behandling.vilkårsvurderinger).map(([k, v]) => (
                <VilkårsvurderingInfoLinje type={k as Vilkårtype} verdi={v} key={k} />
            ))}
        </div>
    );
};

const VisDersomSimulert = (props: { sak: Sak; behandling: Behandling }) => {
    if (props.behandling.status === Behandlingsstatus.AVSLÅTT) {
        return null;
    }
    if (props.behandling.beregning) {
        return (
            <>
                <VisBeregning beregning={props.behandling.beregning} />
                <div>
                    <Innholdstittel>Oppdragssimulering</Innholdstittel>
                    <Simulering sak={props.sak} behandlingId={props.behandling.id} />
                </div>
            </>
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
const Attestering = (props: Props) => {
    const { sak, behandlingId } = props;
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const attesteringStatus = useAppSelector((s) => s.sak.attesteringStatus);
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();

    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);
    if (!behandling) {
        return <AlertStripe type="feil">Fant ikke behandlingsid</AlertStripe>;
    }
    const formik = useFormik<FormData>({
        initialValues: {},
        onSubmit: (values) => {
            const { beslutning } = values;

            if (values.beslutning) {
                dispatch(
                    sakSlice.startAttestering({
                        sakId: sak.id,
                        behandlingId: behandling.id,
                    })
                );
                return;
            }
            // TODO: Implementera vurdert på nytt når det implementeras i bakover
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
    if (
        behandling.vilkårsvurderinger &&
        (behandling.status === Behandlingsstatus.TIL_ATTESTERING ||
            behandling.status === Behandlingsstatus.ATTESTERT ||
            behandling.status === Behandlingsstatus.AVSLÅTT)
    ) {
        return (
            <div>
                <div className={styles.vedtakContainer}>
                    <Innholdstittel>Vedtak</Innholdstittel>
                    <div>
                        {behandling.status === Behandlingsstatus.TIL_ATTESTERING && (
                            <AlertStripeSuksess>{Behandlingsstatus.SIMULERT}</AlertStripeSuksess>
                        )}
                        {behandling.status === Behandlingsstatus.AVSLÅTT && (
                            <AlertStripeFeil>{Behandlingsstatus.AVSLÅTT}</AlertStripeFeil>
                        )}
                    </div>
                    <div>
                        <VilkårsOppsummering behandling={behandling} sakId={sak.id} />
                    </div>
                    <div>
                        <VisDersomSimulert sak={sak} behandling={behandling} />
                    </div>
                    <div>
                        <Innholdstittel>Vis brev kladd</Innholdstittel>
                        <Lenke
                            href={'#'}
                            onClick={() =>
                                fetchBrev(sak.id, behandlingId).then((res) => {
                                    if (res.status === 'ok') window.open(URL.createObjectURL(res.data));
                                })
                            }
                        >
                            test
                        </Lenke>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    {behandling.status === Behandlingsstatus.TIL_ATTESTERING && (
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
                    {RemoteData.isSuccess(attesteringStatus) && <p>Attesteringsbeslut innsendt!</p>}
                </div>
            </div>
        );
    }
    return <div>Behandlingen er ikke ferdig</div>;
};

export default Attestering;
