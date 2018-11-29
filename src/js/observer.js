function Observer(data) {
    this.walk(data);
}
Observer.prototype = {
    // 遍历
    walk: function(data) {
        const self = this;
        Object.keys(data).forEach(function(key) {
            self.defineKey(data, key, data[key]);
        });
    },
    // set, get
    defineKey: function(data, key, value) {
        observe(value); // 递归遍历所有子属性
        const dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return value;
            },
            set: function(newValue) {
                if (newValue === value) {
                    return;
                }
                value = newValue;
                dep.notify();
            }
        });
    }
};

function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
}

// 消息订阅器
// 需要监听的属性
function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    notify: function() {
        this.subs.forEach((sub) => {
            sub.update();
        });
    },
};
Dep.target = null;
