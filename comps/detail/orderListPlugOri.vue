<!--
 * 复制自src/pages/views/common/orderDetail/components/orderListPlug.vue
 * 复制时版本0428
 * 说明: 与原复制文件未做任何改动
-->
<template>
    <div>
        <div class="order-details">
            <h3 class="details_title">{{ titleName }}</h3>
            <div class="details_list">
                <table border="1" cellspacing="0">
                <colgroup>
                    <col width=5%>
                    <col width=12%>
                    <col width=13%>
                    <col width=11%>
                    <col width=9%>
                    <col width=7%>
                    <col width=7%>
                    <col width=7%>
                    <col width=9%>
                    <col width=9% v-if="!paramsReq.isConfirmTempl">
                    <col width=10%>
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
                    <td v-if="!paramsReq.isConfirmTempl">现单价</td>
                    <td>费用</td>
                </tr>
                <template v-for="(item, index) in offerDetailedListBeanCopy.newArr">
                    <!-- <tr :key="index"> -->
                        <template v-show="!item.type">
                            <template v-for="(obj, idx) in item.offerServiceItemBeanList">
                                <tr :key="index+'--'+idx" v-if="showMore || obj.index <= 10">
                                    <td>
                                        {{obj.index}}
                                    </td>
                                    <td v-if="obj.rowSpan" :rowspan="obj.rowSpan">
                                        {{item.serviceSubTypeName}}
                                    </td>
                                    <td>
                                        {{obj.itemName}}
                                    </td>
                                    <td>
                                        <el-tooltip class="item" effect="dark" :content="obj.itemRemark" placement="top-start">
                                            <div class="itemRemark">{{obj.itemRemark}}</div>
                                        </el-tooltip>
                                    </td>
                                    <td>
                                        <el-input-number
                                            v-if="!isSupplier && paramsReq.isConfirmTempl"
                                            placeholder="参加人数"
                                            :controls="false"
                                            :min="0"
                                            :precision="0"
                                            v-model="obj.itemQty"
                                            @change="changeAmt(obj, $event)"
                                        /></el-input-number>
                                        <span v-else>{{parse(obj.itemQty)}}</span>
                                    </td>
                                    <td>
                                        {{obj.unit}}
                                    </td>
                                    <td>
                                        <el-input-number
                                            v-if="!isSupplier && (obj.frequency !== null) && paramsReq.isConfirmTempl"
                                            placeholder="频次"
                                            :controls="false"
                                            :min="0"
                                            :precision="0"
                                            v-model="obj.frequency"
                                            @change="changeAmt(obj, $event)"
                                        /></el-input-number>
                                        <template v-else>
                                            {{parse(obj.frequency)}}
                                        </template>
                                    </td>
                                    <td>
                                        {{obj.frequencyUnit || '-'}}
                                    </td>
                                    <td>
                                        {{ (!paramsReq.isConfirmTempl ? obj.oriUnitPrice : obj.unitPrice) | numTofixed | formatMoney(2, '') }}
                                    </td>
                                     <td v-if="!paramsReq.isConfirmTempl" class="bgWhite">
                                        <el-input-number
                                            v-if="isSupplier && paramsReq.iswaitSign"
                                            placeholder="现单价"
                                            :controls="false"
                                            :min="0"
                                            :precision="2"
                                            v-model="obj.uiUnitPrice"
                                            v-money:2="obj.uiUnitPrice"
                                            @change="changeAmt(obj, $event)"
                                        /></el-input-number>
                                        <el-input-number
                                            v-else
                                            placeholder="现单价"
                                            :controls="false"
                                            :min="0"
                                            :precision="2"
                                            :value="obj.uiUnitPrice"
                                            v-money:2="obj.uiUnitPrice"
                                            disabled
                                        /></el-input-number>
                                    </td>
                                    <td>
                                        {{ obj.totalPrice | numTofixed | formatMoney(2, '') }}
                                    </td>
                                </tr>
                            </template>
                        </template>
                        <template v-if="showMore ? item.type : (item.index <= 10 && item.type)" >
                            <tr :class="{
                                haha: item.type
                            }" :key="index+'--'">
                                <td :colspan="!paramsReq.isConfirmTempl ? 11 : 10" class="subtotal">
                                    <span>发票类型：{{item.invoiceType ? invoiceTypeEum[item.invoiceType] : ''}}</span>
                                    <span>不含税小计：{{ item.totalAmountExclusiveTax | numTofixed | formatMoney(2, '') }}</span>
                                    <span>税率：{{ item.invoiceRate * 100 | numTofixed }} %</span>
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
            <div class="markItems" :class="{'markItems--shrink': paramsReq.isFBid}">
                <div v-if="true" >
                    <span class="markItems-title">费用包含：</span>
                    <span>{{ markItems.priceInclude }}</span>
                </div>
                <div v-if="true" >
                    <span class="markItems-title">费用不包含：</span>
                    <span v-if="markItems.priceExcludeBean">
                        <template v-for="(item, index) in markItems.priceExcludeBean.priceExcludeDetailBeanList">
                            {{item.name + item.price + item.unit }},
                        </template>
                        <span v-if="markItems.priceExcludeBean.remark"> ({{ markItems.priceExcludeBean.remark }})</span>
                    </span>
                </div>
                <div v-if="true" >
                    <span class="markItems-title">价格备注：</span>
                    <span>{{ markItems.businessRemark }}</span>
                </div>
                <div v-if="showPrepayRatio">
                    <span class="markItems-title">供应商填写预付比例：</span>
                    <span>{{ Number(prepayRatio) }}%</span>
                </div>
            </div>
            <div class="total-box">
                <div>
                    <span class="has-tax">合计金额(含税)：</span>
                    <span v-if="offerDetailedListBeanCopy.topData.totalAmount" class="has-tax-amount">{{ offerDetailedListBeanCopy.topData.totalAmount | numTofixed | formatMoney }}</span>
                    <span class="banlanceAmt" v-if="paramsReq.isFBid"> (剩余可跟标金额￥{{ paramsReq.balanceAmt | formatMoney(2, '') }})</span>
                </div>
                <div class="no-tax">
                    <span> 合计(不含税)： </span>
                    <span v-if='offerDetailedListBeanCopy.topData.totalAmountExclusiveTax'>{{ offerDetailedListBeanCopy.topData.totalAmountExclusiveTax | numTofixed | formatMoney }}</span>
                </div>
                <div>
                    <span class="average-spend">人均金额：</span>
                    <span v-if="offerDetailedListBeanCopy.topData.peopleNum" class="average-spend-amount">{{ offerDetailedListBeanCopy.topData.preAmount | numTofixed | formatMoney }}</span>
                </div>
                <div>
                    <span class="average-spend">计划总人数：</span>
                    <span v-if="offerDetailedListBeanCopy.topData.peopleNum" class="average-spend-amount">{{ offerDetailedListBeanCopy.topData.peopleNum }}</span>
                </div>
            </div>
        </div> 
    </div>
