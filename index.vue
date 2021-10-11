<template>
    <fragment>
        <steps
            v-if="pageData.step"
            :params="pageData.step"
        />
        <tip v-if="pageData.showTip" />
        <state
            v-if="pageData.state"
            :params="pageData.state"
            :callback="callback"
            @refresh="init(true)"
        />
        <card
            v-if="pageData.card"
            :params="pageData.card"
            @eventBus="setCallback"
        />
        <detail
            v-if="pageData.detail"
            :params="pageData.detail"
            @eventBus="setCallback"
        />
    </fragment>
</template>
<script lang="ts">
import { Component, Prop, Mixins, Provide } from 'vue-property-decorator';
import { OrderPage } from './entities/OrderPage';
import Tip from 'Views/suppliers/components/chargeModeTip.vue';
import Steps from './comps/step.vue';
import State from './comps/state.vue';
import Card from './comps/card.vue';
import Detail from './comps/detail.vue';
import Method from './mixins/method.vue';

@Component({
    name: 'order-detail',
    components: {
        Steps,
        State,
        Card,
        Detail,
        Tip
    }
})
export default class OrderDetail extends Mixins(Method) {
    @Prop({ type: String, default: () => 'edit' })
    mode!: string;

    private pageData = {};

    private callback = {};

    @Provide('pageData')
    orderPage = this.getPageData;

    created() {
        this.init();
    }

    setCallback(name, fn) {
        this.$set(this.callback, name, fn);
    }

    async init(refresh = false) {
        const pageRes = await this.queryOrderDetail();
        const cardRes = await this.queryOrderCard();
        const applyRes = await this.queryChangeTimeDetail();
        const recordRes = await this.queryChangeTimeList();
        if (refresh) this.callback.refreshPageTable();
        this.pageData = new OrderPage({
            mode: this.mode,
            ...pageRes,
            ...cardRes,
            ...applyRes,
            ...recordRes
        });
    }

    getPageData() {
        return this.pageData;
    }
}
</script>
