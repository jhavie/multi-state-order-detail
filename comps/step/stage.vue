<template>
    <div :class="['stage', stage.active ? 'active' : '']">
        <div class="desc">{{ stage.memo }}</div>
        <div class="line"></div>
    </div>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component({
    name: 'step-stage',
})
export default class StepStage extends Vue {
    @Prop({ type: Object })
    stage!: object;
}
</script>
<style lang="scss" scoped>
.stage {
    display: inline-block;
    text-align: center;
    position: relative;
    .desc {
        position: absolute;
        top: -20px;
        left: 0;
        right: 0;
        font-size: 15px;
        font-weight: bold;
        color: #b4b3b3;
    }
    .line {
        width: 230px;
        height: 2px;
        background-color: #ededed;
    }
}
.active {
    .line {
        background-color: #4b8bee;
    }
    .desc {
        color: #000000;
    }
}
</style>
