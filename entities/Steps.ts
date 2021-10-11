class Steps {
    constructor(source) {
        Object.assign(this, source);
    }

    /** 节点列表 */
    private orderNodeList;
    /** 阶段列表 */
    private orderStageList;
    /** 当前所在节点 */
    private orderNode;
    /** 当前所在阶段 */
    private orderStage;

    get steps() {
        const { orderNodeList, orderStageList, orderNode, orderStage } = this;
        const renderList = Array.from({ length: orderNodeList?.length + orderStageList?.length });
        let flag = true;
        return renderList.reduce((ans: Array<object>, item, index: number) => {
            if (index % 2 === 0) {
                const node = orderNodeList[index / 2];
                if (node.code === orderNode) flag = false;
                ans[index] = {
                    ...node,
                    type: 'Node',
                    step: (index / 2) + 1,
                    active: node.code === orderNode || flag
                };
            } else {
                const stage = orderStageList[(index - 1) / 2];
                if (stage.code === orderStage) flag = false;
                ans[index] = {
                    ...stage,
                    type: 'Stage',
                    active: stage.code === orderStage || flag
                };
            }
            return ans;
        }, []);
    }
}


export {
    Steps
};
