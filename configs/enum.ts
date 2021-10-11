enum CorpOrderStateEnum {
    /** 已生效 */
    INIT = 'done',
    /** 待确认 */
    WAIT_SUPP_CONFIRM = 'onConfirm',
    /** 待下单 */
    SAVE = 'saved',
    /** 已退回 */
    SUPP_BACK = 'returned',
    /** 待发起签报 */
    SUPP_CONFIRM = 'onInitiate',
    /** 审批中 */
    APPROVALING = 'approving',
    /** 审批不通过 */
    APPROVAL_REJECT = 'reject',
    /** 已撤回 */
    CORP_RECALL = 'withdrawn',
    /** 已取消 */
    CANCEL = 'cancel',
    /** 订单变更中 */
    PROCESSING = 'processing',
}

enum SuppOrderStateEnum {
    /** 已生效 */
    INIT = 'done',
    /** 待确认 */
    WAIT_SUPP_CONFIRM = 'onConfirm',
    /** 待下单 */
    SAVE = 'saved',
    /** 已退回 */
    SUPP_BACK = 'returned',
    /** 待企业侧确认 */
    CORP_CONFIRMING = 'onCorpConfirm',
    /** 已撤回 */
    CORP_RECALL = 'withdrawn',
    /** 已取消 */
    CANCEL = 'cancel',
    /** 订单变更中 */
    PROCESSING = 'processing',
}

enum OrderTypeEnum {
    SINGLE = 'SINGLE',
    MULTIPLE = 'MULTIPLE',
}

enum InvoiceEnum {
    UNIFY = 'UNIFY',
    SEPARATE = 'SEPARATE'
}

export {
    CorpOrderStateEnum,
    SuppOrderStateEnum,
    InvoiceEnum,
    OrderTypeEnum
};
