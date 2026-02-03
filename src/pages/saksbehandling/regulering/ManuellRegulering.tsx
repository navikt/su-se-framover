import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Heading, Label, Loader, Modal, TextField } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
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
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { måReguleresManuelt } from '~src/types/Fradrag';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import {
    BrukerManglerSupplement,
    DelvisOpphør,
    DifferanseEtterRegulering,
    DifferanseFørRegulering,
    Eksterndata,
    FantIkkeVedtakForApril,
    FinnesFlerePerioderAvFradrag,
    FradragErUtenlandsinntekt,
    Reguleringssupplement,
    SupplementFor,
    SupplementHarFlereVedtaksperioderForFradrag,
    SupplementInneholderIkkeFradraget,
    YtelseErMidlertidigStanset,
    ÅrsakForManuell,
    ÅrsakTilManuellReguleringKategori,
} from '~src/types/Regulering';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold } from '~src/utils/fradrag/fradragUtil';
import { formatPeriode, formatPeriodeMedOptionalTilOgMed } from '~src/utils/periode/periodeUtils';

import reguleringstext from '../behandlingsoversikt/regulering/regulering-nb';
import styles from './manuellRegulering.module.less';
import messages from './manuellRegulering-nb';

interface FormData {
    uføre: Uføregrunnlag[];
    fradrag: FradragFormData[];
}

const ManuellRegulering = () => {
    const { formatMessage } = useI18n({ messages });
    const props = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.manuellRegulering>();
    const regulering = props.sak.reguleringer.find((r) => r.id === urlParams.reguleringId);
    const [hentReguleringGrunnlagsdataStatus, hentReguleringGrunnlagsdata] = useApiCall(
        reguleringApi.hentReguleringGrunnlagsdata,
    );
    const [regulerStatus, reguler] = useApiCall(reguleringApi.regulerManuelt);
    const [, hentSak] = useAsyncActionCreator(sakSlice.fetchSakByIdEllerNummer);
    const navigate = useNavigate();

    const BackButton = () => (
        <Button
            onClick={() => navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id }))}
            variant="secondary"
            type="button"
        >
            {formatMessage('knapper.tilbake')}
        </Button>
    );
    const filtrerRegulerbarIEU = (grunnlag: Nullable<Uføregrunnlag>): grunnlag is Uføregrunnlag => grunnlag !== null;

    if (!regulering) {
        return (
            <div className={styles.feil}>
                <Alert variant="error">{formatMessage('fantIkkeRegulering')}</Alert>
                <BackButton />
            </div>
        );
    }

    const form = useForm<FormData>({
        defaultValues: {
            uføre: [],
            fradrag: [],
        },
    });

    const onSubmit = (values: FormData) =>
        reguler(
            {
                uføre: values.uføre,
                reguleringId: regulering.id,
                fradrag: values.fradrag.map((f) =>
                    fradragFormdataTilFradrag(f, {
                        fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed)!,
                        tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed)!,
                    }),
                ),
            },
            () => {
                hentSak({ saksnummer: props.sak.saksnummer.toString() }, () => {
                    Routes.navigateToSakIntroWithMessage(navigate, formatMessage('notification'), props.sak.id);
                });
            },
        );

    useEffect(() => {
        hentReguleringGrunnlagsdata({ reguleringId: regulering.id }, (data) => {
            const uføre = data.uføreUnderRegulering ?? data.uføreFraGjeldendeVedtak;
            const fradrag = data.fradragUnderRegulering ?? data.fradragFraGjeldendeVedtak;

            console.log(data);

            form.reset({
                uføre: uføre.filter(filtrerRegulerbarIEU) ?? [],
                fradrag: fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(fradrag).map((f) =>
                    fradragTilFradragFormData(f, {
                        fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed),
                        tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed),
                    }),
                ),
            });
        });
    }, []);

    return pipe(
        hentReguleringGrunnlagsdataStatus,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            () => null,
            (reguleringsGrunnlagsdata) => {
                const uføreFraGjeldendeVedtak = reguleringsGrunnlagsdata.uføreFraGjeldendeVedtak;
                const fradragFraGjeldendeVedtak = reguleringsGrunnlagsdata.fradragFraGjeldendeVedtak;
                const uføregrunnlag = uføreFraGjeldendeVedtak.filter(filtrerRegulerbarIEU) ?? [];
                const harRegulerbarIEU = uføregrunnlag.some((v) => v.forventetInntekt > 0);
                const harRegulerbarFradrag = fradragFraGjeldendeVedtak.some((f) => måReguleresManuelt(f.type));

                return (
                    <div className={styles.pageContainer}>
                        <Heading level="2" size="large" className={styles.tittel}>
                            {formatMessage('tittel')}
                        </Heading>
                        <main className={styles.mainContentContainer}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
                                <div className={styles.container}>
                                    <ÅrsakForManuellRegulering årsaker={regulering.årsakForManuell} />
                                    <Heading
                                        level="3"
                                        size="medium"
                                    >{`${formatMessage('periode')}: ${formatPeriode(regulering.periode)}`}</Heading>

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
                                            />
                                        ) : (
                                            <p>{formatMessage('ingen.fradrag')}.</p>
                                        )}
                                    </div>
                                    {RemoteData.isFailure(regulerStatus) && (
                                        <ApiErrorAlert error={regulerStatus.error} />
                                    )}
                                    <div className={styles.knapper}>
                                        <BackButton />
                                        <Button type="submit" loading={RemoteData.isPending(regulerStatus)}>
                                            {formatMessage('knapper.send')}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                            <SupplementOversikt supplement={regulering.supplement} />
                        </main>
                    </div>
                );
            },
        ),
    );
};

