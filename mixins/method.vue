<script lang="ts">
import { Component } from 'vue-property-decorator';
import Post from './post.vue';
import _pick from 'lodash/pick';
import dayjs from 'dayjs';

dayjs.extend(require('dayjs/plugin/isSameOrAfter'));

// import { accDiv, formatMoney } from 'Utils';
// import _isEmpty from 'lodash/isEmpty';

@Component({ name: 'method' })
export default class Method extends Post {
    /** 是否为标品 */
    get isGoods() {
        return this.params.orderBizType === 'BP';
    }

    /** 是否为跟标 */
    get isFBid() {
        return this.params.orderBizType === 'FOLLOW';
    }

    /** 是否为询比 */
    get isCommon() {
        return this.params.orderBizType === 'NOT_BP';
    }

    /** 撤回订单 */
    async withdrawn() {
        /* 询比撤回 跟标撤回 */
        if (this.isCommon || this.isFBid) {
            const param = {
                id: this.reqId,
                orderId: this.orderId,
            };
            const res = await this.corpRecallPurchOrder(param);
            if (res?.resultCode !== '1000') return;
            this.$emit('refresh');
        } else if (this.isGoods) {
            const param = {
                orderId: this.orderId,
            };
            const res = await this.orderRecalLorder(param);
            if (res?.resultCode !== '1000') return;
            this.$emit('refresh');
        }
    }

    /** 修改 */
    async revise() {
        /* 询比修改 */
        if (this.isCommon) {
            await this.queryReqOrderCard();
            this.$router.push({
                name: 'CreateOrders',
                query: {
                    reqId: this.reqId,
                    orderId: this.orderId,
                },
            });
        } else if (this.isGoods) {
            this.$router.push({
                name: 'GoodsOrder',
                query: {
                    orderId: this.orderId,
                },
            });
        } else if (this.isFBid) {
            this.$router.push({
                name: 'createFollowBid',
                query: {
                    orderId: this.orderId,
                    reqId: this.stateData.followReqId,
                    suppId: this.suppId,
                    mode: 'FBID',
                },
            });
        }
    }

    /* 发起签报 */
    signOff() {
        if (!this.isSupplier && !this.checkActTime()) return;
        const { actTime, purchTotalAmt, subjectInfo, actBeginTime, actEndTime, reqName, followReqId } = this.stateData;
        let bizData;
        let key;
        if (this.isCommon) {
            key = 'MULTIPLE_ORDER_CONFIRM';
            bizData = JSON.stringify({
                orderId: this.orderId,
                reqId: this.reqId,
                activityTime: actTime,
                purchTotalAmt: this.$div(purchTotalAmt, 100),
            });
        } else if (this.isGoods) {
            key = 'BP_CONTRACT_CONFIRM';
            bizData = JSON.stringify({
                reqId: this.orderId, //eoa会自动转换为bizId
                reqName: subjectInfo?.reqName,
                orderId: this.orderId,
                activityTime: `${actBeginTime}—${actEndTime}`,
            });
        } else if (this.isFBid) {
            key = 'FOLLOW_ORDER_CONFIRM';
            bizData = JSON.stringify({
                reqName,
                orderId: this.orderId,
                reqId: followReqId,
                activityTime: `${actBeginTime} - ${actEndTime}`,
                purchTotalAmt: this.$div(purchTotalAmt, 100),
            });
        }
        this.$router.push({
            path: '/demandManger/publish/EOA',
            query: {
                isEdit: 'true',
                [key]: bizData,
            },
        });
    }

    /* 供应商侧退回 */
    async reject(rejectReason) {
        if (this.isCommon) {
            const param = {
                rejectReason,
                orderId: this.orderId,
                opType: 'REJECT',
                suppId: this.suppId,
            };
            const res = await this.suppResPurchOrder(param);
            if (res?.resultCode !== '1000') return;
            this.$emit('refresh');
        } else if (this.isGoods) {
            const param = {
                rejectReason,
                orderId: this.orderId,
                opType: 'REJECT',
                suppId: this.suppId,
            };
            const res = await this.suppResBpContract(param);
            if (res?.resultCode !== '1000') return;
            this.$router.push({
                name: 'suppOrderDetail',
                query: {
                    suppId: this.suppId,
                },
                params: {
                    orderId: this.orderId,
                },
            });
            this.$emit('refresh');
        } else if (this.isFBid) {
            const param = {
                rejectReason,
                orderId: this.orderId,
                opType: 'REJECT',
                suppId: this.suppId,
            };
            const res = await this.suppConfirmFollowContract(param);
            if (res?.resultCode !== '1000') return;
            this.$emit('refresh');
        }
    }

    /** 标品 询比取消订单 */
    async cancel() {
        const params = {
            orderId: this.orderId,
        };
        const res = await this.corpCancelPurchOrder(params);
        if (res?.resultCode !== '1000') return;
        this.$emit('refresh');
    }

    /** 跟标取消订单 需要弹窗原因 */
    async cancelReason(reason) {
        const params = {
            cancelReason: reason,
            orderId: this.orderId,
            isCancelProject: this.isCancelProject, // 是否需要取消项目
        };
        const res = await this.corpCancelPurchOrder(params);
        if (res?.resultCode !== '1000') return;
        this.$emit('refresh');
        this.close();
    }

