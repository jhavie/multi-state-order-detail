<template>
    <div class="state-card">
        <div>
            <span class="label">当前订单状态</span>
            <span class="value"> {{ static[stateData.status].status }}</span>
            <span v-if="stateData.applyTypeName" class="value"> | {{ stateData.applyTypeName }}</span>
            <span v-if="spDesc" class="desc">{{
                static[stateData.status][`${isSupplier ? 'supp' : 'staff'}desc`]
            }}</span>
            <span v-else class="desc"> {{ static[stateData.status].desc }}</span>
        </div>
        <div class="actions" v-if="canEdit && stateData.action.length > 0">
            <template v-for="(item, index) in stateData.action">
                <div
                    :class="
                        stateData.action.length === index + 1
                            ? 'mice-button-primary__medium'
                            : 'mice-button-normal__medium'
                    "
                >
                    <el-button @click="confirmFun(item.click, item.tip)">
                        {{ item.label }}
                    </el-button>
                </div>
            </template>
        </div>
        <div>
            <el-tabs v-if="isShowCancelDetail || isShowChangeDetail" v-model="activeTab" @tab-click="() => {}">
                <template v-for="item in tabPaneConfig">
                    <el-tab-pane v-if="item.show" :label="item.label" :name="item.name">
                        <order-footer v-on="$listeners" :params="item.data()" />
                    </el-tab-pane>
                </template>
            </el-tabs>
            <record-table v-if="isShowRecord" :tableColumn="RecordColumn" :tableData="tableDataList" />
        </div>
        <cancel-order-dialog :cancelOrderDlg.sync="confirmVisible" :confirm="cancelReason" />
        <change-time-dialog
            :beginTime="beginTime"
            :endTime="endTime"
            v-model="changeTimeForm"
            :changeTimeDlg.sync="changeTimeDlg"
            :confirm="changeTimeApply"
        />

        <!-- 一次性下单 -->
        <el-dialog :visible.sync="syncedCancelOrderDlgSing" width="30%">
            <div>
                <div class="confirm-text required">
                    是否确认取消？取消订单后，项目也会被取消。如有产生资损账单，可正常进行报销
                </div>
                <el-input type="textarea" :rows="4" placeholder="请输入取消订单原因" v-model="reason"> </el-input>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelCbSing">取消</el-button>
                <el-button type="primary" @click="cancelReasonSing(reason)">
                    确 定
                </el-button>
            </span>
        </el-dialog>

        <!-- 多次下单 -->
        <el-dialog :visible.sync="syncedCancelOrderDlgMul" width="30%">
            <div>
                <div class="confirm-text required">
                    该项目下已经没有其他订单了，是否取消订单后同步取消项目？取消后如果产生资损账单，可正常进行报销
                </div>
                <el-input type="textarea" :rows="4" placeholder="请输入取消订单原因" v-model="reason"> </el-input>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelCbMul">只取消订单</el-button>
                <el-button type="primary" @click="cancelReasonMul(reason)">
                    确 定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Mixins, Inject } from 'vue-property-decorator';
import { CommonStates, FollowStates, GoodsStates } from '../entities/States';
import CancelOrderDialog from '../comps/dialog/cancel-order.vue';
import ChangeTimeDialog from '../comps/dialog/change-time.vue';
import Method from '../mixins/method.vue';
import OrderFooter from '../comps/detail/orderFooter.vue';
import RecordTable from '../comps/detail/recordTable.vue';
import dayjs from 'dayjs';
import _isEmpty from 'lodash/isEmpty';
import { JSONParse, deepClone } from 'Utils';
import { OrderType } from 'Enums/projects/states';

@Component({
    name: 'state',
    components: {
        OrderFooter,
        RecordTable,
        CancelOrderDialog,
        ChangeTimeDialog,
    },
})
export default class State extends Mixins(Method) {
    @Prop({ type: Object, default: () => {} })
    params!: object;

    @Prop({ type: Object, default: () => {} })
    callback!: object;

    @Inject('pageData')
    getPageData;

    private activeTab: string = '';
    private confirmVisible = false;
    private changeTimeDlg = false;
    private beginTime = '';
    private endTime = '';
    private changeTimeForm = {
        date: [this.params?.subjectInfo?.actBeginTime, this.params?.subjectInfo?.actEndTime],
        changeReason: '',
    };
    isCancelProject = 'N'; // 是否需要取消项目
    syncedCancelOrderDlgSing = false;
    syncedCancelOrderDlgMul = false;
    reason = '';

    mounted() {
        const pageData = this.getPageData();
        this.beginTime = pageData?.card?.beginTime;
        this.endTime = pageData?.card?.endTime;
    }

    get canEdit() {
        return this.params.mode === 'edit';
    }

    get stateData() {
        let _stateData;
        if (this.isCommon) {
            _stateData = new CommonStates(this.params);
        } else if (this.isFBid) {
            _stateData = new FollowStates(this.params);
        } else if (this.isGoods) {
            _stateData = new GoodsStates(this.params);
        }
        return _stateData;
    }

    get common() {
        return this.static.common;
    }

    get tabPaneConfig() {
        return [
            {
                show: this.isShowCancelDetail,
                label: '取消订单申请记录',
                name: 'cancelOrder',
                data: () => {
                    const _stateData = deepClone(this.stateData);
                    delete _stateData.applyBean;
                    return _stateData;
                },
            },
            {
                show: this.isShowChangeDetail,
                label: '出行时间变更记录',
                name: 'changeTime',
                data: () => {
                    const _stateData = deepClone(this.stateData);
                    delete _stateData.cancelApplyBean;
                    return _stateData;
                },
            },
        ];
    }

