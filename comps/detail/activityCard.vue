<template>
    <div class="activity-card-list">
        <div :class="['activity-card',actList.length === i + 1 ? 'noneLine' : '',]"
             v-for="(item, i) in actList"
             :key="i"
        >
            <div class="activity-card-wrap">
                <div class="activity-name">
                    <span class="activity-card-title">{{ item.actName }}</span>
                    <span class="status-wait" v-if="JSON.stringify(actStatusEnum) !== '{}'">
                        {{ actStatusEnum[item.actStatus] }}
                    </span>
                </div>
                <div :class="['activity-card-item', isSupplier ? 'hideRivise' : 'grid-three']">
                    <div class="item">
                        <span class="activity-card-item-title">活动时间</span>
                        <span class="activity-card-item-value">
                            {{ `${item.actStartTime || ''}` | formatDate('yyyy-MM-dd HH:mm') }} 至
                            {{ `${item.actEndTime || ''}` | formatDate('yyyy-MM-dd HH:mm') }}
                        </span>
                    </div>
                    <!-- <div class="item">
                        <span class="activity-card-item-title">人数</span>
                        <span class="activity-card-item-value">{{ detail.peopleNum }}人</span>
                    </div> -->
                    <div v-if="!isSupplier && !inReadMode" class="item">
                        <router-link :to="{ name: 'activityDetails', query: { actId: item.actId } }">
                            <span class="activity-card-item-title">修改 ></span>
                        </router-link>
                    </div>
                </div>
            </div>
            <hr v-if="i !== actList.length - 1"/>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import basicService from 'Service/basicService';

@Component({
    name: 'ActivityCard'
})

export default class ActivityCard extends Vue {
    @Prop({ type: Array, default: () => [] })
    actList?: object[];

    @Prop({ type: Boolean })
    inReadMode?: boolean;

    actStatusEnum = {};

    mounted() {
        this.queryEnum();
    }

    get isSupplier() {
        return basicService.isSupplier();
    }

    async queryEnum() {
        // Mice2InvoiceTypeEnum
        // Mice2InvoiceRateEnum
        const data = await this.$store.dispatch(
            'queryEnum',
            JSON.stringify({
                enumTypeList: ['Mice2ActStatusEnum'],
            }),
        );
        const actStatusEnum = {};
        if (data && data.resultCode === '1000') {
            const newData = data.data || {};
            if (newData?.enumListBeanList?.[0]?.enumBeanList) {
                newData.enumListBeanList[0].enumBeanList.forEach((it) => {
                    actStatusEnum[it.code] = it.memo;
                });
            }
        }
        this.actStatusEnum = actStatusEnum;
    }
}
</script>

<style lang="scss" scoped>

.activity-card.noneLine {
    border-bottom: 0 none;
}

.activity-card-list {
    margin: 0 74px;
}

.activity-card {
    padding: 0 15px;

    .activity-card-wrap {
        padding: 20px 0;
    // border-bottom:1 px solid #ededed;
    }

    hr {
        border-top: 1px solid #ededed;
    }

    .activity-name {
        margin-bottom: 14px;
        color: #383838;
    }

    background-color: #fafbfd;

    .activity-card-item {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        flex-basis: auto;

        .item {

            .activity-card-item-title {
                display: inline-block;
                text-align: right;
                font-family: PingFangSC-Regular;
                color: #747474;
                font-size: 14px;
            }

            .activity-card-item-value {
                margin-left: 5px;
                font-family: PingFangSC-Regular;
                color: #333333;
                font-size: 14px;
            }

        }
    }

    .hideRivise {
        justify-content: flex-start;

        .item {
            margin-right: 170px;
        }

    }

    .grid-three {
        justify-content: space-between;
    }

}

.status-wait {
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    padding: 0 10px;
    margin-left: 8px;
    height: 24px;
    line-height: 24px;
    font-family: PingFangSC-Medium;
    font-size: 12px;
    color: #b0b0b0;
    border: 1px solid #b0b0b0;
    border-radius: 12px 12px 12px 0;
    background: #f7f7f7;
}

</style>