    /** 确认订单 */
    async confirmOrder() {
        if (!this.isSupplier && !this.checkActTime()) return;
        if (this.isCommon) {
            // 数据处理后转换为：submitPurchOrderDetailList: [{itemQty: 1, itemId: "XXX"}]
            const offerSumBeanList = this.stateData.offerSumBeanList;
            const submitPurchOrderDetailList: any[] = [];
            offerSumBeanList.forEach((i) => {
                i.offerServiceBeanList.forEach((e) => {
                    if (e.offerServiceItemBeanList) {
                        e.offerServiceItemBeanList.forEach((a) => {
                            submitPurchOrderDetailList.push({
                                itemQty: Number(a?.itemQty),
                                itemId: a?.itemId,
                                detailId: a?.detailId,
                                frequency: Number(a?.frequency),
                            });
                        });
                    }
                });
            });
            const params = {
                reqId: this.reqId,
                orderId: this.orderId,
                submitType: 'SUBMIT',
                submitPurchOrderDetailList,
                purchOrderBean: {
                    orderId: this.orderId,
                    ..._pick(this.stateData, [
                        'suppName',
                        'userCompanyName',
                        'depAddress',
                        'actPlace',
                        'actBeginTime',
                        'payMode',
                        'actEndTime',
                        'remark',
                        'orderAmt',
                        'peopleNum',
                        'contractPayList',
                        'fileList',
                    ]),
                },
            };
            const res = await this.createXbPurchOrder(params);
            if (res) this.$emit('refresh');
        } else if (this.isFBid || this.isGoods) {
            const res = await this.createFollowPurchOrder({ orderId: this.orderId });
            if (res) this.$emit('refresh');
        }
    }

    /** 供应商确认订单 */
    async suppConfirmOrder() {
        const { getInoviceInfo, updateBpOrderDetailList, getRuleTable, getOrderList } = this.callback;
        const { ruleTableData, validateCb } = getRuleTable();
        // 询比
        if (this.isCommon) {
            const param = {
                rejectReason: '',
                orderId: this.orderId,
                opType: 'CONFIRM',
                suppId: this.suppId,
            };
            const res = await this.suppResPurchOrder(param);
            if (res?.resultCode !== '1000') return;
            this.$miceAlert('提示', '您已确认接单，请务必确保订单状态为已生效时，方可履约。');
            this.$emit('refresh');
        } else if (this.isGoods) {
            if (!validateCb()) return;
            const additionBean = getInoviceInfo();
            const params = {
                breakContractInfoList: ruleTableData,
                updateBpOrderDetailList: updateBpOrderDetailList(),
                taxRate: additionBean.taxRate,
                orderId: this.orderId,
                opType: 'CONFIRM',
                suppId: this.suppId,
            };
            const res = await this.suppResBpContract(params);
            if (res?.resultCode !== '1000') return;
            this.$miceAlert('提示', '您已确认接单，请务必确保订单状态为已生效时，方可履约。');
            this.$emit('refresh');
        } else if (this.isFBid) {
            if (!validateCb()) return;
            const params = {
                breakContractInfoList: ruleTableData,
                suppUpdateChargeDetailList: getOrderList(),
                opType: 'CONFIRM',
                rejectReason: '',
                orderId: this.orderId,
            };
            const res = await this.suppConfirmFollowContract(params);
            if (res?.resultCode !== '1000') return;
            this.$miceAlert('提示', '您已确认接单，请务必确保订单状态为已生效时，方可履约。');
            this.$emit('refresh');
        }
    }

    /** 跳转到审批详情 */
    goApprovalDetail() {
        const sourceData = this.detailData || this.stateData;
        const requestSysId = sourceData.requestSysId;
        this.$router.push({
            path: '/demandManger/publish/EOA',
            query: {
                isEdit: 'false',
                requestSysId,
            },
        });
    }

    /** 上传账单 */
    uploadBill() {
        this.$router.push({
            path: '/billManager/bill/entry',
            query: { orderId: this.orderId, operateType: 'UPLOAD' },
        });
    }

    /** 开具发票 */
    invoice() {
        this.$router.push({
            path: '/billManager/invoice/list',
        });
    }

    checkActTime() {
        const today = dayjs().format('YYYY-MM-DD');
        if (!dayjs(this.stateData.actBeginTime).isSameOrAfter(dayjs(today))) {
            this.$miceConfirm(
                '订单活动时间已过期，请修改后再重新签约下单',
                '',
                {
                    confirmButtonText: '去修改',
                },
                () => this.revise(),
            );
            return false;
        }
        return true;
    }
    /** 变更时间 */
    changeTime() {
        /* 取消订单是否在进行中 有记录但不为已撤回状态 说明该取消订单流程正在进行中 */
        const { cancelApplyBean, orderType } = this.stateData;
        if (cancelApplyBean && cancelApplyBean.applyStatus !== 'CORP_RECALL') {
            this.$message.error('订单正在申请取消中，如变更出行时间，请先撤销取消订单的申请单');
        } else if (this.isCommon && orderType !== 'MULTIPLE') {
            this.$miceConfirm(
                '一次性下单项目的订单行程时间变更需通过变更电子确认书中的服务时间来重新生成',
                '',
                {
                    confirmButtonText: '去变更',
                    cancelButtonText: '暂不变更',
                },
                () => {
                    this.$router.push({
                        path: '/demandManger/operator/detail',
                        query: {
                            reqId: this.reqId,
                        },
                    });
                },
            );
        } else {
            this.changeTimeDlg = true;
        }
    }
}
</script>
