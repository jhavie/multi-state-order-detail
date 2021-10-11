import { $i18n } from 'Utils/i18n';
import { PAY_TYPE } from 'Const/order';
import {
    CorpOrderStateEnum,
    SuppOrderStateEnum,
    OrderTypeEnum,
    InvoiceEnum
} from './enum';
import dayjs from 'dayjs';
import { accDiv, formatMoney, JSONParse, toThousands } from 'Utils';
import { isNumber } from 'Utils/check';
import { isSupplier } from 'Service/basicService';

const {
    withdrawn,
    withdrawnTip,
    revise,
    reviseTip,
    cancelOrder,
    cancelOrderTip,
    confirmOrder,
    confirmOrderTip,
    signOff,
    signOffTip,
    suppConfirmOrder,
    suppConfirmOrderTip,
    reject,
    rejectTip,
    orderId, /** 订单ID */
    rejectReason, /** 退回原因 */
    createTime, /** 订单生成时间 */
    finTime, /** 订单生效时间 */
    suppName, /** 供应商 */
    depAddress, /** 出发地 */
    userCompanyName, /** 主办方 */
    actPlace, /** 目的地 */
    actTime, /** 行程时间 */
    peopleNum, /** 签约人数 */
    totalBudget, /** 采购总预算 */
    accountName, /** 收款账户名 */
    accountNo, /** 收款账户 */
    bankName, /** 银行名称 */
    bankBranchName, /** 银行支行名称 */
    payType, /** 支付方式 */
    suppAmt, /** 供应商报价金额 */
    orderType, /** 下单方式 */
    orderAmtLabel, /** 订单金额 */
    billAmt, /** 账单金额 */
    suppPrepayRatio, /** 供应商填写预付款比例 */
    invoiceReq, /** 发票要求 */
    invoiceType, /** 发票类型 */
    invoiceMemo, /** 发票备注 */
    invoiceRate, /** 税率 */
    remark, /** 订单说明 */
    none, /** 无 */
    file, /** 附件 */
    seeDetail, /** 查看详情 */
    approvalDetail, /** 订单审批状态 */
    isUnion, /** 联合办会 */
    costBearingMethodNames, /** 承担方式 */
    bearTypes,
    byRatio,
    byNumber,
    byAmt
} = $i18n('order.common');

/** 企业侧 订单状态 */
const CORP_ORDER_STATE = {
    [CorpOrderStateEnum.INIT]: '已生效',
    [CorpOrderStateEnum.WAIT_SUPP_CONFIRM]: '待确认',
    [CorpOrderStateEnum.SAVE]: '待下单',
    [CorpOrderStateEnum.SUPP_BACK]: '已退回',
    [CorpOrderStateEnum.SUPP_CONFIRM]: '待发起签报',
    [CorpOrderStateEnum.APPROVALING]: '审批中',
    [CorpOrderStateEnum.APPROVAL_REJECT]: '审批不通过',
    [CorpOrderStateEnum.CORP_RECALL]: '已撤回',
    [CorpOrderStateEnum.CANCEL]: '已取消',
    [CorpOrderStateEnum.PROCESSING]: '订单变更中',
};

/** 供应商侧 订单状态 */
const SUPP_ORDER_STATE = {
    [SuppOrderStateEnum.INIT]: '已生效',
    [SuppOrderStateEnum.WAIT_SUPP_CONFIRM]: '待确认',
    [SuppOrderStateEnum.SAVE]: '待下单',
    [SuppOrderStateEnum.SUPP_BACK]: '已退回',
    [SuppOrderStateEnum.CORP_CONFIRMING]: '待企业侧确认',
    [SuppOrderStateEnum.CORP_RECALL]: '已撤回',
    [SuppOrderStateEnum.CANCEL]: '已取消',
    [SuppOrderStateEnum.PROCESSING]: '订单变更中',
};

/** 订单类型 */
const ORDER_TYPE = {
    [OrderTypeEnum.SINGLE]: '一次性下单',
    [OrderTypeEnum.MULTIPLE]: '分批下单',
};

/** 承担方式 */
const COST_METHOD_NAMES = {
    RATIO: byRatio,
    NUMBER: byNumber,
    AMT: byAmt,
};

const INVOICE_REQ = {
    [InvoiceEnum.UNIFY]: '统一开具单一发票类型',
    [InvoiceEnum.SEPARATE]: '按服务内容分项目开具',
};

const INVOICE_TYPE = {
    '00': '增值税普通发票',
    '01': '增值税专用发票'
};

