<template>
    <div class="payment">
        <div class="payment-item payment-method">
            <div class="payment-item-title">是否分期：</div>
            <div class="payment-item-value">
                <div class="methods-name">
                    甲方及关联公司选择按照
                    <span class="highlight">{{ payModeMap[payMode] }}</span>
                    方式进行支付：
                </div>
                <div class="methods">
                    <div class="methods-item" v-if="payMode === 'ONE_PAY'">
                        <!-- <div class="method-title">一次性支付：</div> -->
                        <div v-if="!isPostPaid" class="method-content">
                            甲方及关联公司在活动结束，收到乙方出具的发票及费用明细清单，经审核无误后向乙方支付实际发生款项。乙方应在甲方确认账单后30个自然日内开具发票，甲方收到乙方支付的平台服务费30个工作日内，甲方及关联公司向乙方支付订单实际费用。
                        </div>
                        <div v-else class="method-content">
                            甲方及关联公司在活动结束，收到乙方出具的发票及费用明细清单，经审核无误后向乙方支付实际发生款项。乙方应在甲方确认账单后30个自然日内开具发票，并在甲方及关联公司完成实际发生额支付的30个自然日内向甲方支付平台服务费。
                        </div>
                    </div>
                    <div class="methods-item" v-if="payMode === 'MULTI_PAY' && payInfoList.length">
                        <!-- <div class="method-title">分期支付：</div> -->
                        <div class="method-content stages">
                            <div
                                class="stage-item"
                                v-if="index !== (payInfoList && payInfoList.length - 1)"
                                v-for="(item, index) in payInfoList"
                                :key="index"
                            >
                                <div class="stage-item-title">
                                    <span v-if="index === 0">首期款：</span>
                                    <span v-else> 第{{ index + 1 }}期款：</span>
                                    甲方及关联公司应在 <span v-if="index === 0">订单生效后</span>
                                    <span class="highlight">{{ item.planPayTime }}</span>
                                    前支付订单总金额的
                                    <span class="highlight">{{ item.payPercent }}</span>
                                    %，共计
                                    <span class="highlight">{{ (item.payAmt / 100) | formatMoney(2, '') }}</span>
                                    元（大写：人民币
                                    <span class="highlight">{{ (item.payAmt / 100) | moneyNumTransfer }}</span>
                                    整）;
                                </div>
                            </div>
                            <div class="stage-item">
                                余款：RMB
                                <span class="highlight">{{
                                    ((payInfoList && payInfoList[payInfoList.length - 1].payAmt / 100) || 0)
                                        | formatMoney(2, '')
                                }}</span>
                                元（大写：人民币
                                <span class="highlight">{{
                                    ((payInfoList && payInfoList[payInfoList.length - 1].payAmt / 100) || 0)
                                        | moneyNumTransfer
                                }}</span>整）
                                <span v-if="!isPostPaid">由甲方及关联公司在活动结束，收到乙方出具的费发票及费明细清单，经审核无误后向乙方支付实际发生的剩余款项。乙方应在甲方及关联公司确认账单后30个自然日内开具发票，甲方收到乙方支付的平台服务费30个工作日内，甲方及关联公司向乙方支付订单实际费用。</span>
                                <span v-else>由甲方及关联公司在活动结束，收到乙方出具的发票及明细清单，经审核无误后向乙方支付实际发生的剩余款项。乙方在甲方及关联公司完成实际发生额支付的30个自然日内向甲方支付平台服务费。</span>
                            </div>
                            <div class="stage-item stage-item--desc" v-if="!isSupplier">
                                注：签约完成后可进行预付款/借款的申请，其中预付款额度存在限制（仅首期和第二期金额为预付款金额），根据财务要求原则上不能超过总签约金额的20%。
                            </div>
                            <div v-if="payMode === 'MULTI_PAY'" class="prepay-total-amt">
                                <span class="label">预付款合计：</span>
                                <span class="value">{{ prePayAmt | numTofixed | formatMoney(2, '¥') }}</span>
                            </div>
                            <div v-if="payMode === 'MULTI_PAY'" class="prepay-total-amt">
                                <span class="label">预付款比例：</span>
                                <span class="value">{{ prePayPercent }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { formatMoney } from '@mice/common/utils';
// 支付方式

const payModeMap = {
    ONE_PAY: '一次性支付',
    MULTI_PAY: '分期支付',
};
export default {
    props: {
        payInfoList: {
            type: Array,
            default: [],
        },
        payMode: {
            type: String,
            default: '',
        },
        isSupplier: {
            type: Boolean,
            default: false,
        },
        isPostPaid: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            payModeMap,
        };
    },
    mounted() {},
    computed: {
        prePayAmt() {
            const newPayList = this.payInfoList?.length > 1 ? this.payInfoList.slice(0, -1) : this.payInfoList;
            return newPayList?.reduce((ans, item) => {
                if (item.planPayTime) return ans + item.payAmt;
                return ans;
            }, 0);
        },
        prePayPercent() {
            const newPayList = this.payInfoList?.length > 1 ? this.payInfoList.slice(0, -1) : this.payInfoList;
            const num = newPayList.reduce((ans, item) => {
                if (item.planPayTime) return ans + item.payPercent;
                return ans;
            }, 0);
            return formatMoney(num, 2, '');
        },
    },
    watch: {
        prePayAmt(val) {
            this.$emit('getPrePayAmt', val);
        },
    },
};
</script>

<style lang="scss" scoped>
.payment {
    width: 100%;
    .payment-item {
        line-height: 38px;
        font-size: 14px;
        display: flex;
        align-items: center;
        .payment-item-title {
            color: #747474;
            width: 160px;
            text-align: right;
        }
        .payment-item-value {
            width: calc(100% - 150px);
            color: #333333;
            margin-left: 7px;
            .highlight {
                color: #f5643d;
            }
            .methods-item {
                display: flex;
                .method-title {
                    width: 120px;
                }
                .method-content {
                    &.stages {
                        .stage-item {
                            &.stage-item--desc {
                                font-size: 14px;
                                color: #999999;
                                letter-spacing: 0;
                            }
                        }
                    }
                }
            }
        }
    }
    .payment-method {
        align-items: start;
    }
    .prepay-total-amt {
        text-align: right;
        .label {
            font-size: 14px;
            color: #000000;
        }
        .value {
            font-family: LucidaGrande;
            font-size: 24px;
            color: #f5643d;
        }
    }
}
</style>
