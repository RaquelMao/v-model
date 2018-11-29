function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
}

Compile.prototype = {
    init: function () {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    },
    // 将需要解析的dom节点存入fragment片段
    nodeToFragment: function (el) {
        const fragment = document.createDocumentFragment();
        let child = el.firstChild;
        while (child) {
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    },
    compileElement: function (el) {
        const childNodes = el.childNodes;
        const self = this;
        [].slice.call(childNodes).forEach(function(node) {
            const reg = /\{\{(.*)\}\}/;
            const text = node.textContent;

            if (self.isElementNode(node)) {
                self.compile(node);
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, reg.exec(text)[1]);
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        });
    },
    compile: function(node) {
        const nodeAttrs = node.attributes;
        const self = this;
        [].forEach.call(nodeAttrs, (attr) => {
           const attrName = attr.name;
           if(self.isDirective(attrName)) {
               const exp = attr.value;
               const dir = attrName.substring(2);
               if (self.isEventDirective(dir)) {
                   self.compileEvent(node, self.vm, exp, dir);
               } else {
                   self.compileModel(node, self.vm, exp, dir);
               }
               node.removeAttribute(attrName);
           }
        });
    },
    compileText: function(node, exp) {
        const self = this;
        const initText = this.vm[exp];
        this.updateText(node, initText); // 将初始化的数据初始化到视图中
        new Watcher(this.vm, exp, function (value) {
            self.updateText(node, value);
        });
    },
    compileEvent: function (node, vm, exp, dir) {
        const eventType = dir.split(':')[1];
        const cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    compileModel: function (node, vm, exp, dir) {
        const self = this;
        let val = this.vm[exp];
        this.modelUpdater(node, val);
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function(e) {
            const newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    },
    updateText: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    modelUpdater: function(node, value) {
        node.value = typeof value === 'undefined' ? '' : value;
    },
    isTextNode: function(node) {
        return node.nodeType === 3;
    },
    isDirective: function(attr) {
        return attr.indexOf('v-') === 0;
    },
    isEventDirective: function(dir) {
        return dir.indexOf('on:') === 0;
    },
    isElementNode: function (node) {
        return node.nodeType === 1;
    },
};
