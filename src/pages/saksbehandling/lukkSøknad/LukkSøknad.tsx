import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Link, Loader, Select } from '@navikt/ds-react';
import classNames from 'classnames';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { LukkSøknadBodyTypes } from '~api/søknadApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { LukkSøknadBegrunnelse, Søknad, Søknadstype } from '~types/Søknad';

import AvslåttSøknad from '../avslag/AvslåttSøknad';

import Avvist from './Avvist';
import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import {
    lukkSøknadInitialValues,
    LukkSøknadValidationSchema,
    LukkSøknadFormData,
    AvsluttSøknadsbehandlingBegrunnelse,
    LukkSøknadOgAvsluttSøknadsbehandlingType,
} from './lukkSøknadUtils';
import Trukket from './Trukket';

const LukkSøknadOgAvsluttBehandling = (props: { sakId: string; søknad: Søknad }) => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages: nb });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [søknadLukketStatus, lukkSøknad] = useAsyncActionCreator(sakSlice.lukkSøknad);
    const [avslagManglendeDokStatus, avslåPgaManglendeDok] = useAsyncActionCreator(sakSlice.avslagManglendeDokSøknad);

    const formik = useFormik<LukkSøknadFormData>({
        initialValues: lukkSøknadInitialValues,
        async onSubmit(values) {
            if (!values.lukkSøknadOgAvsluttSøknadsbehandling) {
                return;
            }

            if (values.lukkSøknadOgAvsluttSøknadsbehandling === AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok) {
                avslåPgaManglendeDok(
                    {
                        søknadId: props.søknad.id,
                        body: { fritekst: '' /*data.fritekst*()*/ },
                    },
                    () => {
                        const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                        return history.push(Routes.createSakIntroLocation(message, props.sakId));
                    }
                );
            }

            lukkSøknad(
                {
                    søknadId: props.søknad.id,
                    body: lagBody(values),
                },
                () => {
                    const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                    history.push(Routes.createSakIntroLocation(message, props.sakId));
                }
            );
        },
        validationSchema: LukkSøknadValidationSchema,
        validateOnChange: hasSubmitted,
    });

    return (
        <form
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
            }}
            className={styles.formContainer}
        >
            <div className={styles.selectContainer}>
                <Select
                    label={formatMessage('lukkSøknadOgAvsluttSøknadsbehandling.begrunnelseForAvsluttelse')}
                    name={'lukkSøknadOgAvsluttSøknadsbehandling'}
                    onChange={(e) => {
                        formik.handleChange(e);
                    }}
                    error={formik.errors.lukkSøknadOgAvsluttSøknadsbehandling}
                >
                    <option value="velgBegrunnelse">{formatMessage('selector.velgBegrunnelse')}</option>
                    {Object.values(LukkSøknadBegrunnelse).map((begrunnelse) => (
                        <option value={begrunnelse} key={begrunnelse}>
                            {formatMessage(lukkSøknadBegrunnelseI18nId(begrunnelse))}
                        </option>
                    ))}
                    {Object.values(AvsluttSøknadsbehandlingBegrunnelse).map((begrunnelse) => (
                        <option value={begrunnelse} key={begrunnelse}>
                            {formatMessage(lukkSøknadBegrunnelseI18nId(begrunnelse))}
                        </option>
                    ))}
                </Select>
            </div>

            {formik.values.lukkSøknadOgAvsluttSøknadsbehandling === LukkSøknadBegrunnelse.Trukket && (
                <Trukket
                    datoSøkerTrakkSøknad={formik.values.trukket.datoSøkerTrakkSøknad}
                    søknadId={props.søknad.id}
                    søknadOpprettet={hentOpprettetDatoFraSøknad(props.søknad)}
                    feilmelding={formik.errors.trukket?.datoSøkerTrakkSøknad}
                    onDatoSøkerTrakkSøknadChange={(val) =>
                        formik.setValues((values) => ({ ...values, trukket: { datoSøkerTrakkSøknad: val } }))
                    }
                    søknadLukketStatus={søknadLukketStatus}
                />
            )}

            {formik.values.lukkSøknadOgAvsluttSøknadsbehandling === LukkSøknadBegrunnelse.Bortfalt && (
                <div className={classNames(styles.bortfaltContainer, styles.buttonsContainer)}>
                    <Button variant="danger">
                        {formatMessage('knapp.lukkSøknad')}
                        {RemoteData.isPending(søknadLukketStatus) && <Loader />}
                    </Button>
                </div>
            )}

            {formik.values.lukkSøknadOgAvsluttSøknadsbehandling === LukkSøknadBegrunnelse.Avvist && (
                <Avvist
                    søknadId={props.søknad.id}
                    søknadLukketStatus={søknadLukketStatus}
                    validateForm={() => formik.validateForm()}
                    avvistFormData={{
                        skalSendesBrev: formik.values.avvist.skalSendesBrev,
                        typeBrev: formik.values.avvist.typeBrev,
                        fritekst: formik.values.avvist.fritekst,
                    }}
                    feilmeldinger={{
                        skalSendesBrev: formik.errors.avvist?.skalSendesBrev,
                        typeBrev: formik.errors.avvist?.typeBrev,
                        fritekst: formik.errors.avvist?.fritekst,
                    }}
                    onValueChange={(val) =>
                        formik.setValues((values) => ({
                            ...values,
                            avvist: {
                                skalSendesBrev: val.skalSendesBrev,
                                typeBrev: val.typeBrev,
                                fritekst: val.fritekst,
                            },
                        }))
                    }
                />
            )}

            {formik.values.lukkSøknadOgAvsluttSøknadsbehandling ===
                AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok && (
                <AvslåttSøknad
                    søknadsbehandlingAvsluttetStatus={avslagManglendeDokStatus}
                    fritekstValue={formik.values.manglendeDok.fritekst}
                    fritekstError={formik.errors.manglendeDok?.fritekst}
                    onFritekstChange={(e: string) =>
                        formik.setValues((values) => ({
                            ...values,
                            manglendeDok: {
                                fritekst: e,
                            },
                        }))
                    }
                />
            )}
            <div className={styles.tilbakeKnappContainer}>
                <Link href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                    {formatMessage('link.tilbake')}
                </Link>
            </div>

            <div>{RemoteData.isFailure(søknadLukketStatus) && <ApiErrorAlert error={søknadLukketStatus.error} />}</div>
        </form>
    );
};

