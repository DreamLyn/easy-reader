<template>

    <div id="app">
        <top-bar v-if="filesStore" :store="filesStore" v-on:upload-files="uploadFiles"></top-bar>
        <category-manage v-if="store" :store="store" v-on:change="changeCategory"></category-manage>
        <!--<router-view/>-->

        <!-- 显示图书 -->
        <div class="books">
            <div v-for="fileInfo in filesInfo" class="book">
                <div class="readtime">
                    {{fileInfo.readtimedis}}
                </div>
                <el-card :body-style="{ padding: '0px' }">
                    <img v-bind:src="fileInfo.thumbnail" class="image" @click="openBook(fileInfo)">
                </el-card>
                <div style="padding:10px;padding-left:5px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;">
                    <span>{{fileInfo.name}}</span>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import Vue from 'vue'
    import TopBar from './components/TopBar';
    import CategoryManage from './components/CategoryManage';
    import localForage from "localforage";

    export default {
        name: 'App',
        components: {
            TopBar,
            CategoryManage,
        },
        data: function () {
            return {
                filesDBName: 'dreamlyn',
                filesStore: null,

                sortType: '1',               //排序方式
                filesInfo: [],               //文件信息存储。
                dbName: "filesInfo",          //数据库名
                store: null,                 //
                categories: [],               //分类
                category: null,               //当前分类
            }
        },
        methods: {
            dbInit: function () {
                this.filesStore = localForage.createInstance({
                    name: this.filesDBName
                });
                this.store = localForage.createInstance({
                    name: this.dbName
                });
            },
            /**
             * 打开书籍
             */
            openBook: function (book) {
                localForage.setItem("category", this.category).then((value) => {
                    var name=book.name;
                    name=name.substring(name.length-1);
                    console.log(name)
                    localForage.setItem("book", name).then((response)=>{
                        window.location.href="reader.html";
                    });
                });

            },
            uploadFiles: function (event) {
                var fileInfo = event.fileInfo;
                this.store.getItem(this.category).then((response) => {
                    response.push(fileInfo);
                    this.store.setItem(this.category, response);
                    this.updateFiles();
                });
            },
            changeCategory: function (event) {
                this.category = event.category;
                this.updateFiles();
            },
            updateFiles: function () {
                this.store.getItem(this.category).then((filesInfo) => {

                    this.filesInfo = [];
                    for (var index = 0; index < filesInfo.length; index++) {
                        var fileInfo = filesInfo[index];
                        fileInfo.name += index;
                        this.filesInfo.push(fileInfo);
                    }
                    //将书籍进行排序
                    switch (this.sortType) {
                        case '1': //按阅读时间
                            this.filesInfo.sort(function (a, b) {
                                return a.readtime > b.readtime ? -1 : 1;
                            });
                            break;
                        case '2': //按添加时间
                            this.filesInfo.sort(function (a, b) {
                                return a.addtime > b.addtime ? -1 : 1;
                            });
                            break;
                        case '3': //按文件名称
                            this.filesInfo.sort(function (a, b) {
                                return a.name > b.name ? 1 : -1;
                            });
                            break;
                        default:
                            break;
                    }
                    //修改显示的缩略图等信息
                    for (var index = 0; index < this.filesInfo.length; index++) {
                        var fileInfo = this.filesInfo[index];
                        if (fileInfo.readtime == null) {

                        } else {
                            //记录阅读时间
                            fileInfo.readtimedis = this.getReadTimeText(fileInfo.readtime) + "读过";
                        }
                        //生成缩略图并显示
                        this.updateThumbnail(index, fileInfo);

                    }
                });
            },
            /**
             * 更新缩略图
             * @param fileInfo
             */
            updateThumbnail(index, fileInfo) {
                var that = this;
                this.filesStore.getItem(fileInfo.dname + 'cover', function (err, file) {
                    if (file) {
                        var reader = new FileReader();
                        reader.onloadend = function (e) {
                            that.filesInfo[index].thumbnail = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    } else {
                        that.filesInfo[index].thumbnail = "/static/images/cover.jpg";
                    }
                });
            }
        },
        mounted() {
            this.dbInit();
        }
    }
</script>

<style>
    html, body {
        margin: 0;
        width: 100%;
        height: 100%;
    }

    #app {
        width: 100%;
        height: 100%;
    }

    .books {
        position: absolute;
        padding-top: 10px;
        top: 41px;
        left: 180px;
        right: 0;
        bottom: 0;
    }

    .book {
        float: left;
        width: 150px;
        height: 250px;
        margin-bottom: 20px;
        margin-left: 25px;
        margin-right: 10px;
        cursor: pointer;
    }

    .readtime {
        color: #888484;
        font-size: 12px;
        padding-bottom: 5px;
        padding-left: 5px;
    }

    .image {
        width: 100%;
        height: 200px;
        display: block;
    }

    .image:hover {
        width: 100%;
        height: 200px;
        display: block;
    }
</style>
