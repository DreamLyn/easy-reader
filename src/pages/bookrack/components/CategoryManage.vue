<template>
    <div class="main">
        <!--<div v-for="(category,index) in categories " class="item" v-bind:class="{ active:(index==activeIndex)}"-->
        <!--@dblclick="dblClickItem(index)" @click="clickItem(index)"-->
        <!--:index="index" :key="index" :item="category">-->
        <!--<div v-if="index!=renameIndex" tabindex="0"-->
        <!--@keyup.delete="deleteCategory(index)">{{category.split(" ")[1]}}-->
        <!--</div>-->
        <!--<input type="text" v-if="index==renameIndex" v-model='categoryEdit' @keyup.enter="renameCategory(index)"-->
        <!--@blur="renameCategory(index)"-->
        <!--v-focus/>-->
        <!--</div>-->
        <div class="add-category" @click="addCategory()">+</div>
        <sortable-list v-model="categories" @sortStart="sortStart" @sortEnd="sortEnd" @input="sortedEnd"
                       tabindex="0"
                       v-on:delete="deleteCategory"
                       :lockAxis="'y'">
            <sortable-item v-for="(category,index) in categories " :index="index" :key="index"
                           :category="category"
                           :activeIndex="activeIndex" :renameIndex="renameIndex"
                           :categoryEdit="categoryEdit"
                           @dblclick="dblClickItem(index)" @click="clickItem(index)"
                           v-on:rename="renameCategory"></sortable-item>
        </sortable-list>
    </div>
</template>

