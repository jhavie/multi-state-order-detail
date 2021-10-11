/*import {
    CORP_ORDER_STATE,
    SUPP_ORDER_STATE,
} from '../configs/const';*/
import {
    CorpOrderStateEnum,
    SuppOrderStateEnum,
} from '../configs/enum';
import { COMMON_ACTION_CONFIG } from '../configs/common';
import { GOODS_ACTION_CONFIG } from '../configs/goods';
import { FOLLOW_ACTION_CONFIG } from '../configs/follow';
import basicService from 'Service/basicService';

class States {
    constructor(source) {
        Object.assign(this, source);
        this.status = source.orderStatus;
    }
    /** 采购订单 */
    private offerDetailedListBean;
    /** 项目信息 */
    private subjectInfo;
    /** 账单金额 */
    private billAmt;
    /** 前端映射的订单状态 */
    private _status!: string;

    /** 供应商名称 */
    get suppName() {
        return this.subjectInfo?.suppName;
    }
    /** 主办方 */
    get userCompanyName() {
        return this.subjectInfo?.userCompanyName;
    }
    /** 出发地 */
    get depAddress() {
        return this.subjectInfo?.depAddress;
    }
    /** 目的地 */
    get actPlace() {
        return this.subjectInfo?.actPlace;
    }
    /** 行程开始时间 */
    get actBeginTime() {
        return this.subjectInfo?.actBeginTime;
    }
    /** 行程结束时间 */
    get actEndTime() {
        return this.subjectInfo?.actEndTime;
    }
    /** 订单说明 */
    get remark() {
        return this.subjectInfo?.remark;
    }
    /** 签约人数 */
    get peopleNum() {
        return this.subjectInfo?.peopleNum;
    }
    /** 采购订单表 */
    get offerSumBeanList() {
        return this.offerDetailedListBean?.offerSumBeanList ?? [];
    }
    /** 活动时间 */
    get actTime() {
        return `${this.subjectInfo.actBeginTime} - ${this.subjectInfo.actEndTime}`;
    }

    get status() {
        return this._status;
    }

    set status(state) {
        if (basicService.isSupplier()) {
            this._status = SuppOrderStateEnum[state];
        } else {
            this._status = CorpOrderStateEnum[state];
        }
    }

    get role() {
        if (basicService.isSupplier()) return 'supplier';
        return 'staff';
    }
}

class CommonStates extends States {
    get action() {
        return COMMON_ACTION_CONFIG
            .filter(item => item.role.includes(this.role) && item.show.includes(this.status));
    }
}

class FollowStates extends States {
    get action() {
        return FOLLOW_ACTION_CONFIG
            .filter(item => item.role.includes(this.role) && item.show.includes(this.status));
    }
}

class GoodsStates extends States {
    get action() {
        return GOODS_ACTION_CONFIG
            .filter(item => item.role.includes(this.role) && item.show.includes(this.status));
    }
}

export {
    CommonStates,
    FollowStates,
    GoodsStates
};