</template>
<script>
import { deepClone, getStore, accDiv, accMul, accAdd } from 'Utils';
import { isNumber } from 'Utils/check';

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
        changeTableData: {
            type: Function,
        },
        orderId: {
            type: String,
            default: '',
        },
        paramsReq: {
            type: Object,
            default: () => {},
        },
        prepayRatio: {
            type: Number,
            default: null,
        },
    },
    data() {
        return {
            showMore: false,
            invoiceTypeEum: {},
            offerDetailedListBeanCopy: { newArr: [], topData: {} },
            revisibleItems: [],
        };
    },
    created() {
        this.queryEnum();
    },
    computed: {
        isSupplier() {
            return getStore({ name: 'roleCode' }) === 'supplier';
        },
        showMoreControl() {
            const { newArr = [] } = this.offerDetailedListBean;
            return newArr[0] && newArr[newArr.length - 1].index > 10;
        },
        showPrepayRatio() {
            return isNumber(this.prepayRatio);
        },
    },
    watch: {
        offerDetailedListBean: {
            deep: true,
            immediate: true,
            handler(curVal, oldVal) {
                this.dataTransfer(curVal);
                this.plugInit(curVal);
            },
        },
    },
    methods: {
        parse(data) {
            return typeof data === 'number' ? data : '-';
        },
        plugInit(data) {
            const revisibleItems = [];
            this.offerDetailedListBeanCopy.newArr.forEach((i, idx) => {
                if (!i.type) {
                    i.offerServiceItemBeanList.forEach((o, index) => {
                        revisibleItems.push({
                            itemQty: o.itemQty,
                            frequency: o.frequency,
                            unitPrice: Math.round(o.unitPrice),
                            detailId: o.detailId,
                        });
                    });
                }
            });
            this.revisibleItems = revisibleItems;
        },
        dataTransfer(data) {
            this.offerDetailedListBeanCopy = deepClone(data);
        },
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
        transmitParams() {
            this.createOrders();
        },
        tiggle() {
            this.showMore = !this.showMore;
            // this.$emit('showTotal', this.showMore);
        },
        changeAmt(obj, e) {
            const oriUnitPrice = accDiv(obj.oriUnitPrice || 0, 100);
            console.log(111111111, obj.uiUnitPrice, oriUnitPrice);
            if (this.isSupplier && obj.uiUnitPrice > oriUnitPrice) {
                this.$miceAlert('修改的价格不能高于原价', false);
                this.$nextTick(() => {
                    obj.uiUnitPrice = oriUnitPrice || 0;
                    this.changeAllData(obj);
                });
            } else {
                this.changeAllData(obj);
            }
        },
        changeAllData(obj) {
            obj.unitPrice = accMul(obj.uiUnitPrice, 100) || 0;
            const frequency = typeof obj.frequency === 'number' ? obj.frequency : 1;
            obj.totalPrice = accMul(accMul(obj.unitPrice, frequency), obj.itemQty || 0) || 0;
            let totalAmount = 0;
            let totalAmountExclusiveTax = 0;
            let blockTotalAmount = 0;
            const revisibleItems = [];
            this.offerDetailedListBeanCopy.newArr.forEach((i, idx) => {
                /**  
                 * {
                    "itemId": "",
                    "detailId": "",
                    "itemName": "头等舱",
                    "unit": "位",
                    "itemQty": "数量",
                    "frequency": "频次",
                    "frequencyUnit": "频次单位",
                    "oriUnitPrice": "原价",
                    "unitPrice": "现价",
                    "totalPrice": "200"
                    "itemDesc": "",
                }
                */
                if (!i.type) {
                    i.offerServiceItemBeanList.forEach((o, index) => {
                        blockTotalAmount = accAdd(blockTotalAmount, o.totalPrice);
                        revisibleItems.push({
                            itemQty: o.itemQty,
                            frequency: o.frequency,
                            unitPrice: Math.round(o.unitPrice),
                            detailId: o.detailId,
                        });
                    });
                } else {
                    i.totalAmount = blockTotalAmount;
                    i.totalAmountExclusiveTax = accDiv(accDiv(blockTotalAmount, accAdd(1, i.invoiceRate)), 100).toFixed(
                        2,
                    );
                    totalAmount = accAdd(totalAmount, i.totalAmount);
                    totalAmountExclusiveTax = accAdd(totalAmountExclusiveTax, i.totalAmountExclusiveTax);
                    blockTotalAmount = 0;
                }
            });
            this.offerDetailedListBeanCopy.topData.totalAmount = totalAmount;
            this.offerDetailedListBeanCopy.topData.totalAmountExclusiveTax = totalAmountExclusiveTax;
            const num = Number(this.offerDetailedListBeanCopy.topData.peopleNum);
            this.offerDetailedListBeanCopy.topData.preAmount = num > 0 ? accDiv(totalAmount, num) : '';
            this.revisibleItems = Object.freeze(revisibleItems);
            this.changeTableData(this.offerDetailedListBeanCopy);
        },
    },
};
</script>