<script>
    import Vue from 'vue'
    import localForage from "localforage";
    import SortableItem from './SortableItem';
    import SortableList from "./SortableList";

    export default {
        components: {
            SortableList,
            SortableItem,
            SortableItem,
        },
        props: [
            'store',
        ],
        data: function () {
            return {

                categories: [],
                activeIndex: 0,      //当前激活的分类（选中的分类）
                renameIndex: -1,     //重命名
                categoryEdit: "",     //编辑状态下的category

                oldIndex: 0,
                newIndex: 0,

                positionYLast: 0,
                clickFlag: false,
            }
        },
        methods: {
            //获取分类
            categoriesInit: function () {
                var callBack = arguments[0] ? arguments[0] : null;
                this.store.keys().then((keys) => {
                    if ((!keys) || (keys.length == 0)) {
                        //如果无分类信息，则重建分类
                        keys.push("0 默认");
                        keys.push("1 生活");
                        keys.push("2 小说");
                        keys.push("3 技术");
                        this.store.setItem("0 默认", []);
                        this.store.setItem("1 生活", []);
                        this.store.setItem("2 小说", []);
                        this.store.setItem("3 技术", []);
                    }
                    this.categories = keys;
                    this.categories.sort(function (a, b) {
                        return a.split(" ")[0] > b.split(" ")[0] ? 1 : -1;
                    });
                    callBack && callBack();
                }).catch(function (err) {
                    //console.log(err);
                });
            },
            //重命名分类
            renameCategory: function (event) {
                var index = event.index;
                var categoryEdit = event.categoryEdit;
                if (categoryEdit == "默认") {
                    categoryEdit = "新建分类";
                    this.$notify({
                        title: '异常',
                        message: '新建分类不能命名为默认',
                        type: 'error'
                    });
                }
                var temp = index + " " + categoryEdit;
                this.renameIndex = -1;
                this.store.getItem(this.categories[index]).then(value => {
                    this.store.removeItem(this.categories[index]).then(() => {
                        /**
                         * 检测是否时新建的分类，如果是，则给value赋值
                         */
                        if (!value) {
                            value = [];
                        }
                        this.store.setItem(temp, value).then((res) => {
                            Vue.set(this.categories, index, temp)
                        });
                    });
                })
            },
            //添加分类
            addCategory: function () {
                var temp = this.categories.length;
                this.categories.push(temp + " " + "新建分类");
                this.categoryEdit = "新建分类";
                this.renameIndex = temp;
            },
            //删除分类
            deleteCategory: function () {
                var index = this.activeIndex;
                var tempIndex = this.categories[index];
                var endIndex = this.categories.length - 1;
                this.store.removeItem(tempIndex).then(() => {
                    this.moveCategories(index + 1, endIndex, index,()=>{
                        this.categoriesInit(()=>{
                            this.$emit("change", {
                                category: this.categories[this.activeIndex]
                            });
                        });
                    });
                });
            },
            //移动分类,把从startIndex到endIndex的分类移动到toIndex处(包含startIndex和endIndex)
            moveCategories: function (startIndex, endIndex, toIndex) {
                var callBack = arguments[3] ? arguments[3] : null;
                if ((startIndex > endIndex)) {
                    this.categoriesInit();
                    return;
                } else if (startIndex > toIndex) {
                    //向前移动
                    for (var index = startIndex; index <= endIndex; index++, toIndex++) {
                        this.moveCategory(index, toIndex, endIndex, callBack);
                    }
                } else if (startIndex < toIndex) {
                    //向后移动
                    toIndex = toIndex + endIndex - startIndex;
                    for (var index = endIndex; index <= startIndex; index--, toIndex--) {
                        this.moveCategory(index, toIndex, endIndex, callBack);
                    }
                } else {
                    //向前移动
                    for (var index = startIndex; index <= endIndex; index++, toIndex++) {
                        this.moveCategory(index, toIndex, endIndex, callBack);
                    }
                }
            },
            //移动一条分类
            moveCategory: function (index, toIndex, endIndex) {
                var callBack = arguments[3] ? arguments[3] : null;
                var tempIndex = this.categories[index];
                this.store.getItem(tempIndex).then((value) => {
                    this.store.removeItem(tempIndex).then(() => {
                        tempIndex = toIndex + " " + tempIndex.split(" ")[1];
                        this.store.setItem(tempIndex, value).then((response) => {
                            if (index == endIndex) {
                                callBack && callBack();
                            }
                        });
                    });
                })
            },

            sortStart: function (event) {
                this.positionYLast = event.event.screenY;
            },
            sortEnd: function (event) {
                if (Math.abs(event.event.screenY - this.positionYLast) <= 10) {
                    //单击
                    this.activeIndex = event.oldIndex;
                    //向外触发
                    this.$emit("change", {
                        category: this.categories[this.activeIndex]
                    })

                    //判断是否为双击
                    if (this.clickFlag) {
                        //双击
                        this.clickFlag = false;
                        this.renameIndex = event.oldIndex;
                        this.categoryEdit = this.categories[event.oldIndex].split(" ")[1];

                    } else {
                        event.event.target.focus();
                        this.clickFlag = true;
                    }
                    setTimeout(() => {
                        this.clickFlag = false;
                    }, 200)
                }
                this.newIndex = event.newIndex;
                this.oldIndex = event.oldIndex;
            },
            sortedEnd: function (newList) {
                if (this.newIndex != this.oldIndex) {
                    var temp = this.newIndex + " " + newList[this.newIndex].split(" ")[1];
                    this.store.getItem(newList[this.newIndex]).then(value => {     //移动项
                        this.store.removeItem(newList[this.newIndex]).then(() => {
                            //移动
                            if (this.newIndex > this.oldIndex) {
                                //如果是向后移动
                                this.moveCategories(this.oldIndex, this.newIndex - 1, this.oldIndex, () => {
                                    this.store.setItem(temp, value).then((response) => {
                                        this.categoriesInit(()=>{
                                            this.activeIndex = this.newIndex;
                                            this.$emit("change", {
                                                category: this.categories[this.activeIndex]
                                            })
                                        });

                                    });
                                })
                            } else {
                                //向前移动
                                this.moveCategories(this.newIndex + 1, this.oldIndex, this.newIndex + 1, () => {
                                    this.store.setItem(temp, value).then((response) => {
                                        this.categoriesInit(()=>{
                                            this.activeIndex = this.newIndex;
                                            this.$emit("change", {
                                                category: this.categories[this.activeIndex]
                                            })
                                        });

                                    });
                                });
                            }
                        });
                    })
                }
            }

        },
        mounted() {
            //this.store.clear();
            this.categoriesInit(()=>{
                this.$emit("change", {
                    category: this.categories[this.activeIndex]
                })
            });
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .main {
        width: 180px;
        position: absolute;
        top: 41px;
        bottom: 0px;
        left: 0px;
        background-color: #f6f6f6;
    }

    /*.item {*/
    /*height: 37px;*/
    /*line-height: 37px;*/
    /*font-size: 13px;*/
    /*cursor: pointer;*/
    /*}*/

    /*.active {*/
    /*background-color: #cecece;*/
    /*}*/

    /*.item div {*/
    /*margin-left: 20px;*/
    /*}*/

    /*.item div:focus {*/
    /*outline: none;*/
    /*}*/

    /*.item input {*/
    /*margin-left: 15px;*/
    /*width: 140px;*/
    /*}*/

    .add-category {
        position: absolute;
        left: 15px;
        bottom: 5px;
        font-size: 30px;
        color: #7f7f7f;
        cursor: pointer;
    }

    .add-category:hover {
        color: #3c3f41;
    }
</style>
