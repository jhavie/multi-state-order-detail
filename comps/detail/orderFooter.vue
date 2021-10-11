<template>
    <div>
        <div class="cancel-card">
            <div class="cancel-card-title">{{ activeConfig && activeConfig.title }}</div>
            <div class="cancel-card-status">
                {{ activeObj.applyStatusName }}
            </div>
            <!-- 上传账单提示、双侧不同 -->
            <div class="cancel-card-billHint" v-if="cancelLossNeedBill">
                <template v-if="isStaff && activeConfig.staffBillHint">
                    {{ activeConfig.staffBillHint }}
                </template>
                <template v-else-if="!isStaff">
                    （需供应商到“账单管理-账单上传”中上传资损账单，
                    <el-button @click="goBillEntry" size="mini" type="text"> 去上传 </el-button>）
                </template>
            </div>

            <!-- 账单待调整提示 -->
            <div class="cancel-card-billHint need-adjusted" v-if="cancelLossNeedAdjusted">
                <template v-if="!isStaff">
                    （企业经办人退回了资损账单，
                    <el-button @click="goBillEntry" size="mini" type="text"> 去调整 </el-button>）
                </template>
                <template v-else-if="isStaff">
                    需供应商再次进行取消账单核对
                </template>
            </div>

            <!-- 确认账单提示、双侧不同 -->
            <div class="cancel-card-billHint" v-if="cancelLossNeedCheck">
                <template v-if="!isStaff && activeConfig.supplierBillHint">
                    {{ activeConfig.supplierBillHint }}
                </template>
                <template v-else-if="isStaff">
                    （需企业核对资损账单，
                    <el-button @click="goBillDetail" size="mini" type="text"> 去核对 </el-button>）
                </template>
            </div>

            <el-button v-if="activeObj.requestSysId" class="right" type="text" @click="goEoaDetail">
                审批详情
            </el-button>

            <div v-if="desc" class="cancel-card-desc">{{ desc }}</div>
            <div class="mgl-10" v-for="i in activeItems">
                <div class="cancel-card-label">{{ i.label }}</div>
                <div class="cancel-card-value">{{ getValue(i.key) }}</div>
            </div>
            <template v-if="canEdit">
                <template v-for="(item, index) in activeBtns">
                    <div
                        class="mg10"
                        :class="
                            activeBtns.length === index + 1
                                ? 'mice-button-primary__medium'
                                : 'mice-button-normal__medium'
                        "
                    >
                        <el-button @click="handleAction(item.click)">{{ item.label }}</el-button>
                    </div>
                </template>
            </template>
        </div>
        <!-- 确认撤消取消订单-->
        <confirmDialog
            :visible.sync="confirmDialogVisible"
            :content="activeConfig.confirm"
            @comfirm="onDialogConfirm"
        ></confirmDialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { cancelOrder, changeTravelTime, changeContractTime } from './orderFooterConfig';
import confirmDialog from '@mice/common/components/confirmDialog';
import { JSONParse } from 'Utils';
import Method from 'Views/common/order-detail/mixins/method.vue';
import basicService from 'Service/basicService';

@Component({
    name: 'order-footer',
    components: {
        confirmDialog,
    },
})
export default class OrderFooter extends Mixins(Method) {
    private readonly CANCEL_ORDER = Object.freeze(cancelOrder);
    private readonly CHANGE_TRAVEL_TIME = Object.freeze(changeTravelTime);
    private readonly CHANGE_CONTRACT_TIME = Object.freeze(changeContractTime);

    @Prop({ type: Object, default: () => {} })
    params!: object;

    reason = '';

    confirmDialogVisible = false;

    get cancelApplyBean() {
        return this.params.cancelApplyBean;
    }

    get applyBean() {
        return this.params.applyBean;
    }

    /** 企业侧 */
    get isStaff() {
        return !basicService.isSupplier();
    }

    get canEdit() {
        return this.params.mode === 'edit';
    }
    /** 供应商已发起有损取消，未上传账单 */
    get cancelLossNeedBill() {
        return this.activeObj.lossyFlag === 'supp_wait_bill' && this.canEdit; // 阅读模式不展示
    }

