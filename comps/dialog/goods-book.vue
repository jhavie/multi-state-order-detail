<template>
    <div class="dialog-test">
        <el-dialog class="el-dialog--large" title="预定详情" :visible.sync="preBookVisibleSynced">
            <h3 class="title">酒店信息</h3>
            <div class="card-info">
                <div class="card-info-header">
                    {{ header }}
                </div>
                <div class="flex">
                    <div v-for="(i, index) in list" class="flex-item" :key="index">
                        <div class="label">{{ i.label }}：</div>
                        <div class="value" :title="i.value">{{ i.value }}</div>
                    </div>
                </div>
            </div>
            <!--<goods-table
                ref="dialogGoodsTable"
                :tableData="serviceInfoList || []"
                :titleName="'预定信息'"
                :isSupplier="false"
                :peopleNum="params.peopleNum"
                :isSupplierRevising="false"
            ></goods-table>-->
            <!--<div class="inoviceInfo">
                <div>
                    <span>{{ invoiceReqName }}</span>
                </div>
                <div v-if="params.isUnify">
                    <span>发票类型:</span>
                    <span class="inoviceType">
                        {{(bpPurchOrderBean.invoiceReqBean && invoiceTypeEnum[bpPurchOrderBean.invoiceReqBean.invoiceType]) || '' }}
                    </span>
                </div>
            </div>-->
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Vue, Prop, Component, PropSync } from 'vue-property-decorator';
import goodsTable from '@mice/pages/views/goods/components/goodsTable';
import { Action } from 'vuex-class';

@Component({
    name: 'goods-book-dialog',
    components: {
        goodsTable
    }
})
export default class GoodsBookDialog extends Vue {
    @Prop({ type: Object })
    params!: object;
    /** 标品查询预定头部卡片信息 */
    @Action('goods/queryBookDetail') queryBookDetail;

    @PropSync('preBookVisible', { type: Boolean, default: () => false })
    preBookVisibleSynced!: boolean;

    mapBpBookBaseInfo = {
        suppId: '供应商ID',
        suppName: '供应商名称',
        suppPhone: '供应商电话',
        suppMail: '供应商邮箱',
        cityName: '城市',
        starRate: '星级',
        venuePrice: '会场价格',
        roomPrice: '客房价格',
        peopleNum: '容纳人数',
        area: '会场面积',
        mainImageUrl: '图片',
        totalAmt: '总价',
        goodsDesc: '商品描述',
    };

    serviceInfoList = [];

    header = '';

    list = [];

    created() {
        this.queryOrderBookDetail();
    }

    // 标品生成订单状态下请求‘预定详情’头部
    async queryOrderBookDetail() {
        const { bookId, goodsId } = this.params;
        const params = {
            bookId,
            goodsId
        };
        const res = await this.queryBookDetail(params);
        if (res?.resultCode !== '1000') return;
        const { data } = res;
        this.genCardData(data.bpBookInfo.bpBookBaseInfo);
        this.serviceInfoList = data.bpBookInfo.bpBookServiceInfoList;
    }

    genCardData(bpBookBaseInfo) {
        const list = [];
        const preName = bpBookBaseInfo.groupName ? `${bpBookBaseInfo.groupName} - ` : '';
        Object.keys(bpBookBaseInfo).forEach((key) => {
            if (key === 'goodsName') {
                this.header = `${preName}${bpBookBaseInfo[key]}`;
            } else if (this.mapBpBookBaseInfo[key] && bpBookBaseInfo[key]) {
                list.push({
                    label: this.mapBpBookBaseInfo[key],
                    value: bpBookBaseInfo[key],
                });
            }
        });
        this.list = list;
    }
}
</script>
<style lang="scss" scoped>
.prePopSubTitle {
    margin: -20px 0 20px;
}
.card-info {
    background-color: #ffffff;
    margin: 0 auto;
    box-shadow: 0 2px 10px 0 rgba(206, 206, 206, 0.5);
    padding: 30px 40px;
    margin-bottom: 30px;
    flex-direction: column;
    align-items: center;
    position: relative;
    .card-info-header {
        font-weight: bold;
        font-size: 16px;
        color: #383838;
    }
    .flex {
        display: flex;
        flex-flow: wrap;
    }
    .flex-item {
        display: inline-block;
        width: 250px;
        margin: 12px 0;
    }
    .label {
        height: 14px;
        display: inline-block;
        vertical-align: middle;
    }
    .value {
        width: 100px;
        height: 14px;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
    }
}
</style>
