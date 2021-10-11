<template>
    <div>
        <div class="payment-item" v-if="billAmt !== null">
            <div class="value">
                {{ billAmt | numTofixed | formatMoney(2, '') }}元
            </div>
            <div class="grey" v-if="billBatch === 'Y'">(多账单)</div>
            <!--<div v-if="canUploadBill"
                 class="detail"
                 @click="goUploaderBill()">
                上传账单
            </div>-->
            <div v-if="canEdit"
                 class="detail"
                 @click="seeDetail()">
                查看明细
            </div>
        </div>
        <div v-else class="payment-item">
            <div v-if="!isSupplier" class="payment-item-value">待供应商上传账单</div>
            <div v-if="isSupplier" class="payment-item-value">待上传账单</div>
            <!--<div v-if="isSupplier && canEdit" class="see-detail" @click="goUploaderBill()">
                上传账单
            </div>-->
            <!-- <div v-if="isSupplier" class="see-detail"
                    @click="seeDetail('bill')">查看明细</div> -->
        </div>
    </div>
</template>

<script lang="ts">
import { basicService } from 'Service';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
    name: 'BillAmtItem'
})

export default class BillAmtItem extends Vue {
    @Prop({ type: Number })
    billAmt!:number;

    @Prop({ type: String })
    billBatch!:string;

    @Prop({ type: String })
    orderStatus!:string;

    @Prop({ type: String })
    mode!:string;

    get canEdit() {
        return this.mode === 'edit';
    }

    get isSupplier() {
        return basicService.isSupplier();
    }

    get canUploadBill() {
        return this.isSupplier && this.orderStatus === 'INIT' && !this.inReadMode;
    }

    get orderId() {
        return this.$route.params?.orderId;
    }

    goUploaderBill() {
        this.$router.push({
            path: '/billManager/bill/entry',
            query: { orderId: this.orderId, operateType: 'UPLOAD' }
        });
    }

    seeDetail() {
        let routerPath;
        if (this.isSupplier) {
            routerPath = '/billManager/bill/entry';
        } else {
            routerPath = '/billManager/bill/list';
        }
        // 根据是企业端还是供应商端跳不同路由
        this.$router.push({
            path: routerPath,
            query: this.isSupplier ? { orderId: this.orderId, operateType: 'VIEW' } : { orderId: this.orderId },
        });
    }
}
</script>

<style lang="scss" scoped>
.value {
    display: inline-block;
}
.grey {
    display: inline-block;
    color: #999;
}
.detail {
    display: inline-block;
    font-weight: bold;
    line-height: 28px;
    color: #4b8bee;
    cursor: pointer;
}
</style>
