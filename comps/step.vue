<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { Steps } from '../entities/Steps';
import Node from './step/node.vue';
import Stage from './step/stage.vue';

@Component({
    name: 'step',
    components: {
        Node,
        Stage
    }
})
export default class Step extends Vue {
    @Prop({ type: Object, default: () => {} })
    params!: object;

    get stepData() {
        return new Steps(this.params);
    }

    render(h) {
        const children = this.stepData.steps
            .reduce((ans, item, index) => {
                ans[index] = this[`gen${item.type}`](h, item);
                return ans;
            }, []);
        return h('div', { class: 'step' }, children);
    }

    genNode(h, node) {
        return h(
            Node,
            {
                props: { node }
            }
        );
    }

    genStage(h, stage) {
        return h(
            Stage,
            {
                props: { stage }
            }
        );
    }
}
</script>
<style lang="scss" scoped>
.step {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    margin-bottom: 40px;
}
</style>
