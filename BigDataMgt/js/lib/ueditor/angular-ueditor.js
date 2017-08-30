
/**
Created by Dio on 17-9.
http://inhu.net
 */

(function() {
  "use strict";
  (function() {
    var NGUeditor;
    NGUeditor = angular.module("ng.ueditor", []);
    NGUeditor.directive("ueditor", [
      function() {
        return {
          restrict: "AE",
          require: "ngModel",
          scope: {
            initconfig: "=",
            height:"=",
            ready: "="
          },
          link: function($S, element, attr, ctrl) {
            var _NGUeditor, _updateByRender;
            _updateByRender = false;
            _NGUeditor = (function() {
              function _NGUeditor() {
                this.bindRender();
                this.initEditor();
                return;
              }
                var theheight = $S.height ? $S.height : 350;
                $S._simpleConfig = {
                    //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
                    toolbars: [
                        ['FullScreen', 'Source', 'Undo', 'Redo', 'Bold', 'test']
                    ],
                    //focus时自动清空初始化时的内容
                    autoClearinitialContent: true,
                    //关闭字数统计
                    wordCount: false,
                    //关闭elementPath
                    elementPathEnabled: false,
                    initialFrameHeight:theheight,//设置编辑器高度
                    scaleEnabled:true
                };
                $S._richEditorConfig = {
                    //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
                    toolbars: [[
                        'fullscreen', 'source', '|', 'undo', 'redo', '|',
                        'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
                        'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                        'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
                         'indent', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
                        'link', 'unlink', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
                        'simpleupload', 'insertimage', 'emotion', 'scrawl', 'insertvideo', 'music', 'attachment', 'map','template', 'background', '|',
                        'horizontal', 'date', 'time', 'spechars', '|',
                        'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', '|',
                        'print', 'preview', 'searchreplace'
                    ]],
                    //focus时自动清空初始化时的内容
                    autoClearinitialContent: true,
                    //关闭字数统计
                    wordCount: false,
                    //关闭elementPath
                    elementPathEnabled: false,
                    initialFrameHeight:theheight,//设置编辑器高度
                    scaleEnabled:true
                };

                $S.config = $S._simpleConfig;
                console.log(element);
                if ($S.initconfig == 'richEditor'){
                    $S.config = $S._richEditorConfig;
                }

              /**
               * 初始化编辑器
               * @return {[type]} [description]
               */

              _NGUeditor.prototype.initEditor = function() {
                var _UEConfig, _editorId, _self;
                _self = this;
                if (typeof UE === 'undefined') {
                  console.error("Please import the local resources of ueditor!");
                  return;
                }
                _UEConfig = $S.config ? $S.config : $S._simpleConfig;
                _editorId = attr.id ? attr.id : "_editor" + (Date.now());
                element[0].id = _editorId;
                this.editor = new UE.ui.Editor(_UEConfig);
                this.editor.render(_editorId);
                return this.editor.ready(function() {
                  _self.editorReady = true;
                  _self.editor.addListener("contentChange", function() {
                    ctrl.$setViewValue(_self.editor.getContent());
                    if (!_updateByRender) {
                      if (!$S.$$phase) {
                        $S.$apply();
                      }
                    }
                    _updateByRender = false;
                  });
                  if (_self.modelContent && _self.modelContent.length > 0) {
                    _self.setEditorContent();
                  }
                  if (typeof $S.ready === "function") {
                    $S.ready(_self.editor);
                  }
                  $S.$on("$destroy", function() {
                    if (!attr.id && UE.delEditor) {
                      UE.delEditor(_editorId);
                    }
                  });
                });
              };

              _NGUeditor.prototype.setEditorContent = function(content) {
                if (content == null) {
                  content = this.modelContent;
                }
                if (this.editor && this.editorReady) {
                  this.editor.setContent(content);
                }
              };

              _NGUeditor.prototype.bindRender = function() {
                var _self;
                _self = this;
                ctrl.$render = function() {
                  _self.modelContent = (ctrl.$isEmpty(ctrl.$viewValue) ? "" : ctrl.$viewValue);
                  _updateByRender = true;
                  _self.setEditorContent();
                };
              };

              return _NGUeditor;

            })();
            new _NGUeditor();
          }
        };
      }
    ]);
  })();

}).call(this);

//# sourceMappingURL=angular-ueditor.js.map