const SPLIT_MAP = {
    X: '- -',
    Y: '拆分',
    N: '不拆分'
};
const RULE_TABLE_CONFIG: object = {
    // 企业侧
    staff: {
        default: {
            showRuleTable: 'auto',
            ruleTableMode: ['show', 'show']
        },
        WAIT_SUPP_CONFIRM: {
            showRuleTable: true,
            ruleTableMode: ['show', 'show']
        },
        INIT: {
            showRuleTable: 'auto',
            ruleTableMode: ['show', 'show']
        }
    },
    // 供应商侧
    supplier: {
        default: {
            showRuleTable: 'auto',
            ruleTableMode: ['show', 'show']
        },
        // 未签约
        WAIT_SUPP_CONFIRM: {
            showRuleTable: true,
            ruleTableMode: ['preview', 'edit']
        }
    }
};

const RECORD_COLUMN = [
    {
        width: '15%',
        prop: 'applyTime',
        name: '申请时间',
    },
    {
        width: '20%',
        prop: 'beforeChange',
        name: '变更前',
    },
    {
        width: '20%',
        prop: 'afterChange',
        name: '变更后',
    },
    {
        width: '30%',
        prop: 'changeReason',
        name: '变更原因',
    },
    {
        width: '15%',
        prop: 'finTime',
        name: '变更生效时间',
    }
];

const getValue = (key, val) => {
    let newVal = val;
    if (!val) return '-';
    if (key === 'payType') {
        newVal = PAY_TYPE[val];
    } else if (['suppAmt', 'purchTotalAmt'].includes(key)) {
        newVal = formatMoney(accDiv(val, 100), 2, '') + '元';
    } else {
        newVal = val;
    }
    return newVal;
};
const ACTION_CONFIG = new Map()
    .set('withdrawn', {
        // 撤回
        role: ['staff'],
        show: ['onConfirm', 'onInitiate', 'reject'],
        tip: withdrawnTip,
        label: withdrawn,
        click: 'withdrawn'
    })
    .set('revise', {
        // 修改
        role: ['staff'],
        show: ['returned', 'withdrawn', 'saved'],
        tip: reviseTip,
        label: revise,
        click: 'revise'
    })
    .set('confirmOrder', {
        // 确认下单
        role: ['staff'],
        show: ['returned', 'withdrawn', 'saved'],
        tip: confirmOrderTip,
        label: confirmOrder,
        click: 'confirmOrder'
    })
    .set('cancelOrder', {
        // 取消订单
        role: ['staff'],
        show: ['returned', 'onInitiate', 'onConfirm', 'withdrawn', 'reject'],
        tip: cancelOrderTip,
        label: cancelOrder,
        click: 'cancel'
    })
    .set('cancelOrderReason', {
        // 取消订单需要原因
        role: ['staff'],
        show: ['done'],
        tip: cancelOrderTip,
        label: cancelOrder,
        click: 'cancelReason'
    })
    .set('signOff', {
        // 发起签报
        role: ['staff'],
        show: ['onInitiate', 'reject'],
        tip: signOffTip,
        label: signOff,
        click: 'signOff'
    })
    .set('reject', {
        // 退回
        role: ['supplier'],
        show: ['onConfirm'],
        tip: rejectTip,
        label: reject,
        click: 'reject'
    })
    .set('suppConfirmOrder', {
        // 确认订单
        role: ['supplier'],
        show: ['onConfirm'],
        tip: suppConfirmOrderTip,
        label: suppConfirmOrder,
        click: 'suppConfirmOrder'
    })
    .set('approvalDetail', {
        // 查看审批详情
        role: ['staff'],
        show: ['approving'],
        tip: null,
        label: '查看详情',
        click: 'goApprovalDetail'
    })
    .set('changeTime', {
        // 变更出行时间
        role: ['staff'],
        show: ['done'],
        tip: null,
        label: '变更出行时间',
        click: 'changeTime'
    })
    .set('uploadBill', {
        role: ['supplier'],
        show: ['done'],
        tip: null,
        label: '上传账单',
        click: 'uploadBill'
    })
    .set('invoice', {
        role: ['supplier'],
        show: ['done'],
        tip: null,
        label: '开具发票',
        click: 'invoice'
    });

