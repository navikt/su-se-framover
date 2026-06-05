import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Heading, Label, Loader, TextField } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';
import * as reguleringApi from '~src/api/reguleringApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import FradragForm from '~src/components/forms/vilkårOgGrunnlagForms/fradrag/FradragForm';
import {
    FradragFormData,
    fradragFormdataTilFradrag,
    fradragTilFradragFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/fradrag/FradragFormUtils';
import OppsummeringAvBeregningOgSimulering from '~src/components/oppsummering/oppsummeringAvBeregningOgsimulering/OppsummeringAvBeregningOgSimulering';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { ReguleringAttestering } from '~src/pages/saksbehandling/regulering/ReguleringAttestering';
import { måReguleresManuelt } from '~src/types/Fradrag';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import {
    Regulering,
    Reguleringsstatus,
    ÅrsakForManuell,
    ÅrsakTilManuellReguleringKategori,
} from '~src/types/Regulering';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold } from '~src/utils/fradrag/fradragUtil';
import { formatPeriode } from '~src/utils/periode/periodeUtils';
import styles from './manuellRegulering.module.less';
import messages from './manuellRegulering-nb';

const ManuellRegulering = () => {
    const { formatMessage } = useI18n({ messages });
    const urlParams = Routes.useRouteParams<typeof Routes.manuellRegulering>();
    const reguleringId = urlParams.reguleringId;
    const props = useOutletContext<SaksoversiktContext>();
    const [regulering, setRegulering] = useState<Regulering | null>(null);
    const [manuellReguleringStatus, hentManuellRegulering] = useApiCall(reguleringApi.hentManuellRegulering);
    const [tilAttesteringStatus, tilAttestering] = useApiCall(reguleringApi.tilAttestering);
    const [beregnStatus, beregn] = useApiCall(reguleringApi.beregnRegulering);

    const navigate = useNavigate();
    const navigateBack = () => navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id }));

    const [, hentSak] = useAsyncActionCreator(sakSlice.fetchSakByIdEllerNummer);
    const tilSakoversikt = () =>
        hentSak({ saksnummer: props.sak.saksnummer.toString() }, () => {
            Routes.navigateToSakIntroWithMessage(navigate, formatMessage('notification'), props.sak.id);
        });

    interface BeregnReguleringForm {
        uføre: Uføregrunnlag[];
        fradrag: FradragFormData[];
    }

    const form = useForm<BeregnReguleringForm>({
        defaultValues: {
            uføre: [],
            fradrag: [],
        },
    });

    useEffect(() => {
        if (reguleringId) {
            hentManuellRegulering({ reguleringId: reguleringId }, (data) => {
                setRegulering(data.regulering);
                const uføre =
                    data.regulering.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger.map((v) => v?.grunnlag) ?? [];
                const fradrag = data.regulering.grunnlagsdataOgVilkårsvurderinger.fradrag;

                form.reset({
                    uføre: uføre.filter(filtrerRegulerbarIEU),
                    fradrag: fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(fradrag).map((f) =>
                        fradragTilFradragFormData(f, {
                            fraOgMed: parseIsoDateOnly(data.regulering.periode.fraOgMed),
                            tilOgMed: parseIsoDateOnly(data.regulering.periode.tilOgMed),
                        }),
                    ),
                });
            });
        }
    }, [reguleringId]);

    const readOnly = () => {
        if (regulering === null) {
            return true;
        }
        return ![Reguleringsstatus.OPPRETTET, Reguleringsstatus.BEREGNET].includes(regulering.reguleringsstatus);
    };
    const underAttestering = regulering?.reguleringsstatus === Reguleringsstatus.ATTESTERING;

    const submitBeregning = (values: BeregnReguleringForm) => {
        if (regulering != null && reguleringId) {
            beregn(
                {
                    uføre: values.uføre,
                    reguleringId: reguleringId,
                    fradrag: values.fradrag.map((f) =>
                        fradragFormdataTilFradrag(f, {
                            fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed)!,
                            tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed)!,
                        }),
                    ),
                },
                (data) => setRegulering(data),
            );
        }
    };

    const ferdigstillEllerTilAttestering = () => {
        if (regulering == null) {
            return;
        }
        tilAttestering(
            {
                reguleringId: regulering.id,
            },
            () => tilSakoversikt(),
        );
    };

    if (RemoteData.isPending(manuellReguleringStatus)) {
        return <Loader />;
    }
    if (!RemoteData.isSuccess(manuellReguleringStatus) || regulering === null) {
        return (
            <div className={styles.feil}>
                {RemoteData.isFailure(manuellReguleringStatus) && (
                    <ApiErrorAlert error={manuellReguleringStatus.error} />
                )}
                <Alert variant="error">{formatMessage('fantIkkeRegulering')}</Alert>
                <Button onClick={navigateBack} variant="secondary" type="button">
                    {formatMessage('knapper.tilbake')}
                </Button>
            </div>
        );
    } else {
        const { uføre, fradrag } = manuellReguleringStatus.value.gjeldendeVedtaksdata;
        const uføregrunnlag = uføre?.vurderinger.map((v) => v?.grunnlag).filter(filtrerRegulerbarIEU) ?? [];
        const harRegulerbarIEU = uføregrunnlag.some((v) => v.forventetInntekt > 0);
        const harRegulerbarFradrag = fradrag.some((f) => måReguleresManuelt(f.type));

        return (
            <div className={styles.pageContainer}>
                <Heading level="2" size="large" className={styles.tittel}>
                    {formatMessage('tittel')}
                </Heading>
                <main className={styles.mainContentContainer}>
                    <div className={styles.form}>
                        <div className={styles.container}>
                            <ÅrsakForManuellRegulering årsaker={regulering.årsakForManuell} />
                            <Heading
                                level="3"
                                size="large"
                            >{`${formatMessage('periode')}: ${formatPeriode(regulering.periode)}`}</Heading>

                            <form onSubmit={form.handleSubmit(submitBeregning)} className={styles.form}>
                                <div className={styles.regulering}>
                                    <Heading level="3" size="medium" className={styles.kategoriTittel}>
                                        {formatMessage('reguler.ieu')}
                                    </Heading>

                                    {harRegulerbarIEU ? (
                                        form
                                            .getValues('uføre')
                                            .filter((u) => u.forventetInntekt > 0)
                                            .map((u, index) => (
                                                <div key={u.id} className={styles.ieu}>
                                                    <p>
                                                        {`${formatMessage('ieu.verdi.tidligere')}: ${
                                                            uføregrunnlag[index].forventetInntekt
                                                        } kr`}
                                                    </p>
                                                    <Controller
                                                        control={form.control}
                                                        name={`uføre.${index}.forventetInntekt`}
                                                        render={({ field }) => (
                                                            <TextField
                                                                disabled={readOnly()}
                                                                value={field.value.toString()}
                                                                size="medium"
                                                                onChange={field.onChange}
                                                                label={formatMessage('ieu', {
                                                                    dato: formatPeriode(u.periode),
                                                                })}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            ))
                                    ) : (
                                        <p>{formatMessage('ingen.ieu')}.</p>
                                    )}
                                </div>

                                <div className={styles.regulering}>
                                    <Heading level="3" size="medium" className={styles.kategoriTittel}>
                                        {formatMessage('reguler.fradrag')}
                                    </Heading>
                                    {harRegulerbarFradrag ? (
                                        <FradragForm
                                            name={'fradrag'}
                                            control={form.control}
                                            setValue={form.setValue}
                                            beregningsDato={{
                                                fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed),
                                                tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed),
                                            }}
                                            harEPS={false}
                                            readonly={readOnly()}
                                            tillatFradragstypeAnnet
                                        />
                                    ) : (
                                        <p>{formatMessage('ingen.fradrag')}.</p>
                                    )}
                                </div>

                                {!underAttestering && (
                                    <Button
                                        className={styles.regulering}
                                        variant="secondary"
                                        type="submit"
                                        loading={RemoteData.isPending(beregnStatus)}
                                    >
                                        Beregn og simuler
                                    </Button>
                                )}

                                {RemoteData.isFailure(beregnStatus) && <ApiErrorAlert error={beregnStatus.error} />}
                                {regulering.beregning && (
                                    <OppsummeringAvBeregningOgSimulering
                                        eksterngrunnlagSkatt={null}
                                        beregning={regulering.beregning}
                                        simulering={regulering.simulering}
                                    />
                                )}
                            </form>

                            <ReguleringUnderkjent regulering={regulering} />

                            {RemoteData.isFailure(tilAttesteringStatus) && (
                                <ApiErrorAlert error={tilAttesteringStatus.error} />
                            )}
                            {!underAttestering && (
                                <div className={styles.knapper}>
                                    <Button onClick={navigateBack} variant="secondary" type="button">
                                        {formatMessage('knapper.tilbake')}
                                    </Button>
                                    <Button
                                        disabled={!regulering.beregning}
                                        onClick={ferdigstillEllerTilAttestering}
                                        loading={RemoteData.isPending(tilAttesteringStatus)}
                                    >
                                        Til attestering
                                    </Button>
                                </div>
                            )}
                            {underAttestering && <ReguleringAttestering regulering={regulering} />}
                        </div>
                    </div>
                </main>
            </div>
        );
    }
};

