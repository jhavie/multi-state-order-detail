<template>
    <fragment>
        <activity-card v-if="params.actList" :actList="params.actList" :inReadMode="params.mode !== 'edit'"/>
        <order-price-list
            :titleName="'采购订单'"
            :markItems="params.markItems"
            :offerDetailedListBean="params.offerDetailListBean"
        />
    </fragment>
</template>

<script lang='ts'>
import { Component, Prop, Mixins } from 'vue-property-decorator';
import Method from 'Views/common/order-detail/mixins/method.vue';
import orderPriceList from './orderPriceList.vue';
import activityCard from './activityCard.vue';

@Component({
    name: 'common',
    components: {
        orderPriceList,
        activityCard
    }
})
export default class Common extends Mixins(Method) {
    @Prop({ type: Object, default: () => {} })
    params!: object;
}
</script>

<style scoped>

</style>
