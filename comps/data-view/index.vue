<template>
    <div class="data-display">
        <template v-for="item in filterConfig">
            <div :style="{ width: span2width(item.span) }">
                <!-- 传入非组件 -->
                <div v-if="!item.component">
                    <div v-if="item.label" class="label">
                        {{ getLabel(item) }}
                    </div>
                    <div
                        v-if="item.formatter || item.value || item.slot"
                        :style="item.style"
                        :class="['value', item.span === 12 ? 'single' : '']"
                    >
                        {{ getValue(item) }}
                        <!--slot 部分-->
                        <div v-if="item.slot" class="inblock">
                            <template v-for="child in filterChildConfig(item.slot)">
                                <el-button v-if="child.type === 'button'" @click="child.click()" type="text">
                                    {{ child.name }}
                                </el-button>
                                <el-popover
                                    v-if="child.type === 'tip'"
                                    placement="bottom-start"
                                    :width="child.tipWidth"
                                    trigger="hover"
                                    :content="child.tip"
                                >
                                    <i slot="reference" class="el-icon-question" v-if="child.notice"
                                        ><span class="rule-image">{{ child.notice }}</span></i
                                    >
                                    <i slot="reference" class="el-icon-warning-outline" v-else></i>
                                </el-popover>
                            </template>
                        </div>
                        <!--slot 部分-->
                    </div>
                </div>
                <!-- 传入为组件 -->
                <div v-else>
                    <div v-if="item.label" class="label">
                        {{ getLabel(item) }}
                    </div>
                    <component :is="item.component" v-bind="getProps(item)" class="value"> </component>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import orderAmtItem from './orderAmtItem.vue';
import fileListItem from './fileListItem.vue';
import billAmtItem from './billAmtItem.vue';
import bearTypes from './bearTypes.vue';
import cityShow from 'Common/components/rederDynamic/cityShow.vue';
import payment from './payment.vue';
import contractBreach from './contractBreach.vue';

type slotTip = {
    type?: string;
    tip?: string;
    tipWidth?: number;
};

type slotButton = {
    type?: string;
    name?: string;
    click?: () => void;
};

interface dataConfig {
    show?: boolean;
    label?: string;
    value?: string;
    span?: number;
    formatter?: (val: any) => string;
    style?: object;
    props?: object;
    component?: string;
    slot?: slotTip[] | slotButton[];
}

@Component({
    name: 'data-view',
    components: {
        payment,
        cityShow,
        contractBreach,
        billAmtItem,
        fileListItem,
        orderAmtItem,
        bearTypes,
    },
})
export default class DataDisplay extends Vue {
    defaultSpan = 6;
    defaultShow = true;

    @Prop({ type: Array, required: true, default: () => [] })
    dataConfig!: dataConfig[];

    get filterConfig() {
        const newConfig = this.dataConfig.map((item) => {
            if (![null, false, ''].includes(item?.show)) {
                item.show = this.defaultShow;
            }
            return item;
        });
        return newConfig.filter((item) => item?.show);
    }

    filterChildConfig(childConfig) {
        const newConfig = childConfig.map((item) => {
            if (![null, false, ''].includes(item?.show)) {
                item.show = this.defaultShow;
            }
            return item;
        });
        return newConfig.filter((item) => item?.show);
    }

    span2width(span = this.defaultSpan) {
        const fullwidth = 12;
        const ratio = (span / fullwidth) * 100 + '%';
        return ratio;
    }

    getProps(item) {
        return item.props;
    }

    getValue(item) {
        if (item.formatter) {
            return item.formatter(item.value);
        }
        return item?.value ?? '';
    }

    getLabel(item) {
        return item.label + '：';
    }
}
</script>

<style lang="scss" scoped>
.data-display {
    display: flex;
    flex-flow: wrap;
    justify-content: flex-start;
    font-size: 14px;
    line-height: 28px;
    .label {
        display: inline-block;
        vertical-align: top;
        color: #747474;
        width: 160px;
        text-align: right;
    }
    .single {
        width: calc(100% - 170px);
    }
    .value {
        display: inline-block;
    }
    .el-icon-warning-outline {
        margin-left: 5px;
        color: #4b8bee;
        font-size: 17px;
        font-weight: bold;
    }
}
/deep/ .el-button {
    padding: 0;
}
.el-icon-question {
    color: #4b8bee;
    font-size: 17px;
    vertical-align: middle;
    margin-left: 8px;
}
.rule-image {
    color: #4b8bee;
    font-size: 14px;
    margin-left: 4px;
}
</style>
