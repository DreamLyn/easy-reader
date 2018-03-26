(function ($) {
    /**
     * 首先获取文件内容
     */
    var category;
    var book;
    var bookInfo;
    var bookInfos;
    var store = localforage.createInstance({
        name: "filesInfo"
    });
    var bookStore = localforage.createInstance({
        name: "dreamlyn"
    });
    localforage.getItem("category").then(response => {
        category = response;
        localforage.getItem("book").then(res => {
            book = res;
            store.getItem(category).then(value => {
                bookInfos = value;


                bookInfo = bookInfos[book];
                bookStore.getItem(bookInfo.dname).then(val => {
                    var reader = new FileReader();
                    reader.onload = function () {
                        var arrayBuffer = reader.result;
                        console.log(arrayBuffer)
                        window.epubreader = ePubReader(arrayBuffer);
                        // self.Book = ePub(arrayBuffer, {
                        //     restore: true,
                        //     gap: 80
                        // });
                        // if (self.editFile.lastreadurl) {
                        //     self.Book.spinePos = self.editFile.lastreadurl;
                        //     // self.Book.settings.previousLocationCfi = self.editFile.lastreadurl;
                        // }
                        // self.Book.renderTo("viewer");
                        // self.Book.setStyle("font-family", "微软雅黑,宋体");
                        // self.Book.setStyle("color", self.mainStyle.color);
                        //
                        // self.Book.getToc().then(function (toc) {
                        //     //遍历目录树，并修改部分东西
                        //     self.transitionToc(toc);
                        //     self.toc = toc;
                        // });
                        // self.Book.on('renderer:click', function (e) {
                        //     //点击后关闭目录
                        //     if (self.tocFlag) {
                        //         self.tocFlag = false;
                        //     }
                        //     if (self.notesFlag) {
                        //         self.notesFlag = false;
                        //     }
                        // });
                        // self.selectWords(); //选中文字后做笔记
                        // self.Book.on('renderer:locationChanged', function (locationCfi) {
                        //     self.editFile.lastreadurl = locationCfi;
                        //     if (self.onLine == '0') {
                        //         localStorage.setItem("filesInfo", JSON.stringify(self.files));
                        //     }
                        //
                        // });
                    }
                    reader.readAsArrayBuffer(val);
                });
                // break;


            });
        });
    });


})(jQuery);