    /** 是否为跟标 */
    get isFBid() {
        return this.params.orderBizType === 'FOLLOW';
    }
    /** 是否为标品 */
    get isBP() {
        return this.params.orderBizType === 'BP';
    }
    /** 是否为询比 */
    get isNOTBP() {
        return this.params.orderBizType === 'NOT_BP';
    }

    /** 企业侧供应商不同角色 这些状态的提示文案不同*/
    get spDesc() {
        return ['done'].includes(this.stateData.status);
    }

    async changeTimeApply() {
        const obj = {
            beginTime: dayjs(this.changeTimeForm.date[0]).format('YYYY-MM-DD'),
            endTime: dayjs(this.changeTimeForm.date[1]).format('YYYY-MM-DD'),
        };
        if (
            this.params?.subjectInfo?.actBeginTime === obj.beginTime &&
            this.params?.subjectInfo?.actEndTime === obj.endTime
        ) {
            this.$message.warning('活动时间并未更改，无需申请！');
            return;
        }

        const params = {
            bizId: this.stateData.orderId,
            bizType: 'CHANGE_TRAVEL_TIME',
            cancelReason: this.changeTimeForm.changeReason,
            updateAfterInfo: JSON.stringify(obj),
        };
        const res = await this.createApply(params);
        if (res?.resultCode !== '1000') return;
        this.changeTimeDlg = false;
        this.$emit('refresh');
    }

    async cancelRemind() {
        if (this.isNOTBP) {
            // 一次性下单默认是Y
            if (this.params.orderType === OrderType.SINGLE) {
                this.singLeCancelRemind();

                // 分批下单需要请求.
            } else if (this.params.orderType === OrderType.MULTIPLE) {
                await this.multipleCancelRemind();
            } else {
                console.log('error', 'cancelRemind');
            }
        } else {
            this.confirmVisible = true;
        }
    }

    // 一次性下单的提醒
    singLeCancelRemind() {
        this.isCancelProject = 'Y';
        this.syncedCancelOrderDlgSing = true;
    }

    // 多次下单的提醒
    async multipleCancelRemind() {
        const res = await this.cancelReqOrderRemind({ orderId: this.orderId });
        if (res && res.resultCode === '1000') {
            this.isCancelProject = res.data.isRemind;
        }

        if (this.isCancelProject === 'Y') {
            this.syncedCancelOrderDlgMul = true;
        } else {
            this.confirmVisible = true;
        }
    }
    cancelCbSing() {
        this.close();
    }
    cancelReasonSing(reason) {
        this.cancelReason(reason);
    }
    cancelCbMul() {
        this.isCancelProject = 'N';
        this.cancelReason(this.reason);
    }
    cancelReasonMul() {
        this.isCancelProject = 'Y';
        this.cancelReason(this.reason);
    }
    close() {
        this.syncedCancelOrderDlgSing = false;
        this.syncedCancelOrderDlgMul = false;
        this.confirmVisible = false;
        this.reason = '';
    }

    async confirmFun(name, tip) {
        if (name === 'cancelReason') {
            if (this.params.billAmt !== null) {
                this.$message.error('供应商侧在上传账单中，无法取消订单，如有疑问，请联系供应商。');
                return;
            }
            // 是否同步取消项目的提醒.
            await this.cancelRemind();
        } else if (name === 'reject') {
            this.$prompt('', '退回原因', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPlaceholder: '请输入退回订单的原因',
            }).then((object) => {
                const o = object as any;
                this.reject(o.value);
            });
        } else if (!tip) {
            this[name]();
        } else {
            this.$miceConfirm(tip, '', {
                confirmButtonText: this.common.confirm,
                cancelButtonText: this.common.cancel,
                dangerouslyUseHTMLString: true,
                closeOnClickModal: true,
                closeOnPressEscape: true,
                callback: (action) => {
                    if (action === 'confirm') {
                        this[name]();
                    }
                },
            });
        }
    }

    get isShowCancelDetail() {
        const flag = !_isEmpty(this.stateData.cancelApplyBean);
        if (flag) this.activeTab = 'cancelOrder';
        return flag;
    }

    /* 是否展示变更详情 */
    get isShowChangeDetail() {
        const flag = !_isEmpty(this.stateData.applyBean);
        if (flag && !this.isShowCancelDetail) this.activeTab = 'changeTime';
        return flag;
    }

    /* 是否展示记录表 */
    get isShowRecord() {
        return !this.isSupplier && this.tableDataList.length > 0;
    }

    get tableDataList() {
        return this.stateData.applyBeanList.map((item) => {
            return {
                applyTime: item.createTime,
                beforeChange: JSONParse(item.updateBeforeInfo, (v) => `${v.beginTime} ~ ${v.endTime}`),
                afterChange: JSONParse(item.updateAfterInfo, (v) => `${v.beginTime} ~ ${v.endTime}`),
                changeReason: item.cancelReason,
                finTime: item.finTime,
            };
        });
    }
}
</script>

<style lang="scss" scoped>
.state-card {
    margin: 20px 0;
    background: #fff;
    box-shadow: 0 2px 10px 0 rgba(206, 206, 206, 0.5);
    padding: 10px 20px;
    line-height: 36px;
    .label {
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
    }
    .value {
        margin-left: 10px;
        display: inline-block;
        font-size: 24px;
        color: #f5643d;
    }
    .desc {
        display: block;
        font-size: 12px;
        color: #a0a1a0;
    }
    .actions {
        margin-top: 10px;
        div {
            margin: 0 5px;
        }
    }
}
</style>