<style lang="scss" scoped>
.order-details {
    /deep/ .el-input__inner {
        width: 90%;
        height: 37px;
        // border: 0 none;
        border: 1px solid #e8e8e8;
        border-radius: 2px;
    }
    /deep/ .el-input-number {
        width: auto;
    }
    padding-bottom: 20px;
    .details_title {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: #383838;
        letter-spacing: -0.13px;
        text-align: center;
        line-height: 16px;
        margin: 25px 0 21px;
    }
    .details_list {
        table {
            table-layout: fixed;
            width: 100%;
            .table_head {
                background: #fafbfd;
                background-color: #f8f8f8;
            }
            td {
                border: 1px solid #e8e8e8;
                height: 36px;
                text-align: center;
                line-height: 36px;
                vertical-align: middle;
                background-color: #f8f8f8;
                .itemRemark {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    word-break: break-all;
                    padding: 0 10px;
                }
            }
            .bgWhite {
                /deep/ .el-input__inner {
                    background-color: #fff;
                }
            }
            .subtotal {
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
            span {
                font-size: 14px;
                line-height: 24px;
                font-family: LucidaGrande;
            }
            .markItems-title {
                color: #747474;
                display: inline-block;
                flex: 0 0 140px;
                margin-right: 10px;
                text-align: right;
            }
        }
    }
    .markItems.markItems--shrink {
        width: 50%;
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
        .banlanceAmt {
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