const VIEW_CONFIG = new Map()
    .set('orderId',
        (params) => ({
            label: orderId,
            value: params.orderId,
            style: {
                'font-weight': 'bolder'
            }
        })
    )
    .set('rejectReason',
        (params) => ({
            show: !!params.rejectReason,
            label: rejectReason,
            value: params.rejectReason,
            style: {
                color: '#f5643d'
            }
        })
    )
    .set('createTime',
        (params) => ({
            span: 12,
            label: createTime,
            value: params.createTime,
            formatter: (val) => dayjs(val).format('YYYY-MM-DD HH:mm'),
        })
    )
    .set('finTime',
    (params) => ({
        span: 12,
        label: finTime,
        show: params.finTime,
        value: params.finTime,
        formatter: (val) => dayjs(val).format('YYYY-MM-DD HH:mm'),
    })
    )
    .set('suppName',
        (params) => ({
            label: suppName,
            value: params.suppName,
        })
    )
    .set('userCompanyName', (params) => ({
        label: userCompanyName,
        value: params.userCompanyName,
    }))
    .set('actTime', (params) => ({
        label: actTime,
        value: params.actTime
    }))
    .set('depAddress', (params) => ({
        label: depAddress,
        value: params.depAddress,
        formatter: (val) => JSONParse(val, (v) => {
            const newList = v?.list.map(item => item.cityName);
            if (newList?.length === 0 && v.remark) return v.remark;
            return newList?.join(',');
        })
    }))
    .set('actPlace', (params) => ({
        label: actPlace,
        value: params.actPlace,
        formatter: (val) => JSONParse(val, (v) => {
            const newList = v?.list.map(item => item.cityName);
            if (newList?.length === 0 && v.remark) return v.remark;
            return newList?.join(',');
        })
    }))
    .set('peopleNum', (params) => ({
        span: 12,
        label: peopleNum,
        value: params.peopleNum,
    }))
    .set('totalBudget', (params) => ({
        show: !params.isSupplier,
        span: 12,
        label: totalBudget,
        value: params.purchTotalAmt,
        formatter: (val) => getValue('purchTotalAmt', val),
    }))
    .set('accountName', (params) => ({
        show: params.isCard,
        label: accountName,
        value: params?.orderBankInfo?.accountName,
        formatter: (val) => getValue('accountName', val),
    }))
    .set('accountNo', (params) => ({
        show: params.isCard,
        label: accountNo,
        value: params?.orderBankInfo?.accountNo,
        formatter: (val) => getValue('accountNo', val),
    }))
    .set('bankName', (params) => ({
        show: params.isCard,
        label: bankName,
        value: params?.orderBankInfo?.bankName,
        formatter: (val) => getValue('bankName', val),
    }))
    .set('bankBranchName', (params) => ({
        show: params.isCard,
        label: bankBranchName,
        value: params?.orderBankInfo?.bankBranchName,
        formatter: (val) => getValue('bankBranchName', val),
        slot: [
            {   
                notice: '开户说明',
                type: 'tip',
                tipWidth: 386,
                tip: '签约接单完成后，将以当前最新的收款账户为供应商创建平安财智云收款账户',
            },
        ],
    }))
    .set('payType', (params) => ({
        span: 12,
        label: payType,
        value: params?.payType,
        formatter: (val) => getValue('payType', val),
    }))
    .set('suppAmt', (params) => ({
        label: suppAmt,
        value: params?.suppAmt,
        formatter: (val) => getValue('suppAmt', val),
    }))
    .set('orderType', (params) => ({
        show: params.orderType === 'MULTIPLE',
        span: 12,
        label: orderType,
        value: '分批下单',
        slot: [
            {
                type: 'tip',
                tipWidth: 508,
                tip: '仅签约项目框架合同，签约完成后，经办人自行创建订单，可创建多个订单',
            },
        ],
    }))
    .set('payment', (params, contractPayList) => ({
        span: 12,
        component: 'payment', //付款方式
        props: {
            isPostPaid: params.isPostPaid,
            isSupplier: params.isSupplier,
            payInfoList: contractPayList,
            payMode: params.payMode,
        },
    }))
    .set('orderAmt', (params, orderAmt) => ({
        label: orderAmtLabel, //订单金额
        component: 'orderAmtItem',
        props: {
            isMultiple: true,
            ruleTableData: params.breakContractInfoList,
            priceInfo: {
                orderAmt,
                orderAmtExTax: params?.totalAmountExclusiveTax,
                priceList: params?.priceList,
            },
        },
    }))
    .set('prepayRatio', (params) => ({
        span: 12,
        show: isNumber(params?.additionBean?.prepayRatio),
        label: suppPrepayRatio,
        value: `${params?.additionBean?.prepayRatio || 0}%`,
    }))
    .set('billAmt', (params) => ({
        show: ['INIT', 'CANCEL', 'PROCESSING'].includes(params.orderStatus),
        span: 12,
        label: billAmt, // 帐单金额
        component: 'billAmtItem',
        props: {
            billAmt: params?.billAmt,
            billBatch: params?.billBatch,
            orderStatus: params?.orderStatus,
            mode: params.mode,
        },
    }))
    .set('isUnion', (params) => ({
        span: 12,
        label: isUnion, //联合办会
        value: params.isUnion,
        formatter: (val) => (val === 'Y' ? '是' : '否'),
    }))
    .set('costBearingMethodNames', (params) => ({
        span: 12,
        show: params?.isUnion === 'Y',
        label: costBearingMethodNames, //承担方式
        value: COST_METHOD_NAMES[params.costBearingMethod]
    }))
    .set('bearTypes', (params) => ({
        span: 12,
        show: params.isUnion === 'Y',
        label: bearTypes, //承担方式
        component: 'bear-types',
        props: {
            bearType: params?.costBearingMethod,
            bearList: params?.costBearingBeanList,
        },
    }))
    .set('goodsInvoiceReqName', (params) => ({
        span: 12,
        show: params.invoiceBean.invoiceReqName,
        label: invoiceReq, // 发票要求
        value: params.invoiceBean.invoiceReqName,
    }))
    .set('invoiceReqName', (params) => ({
        span: 12,
        show: params.invoiceBean.invoiceReqName,
        label: invoiceReq, // 发票要求
        value: params.invoiceBean.invoiceReqName,
    }))
    .set('invoiceType', (params) => ({
        span: 12,
        show: params.invoiceBean.isUnify && params.invoiceBean.invoiceType,
        label: invoiceType, // 发票类型
        value: params.invoiceBean.invoiceType,
    }))
    .set('invoiceRate', (params) => ({
        span: 12,
        show: params.invoiceBean.isUnify && params.invoiceBean.invoiceRate,
        label: invoiceRate, // 税率
        value: params.invoiceBean.invoiceRate,
    }))
    .set('invoiceMemo', (params) => ({
        span: 12,
        show: !!params.invoiceReqBean?.invoiceMemo,
        label: invoiceMemo, //发票的备注
        value: params.invoiceReqBean?.invoiceMemo,

    }))
    .set('remark', (params) => ({
        span: 12,
        label: remark,
        value: params?.remark || none,
    }))
    .set('fileList', (params) => ({
        span: 12,
        label: file, //附件
        component: 'fileListItem',
        props: {
            fileList: params.fileList,
        }
    }))
    .set('approvalDetail', (params, goApprovalDetail) => ({
        show: !!params.requestSysId && !params.isSupplier,
        span: 12,
        label: approvalDetail,
        slot: [{
            name: seeDetail,
            type: 'button',
            click: goApprovalDetail,
        }],
    }));

