import React from 'react';

import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import Vilkårsvurdering from '../vilkårsvurdering/Vilkårsvurdering';
import WarningIcon from '../icons/WarningIcon';

import styles from './vilkår.module.less';

const Vilkår = () => {
    return (
        <div className={styles.container}>
            <Vilkårsvurdering title="Uførhet" icon={<WarningIcon />}>
                <RadioGruppe legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-8 i folketrygdloven er oppfylt?">
                    <Radio label={'Ja'} name="uføretrygd" />
                    <Radio label={'Nei'} name="uføretrygd" />
                </RadioGruppe>
            </Vilkårsvurdering>

            <Vilkårsvurdering title="Flykning" icon={<WarningIcon />}>
                <RadioGruppe legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-8 i folketrygdloven er oppfylt?">
                    <Radio label={'Ja'} name="uføretrygd" />
                    <Radio label={'Nei'} name="uføretrygd" />
                </RadioGruppe>
            </Vilkårsvurdering>
        </div>
    );
};
export default Vilkår;
