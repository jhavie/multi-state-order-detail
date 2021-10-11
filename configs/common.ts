import { VIEW_CONFIG, ACTION_CONFIG } from './const';

const COMMON_ACTION_CONFIG: object[] = [
    ACTION_CONFIG.get('withdrawn'),
    ACTION_CONFIG.get('revise'),
    ACTION_CONFIG.get('confirmOrder'),
    ACTION_CONFIG.get('cancelOrder'),
    ACTION_CONFIG.get('cancelOrderReason'),
    ACTION_CONFIG.get('signOff'),
    ACTION_CONFIG.get('reject'),
    ACTION_CONFIG.get('suppConfirmOrder'),
    ACTION_CONFIG.get('approvalDetail'),
    ACTION_CONFIG.get('changeTime'),
    ACTION_CONFIG.get('uploadBill'),
    ACTION_CONFIG.get('invoice')
];

const COMMON_VIEW_CONFIG = (params, { goApprovalDetail, orderAmt, contractPayList }) => {
    return [
        VIEW_CONFIG.get('orderId')(params),
        VIEW_CONFIG.get('rejectReason')(params),
        VIEW_CONFIG.get('createTime')(params),
        VIEW_CONFIG.get('finTime')(params),
        VIEW_CONFIG.get('suppName')(params),
        VIEW_CONFIG.get('depAddress')(params),
        VIEW_CONFIG.get('userCompanyName')(params),
        VIEW_CONFIG.get('actPlace')(params),
        VIEW_CONFIG.get('actTime')(params),
        VIEW_CONFIG.get('peopleNum')(params),
        VIEW_CONFIG.get('totalBudget')(params),
        VIEW_CONFIG.get('accountName')(params),
        VIEW_CONFIG.get('accountNo')(params),
        VIEW_CONFIG.get('bankName')(params),
        VIEW_CONFIG.get('bankBranchName')(params),
        VIEW_CONFIG.get('payType')(params),
        VIEW_CONFIG.get('suppAmt')(params),
        VIEW_CONFIG.get('orderType')(params),
        VIEW_CONFIG.get('payment')(params, contractPayList),
        VIEW_CONFIG.get('orderAmt')(params, orderAmt),
        VIEW_CONFIG.get('billAmt')(params),
        VIEW_CONFIG.get('prepayRatio')(params),
        VIEW_CONFIG.get('isUnion')(params),
        VIEW_CONFIG.get('costBearingMethodNames')(params),
        VIEW_CONFIG.get('bearTypes')(params),
        VIEW_CONFIG.get('remark')(params),
        VIEW_CONFIG.get('fileList')(params),
        VIEW_CONFIG.get('approvalDetail')(params, goApprovalDetail),
        VIEW_CONFIG.get('invoiceReqName')(params),
        VIEW_CONFIG.get('invoiceType')(params),
    ];
};
export {
    COMMON_ACTION_CONFIG,
    COMMON_VIEW_CONFIG
};
