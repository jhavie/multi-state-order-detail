<template>
    <el-popover v-if="ruleTableData" placement="top-start" title="活动的取消及违约责任" width="500" trigger="hover">
        <div class="pre">
            <div class="wrap">
                双方确认采购订单后，如果发生如下违约情形的，甲方与乙方分别按下列规定承担违约责任；
                如甲乙方就违约责任有另行约定的，按照平台订单实际约定为准。
            </div>
            1.甲方的违约责任：
            <div class="wrap">订单生效后，如因甲方原因取消订单，甲方应支付违约金标准如下：</div>
            <rule-table class="nowrap" :ruleTableData="ruleTableData" :mode="'show'"></rule-table>
            2.乙方的违约责任：
            <div class="wrap">
                订单生效后，因乙方原因取消订单的，除全额退款外，乙方还应额外支付违约金标准如下：
            </div>
            <rule-table class="nowrap" :ruleTableData="ruleTableData" :mode="'show'"></rule-table>
        </div>
        <span class="detail" slot="reference">违约说明</span>
    </el-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ruleTable from 'PageViewsCommon/quoteSignContract/components/ruleTable.vue';

interface breakContractInfo {
    actRange: string;
    ratio: number;
}

@Component({
    name: 'ContractBreach',
    components: {
        ruleTable,
    },
})
export default class ContractBreach extends Vue {
    @Prop({ type: Array })
    ruleTableData?: Array<breakContractInfo>;
}
</script>

<style scoped>
.pre {
    padding: 0 20px;
}

.nowrap {
    white-space: nowrap;
    padding: 16px;
}

.detail {
    display: inline-block;
    font-weight: 500;
    line-height: 28px;
    color: #4b8bee;
    cursor: pointer;
}
</style>
