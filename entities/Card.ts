import { ORDER_SOURCE, PROJECT_SOURCE } from 'Const';
import { basicService, orderService } from 'Service';

class Card {
    constructor(source) {
        Object.assign(this, source);
    }

    /** 订单状态 */
    private orderStatus;

    /** 合同信息 */
    private contractInfo;

    /** 订单金额 */
    private orderAmt;

    /** 创建人名称 */
    private userName;

    /** 创建人联系方式 */
    private userPhone;

    /** 供应商信息 */
    private suppContactInfoBean;

    /** 订单来源 */
    private outSourceSys;

    /** 订单类型 */
    private orderBizType;

    /** 创建人 */
    get user() {
        return `${this.userName || ''} ${this.userPhone || ''}`;
    }

    /** 类型 */
    get reqType() {
        return this.reqTypeName;
    }

    get reqTime() {
        return `${this.beginTime} 至 ${this.endTime}`;
    }
    /** 供应商联系人 */
    get suppContactInfo() {
        const { suppUserName, suppUserPhone } = this.suppContactInfoBean || {};
        return `${suppUserName || ''} ${suppUserPhone || ''}`;
    }

    /** 来源 */
    get outSourceSysName() {
        const outSourceSys = this?.outSourceSys;
        if (!outSourceSys) return 'MICE平台';
        const outSourceItem = PROJECT_SOURCE.find((el) => el.value === outSourceSys);
        return outSourceItem ? outSourceItem.label : 'MICE平台';
    }

    /** 订单类型名称 */
    get orderTypeName() {
        const orderType = this?.orderBizType;
        if (!orderType) return false;
        const findItem = ORDER_SOURCE.find((el) => el.value === orderType);
        return findItem ? findItem.label : false;
    }

    get breakContractInfoList() {
        return this.contractInfo.breakContractInfoList;
    }

    set breakContractInfoList(val) {
        this.contractInfo.breakContractInfoList = val;
    }

    get isHotelSupp() {
        return orderService.isHotelSupp(this.contractInfo?.suppIndustryId);
    }
}

class CommonCard extends Card { }

class GoodsCard extends Card {
    private goodsId;
    private bookId;

    get invoiceReqName() {
        const invoiceReqArr = {
            UNIFY: '统一开具单一发票类型',
            SEPARATE: '按服务内容分项目开具',
        };
        const invoiceReq = this.additionBean?.taxRate?.invoiceReq;
        return invoiceReqArr[invoiceReq];
    }

    get isUnify() {
        return this.invoiceReqBean?.invoiceReq === 'UNIFY';
    }
}

class FollowCard extends Card {
    private reqUserName;
    /** 跟标链接控制字段 供应商侧进行中 */
    get isSuppProceed() {
        return (
            basicService.isSupplier() && ['WAIT_SUPP_CONFIRM', 'SUPP_BACK'].includes(this?.orderStatus)
        );
    }
}

export {
    CommonCard,
    GoodsCard,
    FollowCard
};
