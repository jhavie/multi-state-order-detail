<template>
    <div>
        <el-dialog class="el-dialog--large" title="" width="65%" :visible.sync="eBookVisibleSynced">
            <div class="eBook">
                <eBook
                    :isHotelSupp="params.isHotelSupp"
                    :orderMes="contractInfo"
                    :paramsReq="{ isConfirmTempl: false }"
                    :isShowHead="true"
                ></eBook>
                <div class="quoteRules">
                    <contract-rules
                        v-on="$listeners"
                        :isBreak="!!params.breakContractInfoList"
                        :ruleTableMode="['show', 'show']"
                        :ruleTableData="params.breakContractInfoList"
                        :isHotelSupp="params.isHotelSupp"
                    ></contract-rules>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, PropSync, Inject } from 'vue-property-decorator';
import contractRules from 'Views/common/quoteSignContract/components/contractRules.vue';
import eBook from 'Views/common/quoteSignContract/eBook.vue';

@Component({
    name: 'e-contract-dialog',
    components: {
        contractRules,
        eBook,
    },
})
export default class EContractDialog extends Vue {
    @Prop({ type: Object })
    params!: object;

    @Inject('pageData')
    getOrderPage;

    @PropSync('eBookVisible', { type: Boolean, default: () => false })
    eBookVisibleSynced!: boolean;

    get contractInfo() {
        const orderPage = this.getOrderPage();
        return {
            ...this.params.contractInfo,
            orderAmt: orderPage.dataPool.orderAmt,
        };
    }
}
</script>
