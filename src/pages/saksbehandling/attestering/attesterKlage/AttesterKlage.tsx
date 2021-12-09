import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Heading, Radio, RadioGroup, Select, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
import { Link, useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import OppsummeringAvKlage from '~components/oppsummeringAvKlage/OppsummeringAvKlage';
import Personlinje from '~components/personlinje/Personlinje';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { UnderkjennelseGrunn, underkjennelsesGrunnTextMapper } from '~types/Behandling';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { erKlageTilAttestering } from '~utils/klage/klageUtils';

import sharedStyles from '../sharedStyles.module.less';

import messages from './attesterKlage-nb';
import styles from './attesterKlage.module.less';

interface AttesterKlageFormData {
    beslutning: Nullable<Beslutning>;
    grunn: Nullable<UnderkjennelseGrunn>;
    kommentar: Nullable<string>;
}

enum Beslutning {
    IVERKSETT = 'iverksett',
    UNDERKJENN = 'underkjenn',
}

const schema = yup.object<AttesterKlageFormData>({
    beslutning: yup.string().nullable().required().oneOf([Beslutning.IVERKSETT, Beslutning.UNDERKJENN]),
    grunn: yup.string<UnderkjennelseGrunn>().when('beslutning', {
        is: Beslutning.UNDERKJENN,
        then: yup.string().required().oneOf(Object.values(UnderkjennelseGrunn), 'Du må velge en grunn'),
    }),
    kommentar: yup.mixed<string>().when('beslutning', {
        is: Beslutning.UNDERKJENN,
        then: yup.string().required(),
    }),
});

const AttesterKlage = (props: {
    sakInfo: { sakId: string; saksnummer: number };
    søker: Person;
    klager: Klage[];
    vedtaker: Vedtak[];
}) => {
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();
    const urlParams = Routes.useRouteParams<typeof Routes.attesterKlage>();

    const klage = props.klager.find((k) => k.id === urlParams.klageId);
    const klagensVedtak = props.vedtaker.find((v) => v.id === klage?.vedtakId);

    const [iverksettStatus, iverksett] = useAsyncActionCreator(klageActions.iverksett);
    const [underkjennStatus, underkjenn] = useAsyncActionCreator(klageActions.underkjenn);

    const { control, watch, handleSubmit } = useForm<AttesterKlageFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            beslutning: null,
        },
    });

    if (!klagensVedtak || !klage) {
        return (
            <div className={styles.fantIkkevedtakFeilContainer}>
                <Alert variant="error">{formatMessage('feil.fantIkkeKlageEllerVedtakensKlage')}</Alert>
                <Link
                    to={Routes.saksoversiktValgtSak.createURL({
                        sakId: props.sakInfo.sakId,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    if (!erKlageTilAttestering(klage)) {
        return (
            <div className={styles.fantIkkevedtakFeilContainer}>
                <Alert variant="error">{formatMessage('feil.klageErIkkeTilAttestering')}</Alert>
                <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakInfo.sakId })}>
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    const handleBeslutningSubmit = (data: AttesterKlageFormData) => {
        if (data.beslutning === Beslutning.IVERKSETT) {
            iverksett(
                {
                    sakId: props.sakInfo.sakId,
                    klageId: klage.id,
                },
                () => {
                    history.push(
                        Routes.createSakIntroLocation(formatMessage('notification.iverksatt'), props.sakInfo.sakId)
                    );
                }
            );
        }

        if (data.beslutning === Beslutning.UNDERKJENN) {
            underkjenn(
                {
                    sakId: props.sakInfo.sakId,
                    klageId: klage.id,
                    //valdiering sikrer at feltet ikke er null
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    grunn: data.grunn!,
                    kommentar: data.kommentar!,
                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                },
                () => {
                    history.push(
                        Routes.createSakIntroLocation(formatMessage('notification.underkjent'), props.sakInfo.sakId)
                    );
                }
            );
        }
    };

    return (
        <form className={sharedStyles.container} onSubmit={handleSubmit(handleBeslutningSubmit)}>
            <Personlinje søker={props.søker} sakInfo={props.sakInfo} />
            <Heading level="1" size="xlarge" className={sharedStyles.tittel}>
                {formatMessage('page.tittel')}
            </Heading>
            <div className={styles.oppsummeringContainer}>
                <OppsummeringAvKlage klage={klage} klagensVedtak={klagensVedtak} />
            </div>
            <div className={styles.formContainer}>
                <div className={styles.beslutningContainer}>
                    <Controller
                        control={control}
                        name={'beslutning'}
                        render={({ field, fieldState }) => (
                            <RadioGroup
                                {...field}
                                legend={formatMessage('beslutning.label')}
                                error={fieldState.error?.message}
                                value={field.value ?? ''}
                            >
                                <Radio value={Beslutning.IVERKSETT}>{formatMessage('beslutning.iverksett')}</Radio>
                                <Radio value={Beslutning.UNDERKJENN}>{formatMessage('beslutning.underkjenn')}</Radio>
                            </RadioGroup>
                        )}
                    />
                </div>

                {watch('beslutning') === Beslutning.UNDERKJENN && <UnderkjennelsesForm control={control} />}

                <div className={styles.knapperContainer}>
                    <LinkAsButton
                        variant="secondary"
                        href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakInfo.sakId })}
                    >
                        {formatMessage('knapp.tilbake')}
                    </LinkAsButton>
                    <Button>{formatMessage('knapp.bekreft')}</Button>
                </div>
                <div className={styles.apiErrorContainer}>
                    {RemoteData.isFailure(iverksettStatus) && <ApiErrorAlert error={iverksettStatus.error} />}
                    {RemoteData.isFailure(underkjennStatus) && <ApiErrorAlert error={underkjennStatus.error} />}
                </div>
            </div>
        </form>
    );
};

const UnderkjennelsesForm = (props: { control: Control<AttesterKlageFormData> }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.underkjennelsesFormContainer}>
            <Controller
                control={props.control}
                name={'grunn'}
                render={({ field, fieldState }) => (
                    <Select
                        {...field}
                        className={styles.grunnContainer}
                        label={formatMessage('underkjennelse.select.label')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    >
                        <option value="">{formatMessage('underkjennelse.select.defaultValue')}</option>
                        {Object.values(UnderkjennelseGrunn).map((grunn) => (
                            <option value={grunn} key={grunn}>
                                {underkjennelsesGrunnTextMapper[grunn]}
                            </option>
                        ))}
                    </Select>
                )}
            />
            <Controller
                control={props.control}
                name={'kommentar'}
                render={({ field, fieldState }) => (
                    <Textarea
                        {...field}
                        label={formatMessage('underkjennelse.kommentar.label')}
                        placeholder={formatMessage('underkjennelse.kommentar.placeholder')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    />
                )}
            />
        </div>
    );
};

export default AttesterKlage;
