import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyLong, Heading } from '@navikt/ds-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { ApiError } from '~src/api/apiClient';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import { useUserContext } from '~src/context/userContext';
import * as innsendingSlice from '~src/features/søknad/innsending.slice';
import { SøknadState } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { SøknadContext } from '~src/pages/søknad';
import { schema as alderspensjonSchema } from '~src/pages/søknad/steg/alderspensjon/validering';
import { schema as boOgOppholdSchema } from '~src/pages/søknad/steg/bo-og-opphold-i-norge/validering';
import { schema as flyktningSchema } from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/validering';
import { schema as forVeilederSchema } from '~src/pages/søknad/steg/for-veileder/validering';
import { formueValideringSchema } from '~src/pages/søknad/steg/formue/validering';
import { schema as papirsøknadSchema } from '~src/pages/søknad/steg/informasjon-om-papirsøknad/validering';
import { inntektsValideringSchema } from '~src/pages/søknad/steg/inntekt/validering';
import { schema as oppholdstillatelseSchema } from '~src/pages/søknad/steg/oppholdstillatelse/validering';
import sharedI18n from '~src/pages/søknad/steg/steg-shared-i18n';
import { schema as uføreSchema } from '~src/pages/søknad/steg/uførevedtak/validering';
import { schema as utenlandsoppholdSchema } from '~src/pages/søknad/steg/utenlandsopphold/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Rolle } from '~src/types/LoggedInUser';
import { Person } from '~src/types/Person';
import { Sakstype } from '~src/types/Sak';
import { Søknadstype } from '~src/types/Søknadinnhold';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import {
    FrontendValideringsfeil,
    hentBackendSøknadsinnholdValideringsfeil,
    hentSøknadsinnholdValideringsfeil,
} from './backendValidationUtils';
import styles from './oppsummering.module.less';
import messages from './oppsummering-nb';
import Søknadoppsummering from './Søknadoppsummering/Søknadoppsummering';

const Oppsummering = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string; søker: Person }) => {
    const navigate = useNavigate();
    const { sakstype } = useOutletContext<SøknadContext>();
    const user = useUserContext();
    const [søknadFraStore, innsending] = useAppSelector((s) => [s.soknad, s.innsending.søknad]);
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedI18n } });
    const dispatch = useAppDispatch();
    const feiloppsummeringref = useRef<HTMLDivElement>(null);
    const [innsendingsvalideringsfeil, setInnsendingsvalideringsfeil] = useState<FrontendValideringsfeil[]>([]);

    const alderssøknadsschema = yup.object({
        ...alderspensjonSchema.fields,
        oppholdstillatelse: oppholdstillatelseSchema,
    });
    const uføresøknadsschema = yup.object({
        ...uføreSchema.fields,
        flyktningstatus: flyktningSchema,
    });

    const veileder = yup.object({
        forVeileder:
            søknadFraStore.forVeileder.type === Søknadstype.Papirsøknad && user.roller.includes(Rolle.Saksbehandler)
                ? papirsøknadSchema
                : forVeilederSchema,
    });

    const søknadschema = yup.object({
        ...(sakstype === Sakstype.Alder ? alderssøknadsschema.fields : {}),
        ...(sakstype === Sakstype.Uføre ? uføresøknadsschema.fields : {}),
        boOgOpphold: boOgOppholdSchema,
        formue: formueValideringSchema('søker'),
        inntekt: inntektsValideringSchema('søker'),
        ...(søknadFraStore.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
            ? {
                  ektefelle: yup.object({
                      formue: formueValideringSchema('eps'),
                      inntekt: inntektsValideringSchema('eps'),
                  }),
              }
            : {}),
        utenlandsopphold: utenlandsoppholdSchema,
        ...veileder.fields,
    });

    const form = useForm({
        defaultValues: søknadFraStore,
        resolver: yupResolver(søknadschema),
    });

    const håndterBackendValideringsfeil = (error: ApiError | undefined): boolean => {
        if (!error) return false;

        const backendValideringsfeil = hentBackendSøknadsinnholdValideringsfeil(error);
        if (!backendValideringsfeil) return false;

        const valideringsfeil = hentSøknadsinnholdValideringsfeil(error) ?? [];
        setInnsendingsvalideringsfeil(valideringsfeil);

        return true;
    };

    const handleSubmit = async (values: SøknadState) => {
        if (RemoteData.isSuccess(innsending)) return;
        setInnsendingsvalideringsfeil([]);
        form.clearErrors();

        if (sakstype === Sakstype.Uføre) {
            const res = await dispatch(
                innsendingSlice.sendUføresøknad({
                    søknad: values,
                    søker: props.søker,
                }),
            );
            if (innsendingSlice.sendUføresøknad.fulfilled.match(res)) {
                navigate(props.nesteUrl);
                return;
            }

            if (innsendingSlice.sendUføresøknad.rejected.match(res)) {
                håndterBackendValideringsfeil(res.payload);
            }
            return;
        }

        if (sakstype === Sakstype.Alder) {
            const res = await dispatch(
                innsendingSlice.sendAldersøknad({
                    søknad: values,
                    søker: props.søker,
                }),
            );
            if (innsendingSlice.sendAldersøknad.fulfilled.match(res)) {
                navigate(props.nesteUrl);
                return;
            }

            if (innsendingSlice.sendAldersøknad.rejected.match(res)) {
                håndterBackendValideringsfeil(res.payload);
            }
        }
    };

    return (
        <div className={sharedStyles.container}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <Søknadoppsummering søknad={søknadFraStore} sakstype={sakstype} />

                <Alert variant="info" className={styles.meldFraOmEndringerContainer}>
                    <Heading level="2" size="medium" spacing>
                        {formatMessage('meldFraOmEndringer.tittel')}
                    </Heading>
                    <BodyLong>{formatMessage('meldFraOmEndringer.tekst')}</BodyLong>
                </Alert>

                {innsendingsvalideringsfeil.length > 0 && (
                    <>
                        <Feiloppsummering
                            tittel={formatMessage('feilmelding.innsendingFeilet')}
                            feil={innsendingsvalideringsfeil.map((ifeil) => {
                                return {
                                    skjemaelementId: ifeil.feltSti,
                                    feilmelding: `${ifeil.feltSti}: ${ifeil.begrunnelse}`,
                                };
                            })}
                        />
                    </>
                )}

                {innsendingsvalideringsfeil.length === 0 && RemoteData.isFailure(innsending) && (
                    <Alert className={styles.feilmelding} variant="error">
                        {formatMessage('feilmelding.innsendingFeilet')}
                    </Alert>
                )}

                <Feiloppsummering
                    className={sharedStyles.marginBottom}
                    tittel={formatMessage('feiloppsummering.title')}
                    hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                    feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                    ref={feiloppsummeringref}
                />

                <Bunnknapper
                    previous={{
                        onClick: () => navigate(props.forrigeUrl),
                    }}
                    next={{
                        label: formatMessage('steg.sendInn'),
                        spinner: RemoteData.isPending(innsending),
                        disabled: RemoteData.isSuccess(innsending),
                    }}
                    avbryt={{
                        toRoute: props.avbrytUrl,
                    }}
                />
            </form>
        </div>
    );
};

export default Oppsummering;
