<template>
    <div :class="['circle', node.active ? 'active' : '']">
        <span class="value">{{ node.step }}</span>
        <span class="label">{{ node.memo }}</span>
    </div>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component({
    name: 'step-node',
})
export default class StepNode extends Vue {
    @Prop({ type: Object })
    node!: object;
}
</script>
<style lang="scss" scoped>
.circle {
    position: relative;
    display: inline-flex;
    width: 30px;
    height: 30px;
    border-radius: 30px;
    justify-content: center;
    align-items: center;
    background-color: #cecece;
    border-color: #cecece;
    .value {
        color: #fff;
    }
    .label {
        position: absolute;
        top: 40px;
        text-align: center;
        color: #747474;
        font-size: 14px;
        width: 70px;
    }
}
.active {
    background-color: #4b8bee;
    border-color: #4b8bee;
}
</style>
