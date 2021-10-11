<template>
    <div>
        <div class="order-details">
            <h3 class="details_title">{{ titleName }}</h3>
            <div class="details_list">
                <table border="1" cellspacing="0">
                    <colgroup>
                        <col width="6%" />
                        <col width="14%" />
                        <col width="17%" />
                        <col width="11%" />
                        <col width="9%" />
                        <col width="7%" />
                        <col width="9%" />
                        <col width="7%" />
                        <col width="9%" />
                        <col width="11%" />
                    </colgroup>
                    <tr class="table_head">
                        <td>序号</td>
                        <td>服务子类</td>
                        <td>服务项</td>
                        <td>说明</td>
                        <td>数量</td>
                        <td>单位</td>
                        <td>频次</td>
                        <td>单位</td>
                        <td>单价(含税)</td>
                        <td>费用</td>
                    </tr>
                    <template v-for="(item, index) in offerDetailedListBean.newArr">
                        <!-- <tr :key="index"> -->
                        <template v-show="!item.type">
                            <template v-for="(obj, idx) in item.offerServiceItemBeanList">
                                <tr :key="index + '--' + idx" v-if="showMore || obj.index <= 10">
                                    <td>
                                        {{ obj.index }}
                                    </td>
                                    <td v-if="obj.rowSpan" :rowspan="obj.rowSpan">
                                        {{ item.serviceSubTypeName }}
                                    </td>
                                    <td>
                                        {{ obj.itemName }}
                                    </td>
                                    <td>
                                        <ellipsis stringLength="15" tipWidth="180" :value="obj.itemRemark"></ellipsis>
                                    </td>
                                    <td>
                                        {{ obj.itemQty }}
                                    </td>
                                    <td>
                                        {{ obj.unit }}
                                    </td>
                                    <td>
                                        {{ obj.frequency || '-' }}
                                    </td>
                                    <td>
                                        {{ obj.frequencyUnit || '-' }}
                                    </td>
                                    <td>
                                        {{ obj.unitPrice | numTofixed | formatMoney(2, '') }}
                                    </td>
                                    <td>
                                        {{ obj.totalPrice | numTofixed | formatMoney(2, '') }}
                                    </td>
                                </tr>
                            </template>
                        </template>
                        <template v-if="showMore ? item.type : item.index <= 10 && item.type">
                            <tr
                                :class="{
                                    haha: item.type,
                                }"
                                :key="index + '--'"
                            >
                                <td :colspan="10" class="subtotal">
                                    <span
                                        >发票类型：{{ item.invoiceType ? invoiceTypeEum[item.invoiceType] : '' }}</span
                                    >
                                    <span
                                        >不含税小计：{{
                                            item.totalAmountExclusiveTax | numTofixed | formatMoney(2, '')
                                        }}</span
                                    >
                                    <span>税率：{{ (item.invoiceRate * 100) | numTofixed }} %</span>
                                    <span>含税小计：{{ item.totalAmount | numTofixed | formatMoney(2, '') }}</span>
                                </td>
                            </tr>
                        </template>
                    </template>
                </table>

                <div v-if="showMoreControl" class="more-btn" @click="tiggle()">
                    <span :class="['el-icon-d-arrow-left', showMore ? 'isopenArrow' : 'isCloseArrow']"></span>
                    <div>{{ showMore ? '收起内容' : '查看余下内容' }}</div>
                </div>
            </div>
        </div>
        <div class="gridTwo">
            <div class="markItems">
                <div v-if="true">
                    <span class="markItems-title">费用包含：</span>
                    <span>{{ markItems.priceInclude }}</span>
                </div>
                <div v-if="true">
                    <span class="markItems-title">费用不包含：</span>
                    <span v-if="markItems.priceExcludeBean">
                        <template v-for="(item, index) in markItems.priceExcludeBean.priceExcludeDetailBeanList">
                            {{ item.name + item.price + item.unit }},
                        </template>
                        <span v-if="markItems.priceExcludeBean.remark">({{ markItems.priceExcludeBean.remark }})</span>
                    </span>
                </div>
                <div v-if="true">
                    <span class="markItems-title">价格备注：</span>
                    <span>{{ markItems.businessRemark }}</span>
                </div>
            </div>
            <div class="total-box">
                <div>
                    <span class="has-tax">合计金额(含税)：</span>
                    <span v-if="offerDetailedListBean.topData.totalAmount" class="has-tax-amount">{{
                        offerDetailedListBean.topData.totalAmount | numTofixed | formatMoney
                    }}</span>
                </div>
                <div class="no-tax">
                    <span> 合计(不含税)： </span>
                    <span v-if="offerDetailedListBean.topData.totalAmountExclusiveTax">{{
                        offerDetailedListBean.topData.totalAmountExclusiveTax | numTofixed | formatMoney
                    }}</span>
                </div>
                <div>
                    <span class="average-spend">人均金额：</span>
                    <span v-if="offerDetailedListBean.topData.peopleNum" class="average-spend-amount">{{
                        offerDetailedListBean.topData.preAmount | numTofixed | formatMoney
                    }}</span>
                </div>
                <div>
                    <span class="average-spend">计划总人数：</span>
                    <span v-if="offerDetailedListBean.topData.peopleNum" class="average-spend-amount">{{
                        offerDetailedListBean.topData.peopleNum
                    }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
// import orderPriceListHandle from './orderPriceListHandler.js';

export default {
    props: {
        markItems: {
            type: Object,
            default: () => {
                return {
                    priceInclude: '',
                    priceExcludeBean: { remark: '', priceExcludeDetailBeanList: [] },
                    businessRemark: '',
                };
            },
        },
        offerDetailedListBean: {
            type: Object,
            default: () => {
                return { newArr: [], topData: {} };
            },
        },
        titleName: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            showMore: false,
            invoiceTypeEum: {},
        };
    },
    created() {
        this.queryEnum();
    },
    methods: {
        async queryEnum() {
            // Mice2InvoiceTypeEnum
            // Mice2InvoiceRateEnum
            const data = await this.$store.dispatch(
                'queryEnum',
                JSON.stringify({
                    enumTypeList: ['Mice2InvoiceTypeEnum'],
                }),
            );
            const invoiceTypeEum = {};
            if (data && data.resultCode == '1000') {
                const newData = data.data || {};
                newData.enumListBeanList.forEach((item) => {
                    if (item && item.enumBeanList) {
                        item.enumBeanList.forEach((it) => {
                            invoiceTypeEum[it.code] = it.memo;
                        });
                    }
                });
            }
            this.invoiceTypeEum = invoiceTypeEum;
        },
        tiggle() {
            this.showMore = !this.showMore;
            // this.$emit('showTotal', this.showMore);
        },
    },
    computed: {
        showMoreControl() {
            const { newArr = [] } = this.offerDetailedListBean;
            return newArr[0] && newArr[newArr.length - 1].index > 10;
        },
    },
};
</script>

