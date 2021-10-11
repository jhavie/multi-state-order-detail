<template>
    <div class="e-book-section">
        <div class="top-border"></div>
        <div class="eBook">
            <eBook
                :isHotelSupp="params.isHotelSupp"
                :orderMes="contractInfo"
                :paramsReq="{ isConfirmTempl: false }"
                :isShowHead="true"
            ></eBook>
            <div class="quoteRules">
                <contract-rules
                    @change="ruleTableChange"
                    :isBreak="showRuleTable"
                    :ruleTableMode="ruleTableMode"
                    :ruleTableData="params.breakContractInfoList || []"
                    :isHotelSupp="params.isHotelSupp"
                ></contract-rules>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Inject } from 'vue-property-decorator';
import { RULE_TABLE_CONFIG } from '../../configs/const';
import contractRules from 'Views/common/quoteSignContract/components/contractRules.vue';
import eBook from 'Views/common/quoteSignContract/eBook.vue';
import basicService from 'Service/basicService';

@Component({
    name: 'e-contract-dialog',
    components: {
        contractRules,
        eBook
    }
})
export default class EContractDialog extends Vue {
    @Prop({ type: Object })
    params!: object;

    @Inject('pageData')
    getOrderPage;

    private ruleTableConfig = Object.freeze(RULE_TABLE_CONFIG);

    get role() {
        if (basicService.isSupplier()) return 'supplier';
        return 'staff';
    }

    get ruleTableMode() {
        const roleObj = this.ruleTableConfig[this.role];
        const obj = roleObj[this.params?.orderStatus] || roleObj.default;
        return obj.ruleTableMode;
    }
    get showRuleTable() {
        const roleObj = this.ruleTableConfig[this.role];
        const obj = roleObj[this.params?.orderStatus] || roleObj.default;
        if (obj.showRuleTable === 'auto') return !!this.params.breakContractInfoList;
        return obj.showRuleTable;
    }

    ruleTableChange(data) {
        const { ruleTableData, validateCb } = data;
        this.params.breakContractInfoList = ruleTableData;
        this.params.ruleTableValidate = validateCb;
    }

    get contractInfo() {
        const orderPage = this.getOrderPage();
        return {
            ...this.params.contractInfo,
            orderAmt: orderPage.dataPool.orderAmt
        };
    }
}
</script>
<style scoped>
.top-border {
    background-color: #F5F5F5;
    height: 20px;
}
.eBook {
    padding: 30px;
    box-shadow: 0 2px 10px 0 rgba(206,206,206,0.5);
}
</style>