    /** 供应商已发起，账单待调整 */
    get cancelLossNeedAdjusted() {
        return this.activeObj.lossyFlag === 'supp_bill_unadjusted' && this.canEdit; // 阅读模式不展示
    }

    /** 供应商已发起有损取消，已上传账单，待企业确认 */
    get cancelLossNeedCheck() {
        return this.activeObj.lossyFlag === 'corp_confirm_bill' && this.canEdit; // 阅读模式不展示
    }

    /* methods */
    getValue(key: string) {
        const val = this.activeObj[key];
        if (key === 'updateAfterInfo') {
            return JSONParse(val, (i) => (i?.beginTime || '') + ' ~ ' + (i?.endTime || ''));
        }
        return val;
    }

    recallApply() {
        this.confirmDialogVisible = true;
    }

    handleAction(action: string) {
        this[action]();
    }
    // 确认撤消取消订单
    async onDialogConfirm() {
        const params = { applyId: this.activeObj.applyId };
        let res;
        if (this.cancelApplyBean) {
            res = await this.corpRecallApply(params);
        } else {
            res = await this.recallChangeApply(params);
        }
        if (res.resultCode !== '1000') return;
        this.$emit('refresh');
    }

    // 供应商同意无资损取消
    async agreeCancel() {
        this.$miceConfirm('是否进行无资损取消？', '', {}, async () => {
            const params = { applyId: this.cancelApplyBean?.applyId };
            const res = await this.suppResApply(params);
            if (res.resultCode !== '1000') return;
            this.$emit('refresh');
        });
    }

    /** 跳转账单录入 */
    goBillEntry() {
        // 跳转账单详情，填写资损项
        this.$router.push({
            name: 'supplier_bill_entry',
            query: { orderId: this.orderId, operateType: 'VIEW', billMark: 'lossy_bill' },
        });
    }

    /** 跳转账单核对 */
    goBillDetail() {
        const reqName = this.params.reqName || '';
        this.$router.push({
            name: 'billManager_bill_detail',
            query: {
                billId: this.activeObj.billId,
                operateType: 'CONFIRM',
                fromPage: 'corpOrderDetail',
                reqName,
            },
        });
    }

    // 供应商同意资损取消
    async agreeCancelWithLoss() {
        this.$miceConfirm('是否进行资损取消？', '', {}, () => {
            // 跳转账单详情，填写资损项
            this.$router.push({
                name: 'supplier_bill_entry',
                query: { orderId: this.orderId, operateType: 'UPLOAD', billMark: 'lossy_bill' },
            });
        });
    }

    async agreeChange() {
        this.$miceConfirm('确认要同意变更出行时间吗？', '', {}, () => this.suppOrder('CONFIRM'));
    }

