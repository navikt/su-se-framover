import { Button, Heading, Radio, RadioGroup, Select, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, useForm } from 'react-hook-form';

//import * as pdfApi from '~api/pdfApi';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
//import { useAsyncActionCreator, useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Klage } from '~types/Klage';
import { Sak } from '~types/Sak';

import messages from './behandlingAvKlage-nb';
import styles from './behandlingAvKlage.module.less';

enum VedtakHandling {
    OMGJØR = 'omgjør_vedtak',
    OPPRETTHOLD = 'oppretthold_vedtak',
}

enum OmgjørVedtakÅrsak {
    FEIL_LOVANVENDELSE = 'feil_lovanvendelse',
    ULIK_SKJØNNSVURDERING = 'ulik_skjønnsvurdering',
    SAKSBEHADNLINGSFEIL = 'saksbehadnlingsfeil',
    NYTT_FAKTUM = 'nytt_faktum',
}

enum OmgjørVedtakGunst {
    TIL_GUNST = 'til_gunst',
    TIL_UGUNST = 'til_ugunst',
    DELVIS_OMGJØR_TIL_GUNST = 'delvis_omgjør_til_gunst',
}

enum OpprettholdVedtakHjemmel {
    'Hjemmel1' = '1',
    'Hjemmel2' = '2',
    'Hjemmel3' = '3',
}

interface BehandlingAvKlageFormData {
    vedtakHandling: Nullable<VedtakHandling>;
    omgjør: {
        årsak: Nullable<OmgjørVedtakÅrsak>;
        gunst: Nullable<OmgjørVedtakGunst>;
    };
    oppretthold: {
        hjemmel: Nullable<OpprettholdVedtakHjemmel>;
    };
    vurdering: Nullable<string>;
    fritekst: Nullable<string>;
}

const BehandlingAvKlage = (props: { sak: Sak; klage: Klage }) => {
    const { formatMessage } = useI18n({ messages });

    //TODO
    //const [lagreBehandlingAvKlageStatus, lagreBehandlingAvKlage] = useAsyncActionCreator();
    //const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi);

    const { handleSubmit, watch, control } = useForm<BehandlingAvKlageFormData>({
        defaultValues: {
            vedtakHandling: null,
            omgjør: {
                årsak: null,
                gunst: null,
            },
            oppretthold: {
                hjemmel: null,
            },
            vurdering: null,
            fritekst: null,
        },
    });

    const handleBehandlingAvKlageSubmit = (data: BehandlingAvKlageFormData) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(handleBehandlingAvKlageSubmit)}>
            <Heading size="2xlarge">{formatMessage('page.tittel')}</Heading>
            <div className={styles.vedtakHandlingContainer}>
                <Controller
                    control={control}
                    name={'vedtakHandling'}
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            {...field}
                            legend={formatMessage('form.vedtakHandling.legend')}
                            error={fieldState.error}
                            value={field.value ?? undefined}
                        >
                            <Radio value={VedtakHandling.OMGJØR}>
                                {formatMessage('form.vedtakHandling.omgjørVedtak')}
                            </Radio>
                            <Radio value={VedtakHandling.OPPRETTHOLD}>
                                {formatMessage('form.vedtakHandling.opprettholdVedtak')}
                            </Radio>
                        </RadioGroup>
                    )}
                />
            </div>

            {watch('vedtakHandling') === VedtakHandling.OMGJØR && <OmgjørVedtakForm control={control} />}
            {watch('vedtakHandling') === VedtakHandling.OPPRETTHOLD && <OpprettholdVedtakForm control={control} />}

            <div className={styles.vurderingContainer}>
                <Controller
                    control={control}
                    name={'vurdering'}
                    render={({ field, fieldState }) => (
                        <Textarea
                            {...field}
                            label={formatMessage('form.vurdering.label')}
                            value={field.value ?? ''}
                            error={fieldState.error}
                        />
                    )}
                />
            </div>
            <div className={styles.fritesktOgVisBrevContainer}>
                <Controller
                    control={control}
                    name={'fritekst'}
                    render={({ field, fieldState }) => (
                        <Textarea
                            {...field}
                            label={formatMessage('form.fritekst.label')}
                            value={field.value ?? ''}
                            error={fieldState.error}
                        />
                    )}
                />
                <Button variant="secondary">{formatMessage('knapp.seBrev')}</Button>
            </div>

            <div className={styles.knapperContainer}>
                <LinkAsButton
                    variant="secondary"
                    href={Routes.klage.createURL({
                        sakId: props.sak.id,
                        klageId: props.klage.id,
                        steg: KlageSteg.Formkrav,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </LinkAsButton>
                <Button>{formatMessage('knapp.neste')}</Button>
            </div>
        </form>
    );
};

const OmgjørVedtakForm = (props: { control: Control<BehandlingAvKlageFormData> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.formContainer}>
            <Controller
                control={props.control}
                name={'vedtakHandling'}
                render={({ field, fieldState }) => (
                    <Select
                        {...field}
                        label={formatMessage('form.omgjørVedtak.årsak.label')}
                        value={field.value ?? ''}
                        error={fieldState.error}
                    >
                        <option value="">{formatMessage('form.omgjørVedtak.årsak.velgÅrsak')}</option>
                        {Object.values(OmgjørVedtakÅrsak).map((årsak) => (
                            <option value={årsak} key={årsak}>
                                {formatMessage(omgjørVedtakÅrsakMessages[årsak])}
                            </option>
                        ))}
                    </Select>
                )}
            />
            <Controller
                control={props.control}
                name={'omgjør.gunst'}
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend=""
                        hideLegend
                        {...field}
                        error={fieldState.error}
                        value={field.value ?? undefined}
                    >
                        {Object.values(OmgjørVedtakGunst).map((gunst) => (
                            <Radio value={gunst} key={gunst}>
                                {formatMessage(omgjørVedtakGunstMessages[gunst])}
                            </Radio>
                        ))}
                    </RadioGroup>
                )}
            />
        </div>
    );
};

