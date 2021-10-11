<template>
    <div class="prepay-container">
        <div class="cards">
            <div class="card card--prepay">
                <label class="prepay-title"
                    >预付款申请
                    <el-popover
                        popper-class="prepay-popver"
                        placement="top-start"
                        title="预付款申请"
                        width="396"
                        trigger="click"
                    >
                        <div class="tip-content">
                            针对该笔订单的预付款金额发起的申请，限额为非余款外其他期数支付金额的加和。超过限额、支付方式为非分期付款、所有对账都结束后，无法再发起预付款申请。
                        </div>
                        <i slot="reference" class="tip-icon"></i>
                    </el-popover>
                </label>
                <el-button
                    v-if="!inReadMode"
                    class="btn-apply btn-apply--loan"
                    round
                    :disabled="!prepayAvailable"
                    @click.stop="doApplyLoanprepay('PRE_PAY')"
                    >去申请</el-button
                >
                <div class="circle-panel">
                    <loan-circle :percent="prepayAmtAvailablePercent"></loan-circle>
                </div>
                <div class="circle-mask circle-mask--left"></div>
                <div class="circle-mask circle-mask--right"></div>
                <div class="available-amount">
                    <div class="label">剩余可用金额</div>
                    <div class="amount">{{ prepayAmtAvailable | toThousands }}</div>
                </div>
                <div class="amount-info">
                    <label>总额度(元)</label>
                    <span class="amount">{{ prepayMaxAmt | toThousands }}</span>
                </div>
            </div>
            <div class="card card--loan">
                <label class="prepay-title"
                    >借款申请
                    <el-popover
                        popper-class="prepay-popver"
                        placement="top-start"
                        title="借款"
                        width="396"
                        trigger="click"
                    >
                        <div class="tip-content">
                            以该笔订单为由发起的借款申请，无申请限额，当所有对账结束后，无法再发起借款申请。
                        </div>
                        <i slot="reference" class="tip-icon"></i>
                    </el-popover>
                </label>
                <el-button
                    class="btn-apply btn-apply--prepay"
                    v-if="!inReadMode"
                    round
                    :disabled="!loanAvailable"
                    @click.stop="doApplyLoanprepay('LOAN')"
                    >去申请</el-button
                >
                <div class="amount-limit">
                    无额度限制
                </div>
                <div class="amount-info">
                    <label>已申请(元)</label>
                    <span class="amount">{{ appliedLoanAmt | toThousands }}</span>
                </div>
            </div>
        </div>
        <div class="apply-list">
            <div class="apply-list-header">
                <label>申请记录</label>
                <span>共{{ applyBeanList.length }}条记录</span>
            </div>
            <el-table :data="applyBeanList" border style="width: 100%">
                <el-table-column prop="applyId" width="240" label="申请单号"> </el-table-column>
                <el-table-column prop="billDate" width="240" label="申请时间"> </el-table-column>
                <el-table-column prop="applyTypeName" width="240" label="申请类型"> </el-table-column>
                <el-table-column prop="billAmt" width="240" label="金额（元）"> </el-table-column>
                <el-table-column prop="billStatusName" label="状态"> </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { toThousands } from 'Utils/string';
import loanCircle from './circle';

const APPLY_TYPE = {
    LOAN: '借款',
    PRE_PAY: '预付款',
};

const BILL_STATUS = {
    APPROVING: '审批中',
    APPROVED: '审批通过',
    CANCELED: '已取消',
};
export default {
    components: { loanCircle },
    props: {
        payMode: {
            // 支付方式
            type: String,
            required: true,
        },
        orderId: {
            // 订单ID
            type: String,
            required: true,
        },
        cancelApplyBean: {
            type: Object,
        },
        /** 阅读模式 */
        inReadMode: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            prepayLoading: false,
            appliedLoanAmt: 0, // 已申请借款额度
            appliedPrepayAmt: 0, // 预付款已申请额度
            prepayAmtAvailable: 0, // 申请预付款剩余额度，单位：元，保留两位小数
            prepayMaxAmt: 0, // 申请预付款申请限额，单位：元，保留两位小数
            prepayAvailable: false, // 是否可申请预付款
            loanAvailable: false, // 是否可申请借款
            applyBeanList: [], // 申请单据列表
        };
    },
    filters: {
        toThousands(value) {
            return toThousands(value);
        },
    },
    mounted() {
        this.orderId && this.doQueryLoanprepayList();
    },
    methods: {
        ...mapActions('loanPrepay', ['queryLoanprepayList', 'applyLoanprepay']),
        // 查询借款列表
        async doQueryLoanprepayList() {
            const result = await this.queryLoanprepayList({ orderId: this.orderId });
            if (result && result.resultCode === '1000') {
                const data = result.data || {};
                const applyBeanList = data.applyBeanList || [];
                this.applyBeanList = applyBeanList.map((el) => {
                    el.applyTypeName = APPLY_TYPE[el.applyType];
                    el.billStatusName = BILL_STATUS[el.billStatus];
                    el.billAmt = this.formatMoney(el.billAmt);
                    return el;
                });
                this.prepayAvailable = data.prepayAvailable;
                this.loanAvailable = data.loanAvailable;
                this.appliedLoanAmt = this.formatMoney(data.appliedLoanAmt);
                this.appliedPrepayAmt = this.formatMoney(data.appliedPrepayAmt);
                this.prepayAmtAvailable = this.formatMoney(data.prepayAmtAvailable);
                this.prepayMaxAmt = this.formatMoney(data.prepayMaxAmt);
            }
        },
        // 申请借款
        async doApplyLoanprepay(applyType) {
            if (this.isCancel) {
                this.$message.error('该订单正在取消订单申请中，无法发起借款/预付款的申请。');
                return;
            }
            if (this.prepayLoading) return;
            if (applyType === 'PRE_PAY') {
                if (this.prepayBtnDisabled) {
                    this.$message({ type: 'warning', message: '您的预付款剩余额度不足' });
                    return;
                }
                if (this.isOnePay) {
                    this.$message({ type: 'warning', message: '一次性付款订单暂不支持预付款申请' });
                    return;
                }
            }
            this.prepayLoading = true;
            const res = await this.applyLoanprepay({ applyType, orderId: this.orderId });
            this.prepayLoading = false;
            if (res.resultCode === '1000') {
                const data = res.data || {};
                const { billNo, url } = data;
                this.$message({ type: 'success', message: `申请${APPLY_TYPE[applyType]}成功` });
                const newfasParams = {
                    name: billNo,
                    url,
                    type: 'addChildTag',
                    id: `1${billNo}`,
                };
                try {
                    /* eslint-disable */
                    parent.postMessage(newfasParams, '*');
                } catch (error) {
                    // 跳转newfas
                    throw new Error('跳转newfas失败，参数是：', newfasParams);
                }
                console.log('=====', res);
            }
        },
        formatMoney(num = 0) {
            // return Number(num) / 100;
            return this.$div(Number(num), 100);
        },
    },
    computed: {
        prepayAmtAvailablePercent() {
            return (this.prepayAmtAvailable / this.prepayMaxAmt).toFixed(2);
        },
        // 是否一次性支付
        isOnePay() {
            this.payMode == 'ONE_PAY';
        },
        prepayBtnDisabled() {
            return !Number(this.prepayAmtAvailable) || !Number(this.prepayMaxAmt);
        },
        isCancel() {
            return this.cancelApplyBean && this.cancelApplyBean.applyStatus !== 'CORP_RECALL';
        },
    },
};
</script>

