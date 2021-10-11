<template>
    <div class="bear-types">
        <div class="list">
            <div v-for="assisted in bearList"
                 class="list-item">
                <span class="tip"
                      v-if="assisted.isMain === 'Y'">主办方</span>
                <span :class="{'item-name': true, 'add-margin': assisted.isMain !== 'Y'}">{{assisted.invoiceName}}</span>
                <span v-if="unit !== '元'"
                      class="value-show">{{assisted.costValue + unit}}</span>
                <span class="amount">{{ Number(assisted.costAmt) | numTofixed}}元</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
    name: 'bear-types'
})
export default class BearTypes extends Vue {
    @Prop({ type: String, default: () => 'NUMBER' })
    bearType!: string;

    @Prop({ type: Array, default: () => [] })
    bearList!: object[];

    get unit() {
        const typeToUnit = { RATIO: '%', NUMBER: '人', AMT: '元' };
        return typeToUnit[this.bearType] || '人';
    }
}
</script>

<style lang="scss" scoped="scoped">
    .bear-types {
        .list {
            .list-item {
                .tip {
                    margin-right: 8px;
                    background: #eff6ff;
                    border-radius: 2px;
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: #6da1f1;
                    padding: 3px 8px;
                }
                .item-name {
                    display: inline-block;
                }
                .add-margin {
                    margin-left: 65px;
                }
                .item-value {
                    display: inline-block;
                    padding-left: 10px;
                    padding-right: 10px;
                }
                .amount {
                }
            }
        }
    }
</style>
