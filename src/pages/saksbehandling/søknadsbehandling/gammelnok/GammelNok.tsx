import { useForm } from 'react-hook-form';

import { Heading } from '~node_modules/@navikt/ds-react';
import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi.ts';
import styles from '~src/components/forms/vilkårOgGrunnlagForms/uførhet/uførhet.module.less';
import messages from '~src/components/forms/vilkårOgGrunnlagForms/VilkårOgGrunnlagForms-nb.ts';
import ToKolonner from '~src/components/toKolonner/ToKolonner.tsx';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup.tsx';
import { lagreAlderVilkårAlder } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import { Nullable } from '~src/lib/types.ts';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper.tsx';
import sharedMessages from '~src/pages/saksbehandling/søknadsbehandling/sharedI18n-nb.ts';
import sharedStyles from '~src/pages/saksbehandling/søknadsbehandling/sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types.ts';
import { Vilkårstatus } from '~src/types/Vilkår.ts';

import mmessages from './gammelnok-nb.ts';

export interface GammelNokFormData {
    oppfylt: Nullable<Vilkårstatus>;
}

export interface GammelNokRequest {
    sakId: string;
    behandlingId: string;
    skjema: GammelNokFormData;
}

export const GammelNok = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages, ...mmessages } });

    const [status, lagre] = useAsyncActionCreator(lagreAlderVilkårAlder);

    const defaultValues: GammelNokFormData = {
        oppfylt: null,
    };

    const form = useForm<GammelNokFormData>({
        defaultValues,
    });

    const save = (skjema: GammelNokFormData, onSucces: () => void) => {
        return lagre(
            {
                skjema: skjema,
                behandlingstype: Behandlingstype.Søknadsbehandling,
                sakId: props.sakId,
                behandlingId: props.behandling.id,
            },
            onSucces,
        );
    };

    const handleNesteClick = (values: GammelNokFormData, onSucces: () => void) => {
        return save(values, onSucces);
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FormWrapper
                        form={form}
                        neste={{
                            url: props.nesteUrl,
                            onClick: handleNesteClick,
                            savingState: status,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: save,
                            url: props.avsluttUrl,
                        }}
                    >
                        <div>
                            <VilkårsResultatRadioGroup
                                className={styles.vilkårInput}
                                name={'oppfylt'}
                                legend={formatMessage('alder.gammelnok')}
                                controller={form.control}
                            />
                        </div>
                    </FormWrapper>
                ),
                right: (
                    <div className={sharedStyles.toKollonerRightContainer}>
                        <div>
                            <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>s slette denne?
                            eller vise aldersinfo?
                        </div>
                    </div>
                ),
            }}
        </ToKolonner>
    );
};
