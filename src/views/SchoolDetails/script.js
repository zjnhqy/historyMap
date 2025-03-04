
import Data from '@/assets/data.json' 
export default {
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            activeTab: '地理位置',
            currentIndex: 0,
            scale: 1, // 初始缩放比例
            isHovering: false, // 用于标识鼠标是否悬浮在图片上
            translateX: 0,         // X轴平移
            translateY: 0,         // Y轴平移
            // isHovering: false,     // 是否处于鼠标悬停状态
            dragging: false,       // 是否正在拖拽
            dragStartX: 0,         // 拖拽起始 X 坐标
            dragStartY: 0,         // 拖拽起始 Y 坐标
            // 示例学校数据，记得在实际项目中和原有数据整合
            imgWidth: 0,
            imgHeight: 0,
            containerWidth: 0,
            containerHeight: 0,
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
            schools: Data.schools
    };
    },
    computed: {
        school() {
            console.log(this.schools);
            return this.schools.find((s) => s.id === this.id) || this.schools[0];
        },
        activeItems() {
            return this.activeTab === '景观建筑' ? this.school.architecture : this.school.notablePeople;
        },
    },
    methods: {
        initImage() {
            const img = this.$refs.imgEl;
            this.imgWidth = img.naturalWidth;
            this.imgHeight = img.naturalHeight;

            const container = img.parentElement;
            this.containerWidth = container.clientWidth;
            this.containerHeight = container.clientHeight;

            // 计算初始缩放比例
            const scaleX = this.containerWidth / this.imgWidth;
            const scaleY = this.containerHeight / this.imgHeight;
            this.scale = Math.min(scaleX, scaleY);

            // 初始居中位置
            this.translateX = (this.containerWidth - this.imgWidth * this.scale) / 2;
            this.translateY = (this.containerHeight - this.imgHeight * this.scale) / 2;
            console.log(this.translateX, this.translateY);


            this.calculateBounds();
        },

        calculateBounds() {
            const scaledWidth = this.imgWidth * this.scale;
            const scaledHeight = this.imgHeight * this.scale;

            this.maxX = Math.max((this.containerWidth - scaledWidth) / 2, 0);
            this.minX = Math.min((this.containerWidth - scaledWidth) / 2, 0);
            this.maxY = Math.max((this.containerHeight - scaledHeight) / 2, 0);
            this.minY = Math.min((this.containerHeight - scaledHeight) / 2, 0);

            // 限制当前位置在合理范围内
            this.translateX = Math.min(Math.max(this.translateX, this.minX), this.maxX);
            this.translateY = Math.min(Math.max(this.translateY, this.minY), this.maxY);
        },

        handleZoom(event) {
            const rect = this.$refs.imgEl.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const oldScale = this.scale;
            const newScale = event.deltaY < 0 ?
                Math.min(oldScale * 1.2, 4) :
                Math.max(oldScale / 1.2, 0.5);

            // 计算基于鼠标位置的缩放
            this.translateX -= (mouseX - this.translateX) * (newScale / oldScale - 1);
            this.translateY -= (mouseY - this.translateY) * (newScale / oldScale - 1);

            this.scale = newScale;
            this.calculateBounds();
        },

        handleDrag(event) {
            if (!this.dragging) return;
            const dx = event.clientX - this.dragStartX;
            const dy = event.clientY - this.dragStartY;

            this.translateX = Math.min(Math.max(this.translateX + dx, this.minX), this.maxX);
            this.translateY = Math.min(Math.max(this.translateY + dy, this.minY), this.maxY);

            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
        },


        // 仅在放大状态下允许拖拽
        startDrag(event) {
            if (this.scale === 1) return; // 未放大时不启用拖拽
            if (event.button !== 0) return; // 只响应鼠标左键
            this.dragging = true;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
            window.addEventListener('mousemove', this.handleDrag);
            window.addEventListener('mouseup', this.stopDrag);
        },
        handleDrag(event) {
            if (!this.dragging) return;
            const dx = event.clientX - this.dragStartX;
            const dy = event.clientY - this.dragStartY;
            this.translateX += dx;
            this.translateY += dy;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
        },
        stopDrag() {
            this.dragging = false;
            window.removeEventListener('mousemove', this.handleDrag);
            window.removeEventListener('mouseup', this.stopDrag);
        },
        // 缩放以鼠标所在位置为中心
        handleZoom(event) {
            const scaleX = this.containerWidth / this.imgWidth;
            const scaleY = this.containerHeight / this.imgHeight;
            const eldScale = Math.min(scaleX, scaleY);
            const oldScale = this.scale;
            const zoomSpeed = 0.1;
            let newScale = oldScale;
            if (event.deltaY < 0) {
                newScale = Math.min(oldScale + zoomSpeed, 3); // 最大放大3倍
            } else {
                newScale = Math.max(oldScale - zoomSpeed, eldScale); // 最小1倍
            }
            // 获取图片容器中图片的边界矩形
            const imgRect = this.$refs.imgEl.getBoundingClientRect();
            // 计算鼠标在图片中的相对坐标（像素）
            const offsetX = event.clientX - imgRect.left;
            const offsetY = event.clientY - imgRect.top;
            // 根据缩放比例变化调整平移，保持鼠标位置不变
            console.log(eldScale);

            if (newScale !== eldScale) {
                this.translateX -= (offsetX / oldScale) * (newScale - oldScale);
                this.translateY -= (offsetY / oldScale) * (newScale - oldScale);
            } else {
                console.log('1');

                // 如果缩放恢复到1，则重置平移
                this.translateX = (this.containerWidth - this.imgWidth * eldScale) / 2;
                this.translateY = (this.containerHeight - this.imgHeight * eldScale) / 2;
            }
            this.scale = newScale;
        }
    },
    beforeDestroy() {
        window.removeEventListener('mousemove', this.handleDrag);
        window.removeEventListener('mouseup', this.stopDrag);
    },
    mounted() {
        // console.log('School Details Component Mounted');
        console.log('Received ID:', this.id);
        console.log('Found School:', this.school);
    },
}
