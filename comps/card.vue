<template>
    <div class="header-card">
        <section class="card">
            <div class="top">
                <div class="tag">
                    <span class="title">{{ cardData.reqName }}</span>
                    <span v-if="!isSupplier" class="item-source-tag">{{ cardData.outSourceSysName }}</span>
                    <span v-if="cardData.orderTypeName" class="item-source-tag order-source">{{ cardData.orderTypeName }}</span>
                </div>
                <div class="buttons">
                    <span v-if="isShowEBook" @click="showEBookDetail">电子确认书</span>
                    <span v-if="isGoods && !isSupplier && cardData.voteId" @click="gotoVoteDetail">投票详情</span>
                    <span v-if="isGoods && isInit" @click="showPreBookDetail">预定详情</span>
                    <span v-if="isCommon" @click="goDemandDetail">需求详情</span>
                </div>
            </div>
            <div class="middle">
                <div v-for="item in config" class="card-info">
                    <span class="label">{{ item.label }}：</span>
                    <span class="value">{{ item.value }}</span>
                </div>
            </div>
            <template v-if="isFBid">
            <div class="source-project">
                <span>跟标订单来自{{ cardData.reqUserName }}的项目跟标授权</span>
                <router-link :to="followLinkConfig">查看原项目信息</router-link>
            </div>
        </template>
        </section>
        <e-book-section
            v-if="showEBookSection"
            :params="cardData"
        />
        <e-contract-dialog
            :e-book-visible.sync="eBookVisible"
            :params="cardData"
        />
        <goods-book-dialog
            v-if="isGoods && isInit"
            :pre-book-visible.sync="preBookVisible"
            :params="cardData"
        />
    </div>
</template>

<script lang="ts">
import { Prop, Component, Mixins } from 'vue-property-decorator';
import { CommonCard, GoodsCard, FollowCard } from '../entities/Card';
import EContractDialog from '../comps/dialog/e-contract.vue';
import GoodsBookDialog from '../comps/dialog/goods-book.vue';
import CancelOrderDialog from '../comps/dialog/cancel-order.vue';
import ChangeTimeDialog from '../comps/dialog/change-time.vue';
import EBookSection from '../comps/detail/e-book-section.vue';
import Method from '../mixins/method.vue';

@Component({
    name: 'card',
    components: {
        EContractDialog,
        CancelOrderDialog,
        ChangeTimeDialog,
        GoodsBookDialog,
        EBookSection
    }
})
export default class Card extends Mixins(Method) {
    @Prop({ type: Object, default: () => {} })
    readonly params!: object;
    /** 电子确认书弹窗 */
    eBookVisible = false;
    /** 标品预定详情弹窗 */
    preBookVisible = false;

    ruleTable = {};

    mounted() {
        this.$emit('eventBus', 'getRuleTable', this.getRuleTable);
    }

    getRuleTable() {
        return {
            ruleTableData: this.cardData.breakContractInfoList,
            validateCb: this.cardData.ruleTableValidate
        };
    }

    get cardData() {
        let _cardData;
        if (this.isCommon) {
            _cardData = new CommonCard(this.params);
        } else if (this.isGoods) {
            _cardData = new GoodsCard(this.params);
        } else if (this.isFBid) {
            _cardData = new FollowCard(this.params);
        }
        return _cardData;
    }

    private readonly CARD_DATA_MAP = {
        // orderId: '单号',
        user: '创建人',
        reqType: '活动类型',
        reqPubTime: '项目时间',
        suppContactInfo: '供应商联系人'
    };

    get config() {
        return [{
            label: this.CARD_DATA_MAP.user,
            value: this.cardData.user
        }, {
            label: this.CARD_DATA_MAP.reqType,
            value: this.cardData.reqType
        }, {
            label: this.CARD_DATA_MAP.reqPubTime,
            value: this.cardData.reqTime
        }, {
            label: this.CARD_DATA_MAP.suppContactInfo,
            value: this.cardData.suppContactInfo
        }];
    }