const OpprettholdVedtakForm = (props: { control: Control<BehandlingAvKlageFormData> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.formContainer}>
            <Controller
                control={props.control}
                name={'oppretthold.hjemmel'}
                render={({ field, fieldState }) => (
                    <Select
                        {...field}
                        label={formatMessage('form.opprettholdVedtak.hjemmel.label')}
                        value={field.value ?? ''}
                        error={fieldState.error}
                    >
                        <option value="">{formatMessage('form.opprettholdVedtak.hjemmel.velgHjemmel')}</option>
                        {Object.values(OpprettholdVedtakHjemmel).map((hjemmel) => (
                            <option value={hjemmel} key={hjemmel}>
                                {formatMessage(OpprettholdVedtakHjemmelMessages[hjemmel])}
                            </option>
                        ))}
                    </Select>
                )}
            />
        </div>
    );
};

const omgjørVedtakÅrsakMessages: { [key in OmgjørVedtakÅrsak]: keyof typeof messages } = {
    [OmgjørVedtakÅrsak.FEIL_LOVANVENDELSE]: 'form.omgjørVedtak.årsak.feilLovanvendelse',
    [OmgjørVedtakÅrsak.SAKSBEHADNLINGSFEIL]: 'form.omgjørVedtak.årsak.saksbehandlingsfeil',
    [OmgjørVedtakÅrsak.ULIK_SKJØNNSVURDERING]: 'form.omgjørVedtak.årsak.ulikSkjønnsvurdering',
    [OmgjørVedtakÅrsak.NYTT_FAKTUM]: 'form.omgjørVedtak.årsak.nyttFaktum',
};
const omgjørVedtakGunstMessages: { [key in OmgjørVedtakGunst]: keyof typeof messages } = {
    [OmgjørVedtakGunst.TIL_GUNST]: 'form.omgjørVedtak.gunst.tilGunst',
    [OmgjørVedtakGunst.TIL_UGUNST]: 'form.omgjørVedtak.gunst.tilUgunst',
    [OmgjørVedtakGunst.DELVIS_OMGJØR_TIL_GUNST]: 'form.omgjørVedtak.gunst.delvisOmgjørTilGunst',
};

const OpprettholdVedtakHjemmelMessages: { [key in OpprettholdVedtakHjemmel]: keyof typeof messages } = {
    [OpprettholdVedtakHjemmel.Hjemmel1]: 'form.opprettholdVedtak.hjemmel.1',
    [OpprettholdVedtakHjemmel.Hjemmel2]: 'form.opprettholdVedtak.hjemmel.2',
    [OpprettholdVedtakHjemmel.Hjemmel3]: 'form.opprettholdVedtak.hjemmel.3',
};

export default BehandlingAvKlage;
