<!--
 * @Author: your name
 * @Date: 2021-04-07 00:07:25
 * @LastEditTime: 2021-04-08 20:10:37
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /plugins-mice2-ts/src/pages/views/common/orderDetail/components/dataDisplay/fileListItem.vue
-->
<template>
    <div class="file-list">
        <div v-if="fileList.length === 0" class="grey">无</div>
        <template v-else v-for="(item, i) in fileList">
            <div v-if="!!item" :key="i"
                class="underline"
                @click="downLoad(item)">
                {{ item.fileName }}
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
    name: 'FileList',
})

export default class FileList extends Vue {
    @Prop({ type: Array, required: true, default: () => [] })
    fileList?: object[];

    downLoad(item) {
        if (item.fileUrl.includes('http')) {
            window.open(item.fileUrl, '_self');
        } else {
            this.$store.dispatch('downLoadFileByFileIdAndName', {
                fileId: item.fileId,
                fileName: item.fileName,
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.file-list {
    width: auto;
}
.underline {
    width: fit-content;
    width: -moz-fit-content;
    text-decoration: underline;
    cursor: pointer;
}
.grey {
    color: #999;
}
</style>