<style lang="scss" scoped>
.order-details {
    padding-bottom: 20px;
    .details_title {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: #383838;
        letter-spacing: -0.13px;
        text-align: center;
        line-height: 16px;
        margin-bottom: 21px;
    }
    .details_list {
        table {
            width: 100%;
            .table_head {
                background: #fafbfd;
            }
            td {
                border: 1px solid #e8e8e8;
                height: 36px;
                text-align: center;
                line-height: 36px;
                vertical-align: middle;
            }
            .subtotal {
                background: #fafbfd;
                text-align: right;
                padding-right: 10px;
                span {
                    padding: 0 10px;
                }
            }
        }
        .more-btn {
            text-align: center;
            margin-top: 20px;
            color: #1989fa;
            .isopenArrow {
                transform: rotate(90deg);
                font-size: 16px;
            }
            .isCloseArrow {
                transform: rotate(-90deg);
                font-size: 16px;
            }
        }
    }
}
.gridTwo {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    padding: 25px 0 20px;
    border-top: 1px solid #eee;
    .markItems {
        width: 70%;
        div {
            display: flex;
            margin-top: 10px;
            span {
                font-size: 14px;
                line-height: 24px;
                font-family: LucidaGrande;
            }
            .markItems-title {
                display: inline-block;
                flex: 0 0 150px;
                margin-right: 10px;
                text-align: right;
            }
        }
    }
    .total-box {
        text-align: right;
        div {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-bottom: 10x;
        }
        .has-tax {
            font-size: 14px;
            color: #000000;
        }
        .has-tax-amount {
            font-family: LucidaGrande;
            font-size: 24px;
            color: #f5643d;
        }
        .no-tax {
            margin-top: 10px;
            font-size: 14px;
            color: #666666;
        }
        .average-spend {
            margin-top: 10px;
            font-size: 14px;
            color: #666;
        }
        .average-spend-amount {
            margin-top: 10px;
            font-family: LucidaGrande;
            font-size: 14px;
            color: #666;
        }
    }
}
.foot-btn {
    text-align: center;
}
</style>
