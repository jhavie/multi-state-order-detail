<template>
    <div class="sevice-title">
        <el-form ref="helpInfo" :model="additionBean" :rules="rules" label-width="auto">
            <supp-invoice-ctrl
                ref="suppInvoiceCtrl"
                form-prop-name="suppInvoiceCtrl"
                :outSourceSys="outSourceSys"
                :invoiceTypeEnum="taxDataList.Mice2InvoiceTypeEnum"
                :invoiceRateEnum="taxDataList.Mice2InvoiceRateEnum"
                :taxRate="additionBean.taxRate || {}"
                :editable="editable"
            >
            </supp-invoice-ctrl>
        </el-form>
    </div>
</template>

<script>
import suppInvoiceCtrl from 'Components/dynamicForm/invoiceCtrl/suppInvoiceCtrl';

export default {
    components: { suppInvoiceCtrl },
    props: {
        outSourceSys: String, // 订单来源
        additionBeanData: {
            type: Object,
            default: () => {}
        },
        editable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            rules: {
                suppInvoiceCtrl: [
                    // { required: true, message: '发票信息必须补充完整', trigger: ['change', 'blur'] }
                ]
            },
            taxDataList: {},
            additionBean: {}
        };
    },
    created() {
        this.queryEnum();
        // if (this.additionBean.acceptPrepay === 'N') {
        //     this.additionBean.prepayRatio = 0;
        // }
    },
    watch: {
        additionBeanData: {
            immediate: true,
            deep: true,
            handler(val) {
                if (val) {
                    this.initAdditionBean();
                }
            }
        }
    },
    methods: {
        initAdditionBean() {
            this.additionBean = Object.assign({}, this.additionBeanData);
        },
        async queryEnum() {
            // Mice2InvoiceTypeEnum
            // Mice2InvoiceRateEnum
            const data = await this.$store.dispatch(
                'queryEnum',
                JSON.stringify({
                    enumTypeList: ['Mice2InvoiceTypeEnum', 'Mice2InvoiceRateEnum']
                })
            );
            if (data && data.resultCode == '1000') {
                const newData = data.data || {};
                const enumListBeanList = newData.enumListBeanList;
                enumListBeanList.forEach((item) => {
                    this.$set(this.taxDataList, item.enumType, item.enumBeanList);
                });
            }
        },
        getFormData() {
            const taxRate = this.$refs.suppInvoiceCtrl.getFormData();
            this.$set(this.additionBean, 'taxRate', taxRate);
            return this.additionBean;
        },
        // validForm() {
        //     const flag = this.$refs.suppInvoiceCtrl.validate(true);
        //     // this.suppInvoiceFormUpdate(flag);
        //     return flag;
        // },
        // suppInvoiceFormUpdate(flag) {
        //     this.$set(this.additionBean, 'suppInvoiceCtrl', flag ? 'webHasValue' : null);
        //     this.$refs.helpInfo.validateField('suppInvoiceCtrl');
        // }
    }
};
</script>

<style lang="scss" scoped>
.sevice-title {
    .taxRateList {
        width: 50%;
        float: left;
        display: flex;
        .el-form-item__content {
            position: inherit !important;
        }
        margin-bottom: 14px;
    }
    .prepayRatioClass {
        position: absolute;
    }
    .clear {
        clear: both;
    }
    letter-spacing: 0;
    text-align: left;
    .type {
        padding-top: 12px;
        width: 70px;
        font-family: PingFangSC-Regular;
        font-size: 16px;
        color: #333333;
        letter-spacing: 0;
        line-height: 14px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    .desc {
        flex: 1;
        font-size: 14px;
        color: #747474;
        letter-spacing: 0;
        line-height: 14px;
        .el-form-item {
            margin-bottom: 8px;
        }
    }
}
</style>
