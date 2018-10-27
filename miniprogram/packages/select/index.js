'use strict';

Component({
  properties: {
    items: {
      type: Array,
      value: []
    },
    name: {
      type: String,
      value: ''
    },
    selectedValue: {
      type: String,
      value: ''
    },
    selectedValue: {
      type: Number,
      value: 320
    },
    activeColor: {
      type: String,
      value: '#ff4444'
    }
  },

  methods: {
    handleSelectChange: function handleSelectChange(e) {
      let d = e.currentTarget.dataset;
      let item = this.data.items[d.index]
      this.setData({ selectedValue: item.value || ''})
      this.triggerEvent('change', item);
    }
  }
});