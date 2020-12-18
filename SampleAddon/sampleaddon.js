"use strict";

// Add global section to register addon actions if it doesn't exist yet
if (typeof window.addons == "undefined")
  window.addons = {}

window.addons.addonMenuSampleAddon = {
  function1: function () {
    alert('Function 1');
  },

  function2: function () {
    alert('Function 2');
  },
}