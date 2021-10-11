<template>
    <fragment>
        <div class="order-detail-content-others">
            <inovice-info
                v-if="isSupplier && params.isWaitSuppConfirm && additionBeanData.taxRate"
                ref="inoviceInfo"
                class="form_wrap_main"
                :outSourceSys="''"
                :addition-bean-data="additionBeanData"
                :editable="false"
            ></inovice-info>
        </div>
        <goods-tax-table
            class="goods-table"
            ref="goodsTable"
            :peopleNum="params.peopleNum"
            :tableData="params.bpOfferSumBeanList"
            :isUnify="params.isUnify"
            :taxRate="params.taxRate"
            :isSupplierRevising="params.isWaitSuppConfirm"
            :isSupplier="isSupplier"
            :isChecking="params.isChecking"
            :titleName="'预定信息'"
            @tableDataChange="tableDataChange"
        ></goods-tax-table>
    </fragment>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Inject } from 'vue-property-decorator';
import inoviceInfo from './inoviceInfo.vue'; // 发票组件
import { deepClone } from 'Utils';
import goodsTaxTable from '@mice/pages/views/goods/components/goodsTaxTable.vue'; // 标品表格
import Method from 'Views/common/order-detail/mixins/method.vue';

@Component({
    name: 'goods',
    components: {
        goodsTaxTable,
        inoviceInfo
    }
})
export default class Goods extends Mixins(Method) {
    @Prop({ type: Object, default: () => {} })
    params!: object;

    @Inject('pageData')
    getOrderPage;

    private tableData = [];
    private additionBeanData = {};

    mounted() {
        this.initData();
        this.$emit('eventBus', 'updateBpOrderDetailList', this.updateBpOrderDetailList);
        this.$emit('eventBus', 'getInoviceInfo', this.getInoviceInfo);
    }

    initData() {
        const { invoiceReq = '', invoiceType = '' } = this.params.invoiceReqBean;
        this.$set(
            this.additionBeanData,
            'taxRate',
            {
                ...this.params.taxRate,
                invoiceReq,
                invoiceType
            }
        );
        this.tableData = deepClone(this.params.bpOfferSumBeanList);
    }

    getInoviceInfo() {
        return this.$refs.inoviceInfo.getFormData();
    }

    updateBpOrderDetailList() {
        return this.tableData.reduce((ans, i, idx) => {
            i?.bpBookServiceInfoList?.forEach((service) => {
                service?.bookDetailInfoList?.forEach((item) => {
                    ans.push({
                        detailId: item?.detailId,
                        unitAmt: item?.unitAmt,
                    });
                });
            });
            return ans;
        }, []);
    }

    tableDataChange(data) {
        const orderPage = this.getOrderPage();
        const { tableData, totalAmount } = data;
        this.tableData = tableData;
        orderPage.setDataPool('orderAmt', totalAmount);
    }
}
</script>

<style scoped>
.order-detail-content-others {
    margin-left: 80px;
}
.goods-table {
    margin-top: 20px;
}
</style>
