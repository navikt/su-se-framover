import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup } from '@navikt/ds-react';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/string';
import React, { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { PersonligOppmøteFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable } from '~src/lib/types';
import {
    getInitialFormValues,
    tilOppdatertVilkårsinformasjon,
    toPersonligOppmøteStatus,
} from '~src/pages/saksbehandling/søknadsbehandling/personlig-oppmøte/utils';
import { SøknadsbehandlingWrapper } from '~src/pages/saksbehandling/søknadsbehandling/SøknadsbehandlingWrapper';
import { erFerdigbehandletMedAvslag, erVurdertUtenAvslagMenIkkeFerdigbehandlet } from '~src/pages/saksbehandling/utils';
import { Behandling, Behandlingsstatus } from '~src/types/Behandling';
import { Sakstype } from '~src/types/Sak';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { erVilkårsvurderingerVurdertAvslag } from '~src/utils/behandling/behandlingUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './personligOppmøte-nb';
import * as styles from './personligOppmøte.module.less';
import { FormData, HarMøttPersonlig, ManglendeOppmøteGrunn, schema } from './types';

const eqFormData = struct<FormData>({
    møttPersonlig: eqNullable(S.Eq),
    grunnForManglendePersonligOppmøte: eqNullable(S.Eq),
});

const PersonligOppmøte = (props: VilkårsvurderingBaseProps & { sakstype: Sakstype }) => {
    const navigate = useNavigate();
    const advarselRef = useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreBehandlingsinformasjon] = useAsyncActionCreator(sakSlice.lagreBehandlingsinformasjon);

    const initialValues = getInitialFormValues(props.behandling.behandlingsinformasjon.personligOppmøte);

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.PersonligOppmøte,
        (values) => eqFormData.equals(values, initialValues)
    );

    const form = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const watch = form.watch();

    const oppdatertVilkårsinformasjon = useMemo(
        () =>
            tilOppdatertVilkårsinformasjon(
                props.sakstype,
                watch,
                props.behandling.behandlingsinformasjon,
                props.behandling.grunnlagsdataOgVilkårsvurderinger
            ),
        [watch, props.behandling.behandlingsinformasjon, props.behandling.grunnlagsdataOgVilkårsvurderinger]
    );

    const save = async (values: FormData, onSuccess: (res: Behandling) => void) => {
        const personligOppmøteStatus = toPersonligOppmøteStatus(values);
        if (!personligOppmøteStatus) {
            return;
        }
        if (
            personligOppmøteStatus === props.behandling.behandlingsinformasjon.personligOppmøte?.status &&
            !erVilkårsvurderingerVurdertAvslag(props.behandling)
        ) {
            clearDraft();
            return;
        }

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: {
                        status: personligOppmøteStatus,
                    },
                },
            },
            (res) => {
                clearDraft();
                onSuccess(res);
            }
        );
    };

    const handleSave = async (values: FormData, onSuccess: (res: Behandling) => void) => {
        const vilkårsinformasjon = tilOppdatertVilkårsinformasjon(
            props.sakstype,
            values,
            props.behandling.behandlingsinformasjon,
            props.behandling.grunnlagsdataOgVilkårsvurderinger
        );

        if (
            vilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
            erVurdertUtenAvslagMenIkkeFerdigbehandlet(vilkårsinformasjon)
        ) {
            advarselRef.current?.focus();
            return;
        }

        await save(values, (res) => {
            clearDraft();
            onSuccess(res);
        });
    };

    const onSuccess = (res: Behandling) =>
        res.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG
            ? navigate(
                  Routes.saksbehandlingSendTilAttestering.createURL({
                      sakId: props.sakId,
                      behandlingId: props.behandling.id,
                  })
              )
            : navigate(props.nesteUrl);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <SøknadsbehandlingWrapper
                        form={form}
                        save={handleSave}
                        savingState={status}
                        avsluttUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                        onSuccess={onSuccess}
                        nesteKnappTekst={
                            oppdatertVilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
                            erFerdigbehandletMedAvslag(oppdatertVilkårsinformasjon)
                                ? formatMessage('button.tilVedtak.label')
                                : undefined
                        }
                    >
                        <>
                            <div className={styles.formElement}>
                                <Controller
                                    control={form.control}
                                    name="møttPersonlig"
                                    render={({ field, fieldState }) => (
                                        <RadioGroup
                                            legend={formatMessage('radio.personligOppmøte.legend')}
                                            error={fieldState.error?.message}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            value={field.value ?? ''}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                val !== HarMøttPersonlig.Nei &&
                                                    form.setValue('grunnForManglendePersonligOppmøte', null);
                                            }}
                                        >
                                            <Radio id={field.name} value={HarMøttPersonlig.Ja} ref={field.ref}>
                                                {formatMessage('radio.label.ja')}
                                            </Radio>
                                            <Radio value={HarMøttPersonlig.Nei}>
                                                {formatMessage('radio.label.nei')}
                                            </Radio>
                                            <Radio value={HarMøttPersonlig.Uavklart}>
                                                {formatMessage('radio.label.uavklart')}
                                            </Radio>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                            {watch.møttPersonlig === HarMøttPersonlig.Nei && (
                                <div className={styles.formElement}>
                                    <Controller
                                        control={form.control}
                                        name="grunnForManglendePersonligOppmøte"
                                        render={({ field, fieldState }) => (
                                            <RadioGroup
                                                legend={formatMessage('radio.personligOppmøte.grunn.legend')}
                                                error={fieldState.error?.message}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                            >
                                                <Radio
                                                    id={field.name}
                                                    ref={field.ref}
                                                    value={ManglendeOppmøteGrunn.SykMedLegeerklæringOgFullmakt}
                                                >
                                                    {formatMessage(ManglendeOppmøteGrunn.SykMedLegeerklæringOgFullmakt)}
                                                </Radio>
                                                <Radio value={ManglendeOppmøteGrunn.OppnevntVergeSøktPerPost}>
                                                    {formatMessage(ManglendeOppmøteGrunn.OppnevntVergeSøktPerPost)}
                                                </Radio>
                                                <Radio value={ManglendeOppmøteGrunn.KortvarigSykMedLegeerklæring}>
                                                    {formatMessage(ManglendeOppmøteGrunn.KortvarigSykMedLegeerklæring)}
                                                </Radio>
                                                <Radio value={ManglendeOppmøteGrunn.MidlertidigUnntakFraOppmøteplikt}>
                                                    {formatMessage(
                                                        ManglendeOppmøteGrunn.MidlertidigUnntakFraOppmøteplikt
                                                    )}
                                                </Radio>
                                                <Radio value={ManglendeOppmøteGrunn.BrukerIkkeMøttOppfyllerIkkeVilkår}>
                                                    {formatMessage(
                                                        ManglendeOppmøteGrunn.BrukerIkkeMøttOppfyllerIkkeVilkår
                                                    )}
                                                </Radio>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            )}

                            <div
                                ref={advarselRef}
                                tabIndex={-1}
                                aria-live="polite"
                                aria-atomic="true"
                                className={styles.alertstripe}
                            >
                                {oppdatertVilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
                                    erVurdertUtenAvslagMenIkkeFerdigbehandlet(oppdatertVilkårsinformasjon) && (
                                        <Alert variant="warning">{formatMessage('alert.ikkeFerdigbehandlet')}</Alert>
                                    )}
                            </div>
                        </>
                    </SøknadsbehandlingWrapper>
                ),
                right: <PersonligOppmøteFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default PersonligOppmøte;
