<script lang="ts">
import { Component } from 'vue-property-decorator';
import Base from './base.vue';
import { Action } from 'vuex-class';
// import _pick from 'lodash/pick';
import { PAGESTATUS } from '@mice/common/const/index.js';
import _get from 'lodash/get';

@Component({ name: 'post' })
export default class Post extends Base {
    /** 查询需求卡片头 */
    @Action('order/getDemandHead') getDemandHead;
    /** 创建变更申请单 */
    @Action('order/createApply') createApply;
    /** 企业侧撤回申请单 */
    @Action('order/corpRecallApply') corpRecallApply;
    /** 供应商侧撤回申请单 */
    @Action('order/suppResApply') suppResApply;
    /** 供应商侧发起申请单 */
    @Action('order/suppOrderResApply') suppOrderResApply;
    /** 供应商侧撤回修改申请单 */
    @Action('order/recallChangeApply') recallChangeApply;
    /** 企业侧 跟标确认订单 */
    @Action('reSubmitFollowOrder') reSubmitFollowOrder;
    /** 查询变更列表 */
    @Action('order/queryApplyList') queryApplyList;
    /** 企业侧查询变更详情 */
    @Action('order/corpQueryApplyDetail') corpQueryApplyDetail;
    /** 供应商查询变更详情 */
    @Action('order/suppQueryApplyDetail') suppQueryApplyDetail;
    /** 请求需求类型 */
    @Action('mould/getReqTypeList') getReqTypeList;
    /** 企业侧卡片头 */
    @Action('order/queryCorpPurchOrderCard') queryCorpPurchOrderCard;
    /** 供应商卡片头 */
    @Action('order/querySuppPurchOrderCard') querySuppPurchOrderCard;
    /** 企业侧订单详情 */
    @Action('order/queryCorpPurchOrderDetail') queryCorpPurchOrderDetail;
    /** 供应商侧订单详情 */
    @Action('order/querySuppPurchOrderDetail') querySuppPurchOrderDetail;
    /** 撤回 */
    @Action('corpRecallPurchOrder') corpRecallPurchOrder;
    /** 询比/跟标 发起确认下单 */
    @Action('createPurchOrder') createPurchOrder;
    /** 退回/供应商确认订单 */
    @Action('suppResPurchOrder') suppResPurchOrder;
    /** 取消订单 */
    @Action('order/corpCancelPurchOrder') corpCancelPurchOrder;
    /**  是否触发项目取消提醒 */
    @Action('order/cancelReqOrderRemind') cancelReqOrderRemind;
    /** 标品撤回订单 */
    @Action('goods/orderRecalLorder') orderRecalLorder;
    /** 供应商 跟标确认订单 */
    @Action('suppConfirmFollowContract') suppConfirmFollowContract;
    /** 供应商侧 标品确认订单 */
    @Action('goods/suppResBpContract') suppResBpContract;
    /** 企业侧 查询订单对应账单 */
    @Action('staffBillManager/queryCorpBillListByOrderId') queryCorpBillList;
    /** 供应商侧 查询订单对应账单 */
    @Action('staffBillManager/querySuppBillListByOrderId') querySuppBillList;

    /** 查询卡片头 */
    async queryOrderCard() {
        const params = {
            orderId: this.orderId,
        };
        let res;
        if (!this.isSupplier) {
            res = await this.queryCorpPurchOrderCard(params);
        } else {
            res = await this.querySuppPurchOrderCard(params);
        }
        const { data } = res;
        if (res?.resultCode !== '1000') return;
        return data;
    }

    /** 查询订单详情 */
    async queryOrderDetail() {
        const params = {
            orderId: this.orderId,
        };
        let res;
        if (!this.isSupplier) {
            res = await this.queryCorpPurchOrderDetail(params);
        } else {
            res = await this.querySuppPurchOrderDetail(params);
        }
        const { data } = res;
        if (res?.resultCode !== '1000') return;
        return data;
    }

    /** 查询发票类型枚举值 */
    async queryEnum() {
        const res = await this.$store.dispatch(
            'queryEnum',
            JSON.stringify({
                enumTypeList: ['Mice2InvoiceTypeEnum'],
            }),
        );
        if (res?.resultCode !== '1000') return;
        const { data } = res;
        const invoiceTypeEnumList = _get(data, 'enumListBeanList.0.enumBeanList', []);
        return invoiceTypeEnumList.reduce((ans, item) => {
            ans[item.code] = item.memo;
            return ans;
        }, {});
    }

    /** 查询需求大类和子类 */
    async queryReqTypeList() {
        const result = await this.getReqTypeList();
        if (result?.resultCode !== '1000') return;
        const { data = {} } = result;
        const { reqTypeBeanList = [] } = data;
        const ReqTypeMap = {};
        reqTypeBeanList.forEach((item) => {
            ReqTypeMap[item.reqType] = item.reqTypeName;
            if (item?.reqSubTypeList?.length) {
                item.reqSubTypeList.forEach((subItem) => {
                    ReqTypeMap[subItem.reqType] = subItem.reqTypeName;
                });
            }
        });
        return ReqTypeMap;
    }

    /** 变更出行时间查询 */
    async queryChangeTimeList() {
        const params = {
            bizId: this.orderId,
            bizType: 'CHANGE_TRAVEL_TIME',
        };
        const res = await this.queryApplyList(params);
        if (res.resultCode !== '1000') return;
        const { data } = res;
        return data;
        // this.applyBeanList = data.applyBeanList;
    }

    /** 变更时间详情查询 */
    async queryChangeTimeDetail() {
        const params = {
            bizId: this.orderId,
            bizType: 'CHANGE_TRAVEL_TIME',
        };
        let res;
        if (this.isSupplier) {
            res = await this.suppQueryApplyDetail(params);
        } else {
            res = await this.corpQueryApplyDetail(params);
        }
        if (res?.resultCode !== '1000') return;
        const { data } = res;
        return data;
        // this.applyBean = data.applyBean;
    }

    /** 企业侧 询比跟标 确认下单 */
    async createXbPurchOrder(params) {
        const res = await this.createPurchOrder(params);
        if (res.resultCode !== '1000') return;
        return res;
    }

    async createFollowPurchOrder(params) {
        const res = await this.reSubmitFollowOrder(params);
        if (res?.resultCode !== '1000') return;
        return res;
    }

    // 需求头部卡片接口
    async queryReqOrderCard() {
        const res = await this.getDemandHead({ reqId: this.reqId });
        const { data } = res;
        const { reqOrderCard } = data;
        const newAttr = {
            statusText: '',
            statusColor: '',
        };
        newAttr.statusText = PAGESTATUS.text[reqOrderCard.pageStatus];
        newAttr.statusColor = PAGESTATUS.color[reqOrderCard.pageStatus];
        // 更新卡片头，这里修改时会跳转到创建订单
        sessionStorage.setItem('demandCardInfo', JSON.stringify({ ...reqOrderCard, ...newAttr }));
        if (res?.resultCode === '1000') return res?.data?.reqOrderCard || {};
    }
    // 多订单情况下判断订单状态，订单生效状态要调用老详情页组件
    // isReqHeadCard： 是否展示需求头部卡片和请求相应接口，
    // isResetOrderInit： 是否重置orderInit，改变显示组件

    // 查询账单列表
    async queryBillList(params) {
        const param = {
            ...params,
            orderId: this.orderId,
        };
        let res;
        if (this.isSupplier) {
            res = await this.querySuppBillList(param);
        } else {
            res = await this.queryCorpBillList(param);
        }
        if (res?.resultCode !== '1000') return;
        return res;
    }
}
</script>
