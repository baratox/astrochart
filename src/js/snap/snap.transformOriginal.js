import * as Snap from 'snapsvg'

Snap.plugin(function (Snap, Element, Paper) {
  'use strict'

  Element.prototype.transformOriginal = function (t, append) {
    if (typeof t === 'undefined') {
      // Save current transformation as original.
      this.data('original-transform', this.transform().localMatrix)
    } else {
      // Prepends t to the original transform by default
      append = typeof append !== 'undefined' ? append : false
      var original = this.data('original-transform') != null ? this.data('original-transform').clone() : null
      if (original) {
        if (t instanceof Snap.Matrix) {
          if (append) {
            this.transform(original.add(t))
          } else {
            this.transform(t.add(original))
          }
        } else {
          if (append) {
            this.transform(original)
            this.transform(t)
          } else {
            this.transform(t)
            this.transform(original)
          }
        }
      } else {
        this.transform(t)
      }
    }
  }
})
