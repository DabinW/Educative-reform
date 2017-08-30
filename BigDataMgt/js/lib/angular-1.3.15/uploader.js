/*
 * Author: Remy Alain Ticona Carbajal http://realtica.org
 * Description: The main objective of ng-uploader is to have a user control,
 * clean, simple, customizable, and above all very easy to implement.
 * Licence: MIT
 */

angular.module('ui.uploader', []).service('uiUploader', uiUploader);

uiUploader.$inject = ['$log'];

function uiUploader($log) {
    'use strict';

    /*jshint validthis: true */
    var self = this;
    self.files = [];
    self.options = {};
    self.activeUploads = 0;
    $log.info('uiUploader loaded');
    
    function addFiles(files) {
        for (var i = 0; i < files.length; i++) {
            var tp = self.files.map(function(e) { return e.name; }).indexOf(files[i].name);
            if (tp < 0){
                self.files.push(files[i]);
            }
        }
    }

    function getFiles() {
        return self.files;
    }

    function startUpload(options) {
        self.options = options;
        ajaxUpload(self.files, self.options.url,self.options.baseinfo, self.options.AskString);
//        for (var i = 0; i < self.files.length; i++) {
//            if (self.activeUploads == self.options.concurrency) {
//                break;
//            }
//            if (self.files[i].active)
//                continue;
//
//        }
    }
    
    function removeFile(file){
        var tp = self.files.indexOf(file);
        self.files.splice(self.files.indexOf(file),1);
    }
    
    function removeAll(){
        self.files.splice(0,self.files.length);
    }
    
    return {
        addFiles: addFiles,
        getFiles: getFiles,
        files: self.files,
        startUpload: startUpload,
        removeFile: removeFile,
        removeAll:removeAll
    };
    
    function getHumanSize(bytes) {
        var sizes = ['n/a', 'bytes', 'KiB', 'MiB', 'GiB', 'TB', 'PB', 'EiB', 'ZiB', 'YiB'];
        var i = +Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[isNaN(bytes) ? 0 : i + 1];
    }

    function ajaxUpload(files, url, baseinfo,AskString) {
        var xhr, formData, prop, data = '',
            key = '' || 'file';
        self.activeUploads += 1;
        //file.active = true;
        xhr = new window.XMLHttpRequest();
        formData = new window.FormData();
        xhr.open('POST', url);

        // Triggered when upload starts:
        xhr.upload.onloadstart = function() {};

        // Triggered many times during upload:
        xhr.upload.onprogress = function(event) {
            if (!event.lengthComputable) {
                return;
            }
            // Update file size because it might be bigger than reported by
            // the fileSize:
            //$log.info("progres..");
            //console.info(event.loaded);
            //file.loaded = event.loaded;
            //file.humanSize = getHumanSize(event.loaded);
            //self.options.onProgress(file);
        };

        // Triggered when upload is completed:
//        xhr.onload = function() {
//            self.activeUploads -= 1;
//            startUpload(self.options);
//            //self.options.onCompleted(file, xhr.responseText);
//        };


        xhr.onreadystatechange = function() {
            if(xhr.readyState==4){
                if(xhr.status==200){
                    self.options.onCompleted(xhr.responseText);
                }
            }
        };
        // Triggered when upload fails:
        xhr.onerror = function() {};

        // Append additional data if provided:
        if (data) {
            for (prop in data) {
                if (data.hasOwnProperty(prop)) {
                    formData.append(prop, data[prop]);
                }
            }
        }

        // Append files data:
        for (var i = 0; i < files.length; i++) {
            formData.append(key, files[i]);
        }
        //formData.append(key, file, file.name);
        // Append Params
        formData.append('baseinfo', baseinfo);
        formData.append('AskString', AskString);
        // Initiate upload:
        xhr.send(formData);

        return xhr;
    }

}
