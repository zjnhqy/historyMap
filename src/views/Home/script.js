export default {
    name: "HomeView",
    data() {
        return {
            connections: [
                {
                    start: "btn1", end: "btn2",
                    // stroke: "#FF5733",         // 自定义颜色
                    // strokeWidth: 3,            // 自定义线宽
                    // strokeDasharray: "5,5",
                    isRightAngle: true,
                },
                { start: "btn3", end: "btn5" },
                { start: "btn2", end: "btn5", isRightAngle: true },
                { start: "btn5", end: "btn6" },
                { start: "btn5", end: "btn7" },
                { start: "btn6", end: "btn8" },
                { start: "btn7", end: "btn8" },
                { start: "btn8", end: "btn10", isRightAngle: true },
                { start: "btn10", end: "btn14" },
                { start: "btn14", end: "btn15", isRightAngle: false },
                // { start: "btn14", end: "btn15" },
                { start: "btn17", end: "btn18", isRightAngle: false },
                { start: "btn18", end: "btn19", isRightAngle: false },
                { start: "btn19", end: "btn14" },
                { start: "btn4", end: "btn9", isRightAngle: false },
                { start: "btn9", end: "btn11", isRightAngle: true },
                { start: "btn11", end: "btn13", isRightAngle: false },
                // { start: "btn14", end: "btn15" },
            ],
            lines: [],
            showButtons: true, // 控制是否显示按钮
        };
    },
    mounted() {
        this.updateLineCoordinates();
    window.addEventListener("resize", this.updateLineCoordinates);

    this.$nextTick(() => {
        const container = this.$refs.buttonContainer;
        if (!container) {
            console.error("buttonContainer not found in Vue component.");
            return;
        }

        const buttons = container.getElementsByTagName("button");

        function checkButtonWrapping() {
            if (buttons.length === 0) return;

            let firstTop = buttons[0].offsetTop; // 获取第一个按钮的顶部位置

            // 遍历每个按钮，检查是否换行
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i];
                // 如果该按钮的位置不与第一个按钮的顶部位置相同，说明它换行了
                if (button.offsetTop !== firstTop) {
                    button.style.display = "none";  // 隐藏按钮
                } else {
                    button.style.display = "inline-block";  // 显示按钮
                }
            }
        }

        // 监听窗口大小变化
        window.addEventListener("resize", checkButtonWrapping);

        // 初始检查
        checkButtonWrapping();
    });
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.updateLineCoordinates);
    },
    methods: {
        goToSchoolDetails(id) {
            this.$router.push({ name: "SchoolDetails", params: { id } });
        },
        getLinePoints(startEl, endEl, containerRect, isRightAngle) {
            if (isRightAngle) {
                return this.getRightAnglePoints(startEl, endEl, containerRect);
            } else {
                return this.getStraightLinePoints(startEl, endEl, containerRect);
            }
        },
        getRightAnglePoints(startEl, endEl, containerRect) {
            const rect1 = startEl.getBoundingClientRect();
            const rect2 = endEl.getBoundingClientRect();

            const center1 = {
                x: rect1.left - containerRect.left + rect1.width / 2,
                y: rect1.top - containerRect.top + rect1.height,
            };

            const endPoint = {
                x: rect2.left - containerRect.left + rect2.width / 2,
                y: rect2.top - containerRect.top,
            };

            const midPoint1 = { x: center1.x, y: center1.y + 10 }; // 垂直下降 20px
            const midPoint2 = { x: endPoint.x, y: midPoint1.y }; // 水平移动

            return `${center1.x},${center1.y} ${midPoint1.x},${midPoint1.y} ${midPoint2.x},${midPoint2.y} ${endPoint.x},${endPoint.y}`;
        },
        getStraightLinePoints(startEl, endEl, containerRect) {
            const rect1 = startEl.getBoundingClientRect();
            const rect2 = endEl.getBoundingClientRect();

            const startPoint = {
                x: rect1.left - containerRect.left + rect1.width / 2,
                y: rect1.top - containerRect.top + rect1.height,
            };

            const endPoint = {
                x: rect1.left - containerRect.left + rect1.width / 2,
                y: rect2.top - containerRect.top,
            };

            return `${startPoint.x},${startPoint.y} ${endPoint.x},${endPoint.y}`;
        },
        updateLineCoordinates() {
            this.$nextTick(() => {
                const container = this.$refs.container;
                if (!container) return;
                const containerRect = container.getBoundingClientRect();
                const newLines = [];
                this.connections.forEach((conn) => {
                    const startEl = this.$refs[conn.start];
                    const endEl = this.$refs[conn.end];
                    if (startEl && endEl) {
                        const points = this.getLinePoints(startEl, endEl, containerRect, conn.isRightAngle ?? true);;
                        newLines.push({
                            points,
                            stroke: conn.stroke,
                            strokeWidth: conn.strokeWidth,
                            strokeDasharray: conn.strokeDasharray,
                        });
                    }
                });
                this.lines = newLines;
            });
        },
    },
};