    get followLinkConfig() {
        const router = {
            path: '',
            query: {
                orderMode: 'FBID',
                reqId: this.cardData.followReqId
            }
        };
        if (!this.isSupplier) {
            router.path = '/demandManger/operator/demandDetailInfo';
        } else {
            router.path = '/supplier/projectManger/detail';
            router.query.flow = 'demandDetail';
        }
        return router;
    }

    get isShowEBook() {
        if (this.isGoods) {
            return ['INIT', 'CANCEL', 'PROCESSING'].includes(this.cardData.orderStatus);
        }
        return true;
    }

    get showEBookSection() {
        if (this.isGoods) {
            return [
                'SAVE',
                'CORP_RECALL',
                'WAIT_SUPP_CONFIRM',
                'SUPP_BACK',
                'SUPP_CONFIRM',
                'APPROVALING',
                'APPROVAL_REJECT',
            ].includes(this.cardData.orderStatus);
        } else if (this.isFBid) {
            return this.cardData.isSuppProceed;
        }
        return false;
    }

    get isInit() {
        return this.cardData.orderStatus === 'INIT';
    }

    showEBookDetail() {
        this.eBookVisible = true;
    }

    showPreBookDetail() {
        this.preBookVisible = true;
    }

    gotoVoteDetail() {
        this.$router.push({
            name: 'votingDetail',
            query: {
                voteId: this.cardData.voteId,
            },
        });
    }

    // 跳转需求详情
    goDemandDetail() {
        let routerPath;
        // 查询中心定制路由，想办法解耦
        if (this.$route.path.includes('queryCenter')) {
            routerPath = '/staffs/queryCenter/demandDetail';
        } else if (this.isSupplier) {
            routerPath = '/supplier/projectManger/detail';
        } else if (!this.isSupplier && this.cardData.role === 'OPERATOR') {
            routerPath = '/demandManger/operator/demandDetailInfo';
        } else {
            routerPath = '/demandManger/buyer/demandDetailInfo';
        }
        // 根据是企业端还是供应商端跳不同路由
        this.$router.push({
            path: routerPath,
            query: this.isSupplier ?
                { reqId: this.reqId, flow: 'demandDetail' } :
                { reqId: this.reqId },
        });
    }
}
</script>
<style lang="scss" scoped>
$order-tag-width: 52px;
$order-tag-height: 24px;
$order-tag-font-size: 12px;
$mice-text-family-md: PingFangSC-Medium;
.header-card {
    background: #fff;
    .card {
        box-shadow: 0 2px 10px 0 rgba(206,206,206,0.5)
    }
    .top {
        padding: 30px 30px 0 30px;
        display: flex;
        justify-content: space-between;
        .tag {
            .title {
                font-weight: bold;
                font-size: 16px;
                color: #383838;
                line-height: 16px;
            }
            .item-source-tag {
                display: inline-block;
                vertical-align: middle;
                text-align: center;
                padding: 0 6px;
                margin-left: 8px;
                height: $order-tag-height;
                line-height: $order-tag-height;
                border-radius: 2px;
                font-family: $mice-text-family-md;
                font-size: $order-tag-font-size;
                color: #7cd4ab;
                background: #effbf3;
            }
            .order-source {
                color: #e6a23c;
                background: #fdf6ec;
            }
        }
        .buttons {
            span {
                color: #4B8BEE;
                cursor: pointer;
            }
        }
    }
    .middle {
        display: flex;
        flex-wrap: wrap;
        padding: 10px 30px 30px 30px;
        line-height: 28px;
        .card-info {
            display: block;
            width: 33%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
    }
    .source-project {
        height: 26px;
        padding-left: 30px;
        line-height: 26px;
        font-size: 12px;
        color: #ffad42;
        background-color: #fff3e2;
        a {
            text-decoration: underline;
        }
    }
}
</style>

