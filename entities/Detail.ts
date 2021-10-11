import { basicService, orderService } from 'Service';
import dayjs from 'dayjs';
import orderPriceListHandle from 'Views/common/orderDetail/components/orderPriceListHandler';
import { INVOICE_REQ, INVOICE_TYPE } from '../configs/const';
import _get from 'lodash/get';
import { InvoiceEnum } from 'Views/common/order-detail/configs/enum';

class Detail {
    constructor(source) {
        Object.assign(this, source);
    }

    /** 企业侧字段 */
    private subjectInfo;
    /** 订单状态 */
    private orderStatus;
    /** 合同信息 */
    private contractInfo;

    private mode;

    get canEdit() {
        return this.mode === 'edit';
    }

    get isWaitSuppConfirm() {
        return this.orderStatus === 'WAIT_SUPP_CONFIRM';
    }

    get breakContractInfoList() {
        return this.contractInfo?.breakContractInfoList;
    }
    /** 供应商名称 */
    get suppName() {
        return this.subjectInfo?.suppName;
    }

    /** 出发地 */
    get actPlace() {
        return this.subjectInfo?.actPlace;
    }

    /** 出发地 */
    get depAddress() {
        return this.subjectInfo?.depAddress;
    }

    /** 活动日期 */
    get actTime() {
        return `${this.subjectInfo?.actBeginTime} ~ ${this.subjectInfo?.actEndTime}`;
    }

    /** 签约人数 */
    get peopleNum() {
        return this.subjectInfo?.peopleNum;
    }

    /** 订单说明 */
    get remark() {
        return this.subjectInfo?.remark;
    }

    /** 能否变更活动时间 */
    get canChangeTime() {
        const date1 = dayjs();
        const date2 = dayjs(this.subjectInfo?.actEndTime);
        const isOutdate = date1.diff(date2, 'day') > 30;
        return !this.isSupplier && this.orderStatus === 'INIT' && this.canEdit && !isOutdate;
    }

    get isSupplier() {
        return basicService.isSupplier();
    }
    /** 主办方 */
    get userCompanyName() {
        return this.subjectInfo?.userCompanyName;
    }

    /** 开票方式 */
    get invoiceReqName() {
        const invoiceReq = this.additionBean?.taxRate?.invoiceReq;
        return INVOICE_REQ[invoiceReq];
    }

    get invoiceRate() {
        return `${this.additionBean?.taxRate?.invoiceRate}%`;
    }

    get invoiceType() {
        return INVOICE_TYPE[this.additionBean?.taxRate?.invoiceType];
    }

    get isPostPaid() {
        return orderService.isPostPaid(this.suppPayType);
    }

    get invoiceBean() {
        // const { invoiceMemo, invoiceReq, invoiceType } = this.invoiceReqBean;
        // const { invoiceRate, invoiceReq, invoiceType, taxRateDetailBeanList } = this.additionBean.taxRate;
        // const { invoiceRate, invoiceType } = taxRateDetailBeanList[0];
        const invoiceReq = _get(this.invoiceReqBean, 'invoiceReq') || _get(this.additionBean, 'taxRate.invoiceReq');
        const invoiceType = _get(this.invoiceReqBean, 'invoiceType') || _get(this.additionBean, 'taxRate.invoiceType');
        // _get(this.additionBean, 'taxRate.taxRateDetailBeanList.0.invoiceType');
        const invoiceRate = _get(this.additionBean, 'taxRate.invoiceRate');
        const isUnify = invoiceReq === InvoiceEnum.UNIFY;
        return {
            isUnify,
            invoiceReq,
            invoiceReqName: INVOICE_REQ[invoiceReq],
            invoiceType: INVOICE_TYPE[invoiceType] || null,
            invoiceRate: invoiceRate ? `${invoiceRate}%` : null,
            invoiceMemo: _get(this.invoiceReqBean, 'invoiceMemo')
        };
    }
}

class CommonDetail extends Detail {
    private costBearingBeanList;
    private costBearingMethod;
    private isUnion;
    private orderType;
    private actList;
    private offerDetailedListBean;

    get markItems() {
        const { priceInclude, priceExcludeBean, businessRemark } = this.additionBean;
        return {
            priceInclude,
            priceExcludeBean,
            businessRemark,
        };
    }
    /* 价格表格清单 */
    get offerDetailListBean() {
        return orderPriceListHandle(this.offerDetailedListBean);
    }
}

class GoodsDetail extends Detail {
    private bpOfferSumBeanList;

    /** 开票方式 */
    get invoiceReqName() {
        const invoiceReqArr = {
            UNIFY: '统一开具单一发票类型',
            SEPARATE: '按服务内容分项目开具',
        };
        const invoiceReq = this.invoiceReqBean?.invoiceReq;
        return invoiceReqArr[invoiceReq];
    }

    /*get isUnify() {
        return this.invoiceReqBean?.invoiceReq === 'UNIFY';
    }*/

    get isChecking() {
        // APPROVALING：eoa审批中 ｜ APPROVAL_REJECT：oea审批不通过 ｜ SUPP_CONFIRM：企业确认中 ｜ CORP_RECALL：供应商退回 ｜ SUPP_RECALL：企业撤回
        return ['APPROVALING', 'APPROVAL_REJECT', 'SUPP_CONFIRM', 'CORP_RECALL', 'SUPP_RECALL'].includes(
            this.orderStatus,
        );
    }

    get taxRate() {
        return this.additionBean?.taxRate;
    }
}

class FollowDetail extends Detail {
    /** 跟标ID */
    private followReqId;

    get prepayRatio() {
        return this.additionBean?.prepayRatio ?? 0;
    }
    /* 价格表格清单 */
    get offerDetailListBean() {
        return orderPriceListHandle(this.offerDetailedListBean);
    }
}

export {
    CommonDetail,
    GoodsDetail,
    FollowDetail
};
