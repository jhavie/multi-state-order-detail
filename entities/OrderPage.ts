import basicService from 'Service/basicService';
import _pick from 'lodash/pick';
import { accDiv, accMul } from 'Utils';

class OrderPage {
    constructor(source) {
        Object.assign(this, OrderPage.transfer(source));
        this.initDataPool();
    }

    /** 数据池 用于共享数据 不修改源数据*/
    private _dataPool;

    initDataPool() {
        this._dataPool = {
            role: this.role,
            isCommon: this.isCommon,
            isGoods: this.isGoods,
            isFBid: this.isFBid,
        };
        this.setDataPool('orderAmt', this.detail.orderAmt);
        this.setDataPool('contractPayList', this.contractPayList);
    }

    get contractPayList() {
        return this.detail.contractPayList?.reduce((ans, item, index) => {
            if (item.planPayTime) {
                ans[index] = {
                    ...item,
                    payAmt: accDiv(accMul(this._dataPool.orderAmt, item.payPercent), 100)
                };
            } else {
                const remainder = ans.reduce((res, i) => {
                    res += i.payAmt;
                    return res;
                }, 0);
                item.payAmt = this.dataPool.orderAmt - remainder;
                ans[index] = item;
            }
            return ans;
        }, []) ?? [];
    }

    get role() {
        if (basicService.isSupplier()) return 'supplier';
        return 'staff';
    }

    get showTip() {
        return this.role === 'supplier' && this.state.orderStatus === 'WAIT_SUPP_CONFIRM';
    }

    /** 是否为标品 */
    get isGoods() {
        return this.state.orderBizType === 'BP';
    }

    /** 是否为跟标 */
    get isFBid() {
        return this.state.orderBizType === 'FOLLOW';
    }

    /** 是否为询比 */
    get isCommon() {
        return this.state.orderBizType === 'NOT_BP';
    }

    setDataPool(key, val) {
        this._dataPool[key] = val;
        if (key === 'orderAmt') this.setDataPool('contractPayList', this.contractPayList);
    }

    get dataPool() {
        return this._dataPool;
    }

    private static transfer(data) {
        const {
            mode,
            applyBean, /** 申请单详情 */
            applyBeanList, /** 申请单变更记录表 */
            purchOrderCommonBean,
            purchOrderXbBean,
            purchOrderBpBean,
            purchOrderFollowBean,
            orderCardCommonBean,
            orderCardFollowBean,
        } = data;
        const common: object = {
            mode,
            ..._pick(purchOrderFollowBean, ['followReqId']),
            ..._pick(orderCardCommonBean, ['reqName']),
            ..._pick(purchOrderCommonBean, [
                'payMode', /** 是否分期 */
                'orderAmt', /** 订单金额 */
                'contractPayList', /** 分期付款信息 */
                'fileList', /** 附件列表 */
                'subjectInfo', /** 签约项目信息 */
                'orderBizType', /** 订单类型 */
                'reqId',
            ])
        };
        const state: object = {
            ...common,
            applyBean,
            applyBeanList,
            ..._pick(orderCardCommonBean, ['applyTypeName', 'orderId', 'reqId']),
            ..._pick(purchOrderXbBean, ['orderType']),
            ..._pick(purchOrderCommonBean, [
                'orderBizType', /** 订单类型 */
                'orderBizTypeName', /** 订单类型名称 */
                'orderStatus', /** 订单状态 */
                'orderStatusName', /** 订单状态名称 */
                'offerDetailedListBean', /** 采购订单 */
                'requestSysId', /** 审批详情ID */
                'purchTotalAmt', /** 采购总预算 */
                'cancelApplyBean', /** 取消订单申请单详情 */
                'billAmt' /** 账单金额 */
            ])
        };
        const card: object = {
            mode,
            ..._pick(purchOrderCommonBean, [
                'contractInfo',
                'voteId',
                'orderAmt',
                'orderBizType', /** 订单状态 */
                'cancelApplyBean', /** 取消订单申请单详情 */
            ]),
            ..._pick(purchOrderBpBean, [
                'bpOfferSumBeanList', /** 预定信息表 */
                'invoiceReqBean', /** 发票信息 */
                'goodsId',
                'bookId'
            ]),
            ..._pick(orderCardFollowBean, ['followReqId', 'reqUserName']),
            ..._pick(orderCardCommonBean, [
                'reqName', /** 需求名称 */
                'orderId', /** 订单ID */
                'userName', /** 创建人名称 */
                'userPhone', /** 创建人手机号 */
                'suppContactInfoBean', /** 供应商信息 */
                'orderStatusName', /** 订单状态名称 */
                'outSourceSys', /** 订单来源 */
                'orderBizType', /** 订单类型 */
                'reqTypeName', /** 需求类型 */
                'orderStatus', /** 订单状态 */
                'beginTime', /** 项目开始时间 */
                'endTime' /** 项目结束时间 */
            ])
        };
        const detail: object = {
            ...common,
            ..._pick(purchOrderBpBean, ['bpOfferSumBeanList', 'invoiceReqBean']),
            ..._pick(purchOrderXbBean, ['orderType', 'isUnion', 'costBearingMethod', 'costBearingBeanList']),
            ..._pick(purchOrderCommonBean, [
                'orderStatus', /** 订单状态 */
                'createTime', /** 订单创建时间 */
                'finTime',   /** 订单生效时间 */
                'rejectReason', /** 退回原因 */
                'depAddress', /** 出发地 */
                'actList', /** 活动列表*/
                'actPlace', /** 目的地 */
                'actDay', /** 行程天数 */
                'peopleNum', /** 签约人数 */
                'orderBankInfo', /** 收款账户信息 */
                'accountName', /** 收款账户 */
                'accountNo', /** 收款账号 */
                'bankName', /** 开户行 */
                'bankBranchName', /** 开户行支行 */
                'payType', /** 支付方式 */
                'suppAmt', /** 供应商报价金额 */
                'additionBean', /** 采购订单模块 */
                'contractInfo', /** 合同信息 */
                'fileList', /** 附件列表 */
                'orderId', /** 订单ID */
                'offerDetailedListBean', /** 采购订单详情*/
                'requestSysId', /** 审批详情ID */
                'purchTotalAmt', /** 采购总预算 */
                'billAmt', /** 账单金额 */
                'billBatch', /** 是否是多账单*/
                'suppPayType' /** 支付方式 */
            ])
        };
        const step = _pick(orderCardCommonBean, [
            'orderNode', /** 订单节点 */
            'orderNodeList', /** 订单节点表 */
            'orderNodeName', /** 订单节点名称 */
            'orderStage', /** 订单阶段 */
            'orderStageList', /** 订单阶段表 */
        ]);
        return {
            state,
            step,
            card,
            detail
        };
    }
}


export {
    OrderPage
};