export default ManuellRegulering;

const ÅrsakForManuellRegulering = (props: { årsaker: ÅrsakForManuell[] }) => {
    const { formatMessage } = useI18n({ messages: { ...reguleringstext } });
    return props.årsaker.length > 0 ? (
        <Alert className={styles.advarsel} variant="warning">
            <Label>Reguleringen er til manuell behandling fordi: </Label>
            <ul className={styles.årsaksContainer}>
                {props.årsaker.map((årsak, i) => {
                    switch (årsak.type) {
                        case ÅrsakTilManuellReguleringKategori.FradragMåHåndteresManuelt: {
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.FradragMåHåndteresManuelt)}
                                    </BodyShort>
                                    <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.UtbetalingFeilet: {
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.UtbetalingFeilet)}
                                    </BodyShort>
                                    <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.BrukerManglerSupplement: {
                            const asserted = årsak as BrukerManglerSupplement;

                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.BrukerManglerSupplement)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.SupplementInneholderIkkeFradraget: {
                            const asserted = årsak as SupplementInneholderIkkeFradraget;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(
                                            ÅrsakTilManuellReguleringKategori.SupplementInneholderIkkeFradraget,
                                        )}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.MerEnn1Eps: {
                            const asserted = årsak as SupplementInneholderIkkeFradraget;
                            return (
                                <li key={i}>
                                    <BodyShort>{formatMessage(ÅrsakTilManuellReguleringKategori.MerEnn1Eps)}</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.FinnesFlerePerioderAvFradrag: {
                            const asserted = årsak as FinnesFlerePerioderAvFradrag;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.FinnesFlerePerioderAvFradrag)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.FradragErUtenlandsinntekt: {
                            const asserted = årsak as FradragErUtenlandsinntekt;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.FradragErUtenlandsinntekt)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.FantIkkeVedtakForApril: {
                            const asserted = årsak as FantIkkeVedtakForApril;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.FantIkkeVedtakForApril)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.SupplementHarFlereVedtaksperioderForFradrag: {
                            const asserted = årsak as SupplementHarFlereVedtaksperioderForFradrag;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(
                                            ÅrsakTilManuellReguleringKategori.SupplementHarFlereVedtaksperioderForFradrag,
                                        )}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>Vedtaksperioder</BodyShort>
                                        <div className={styles.årsaksdetaljer}>
                                            {asserted.eksterneReguleringsvedtakperioder.map((periode) => (
                                                <BodyShort key={`${periode.fraOgMed}-${periode.tilOgMed}`}>
                                                    {formatPeriodeMedOptionalTilOgMed(periode)}
                                                </BodyShort>
                                            ))}
                                        </div>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.DifferanseFørRegulering: {
                            const asserted = årsak as DifferanseFørRegulering;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.DifferanseFørRegulering)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>
                                            Vårt beløp før regulering {asserted.vårtBeløpFørRegulering}
                                        </BodyShort>
                                        <BodyShort>
                                            Netto beløp fra ekstern kilde {asserted.eksternNettoBeløpFørRegulering}
                                        </BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.DifferanseEtterRegulering: {
                            const asserted = årsak as DifferanseEtterRegulering;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.DifferanseEtterRegulering)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>
                                            Forventet beløp etter regulering {asserted.forventetBeløpEtterRegulering}
                                        </BodyShort>
                                        <BodyShort>
                                            Regulert netto beløp fra ekstern kilde{' '}
                                            {asserted.eksternNettoBeløpEtterRegulering}
                                        </BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.YtelseErMidlertidigStanset: {
                            const asserted = årsak as YtelseErMidlertidigStanset;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.YtelseErMidlertidigStanset)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.ForventetInntektErStørreEnn0: {
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.ForventetInntektErStørreEnn0)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.AutomatiskSendingTilUtbetalingFeilet: {
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(
                                            ÅrsakTilManuellReguleringKategori.AutomatiskSendingTilUtbetalingFeilet,
                                        )}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.VedtakstidslinjeErIkkeSammenhengende: {
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(
                                            ÅrsakTilManuellReguleringKategori.VedtakstidslinjeErIkkeSammenhengende,
                                        )}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakTilManuellReguleringKategori.DelvisOpphør: {
                            const asserted = årsak as DelvisOpphør;
                            return (
                                <li key={i}>
                                    <BodyShort>
                                        {formatMessage(ÅrsakTilManuellReguleringKategori.DelvisOpphør)}
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Opphørte perioder</BodyShort>
                                        <div className={styles.årsaksdetaljer}>
                                            {asserted.opphørsperioder.map((periode) => formatPeriode(periode))}
                                        </div>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
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

const SupplementOversikt = (props: { supplement: Reguleringssupplement }) => {
    return (
        <div>
            <Heading level="3" size="medium">
                Data fra ekstern kilde
            </Heading>
            <div className={styles.supplementOversiktInnhold}>
                {props.supplement.bruker ? (
                    <SupplementForOversikt overskrift="Søker" supplementFor={props.supplement.bruker} />
                ) : (
                    <Label>Data for søker finnes ikke</Label>
                )}

                {props.supplement.eps.length > 0 ? (
                    props.supplement.eps.map((eps) => (
                        <SupplementForOversikt key={eps.fnr} overskrift={`EPS - ${eps.fnr}`} supplementFor={eps} />
                    ))
                ) : (
                    <Label>Data for EPS finnes ikke</Label>
                )}
            </div>
        </div>
    );
};

const SupplementForOversikt = (props: { overskrift: string; supplementFor: SupplementFor }) => {
    const [visEksternDataModal, setVisEksternDataModal] = useState(false);

    return (
        <div className={styles.supplementForOversiktContainer}>
            <Heading level="3" size="medium">
                {props.overskrift}
            </Heading>
            <ul className={styles.supplementForInnhold}>
                {props.supplementFor.fradragsperioder.map((fradrag, index) => (
                    <li key={`${fradrag.fradragstype} - ${index}`} className={styles.fradragsperiodeContainer}>
                        <Heading level="4" size="small">
                            {fradrag.fradragstype}
                        </Heading>

                        {fradrag.vedtaksperiodeEndring === null ? (
                            'Har ikke endringsvedtak'
                        ) : (
                            <div>
                                <Label>Endringsvedtak</Label>
                                <div className={styles.vedtaksperiodeData}>
                                    <BodyShort>
                                        <BodyShort>
                                            {formatPeriodeMedOptionalTilOgMed(fradrag.vedtaksperiodeEndring.periode)}:
                                        </BodyShort>
                                        :
                                    </BodyShort>
                                    <BodyShort>{fradrag.vedtaksperiodeEndring.beløp},-</BodyShort>
                                </div>
                            </div>
                        )}

                        <div>
                            <Label>Reguleringsvedtak</Label>
                            <ul>
                                {fradrag.vedtaksperiodeRegulering.map((periode, index) => (
                                    <li key={`${periode.periode.fraOgMed} - ${periode.periode.tilOgMed} - ${index}`}>
                                        <div className={styles.vedtaksperiodeData}>
                                            <BodyShort>{formatPeriodeMedOptionalTilOgMed(periode.periode)}:</BodyShort>
                                            <BodyShort>{periode.beløp},-</BodyShort>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
            <Button
                className={styles.eksterneVedtakdataButton}
                variant="tertiary"
                onClick={() => setVisEksternDataModal(true)}
            >
                Se eksterne vedtaksdata
            </Button>

            <EksternDataModal
                visModal={visEksternDataModal}
                onClose={() => setVisEksternDataModal(false)}
                data={props.supplementFor.eksterneVedtaksdata}
            />
        </div>
    );
};

const EksternDataModal = (props: { visModal: boolean; onClose: () => void; data: Eksterndata[] }) => {
    return (
        <Modal
            className={styles.eksternDataModal}
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Eksterne data som SU-app har mottatt' }}
        >
            <Modal.Body className={styles.eksternDataModalBody}>
                <ul>
                    {props.data.map((data, index) => (
                        <li key={index} className={styles.eksternDataContainer}>
                            <OppsummeringPar label={'Fødselsnummer'} verdi={data.fnr} retning="vertikal" />
                            <OppsummeringPar label={'Sakstype'} verdi={data.sakstype} retning="vertikal" />
                            <OppsummeringPar label={'Vedtakstype'} verdi={data.vedtakstype} retning="vertikal" />
                            <OppsummeringPar label={'Fra og med'} verdi={data.fraOgMed} retning="vertikal" />
                            <OppsummeringPar label={'Til og med'} verdi={data.tilOgMed} retning="vertikal" />
                            <OppsummeringPar label={'Brutto ytelse'} verdi={data.bruttoYtelse} retning="vertikal" />
                            <OppsummeringPar label={'Netto ytelse'} verdi={data.nettoYtelse} retning="vertikal" />
                            <OppsummeringPar
                                label={'Ytelseskomponent type'}
                                verdi={data.ytelseskomponenttype}
                                retning="vertikal"
                            />
                            <OppsummeringPar
                                label={'Brutto ytelseskomponent'}
                                verdi={data.bruttoYtelseskomponent}
                                retning="vertikal"
                            />
                            <OppsummeringPar
                                label={'Netto ytelseskomponent'}
                                verdi={data.nettoYtelseskomponent}
                                retning="vertikal"
                            />
                        </li>
                    ))}
                </ul>
            </Modal.Body>
        </Modal>
    );
};