const TABLE_PROPS = [
    {
        label: '账单ID',
        prop: 'billId',
        width: 250
    }, {
        label: '拆分标记',
        prop: 'splitFlag',
        formatter: (bill: any) => SPLIT_MAP[bill.splitFlag || 'X']
    }, {
        label: '账单创建时间',
        prop: 'createTime',
        width: 200
    }, {
        label: '账单金额',
        prop: 'billAmount',
        width: 150,
        formatter: (bill: any) => {
            return isNaN(bill.billAmount) ? '' : toThousands(accDiv(bill.billAmount, 100));
        }
    }, {
        label: isSupplier() ? '对账状态' : '账单状态',
        prop: 'billStatusName',
        width: 100,
        formatter: (bill: any) => {
            return isSupplier() ? bill.reconStatusName || '- -' : bill.billStatusName || '- -';
        }
    }, {
        label: '发票状态',
        prop: 'invoiceStatusName',
        width: 200,
        formatter: (bill: any) => {
            return bill.invoiceStatusName ?? '- -';
        }
    },
];

export {
    CORP_ORDER_STATE,
    SUPP_ORDER_STATE,
    ORDER_TYPE,
    PAY_TYPE, //支付方式 银行转账｜现金
    RECORD_COLUMN,
    ACTION_CONFIG,
    VIEW_CONFIG,
    RULE_TABLE_CONFIG,
    INVOICE_REQ,
    INVOICE_TYPE,
    TABLE_PROPS
};

