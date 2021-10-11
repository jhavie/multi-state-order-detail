/** 取消订单申请单 */
const CANCEL_ORDER: object = {
    title: '取消订单申请',
    staffBillHint: '（需供应商上传资损账单）',
    supplierBillHint: '(需企业核对资损账单）',
    confirm: '是否确认撤销订单取消的申请？如已产生账单将被作废删除',
    desc: [{
        role: 'staff',
        status: 'WAIT',
        value: '企业经办人已发起了取消订单，待供应商确认'
    }, {
        role: 'staff',
        status: 'WAIT_APPROVAL',
        value: '供应商已确认取消订单，待企业经办人进行再次确认或发起签报'
    }, {
        role: 'staff',
        status: 'APPROVALING',
        value: '订单取消签报审批中，进展参见订单详情中的审批详情'
    }, {
        role: 'staff',
        status: 'APPROVAL_REJECT',
        value: '订单取消签报审批不通过，待企业经办人进行再次确认或发起签报'
    }, {
        role: 'staff',
        status: 'FIN',
        value: '订单取消签报审批通过，该订单已取消，如有资损可凭相关账单及其他附件进行报销'
    }, {
        role: 'supplier',
        status: 'WAIT',
        value: '企业经办人已发起了取消订单，待供应商确认'
    }, {
        role: 'supplier',
        status: 'CONFIRMING',
        value: '企业经办人再次确认订单取消中，详细可咨询企业经办人'
    }, {
        role: 'supplier',
        status: 'CONFIRM',
        value: '订单取消签报审批通过，该订单已取消，如有资损可凭相关账单及其他附件进行报销'
    }],
    showItems: [{
        status: ['DEFAULT'],
        key: 'createTime',
        label: '申请时间'
    }, {
        status: ['DEFAULT'],
        key: 'cancelReason',
        label: '取消原因'
    }],
    buttons: [{
        role: 'supplier',
        status: ['WAIT'],
        lossyFlags: [null],
        label: '无资损取消',
        click: 'agreeCancel'
    },
    {
        role: 'supplier',
        status: ['WAIT'],
        label: '资损取消',
        lossyFlags: [null],
        click: 'agreeCancelWithLoss'
    },
    {
        role: 'staff',
        // status: ['WAIT', 'WAIT_APPROVAL', 'APPROVAL_REJECT'], 戴金玲416邮件改动
        status: ['APPROVAL_REJECT'],
        label: '撤销申请',
        click: 'recallApply'
    },
    {
        role: 'staff',
        status: ['WAIT_APPROVAL', 'APPROVAL_REJECT'],
        label: '发起签报',
        click: 'approval'
    },
    {
        role: 'staff',
        status: ['FIN'], // 审批状态为已通过
        orderStatus: ['CANCEL'], // 订单状态为已取消
        label: '再次下单',
        click: 'reOrder'
    },
    {
        role: 'staff',
        status: ['WAIT', 'WAIT_APPROVAL'], // 审批状态为已通过
        label: '撤销申请',
        click: 'recallApply'
    },
    ]
};
/** 变更出行时间申请单 */
const CHANGE_TRAVEL_TIME: object = {
    title: '出行时间变更申请',
    confirm: '是否撤销出行时间变更的申请？',
    desc: [{
        role: 'staff',
        status: 'WAIT',
        value: '企业经办人已发起了订单变更，待供应商确认'
    }, {
        role: 'staff',
        status: 'SUPP_BACK',
        value: '供应商拒绝了订单变更'
    }, {
        role: 'staff',
        status: 'CORP_RECALL',
        value: '企业经办人已撤回了订单变更'
    }, {
        role: 'staff',
        status: 'WAIT_APPROVAL',
        value: '供应商已确认变更，待企业经办人进行再次确认或发起签报'
    }, {
        role: 'staff',
        status: 'APPROVALING',
        value: '订单变更签报审批中，进展参见订单详情中的审批详情'
    }, {
        role: 'staff',
        status: 'APPROVAL_REJECT',
        value: '订单变更签报审批不通过，待企业经办人进行再次确认或发起签报'
    }, {
        role: 'supplier',
        status: 'WAIT',
        value: '企业经办人已发起了订单变更，待供应商确认'
    }, {
        role: 'supplier',
        status: 'SUPP_BACK',
        value: '供应商拒绝了订单变更'
    }, {
        role: 'supplier',
        status: 'CORP_RECALL',
        value: '企业经办人已撤回了订单变更'
    }, {
        role: 'supplier',
        status: 'CONFIRMING',
        value: '企业经办人再次确认订单出行变更中，详细可咨询企业经办人'
    }],
    showItems: [{
        status: ['DEFAULT', 'SUPP_BACK'],
        key: 'updateAfterInfo',
        label: '变更时间'
    }, {
        status: ['DEFAULT', 'SUPP_BACK'],
        key: 'createTime',
        label: '申请时间'
    }, {
        status: ['DEFAULT', 'SUPP_BACK'],
        key: 'cancelReason',
        label: '变更原因'
    }, {
        status: ['SUPP_BACK'],
        key: 'rejectReason',
        label: '退回原因'
    }],
    buttons: [{
        role: 'supplier',
        status: ['WAIT'],
        label: '拒绝',
        click: 'rejectChange'
    }, {
        role: 'supplier',
        status: ['WAIT'],
        label: '同意',
        click: 'agreeChange'
    }, {
        role: 'staff',
        status: ['WAIT', 'WAIT_APPROVAL', 'APPROVAL_REJECT'],
        label: '撤销申请',
        click: 'recallApply'
    }, {
        role: 'staff',
        status: ['WAIT_APPROVAL', 'APPROVAL_REJECT'],
        label: '发起签报',
        click: 'approval'
    }]
};
/** 变更合同时间申请单 */
const CHANGE_CONTRACT_TIME: object = {
    title: '合同时间变更申请',
    confirm: '是否撤销出行时间变更的申请？',
    desc: [],
    showItems: [{
        status: ['DEFAULT', 'SUPP_BACK'],
        key: 'updateAfterInfo',
        label: '变更时间'
    }, {
        status: ['DEFAULT', 'SUPP_BACK'],
        key: 'createTime',
        label: '申请时间'
    }, {
        status: ['DEFAULT', 'SUPP_BACK'],
        key: 'cancelReason',
        label: '变更原因'
    }, {
        status: ['SUPP_BACK'],
        key: 'rejectReason',
        label: '退回原因'
    }],
    buttons: [{
        role: 'supplier',
        status: ['WAIT'],
        label: '拒绝',
        click: 'rejectChange'
    }, {
        role: 'supplier',
        status: ['WAIT'],
        label: '同意',
        click: 'agreeChange'
    }, {
        role: 'staff',
        status: ['WAIT', 'WAIT_APPROVAL', 'APPROVAL_REJECT'],
        label: '撤销申请',
        click: 'recallApply'
    }, {
        role: 'staff',
        status: ['WAIT_APPROVAL', 'APPROVAL_REJECT'],
        label: '发起签报',
        click: 'approval'
    }]
};

/** 企业侧 申请单状态 */
const CORP_APPLY_STATUS_DESC = {
    WAIT: '待确认',
    SUPP_BACK: '已退回',
    WAIT_APPROVAL: '待发起审批',
    APPROVALING: '审批中',
    APPROVAL_REJECT: '审批不通过',
    CORP_RECALL: '已撤回',
    FIN: '审批通过'
};

/** 供应商侧 申请单状态 */
const SUPP_APPLY_STATUS_DESC = {
    WAIT: '待确认',
    SUPP_BACK: '已退回',
    CONFIRMING: '企业侧确认中',
    APPROVAL_REJECT: '审批不通过',
    CORP_RECALL: '已撤回',
    CONFIRM: '已确认'
};

export {
    CANCEL_ORDER as cancelOrder,
    CHANGE_TRAVEL_TIME as changeTravelTime,
    CHANGE_CONTRACT_TIME as changeContractTime,
    CORP_APPLY_STATUS_DESC,
    SUPP_APPLY_STATUS_DESC
};