<style lang="scss" scoped>
.prepay-container {
    min-height: 300px;
    background-color: #fff;
    .cards {
        display: flex;
        margin-bottom: 30px;
        .card {
            position: relative;
            width: 328px;
            height: 192px;
            padding: 32px;
            margin-right: -4px;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            border-radius: 4px;
            box-sizing: border-box;
            &.card--loan {
                background-image: url('~@mice/assets/img/loanpay/loan-bg.svg');
            }
            &.card--prepay {
                background-image: url('~@mice/assets/img/loanpay/prepay-bg.svg');
            }
            .prepay-title {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: #fff;
                letter-spacing: 0;
                display: flex;
                align-items: center;
                line-height: 28px;
                > span {
                    display: inherit;
                }
                .tip-icon {
                    display: inline-block;
                    height: 16px;
                    width: 16px;
                    background-image: url('~@mice/assets/img/loanpay/btn_tips_white.svg');
                    background-repeat: no-repeat;
                    background-position: center;
                    padding: 0 16px;
                    cursor: pointer;
                }
            }
            .btn-apply {
                position: absolute;
                top: 32px;
                right: 36px;
                width: 66px;
                height: 28px;
                background-color: rgba(255, 255, 255, 0.7);
                border-radius: 100px;
                font-family: PingFangSC-Medium;
                font-size: 12px;
                letter-spacing: 0;
                padding: 0;
                line-height: 28px;
                text-align: center;
                &.btn-apply--loan {
                    color: #4b8bee;
                }
                &.btn-apply--prepay {
                    color: #7c93b9;
                }
            }
            .available-amount {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 54px;
                font-family: Bebas-Regular;
                color: #ffffff;
                letter-spacing: 0;
                text-align: center;
                .label {
                    font-size: 10px;
                    margin-bottom: 4px;
                }
                .amount {
                    font-family: Bebas-Regular;
                    font-size: 32px;
                }
            }
            .circle-mask {
                position: absolute;
                display: inline-block;
                width: 23px;
                height: 62px;
                bottom: 40px;
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                &--right {
                    right: 90px;
                    background-image: url('~@mice/assets/img/loanpay/mask-right.svg');
                }
                &--left {
                    left: 86px;
                    background-image: url('~@mice/assets/img/loanpay/mask-left.svg');
                }
            }
            .circle-panel {
                text-align: center;
            }
            .amount-limit {
                // font-family: PingFangSC-Medium;
                font-size: 32px;
                color: #fff;
                letter-spacing: 0;
                margin: 12px 0;
            }
            .amount-info {
                position: absolute;
                left: 32px;
                bottom: 28px;
                font-family: PingFangSC-Medium;
                font-size: 12px;
                color: #ffffff;
                letter-spacing: 0;
                line-height: 16px;
                .amount {
                    margin-left: 4px;
                    font-family: Bebas-Regular;
                }
            }
        }
    }
    .apply-list {
        .apply-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            margin-bottom: 10px;
            label {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: #383838;
                letter-spacing: 0;
                text-align: right;
                line-height: 14px;
            }
            span {
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: #999999;
                letter-spacing: 0;
                text-align: right;
            }
        }
        /deep/ .el-table th {
            background-color: #f8f8f8;
        }
        /deep/.el-table th,
        /deep/.el-table td {
            padding: 7px 0;
        }
    }
}
</style>
