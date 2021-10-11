<template>
    <!-- 取消订单输入原因框 -->
    <div class="dialog-test">
        <el-dialog :visible.sync="syncedCancelOrderDlg" width="30%">
            <div>
                <div class="confirm-text required">是否确认取消订单？</div>
                <el-input type="textarea"
                          :rows="4"
                          placeholder="请输入取消订单原因"
                          v-model="reason">
                </el-input>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="close">取消</el-button>
                <el-button type="primary" @click="confirm(reason)">
                    确 定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { Vue, Component, PropSync, Prop } from 'vue-property-decorator';

@Component({
    name: 'cancel-order-dialog',
})
export default class CancelOrderDialog extends Vue {
    @PropSync('cancelOrderDlg', { type: Boolean, default: false })
    syncedCancelOrderDlg!: boolean;

    @Prop({ type: Function })
    readonly confirm!: (reason) => void;

    /* 取消原因 */
    reason = '';

    close() {
        this.syncedCancelOrderDlg = false;
        this.reason = '';
    }
}
</script>

<style scoped>
    .confirm-text {
        margin-bottom: 10px;
        font-family: PingFangSC-Regular;
        font-size: 18px;
        color: #333333;
    }
</style>
