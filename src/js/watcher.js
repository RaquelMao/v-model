function Watcher(vm, exp, cb) {
    this.vm = vm;
    this.cb = cb; // function 将数据展示到视图
    this.exp = exp;
    this.value = this.get();
}
Watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        let newValue = this.vm.data[this.exp];
        let oldValue = this.value;
        if (newValue !== oldValue) {
            this.value = newValue;
            this.cb.call(this.vm, newValue, oldValue); // function 将数据展示到视图
        }
    },
    get: function() {
        Dep.target = this; // 将自己添加进消息订阅器
        const value = this.vm.data[this.exp];
        Dep.target = null;
        return value;
    }
};
