<template>
    <div class="item" v-bind:class="{ active:(index==activeIndex)}">
        <div v-if="index!=renameIndex" >{{category.split(" ")[1]}}
        </div>
        <input type="text" v-if="index==renameIndex"
               :value="categoryEdit"
               @keyup.enter="renameCategory(index,$event.target.value)" @blur="renameCategory(index,$event.target.value)"
               v-focus/>
    </div>
</template>

<script>
    import {ElementMixin} from 'vue-slicksort';

    export default {
        name: "sortable-item",
        mixins: [ElementMixin],
        props: ['category', 'activeIndex', 'renameIndex','categoryEdit'],
        directives: {
            focus: {
                // 当绑定元素插入到 DOM 中。
                inserted: function (el) {
                    // 聚焦元素
                    el.focus();
                }
            }
        },
        methods: {
            //重命名分类
            renameCategory: function (index,categoryEdit) {
                this.$emit('rename',{
                    index:index,
                    categoryEdit:categoryEdit
                })
            },
            deleteCategory:function (index) {
                console.log("ddddddd")
                this.$emit('delete',{
                    index:index
                })
            },
        }
    }
</script>

<style scoped>
    .item {
        height: 37px;
        line-height: 37px;
        font-size: 13px;
        cursor: pointer;
    }

    .active {
        background-color: #cecece;
    }

    .item div {
        margin-left: 20px;
    }

    /*.item div:focus {*/
        /*outline: none;*/
    /*}*/

    .item input {
        margin-left: 15px;
        width: 140px;
    }
</style>