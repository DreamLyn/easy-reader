<template>
    <div @keyup="deleteCategory">
        <slot />
    </div>
</template>

<script>
    import { ContainerMixin } from 'vue-slicksort';

    export default {
        name: "sortable-list",
        mixins: [ContainerMixin],
        methods:{
            deleteCategory:function (event) {
                if(event.keyCode==46){
                    this.$emit("delete");
                }
                //this.$emit("delete");
            }
        }
    }
</script>

<style scoped>
div{
    outline:none;
}
</style>