function lagBody(values: LukkSøknadFormData): LukkSøknadBodyTypes {
    switch (values.lukkSøknadOgAvsluttSøknadsbehandling) {
        case LukkSøknadBegrunnelse.Trukket:
            return {
                type: values.lukkSøknadOgAvsluttSøknadsbehandling,
                // Denne har validering i trukket komponenten
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                datoSøkerTrakkSøknad: values.trukket.datoSøkerTrakkSøknad!,
            };

        case LukkSøknadBegrunnelse.Bortfalt:
            return {
                type: values.lukkSøknadOgAvsluttSøknadsbehandling,
            };
        case LukkSøknadBegrunnelse.Avvist:
            return {
                type: values.lukkSøknadOgAvsluttSøknadsbehandling,
                brevConfig: values.avvist.typeBrev
                    ? {
                          brevtype: values.avvist.typeBrev,
                          fritekst: values.avvist.fritekst,
                      }
                    : null,
            };
        default:
            throw new Error('LukkSøknadBegrunnelse har ugyldig verdi');
    }
}

function hentOpprettetDatoFraSøknad(søknad: Søknad) {
    if (søknad.søknadInnhold.forNav.type === Søknadstype.Papirsøknad) {
        return søknad.søknadInnhold.forNav.mottaksdatoForSøknad;
    }
    return søknad.opprettet;
}

const lukkSøknadBegrunnelseI18nId = (type: LukkSøknadOgAvsluttSøknadsbehandlingType): keyof typeof nb => {
    switch (type) {
        case LukkSøknadBegrunnelse.Trukket:
            return 'lukking.begrunnelse.trukket';
        case LukkSøknadBegrunnelse.Bortfalt:
            return 'lukking.begrunnelse.bortfalt';
        case LukkSøknadBegrunnelse.Avvist:
            return 'lukking.begrunnelse.avvist';
        case AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok:
            return 'avslutt.manglendeDokumentasjon';
    }
};

export default LukkSøknadOgAvsluttBehandling;
