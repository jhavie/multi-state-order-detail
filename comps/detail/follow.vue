<template>
    <fragment>
        <order-list-plug
            :changeTableData="changeTableData"
            ref="orderListPlug"
            :offerDetailedListBean="params.offerDetailListBean"
            :markItems="params.markItems"
            :paramsReq="paramsReq"
            :titleName="'采购订单'"
            :prepayRatio="params.prepayRatio"
        ></order-list-plug>
    </fragment>
</template>

<script lang="ts">
import { Prop, Mixins, Component, Inject } from 'vue-property-decorator';
import orderListPlug from './orderListPlugOri.vue';
import Method from 'Views/common/order-detail/mixins/method.vue';
// import { accDiv, accMul, formatMoney } from 'Utils';

@Component({
    name: 'follow',
    components: {
        orderListPlug,
    },
})
export default class Follow extends Mixins(Method) {
    @Prop({ type: Object, default: () => {} })
    params!: object;

    @Inject('pageData')
    getOrderPage;
    
    mounted() {
        this.$emit('eventBus', 'getOrderList', this.getOrderList);
    }

    get paramsReq() {
        return {
            isConfirmTempl: false,
            iswaitSign: this.isSupplier && this.params.orderStatus === 'WAIT_SUPP_CONFIRM',
        };
    }

    getOrderList() {
        const revisibleItems = this.$refs.orderListPlug.revisibleItems;
        const suppUpdateChargeDetailList = [];
        revisibleItems.forEach((it) => {
            suppUpdateChargeDetailList.push({
                detailId: it.detailId,
                unitAmt: it.unitPrice,
            });
        });
        return suppUpdateChargeDetailList;
    }
    // 供应商修改价格
    changeTableData(data) {
        const orderPage = this.getOrderPage();
        const totalAmount = data.topData.totalAmount;
        orderPage.setDataPool('orderAmt', totalAmount);
    }
}
</script>

<style scoped>
</style>
