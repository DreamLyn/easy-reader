<template>
    <div>
        <div class="oss_file">
            <input type="file" :id="id" :multiple="multiple" @change="doUpload"/>
        </div>
    </div>
</template>

<script>
    export default {
        name: "local-upload",
        props: {
            multiple: {
                type: Boolean,
                twoWay: false
            },
            id: {
                type: String,
                twoWay: false
            },
            url: {
                type: Array,
                twoWay: true
            }
        },
        data() {
            return {
                region: 'Your oss Region',
                bucket: 'Bucket Name',
            };
        },
        methods: {
            doUpload() {
                const _this = this;
                Vue.http.get('/alioss/getOssToken').then((result) => {
                    const client = new OSS.Wrapper({
                        region: _this.region,
                        accessKeyId: result.data.token.AccessKeyId,
                        accessKeySecret: result.data.token.AccessKeySecret,
                        stsToken: result.data.token.SecurityToken,
                        bucket: _this.bucket
                    })
                    const files = document.getElementById(_this.id);
                    if (files.files) {
                        const fileLen = document.getElementById(_this.id).files
                        const resultUpload = [];
                        for (let i = 0; i < fileLen.length; i++) {
                            const file = fileLen[i];
                            const storeAs = file.name;
                            client.multipartUpload(storeAs, file, {}).then((results) => {
                                if (results.url) {
                                    resultUpload.push(results.url);
                                }
                            }).catch((err) => {
                                console.log(err);
                            });
                        }
                        _this.url = resultUpload;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .oss_file {
        height: 100px;
        width: 100%;

    }

    .oss_file input {
        right: 0;
        top: 0;
        opacity: 0;
        filter: alpha(opacity=0);
        cursor: pointer;
        width: 100%;
        height: 100%;
    }


</style>