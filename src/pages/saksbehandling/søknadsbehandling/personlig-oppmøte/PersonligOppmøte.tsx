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
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import {
    getInitialFormValues,
    tilOppdatertVilkårsinformasjon,
    toPersonligOppmøteÅrsakOgResultat,
} from '~src/pages/saksbehandling/søknadsbehandling/personlig-oppmøte/utils';
import { erFerdigbehandletMedAvslag, erVurdertUtenAvslagMenIkkeFerdigbehandlet } from '~src/pages/saksbehandling/utils';
import { Sakstype } from '~src/types/Sak';
import { Søknadsbehandling, Behandlingsstatus } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { erVilkårsvurderingerVurdertAvslag } from '~src/utils/behandling/SøknadsbehandlingUtils';

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
    const [status, lagre] = useAsyncActionCreator(sakSlice.lagrePersonligOppmøteVilkår);

    const initialValues = getInitialFormValues(props.behandling.grunnlagsdataOgVilkårsvurderinger.personligOppmøte);

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
        [watch, props.behandling.grunnlagsdataOgVilkårsvurderinger]
    );

    const save = async (values: FormData, onSuccess: (res: Søknadsbehandling) => void) => {
        const personligOppmøteStatus = toPersonligOppmøteÅrsakOgResultat(values);
        if (!personligOppmøteStatus) {
            return;
        }
        if (
            personligOppmøteStatus.årsak ===
                props.behandling.grunnlagsdataOgVilkårsvurderinger.personligOppmøte?.vurderinger[0].vurdering &&
            !erVilkårsvurderingerVurdertAvslag(props.behandling)
        ) {
            clearDraft();
        }

        lagre(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: [
                    {
                        periode: props.behandling.stønadsperiode!.periode,
                        vurdering: personligOppmøteStatus!.årsak,
                    },
                ],
            },
            (res) => {
                clearDraft();
                onSuccess(res);
            }
        );
    };

    const handleSave = async (values: FormData, onSuccess: (res: Søknadsbehandling) => void) => {
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

    const onSuccess = (res: Søknadsbehandling) => {
        res.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG
            ? navigate(
                  Routes.saksbehandlingSendTilAttestering.createURL({
                      sakId: props.sakId,
                      behandlingId: props.behandling.id,
                  })
              )
            : navigate(props.nesteUrl);
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FormWrapper
                        form={form}
                        save={handleSave}
                        savingState={status}
                        avsluttUrl={props.avsluttUrl}
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
                    </FormWrapper>
                ),
                right: <PersonligOppmøteFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default PersonligOppmøte;
