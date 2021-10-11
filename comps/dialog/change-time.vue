<template>
    <!-- 变更出行输入原因框 -->
    <div class="dialog-test">
        <el-dialog :visible.sync="syncedChangeTimeDlg" width="510px">
            <div slot="title">
                <p class="title">出行时间变更</p>
                <p v-if="tips" class="tips">变更时间范围为：{{ tips }}，如未有合适时间，可先变更合同时间！</p>
            </div>
            <div>
                <el-form ref="changeTime" :model="changeTimeForm" label-width="68px">
                    <el-form-item label="变更时间">
                        <div class="mice-date-lg">
                            <el-date-picker
                                type="daterange"
                                @input="onInput"
                                v-model="changeTimeForm.date"
                                placeholder="选择日期"
                                :picker-options="pickerOptions"
                            >
                            </el-date-picker>
                        </div>
                    </el-form-item>
                    <el-form-item label="原因" label-width="68px">
                        <el-input
                            type="textarea"
                            :rows="4"
                            maxlength="250"
                            show-word-limit
                            placeholder="请输入出行时间变更原因"
                            v-model="changeTimeForm.changeReason"
                            @input="onInput"
                        >
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="close">取 消</el-button>
                <el-button type="primary" @click="confirm" :disabled="canClick">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { Vue, Component, PropSync, Prop, Model } from 'vue-property-decorator';

@Component({
    name: 'change-time-dialog'
})
export default class ChangeTimeDialog extends Vue {
    @PropSync('changeTimeDlg', { type: Boolean, default: false })
    syncedChangeTimeDlg!: boolean;

    @Prop({ type: Function })
    readonly confirm!: () => void;

    @Prop({ type: String })
    readonly beginTime!: () => '';

    @Prop({ type: String })
    readonly endTime!: () => '';

    @Model('input', { type: Object })
    readonly changeTimeForm!: object;

    onInput() {
        this.$emit('input', this.changeTimeForm);
    }

    close() {
        this.syncedChangeTimeDlg = false;
    }

    get canClick() {
        return !(this.changeTimeForm?.date && this.changeTimeForm?.date.length === 2);
    }

    get tips() {
        let tip = '';
        if (this.endTime) {
            tip = `${this.beginTime || this.dayJS().format('YYYY-MM-DD')}至${this.endTime}`;
        }
        return tip;
    }
    get pickerOptions() {
        const dayJS = this.$dayJS;
        const beginTime = this.beginTime;
        const endTime = this.endTime;
        let minTime = dayJS();
        if (beginTime && minTime.isBefore(dayJS(beginTime), 'day')) {
            minTime = dayJS(beginTime);
        }
        let maxTime = '';
        if (endTime) {
            if (minTime.isBefore(dayJS(endTime), 'day')) {
                maxTime = dayJS(endTime);
            } else {
                maxTime = minTime;
            }
        }

        return {
            disabledDate(time) {
                const target = dayJS(time);
                let flag = false;
                if (!maxTime) {
                    flag = target.isBefore(minTime, 'day');
                } else {
                    // eslint-disable-next-line no-lonely-if
                    if (maxTime.isAfter(minTime, 'day')) {
                        flag = target.isAfter(maxTime, 'day') || target.isBefore(minTime, 'day');
                    } else if (maxTime.isSame(dayJS(endTime), 'day')) {
                        flag = !target.isSame(maxTime, 'day');
                    } else {
                        flag = true;
                    }
                }
                return flag;
            }
        };
    }
}
</script>

<style lang="scss" scoped >
.dialog-test {
    .title {
        line-height: 24px;
        font-size: 18px;
        color: #383838;
    }
    .tips {
        font-size: 12px;
        color: gray;
    }
}
</style>
