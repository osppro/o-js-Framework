(()=>{var t={976:()=>{}},e={};function o(n){var a=e[n];if(void 0!==a)return a.exports;var r=e[n]={exports:{}};return t[n](r,r.exports,o),r.exports}o.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return o.d(e,{a:e}),e},o.d=(t,e)=>{for(var n in e)o.o(e,n)&&!o.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},o.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{"use strict";var t=o(976);class e extends t.OComponent{template(t){return'\n      <h1>[data.title]</h1>\n      <p>[data.content]</p>\n      <a href="#" onclick="o.navigate(\'/about\')">Go to About</a>\n    '}}class n extends t.OComponent{template(t){return'\n      <h1>[data.title]</h1>\n      <p>[data.content]</p>\n      <a href="#" onclick="o.navigate(\'/\')">Go to Home</a>\n    '}}const a=new t.O("/o-js-Framework");a.component("HomeComponent",e),a.component("AboutComponent",n),a.route("/","HomeComponent"),a.route("/about","AboutComponent"),a.setDefaultRoute("HomeComponent"),a.data({title:"Welcome to O.js",content:"This is the home page."}),a.mount((()=>{console.log("Application mounted")}))})()})();