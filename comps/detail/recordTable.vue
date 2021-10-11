<template>
    <section>
        <div class="record-title">变更记录</div>
        <table border="1" ref="head" class="head-title">
            <tr class="category-title">
                <td v-for="col in tableColumn" :width="col.width"> {{ col.name }} </td>
            </tr>
            <template v-for="item in tableData">
                <tr>
                    <td v-for="col in tableColumn">{{ item[col.prop] }}</td>
                </tr>
            </template>
        </table>
    </section>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component({
    name: 'record-table',
})
export default class RecordTable extends Vue {
    @Prop({ type: Array, default: () => [] })
    tableColumn!: object[];

    @Prop({ type: Array, default: () => [] })
    tableData!: object[];
}
</script>

<style lang="scss" scoped>
.record-title {
    margin: 20px 0;
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #000000;
    line-height: 14px;
}

.head-title {
    width: 100%;

    .category-title {
        height: 50px;
        line-height: 50px;
        background-color: #f8f8f8;

        td {
            font-family: PingFangSC-Semibold;
            font-size: 14px;
            color: #383838;
        }
    }

    td {
        height: 50px;
        line-height: 18px;
        // border: 1px solid #ededed;
        min-height: 36px;
        text-align: left;
        font-size: 14px;
        vertical-align: middle;
        padding: 0 15px;
    }

    tr:nth-child(2n+1){
        background-color: #f8f8f8;
    }
}
</style>
