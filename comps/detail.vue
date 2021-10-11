<template>
    <div class="detail">
        <el-tabs v-model="activeName" @tab-click="() => {}">
            <el-tab-pane label="订单详情" name="orderDetail">
                <data-view :data-config="config" />
                <common v-if="isCommon" v-on="$listeners" :params="detailData" />
                <goods v-if="isGoods" v-on="$listeners" :params="detailData" />
                <follow v-if="isFBid" v-on="$listeners" :params="detailData" />
            </el-tab-pane>
            <el-tab-pane label="活动账单" name="bill">
                <auto-paging-table ref="pageTable" :propList="tableProps" :queryFun="queryBillList" listKey="billList">
                    <template slot="end" v-if="canEdit">
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button
                                    :disabled="scope.row.billStatus === 'INIT' && !isSupplier"
                                    size="mini"
                                    type="text"
                                    @click="goBillList(scope.row)"
                                >
                                    查看账单
                                </el-button>
                                <el-button 
                                :disabled="scope.row.billStatus === 'INIT' && !isSupplier"
                                size="mini" type="text" @click="goInvoiceList(scope.row)">
                                    查看发票
                                </el-button>
                            </template>
                        </el-table-column>
                    </template>
                    <list-no-data slot="empty" title="" describe="暂无账单，待供应商上传" />
                </auto-paging-table>
            </el-tab-pane>
            <el-tab-pane v-if="!isSupplier && detailData.orderStatus === 'INIT'" label="预付款/借款" name="loanPrepay">
                <loan-prepay :orderId="orderId" :payMode="detailData.payMode" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Inject } from 'vue-property-decorator';
import { CommonDetail, GoodsDetail, FollowDetail } from '../entities/Detail';
import Common from '../comps/detail/common.vue';
import Follow from '../comps/detail/follow.vue';
import Goods from '../comps/detail/goods.vue';
import LoanPrepay from './loanPrepay/index.vue';
import DataView from './data-view/index.vue';
import Method from '../mixins/method.vue';
import { COMMON_VIEW_CONFIG } from '../configs/common';
import { GOODS_VIEW_CONFIG } from '../configs/goods';
import { FOLLOW_VIEW_CONFIG } from '../configs/follow';
import { TABLE_PROPS } from '../configs/const';

@Component({
    name: 'detail',
    components: {
        DataView,
        Goods,
        Common,
        Follow,
        LoanPrepay,
    },
})
export default class Detail extends Mixins(Method) {
    private commonViewConfig = COMMON_VIEW_CONFIG;
    private followViewConfig = FOLLOW_VIEW_CONFIG;
    private goodsViewConfig = GOODS_VIEW_CONFIG;
    private activeName: string = 'orderDetail';
    private tableProps: Array<Object> = Object.freeze(TABLE_PROPS);

    @Prop({ type: Object, default: () => {} })
    params!: object;

    @Inject('pageData')
    getOrderPage;

    mounted() {
        this.$emit('eventBus', 'refreshPageTable', this.$refs.pageTable.queryTableData);
    }

    get detailData() {
        let _detailData;
        if (this.isCommon) {
            _detailData = new CommonDetail(this.params);
        } else if (this.isGoods) {
            _detailData = new GoodsDetail(this.params);
        } else if (this.isFBid) {
            _detailData = new FollowDetail(this.params);
        }
        return _detailData;
    }
    /* 展示列表配置项 */
    get config() {
        const orderPage = this.getOrderPage();
        const fnData = {
            goApprovalDetail: this.goApprovalDetail,
            orderAmt: orderPage.dataPool.orderAmt,
            contractPayList: orderPage.dataPool.contractPayList,
        };
        if (this.isCommon) {
            return this.commonViewConfig(this.detailData, fnData);
        } else if (this.isGoods) {
            return this.goodsViewConfig(this.detailData, fnData);
        } else if (this.isFBid) {
            return this.followViewConfig(this.detailData, fnData);
        }
        return [];
    }

    get canEdit() {
        return this.params.mode === 'edit';
    }

    goBillList() {
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

    goInvoiceList(row) {
        this.$router.push({
            path: '/billManager/invoice/list',
            query: {
                orderId: this.orderId,
                billId: row.billId,
            },
        });
    }
}
</script>

<style scoped>
.detail {
    margin: 20px 0 30px 0;
    background: #fff;
    box-shadow: 0 2px 10px 0 rgba(206, 206, 206, 0.5);
    padding: 10px 20px;
}
</style>
