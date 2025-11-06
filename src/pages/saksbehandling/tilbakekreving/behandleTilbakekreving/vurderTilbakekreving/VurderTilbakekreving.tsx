import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading, Panel, Radio, RadioGroup } from '@navikt/ds-react';
import { useEffect } from 'react';
import { Controller, UseFormTrigger, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { vurderTilbakekrevingsbehandling } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Grunnlagsperiode } from '~src/types/Kravgrunnlag';
import {
    ManuellTilbakekrevingsbehandling,
    TilbakekrevingSteg,
    TilbakekrevingsVurdering,
} from '~src/types/ManuellTilbakekrevingsbehandling';
import { formatDate } from '~src/utils/date/dateUtils';

import messages from '../../Tilbakekreving-nb';

import styles from './VurderTilbakekreving.module.less';
import {
    eqVurderTilbakekrevingFormData,
    VurderTilbakekrevingFormData,
    vurderTilbakekrevingSchema,
} from './VurderTilbakekrevingUtils';

const VurderTilbakekreving = (props: {
    sakId: string;
    saksversjon: number;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(vurderTilbakekrevingsbehandling);

    const nesteUrl = routes.tilbakekrevingValgtBehandling.createURL({
        sakId: props.sakId,
        behandlingId: props.tilbakekreving.id,
        steg: TilbakekrevingSteg.Vedtaksbrev,
    });

    const defaultValuesFraBehandling = props.tilbakekreving.vurderinger?.perioder.map((periode) => {
        return {
            periode: periode.periode,
            vurdering: periode.vurdering,
        };
    });

    if (props.tilbakekreving.kravgrunnlag == null) {
        throw Error('Tilbakekrevingsbehandling må ha kravgrunnlag under vurderingssteget');
    }
    const kravgrunnlag = props.tilbakekreving.kravgrunnlag;

    const defaultValuesFraKravgunnlag = kravgrunnlag.grunnlagsperiode.map((periode) => ({
        periode: periode.periode,
        vurdering: null,
    }));

    const initialValues =
        defaultValuesFraBehandling && defaultValuesFraBehandling.length > 0
            ? { grunnlagsperioder: defaultValuesFraBehandling }
            : { grunnlagsperioder: defaultValuesFraKravgunnlag };

    const form = useForm<VurderTilbakekrevingFormData>({
        defaultValues: initialValues,
        resolver: yupResolver(vurderTilbakekrevingSchema),
    });

    const fieldName = 'grunnlagsperioder';
    const { fields } = useFieldArray({ name: fieldName, control: form.control });

    //Oppdatering av kravgrunnlaget får ikke React hook form sin usefieldArray til å rendre på nytt
    //når initialValues endrer seg. Derfor må vi gjøre det manuelt her.
    useEffect(() => {
        //fjerner id fra fields så innholdet blir likt initialValues
        const fieldsUtenId = fields.map((periode) => ({
            periode: periode.periode,
            vurdering: periode.vurdering,
        }));

        //sammenligner array innholdet med objekter som en lang streng
        if (JSON.stringify(fieldsUtenId) !== JSON.stringify(initialValues.grunnlagsperioder)) {
            form.reset(initialValues);
        }
    }, [initialValues]);

    const save = (data: VurderTilbakekrevingFormData, onSuccess: () => void) => {
        lagre(
            {
                sakId: props.sakId,
                versjon: props.saksversjon,
                behandlingId: props.tilbakekreving.id,
                perioder: data.grunnlagsperioder.map((periode) => ({
                    periode: periode.periode,
                    vurdering: periode.vurdering!,
                })),
            },
            onSuccess,
        );
    };

    const handleLagreOgFortsettSenereClick = async (
        data: VurderTilbakekrevingFormData,
        trigger: UseFormTrigger<VurderTilbakekrevingFormData>,
    ) => {
        if (eqVurderTilbakekrevingFormData.equals(initialValues, data)) {
            navigate(routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        await trigger().then((isValid) => {
            if (isValid) {
                save(data, () => navigate(routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })));
            }
        });
    };

    const handleSubmit = (values: VurderTilbakekrevingFormData) => {
        if (eqVurderTilbakekrevingFormData.equals(initialValues, values)) {
            navigate(nesteUrl);
            return;
        }
        save(values, () => navigate(nesteUrl));
    };

    return (
        <ToKolonner tittel={formatMessage('vurderTilbakekreving.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <ul className={styles.grunnlagsperioderContainer}>
                            {fields.map((periode, idx) => (
                                <li key={`${periode.id}`}>
                                    <Panel border className={styles.periodePanel}>
                                        <div>
                                            <Heading size="small">{`${formatDate(
                                                periode.periode.fraOgMed,
                                            )} - ${formatDate(periode.periode.tilOgMed)}`}</Heading>
                                            <Controller
                                                control={form.control}
                                                name={`${fieldName}.${idx}.vurdering`}
                                                render={({ field, fieldState }) => (
                                                    <RadioGroup
                                                        {...field}
                                                        legend={formatMessage(
                                                            'vurderTilbakekreving.skalBeløpBliTilbakekrevd',
                                                        )}
                                                        hideLegend
                                                        error={fieldState.error?.message}
                                                    >
                                                        <Radio value={TilbakekrevingsVurdering.SKAL_TILBAKEKREVES}>
                                                            {formatMessage('vurderTilbakekreving.skalTilbakekreve')}
                                                        </Radio>
                                                        <Radio value={TilbakekrevingsVurdering.SKAL_IKKE_TILBAKEKREVES}>
                                                            {formatMessage('vurderTilbakekreving.skalIkkeTilbakekreve')}
                                                        </Radio>
                                                    </RadioGroup>
                                                )}
                                            />
                                        </div>
                                        <KravgrunnlagPeriodeInfo
                                            grunnlagsperiode={kravgrunnlag.grunnlagsperiode[idx]}
                                        />
                                    </Panel>
                                </li>
                            ))}
                        </ul>

                        <div>
                            <Feiloppsummering
                                tittel={formatMessage('vurderTilbakekreving.feiloppsummering')}
                                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                            />
                            <Navigasjonsknapper
                                neste={{
                                    loading: RemoteData.isPending(status),
                                }}
                                fortsettSenere={{
                                    onClick: () => handleLagreOgFortsettSenereClick(form.getValues(), form.trigger),
                                }}
                                tilbake={{
                                    url: routes.tilbakekrevingValgtBehandling.createURL({
                                        sakId: props.sakId,
                                        behandlingId: props.tilbakekreving.id,
                                        steg: TilbakekrevingSteg.Forhåndsvarsling,
                                    }),
                                }}
                            />

                            {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        </div>
                    </form>
                ),
                right: (
                    <OppsummeringAvKravgrunnlag
                        kravgrunnlag={props.tilbakekreving.kravgrunnlag}
                        basicBareMetaInfo={{ medTittel: true }}
                    />
                ),
            }}
        </ToKolonner>
    );
};

const KravgrunnlagPeriodeInfo = (props: { grunnlagsperiode: Grunnlagsperiode }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.kravgrunnlagsInfoContainer}>
            <div className={styles.detalje}>
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.betaltSkattForYtelsesgruppen')}
                    verdi={props.grunnlagsperiode.betaltSkattForYtelsesgruppen}
                    retning="vertikal"
                />
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.skatteprosent')}
                    verdi={props.grunnlagsperiode.skatteProsent}
                    retning="vertikal"
                />
            </div>

            <div className={styles.detalje}>
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.bruttoTidligereUtbetalt')}
                    verdi={props.grunnlagsperiode.bruttoTidligereUtbetalt}
                    retning="vertikal"
                />
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.bruttoNyUtbetaling')}
                    verdi={props.grunnlagsperiode.bruttoNyUtbetaling}
                    retning="vertikal"
                />
            </div>

            <OppsummeringPar
                label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.bruttoFeilutbetaling')}
                verdi={props.grunnlagsperiode.bruttoFeilutbetaling}
                retning="vertikal"
            />
        </div>
    );
};

export default VurderTilbakekreving;
