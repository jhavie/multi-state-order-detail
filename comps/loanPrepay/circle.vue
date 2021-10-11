<template>
    <div class="time-graph">
        <canvas id="graph-canvas"
                width="156"
                height="100">
        </canvas>
    </div>
</template>

<script>
import { accAdd, accSub, accMul } from 'Utils';

/* eslint-disable */
export default {
    props: {
        percent: {
            type: String,
            required: true
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.drawMain(Number(this.percent || 0), "#fff", "rgba(255, 255, 255, 0.4)", "#fff");
        });
    },
    watch: {
        percent() {
            this.$nextTick(() => {
                this.drawMain(Number(this.percent || 0), "#fff", "rgba(255, 255, 255, 0.4)", "#fff");
            });
        }
    },
    methods: {
        drawMain(percent, forecolor, bgcolor, fillColor) {
            /*
                @drawingElem: 绘制对象
                @percent：绘制圆环百分比, 范围[0, 100]
                @forecolor: 绘制圆环的前景色，颜色代码
                @bgcolor: 绘制圆环的背景色，颜色代码
                将角度转换为弧度：radians = (Math.PI / 180) * degrees
            */
            const drawingElem = document.getElementById("graph-canvas");
            const ctx = drawingElem.getContext('2d');
            const centerX = drawingElem.width / 2; // 圆心所在X坐标
            const centerY = 73; // 圆心所在Y坐标
            const radius = 68; // 半径
            const lineWidth = 8.8; // 圆弧粗细
            const radiansStart = 1; // 圆弧起始位置
            const radiansEnd = 2 - radiansStart + 1; // 圆弧结束位置
            const radiansRegion = accSub(radiansEnd, radiansStart); // 圆弧弧度区间
            const percentRadians = accMul(radiansRegion, percent); // 白色填充百分百
            const fillRadiansEnd = accAdd(radiansStart, percentRadians); // 白色圆弧填充结束位置
            // 绘制背景圆圈
            function backgroundCircle() {
                ctx.save();
                ctx.beginPath();
                ctx.lineCap = "round";
                ctx.lineWidth = lineWidth; // 设置线宽
                ctx.strokeStyle = bgcolor;
                // 起点，终点，半径，开始点，结束点，是否顺/逆时针
                ctx.arc(centerX, centerY, radius, radiansStart * Math.PI, radiansEnd * Math.PI, false);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }

            //绘制运动圆环
            function foregroundCircle(n) {
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = forecolor;
                ctx.lineWidth = lineWidth;
                ctx.lineCap = "round";
                ctx.arc(centerX, centerY, radius, radiansStart * Math.PI, fillRadiansEnd * Math.PI, false);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }

            //执行动画
            (function drawFrame() {
                backgroundCircle();
                foregroundCircle(percent);
            }());
        },
    }
}
</script>

<style lang="scss" scoped>
</style>
