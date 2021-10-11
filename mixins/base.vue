<template></template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { basicService } from 'Service';
import { PAY_TYPE } from 'Const/order';
import { RECORD_COLUMN } from '../configs/const';
import { getStore } from 'Utils';

@Component({
    name: 'base-comp'
})
export default class Base extends Vue {
    static = this.$t('order');
    roleCode = getStore({ name: 'roleCode' }) || '';
    id = this.$route.query.id || '';
    orderId = this.$route.params.orderId || '';
    suppId = this.$route.query.suppId || ''; // 标品supp侧
    reqId = this.$route.query.reqId || ''; // 标品
    PayTypeEnum = PAY_TYPE;
    RecordColumn = RECORD_COLUMN;

    /** 是否为供应商侧 */
    get isSupplier() {
        return basicService.isSupplier();
    }
    /*
    /!** 是否为标品 *!/
    get isGoods() {
        return this.$route.query.orderSourceType === 'BP';
    }

    /!** 是否为跟标 *!/
    get isFBid() {
        return this.$route.query.orderSourceType === 'FOLLOW';
    }

    /!** 是否为询比 *!/
    get isCommon() {
        return this.$route.query.orderSourceType === 'NOT_BP';
    }
    */
}
</script>