    async rejectChange() {
        this.$prompt('', '确认要拒绝变更出行时间吗？', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPlaceholder: '请输入拒绝变更的原因',
            inputValidator: (val) => val.trim().length <= 250,
            inputErrorMessage: '拒绝变更原因不能超过250个字符',
            type: 'info',
        }).then(({ value }) => {
            this.suppOrder('REJECT', value);
        });
        // this.$miceConfirm('确认要拒绝变更出行时间吗？', '', {}, () => this.suppOrder('REJECT'));
        // await this.suppOrder('REJECT');
    }

    async suppOrder(val: string, reason: string) {
        const params: any = {
            applyId: this.applyBean?.applyId,
            opType: val,
        };
        if (reason) params.rejectReason = reason;
        const res = await this.suppOrderResApply(params);
        if (res.resultCode !== '1000') return;
        this.$emit('refresh');
    }

    // 发起签报
    approval() {
        const bpFlag = this.isGoods;
        const data = {
            isGoods: bpFlag,
            applyId: this.activeObj.applyId,
            reqId: this.reqId || this.params.reqId,
            orderId: this.orderId || this.params.orderId,
        };
        if (bpFlag) {
            data.isGoods = bpFlag;
            data.reqName = this.params.reqName;
        }
        //待验证。。。。。。。。。todo
        if (this.isFBid) {
            data.isGoods = true;
            data.reqName = this.params.reqName;
            data.reqId = this.params.followReqId;
        }
        this.$router.push({
            name: 'EOA',
            query: {
                isEdit: 'true',
                [this.approvalType]: JSON.stringify(data),
            },
        });
    }

    goEoaDetail() {
        this.$router.push({
            path: '/demandManger/publish/EOA',
            query: {
                requestSysId: this.activeObj.requestSysId,
            },
        });
    }

    /** 再次下单 */
    reOrder() {
        const orderType = this.params.orderType;
        if (orderType === 'MULTIPLE') {
            // 分批下单，跳转至项目详情页
            this.$router.push({
                name: 'demandMangerDetail',
                query: {
                    reqId: this.reqId || this.params.reqId,
                },
            });
        } else if (orderType === 'SINGLE') {
            // 一次性下单，跳转至创建询比项目
            this.$router.push({
                name: 'demands_publish',
            });
        } else {
            // 标品下单，跳转至mice商城标品列表
            this.$router.push({
                name: 'goodsManager',
            });
        }
    }

    /* computed */
    get activeItems() {
        let res = this.activeConfig.showItems.filter((item) => item.status.includes(this.activeObj.applyStatus));
        if (res.length === 0) res = this.activeConfig.showItems.filter((item) => item.status.includes('DEFAULT'));
        return res;
    }

    get activeBtns() {
        const orderStatus = this.params.orderStatus;
        let buttons = this.activeConfig.buttons;
        if (this.isFBid) {
            buttons = buttons.filter((item) => item.click !== 'reOrder');
        }
        return buttons
            .filter((item) => !item.orderStatus || item.orderStatus.includes(orderStatus)) // 按订单状态过滤
            .filter((item) => item.role === this.roleCode && item.status.includes(this.activeObj.applyStatus))
            .filter((item) => !item.lossyFlags || item.lossyFlags.includes(this.activeObj.lossyFlag)); // 过滤掉资损按钮
    }

    get activeObj() {
        let obj;
        if (this.cancelApplyBean) obj = this.cancelApplyBean;
        else if (this.applyBean?.bizType === 'CHANGE_TRAVEL_TIME') obj = this.applyBean;
        else if (this.applyBean?.bizType === 'CHANGE_CONTRACT_TIME') obj = this.applyBean;
        return obj;
    }

    get activeConfig() {
        let config;
        if (this.cancelApplyBean) {
            config = this.CANCEL_ORDER;
        } else {
            config = this[this.applyBean?.bizType];
        }
        return config;
    }

    get desc() {
        const applyStatus = this.activeObj.applyStatus;
        const filtered = this.activeConfig.desc.filter(
            (item) => item.role === this.roleCode && item.status === applyStatus,
        );
        return filtered[0] && filtered[0].value;
    }

    get approvalType() {
        let type;
        if (this.cancelApplyBean) {
            type = 'CANCEL_ORDER';
        } else {
            type = this.applyBean?.bizType;
        }
        return type + '_APPLY';
    }
}
</script>

<style lang="scss" scoped>
.cancel-card {
    position: relative;
    line-height: 14px;
    width: 100%;
    padding: 10px;
    background: #fafbfd;
    border-radius: 4px;
    &-title {
        display: inline-block;
        font-family: PingFangSC-Medium;
        margin: 0 20px 10px 20px;
        font-size: 16px;
        color: #000000;
    }
    &-status {
        display: inline-block;
        font-family: PingFangSC-Medium;
        font-size: 12px;
        color: #f5643d;
    }
    &-desc {
        margin: 7px 20px;
        font-size: 12px;
        color: #a0a1a0;
    }
    &-billHint {
        display: inline-block;
        font-size: 12px;
    }
    .right {
        position: absolute;
        right: 30px;
    }
    &-label {
        padding: 10px;
        display: inline-block;
        font-size: 14px;
        color: #747474;
    }
    &-value {
        padding: 10px;
        display: inline-block;
        font-size: 14px;
        color: #333333;
    }
    .need-adjusted {
        padding-left: 10px;
    }
}
/deep/ .el-button--text {
    padding: 0;
}
</style>