export default ManuellRegulering;

const filtrerRegulerbarIEU = (grunnlag: Nullable<Uføregrunnlag>): grunnlag is Uføregrunnlag => grunnlag !== null;

const ÅrsakForManuellRegulering = (props: { årsaker: ÅrsakForManuell[] }) => {
    return props.årsaker.length > 0 ? (
        <Alert className={styles.advarsel} variant="warning">
            <Label>Reguleringen er til manuell behandling fordi: </Label>
            <ul className={styles.årsaksContainer}>
                {props.årsaker.map((årsak, i) => {
                    switch (årsak.type) {
                        case ÅrsakTilManuellReguleringKategori.ManglerRegulertBeløpForFradrag: {
                            return (
                                <li key={i}>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.ManglerIeuFraPesys: {
                            return (
                                <li key={i}>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.YtelseErMidlertidigStanset: {
                            return (
                                <li key={i}>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.EtAutomatiskFradragHarFremtidigPeriode: {
                            return (
                                <li key={i}>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.UgyldigePerioderForAutomatiskRegulering: {
                            return (
                                <li key={i}>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.AapManglerGyldigPeriode: {
                            return (
                                <li key={i}>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                    }
                })}
            </ul>
        </Alert>
    ) : (
        <></>
    );
};

const ReguleringUnderkjent = ({ regulering }: { regulering: Regulering }) => {
    if (regulering.attesteringer.filter((att) => att.underkjennelse != null).length < 1) {
        return null;
    }
    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Lilla}
            tittel={'Oppsummering regulering'}
        >
            <UnderkjenteAttesteringer attesteringer={regulering.attesteringer} />
        </Oppsummeringspanel>
    );
};
