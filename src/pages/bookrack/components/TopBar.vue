<template>
    <div id="titlebar">
        <a id="logo" href="">Easy Reader</a>
        <el-tag id="web-store" size="mini">浏览器存储</el-tag>
        <el-tag id="local-store" size="mini">本地存储</el-tag>

        <el-button id="book-manage" size="mini" round v-on:click="addBook">添加图书</el-button>
        <input type="file" id="file-upload"
               multiple="multiple"
               accept="application/epub+zip"
               style="width: 0;height: 0;"
               ref="inputer"
               @change="selectFiles($event)"/>
    </div>
</template>

<script>
    import localForage from "localforage";

    export default {
        props:[
            'store'
        ],
        data: function () {
            return {
            }
        },
        methods: {
            addBook: function () {
                document.getElementById("file-upload").click();
            },
            selectFiles: function (event) {
                var self = this;
                //获取文件
                //
                var files = this.$refs.inputer.files;
                var count = 0;
                for (var index = 0; index < files.length; index++) {
                    var file = files[index];
                    var fileName = file.name;
                    if (file.size / 1024 / 1024 > 100) {
                        //如果大于20M
                        self.$notify({
                            title: '失败',
                            message: fileName + '大于100M，目前只支持小于100M文件',
                            type: 'error'
                        });
                    } else {
                        var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                            chunkSize = 2097152, // Read in chunks of 2MB
                            chunks = Math.ceil(file.size / chunkSize),
                            currentChunk = 0,
                            spark = new SparkMD5.ArrayBuffer(),
                            fileReader = new FileReader();
                        var md5;
                        fileReader.onload = function (e) {
                            spark.append(e.target.result); // Append array buffer
                            currentChunk++;
                            if (currentChunk < chunks) {
                                loadNext();
                            } else {
                                md5 = spark.end();
                                self.store.setItem(md5, file, function (err) {
                                    //存储缩略图
                                    var reader = new FileReader();
                                    reader.onload = function() {
                                        var arrayBuffer = reader.result;
                                        var Book = ePub(arrayBuffer);
                                        Book.ready.cover.promise.then(function(cover) {
                                            var zipCover = Book.zip.zip.file(cover);
                                            if (zipCover) {
                                                //如果不为空
                                                var coverBuffer = zipCover.asArrayBuffer();
                                                var coverFile = new Blob([coverBuffer]);
                                                self.store.setItem(md5 + 'cover', coverFile, function(err) {
                                                    var fileInfo = {};
                                                    //书名
                                                    fileInfo.name = file.name;
                                                    //书籍MD5
                                                    fileInfo.dname = md5;
                                                    //书籍添加时间
                                                    fileInfo.addtime = Date.parse(new Date());
                                                    //书籍上次阅读时间
                                                    fileInfo.readtime = null;
                                                    //书籍阅读状态
                                                    fileInfo.readtimedis = "未读过";
                                                    //上次阅读位置
                                                    fileInfo.lastreadurl = null;
                                                    //缩略图
                                                    fileInfo.thumbnail = "";
                                                    //标签
                                                    fileInfo.tags = [];
                                                    //注释用户
                                                    fileInfo.notes = [];
                                                    count++;
                                                    //判断书籍是否遍历完毕，完毕后将相应json存入
                                                    if (count == files.length) {
                                                        //上传图书成功
                                                        self.$emit("upload-files",{
                                                            fileInfo:fileInfo
                                                        });
                                                    }
                                                });
                                            } else {
                                                var fileInfo = {};
                                                //书名
                                                fileInfo.name = file.name;
                                                //书籍MD5
                                                fileInfo.dname = md5;
                                                //书籍添加时间
                                                fileInfo.addtime = Date.parse(new Date());
                                                //书籍上次阅读时间
                                                fileInfo.readtime = null;
                                                //书籍阅读状态
                                                fileInfo.readtimedis = "未读过";
                                                //上次阅读位置
                                                fileInfo.lastreadurl = null;
                                                //缩略图
                                                fileInfo.thumbnail = "";
                                                //标签
                                                fileInfo.tags = [];
                                                //注释用户
                                                fileInfo.notes = [];
                                                count++;
                                                //判断书籍是否遍历完毕，完毕后将相应json存入
                                                if (count == files.length) {
                                                    //上传图书成功
                                                    self.$emit("upload-files",{
                                                        fileInfo:fileInfo
                                                    });
                                                }
                                            }


                                        });

                                    }
                                    reader.readAsArrayBuffer(file);
                                });
                            }
                        };
                        fileReader.onerror = function () {
                            console.warn('oops, something went wrong.');
                        };

                        function loadNext() {
                            var start = currentChunk * chunkSize,
                                end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
                        }

                        loadNext();
                    }
                }
            },
        },
        mounted() {

        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    #titlebar {
        height: 40px;
        line-height: 40px;
        width: 100%;
        background-color: #ffffff;
        box-shadow: 1px 1px 1px #E0E0E0;
    }

    #logo {
        font-size: 20px;
        font-weight: 500;
        line-height: 40px;
        color: #1fbcd3;
        text-shadow: 0 1px 0 rgba(0, 0, 0, .1);
        float: left;
        margin-left: 20px;
        text-decoration: none
    }

    #logo:hover {
        text-decoration: none;
        color: #0e8dd3;
    }

    #web-store {
        cursor: pointer;
        margin-left: 40px;
    }

    #local-store {
        cursor: pointer;
        margin-left: 10px;
    }

    #book-manage {
        float: right;
        margin-right: 30px;
        color: white;
        background-color: #fc6533;
        height: 25px;
        padding: 5px 20px;
        margin-top: 8px;
    }

</style>
