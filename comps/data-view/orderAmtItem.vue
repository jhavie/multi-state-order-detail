<template>
    <div>
        <div class="inblock">{{ priceInfo.orderAmt | numTofixed | formatMoney(2, '') }}元</div>
        <el-button type="text" v-if="!isMultiple" @click="seeDetail">查看明细</el-button>
        <contract-breach v-if="isBreak" :ruleTableData="ruleTableData"></contract-breach>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { setStore } from 'Utils';
import basicService from 'Service/basicService';
import contractBreach from './contractBreach.vue';

@Component({
    name: 'OrderAmtItem',
    components: {
        contractBreach
    },
})
export default class OrderAmtItem extends Vue {
    @Prop({ type: Object, required: true })
    priceInfo!: object;

    @Prop({ type: Boolean, default: false })
    isMultiple?: boolean;

    @Prop({ type: Boolean, default: true })
    isBreak?: boolean;

    @Prop({ type: Array })
    ruleTableData?: object[];

    get isSupplier() {
        return basicService.isSupplier();
    }

    seeDetail() {
        // 订单明细
        // const priceInfo = {
        //     orderAmt: this.detail.orderAmt,
        //     orderAmtExTax: this.detail.totalAmountExclusiveTax,
        //     priceList: this.detail.priceList,
        //     markItems: this.markItems,
        // };
        setStore({ name: 'priceInfo', content: this.priceInfo });
        let routerPath;
        if (this.isSupplier) {
            routerPath = '/supplier/orderManger/amountDetail';
        } else {
            routerPath = '/staffs/orderManger/amountDetail';
        }
        // const url = window.location.origin + window.location.pathname + '#' + routerPath;
        // window.open(url);
        this.$router.push({ path: routerPath });
    }
}
</script>

<style scoped>

</style>
