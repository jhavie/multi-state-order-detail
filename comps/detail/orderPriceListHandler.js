import { accDiv } from 'Utils';

// isFilter是否开启过滤，过滤数量为零的数据
function orderPriceListHandle (offerDetailedListBean = {}, isFilter = false) {
    /**
     * "invoiceRate": "111",
        "totalAmount": 100000,
        "offerServiceBeanList":
    */
    const mainObj = offerDetailedListBean.offerSumBeanList || [];    
    const newArr = [];
    const topData = { preAmount: offerDetailedListBean.preAmount || 0, totalAmount: offerDetailedListBean.totalAmount || 0, peopleNum: offerDetailedListBean.peopleNum || 0, totalAmountExclusiveTax: offerDetailedListBean.totalAmountExclusiveTax || 0, totalEvalAmout: offerDetailedListBean.totalEvalAmout || 0 };
    let num = 0;
    mainObj.forEach((i, idx) => {
        /**  
         * {
            "itemId": "",
            "itemName": "头等舱",
            "unit": "位",
            "itemQty": "1",
            "itemDesc": "",
            "unitPrice": "100",
            "totalPrice": "200"
        }
        */
        i.offerServiceBeanList.forEach((e, index) => {
            if (e.offerServiceItemBeanList) {
                const newA = e.offerServiceItemBeanList.filter(a => isFilter || Number(a.itemQty)).map((ha, ind, arr) => {
                    if (typeof ha.oriItemQty !== 'number') ha.oriItemQty = ha.itemQty;
                    if (typeof ha.oriFrequency !== 'number') ha.oriFrequency = ha.frequency;
                    num++;
                    // const uiUnitPrice = Number(ha.unitPrice) / 100;
                    const uiUnitPrice = accDiv(Number(ha.unitPrice), 100);
                    if (ind == 0) {
                        return {
                            ...ha,
                            index: num,
                            rowSpan: arr.length,
                            uiUnitPrice,
                        };
                    } 
                    return {
                        ...ha,
                        index: num,
                        uiUnitPrice,
                    };
                });
                newArr.push({
                    serviceSubType: e.serviceSubType,
                    serviceSubTypeName: e.serviceSubTypeName,
                    offerServiceItemBeanList: newA
                });
            }
            if (index === i.offerServiceBeanList.length - 1) {
                newArr.push({
                    type: 'total',
                    invoiceRate: i.invoiceRate,
                    totalAmount: i.totalAmount,
                    invoiceType: i.invoiceType,
                    totalAmountExclusiveTax: i.totalAmountExclusiveTax,
                    index: num,
                });
            }
        });
    });
    // console.log(9999999999, newArr, topData);
    return { newArr, topData };
}

export default orderPriceListHandle;