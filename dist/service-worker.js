if(!self.define){let s,e={};const l=(l,i)=>(l=new URL(l+".js",i).href,e[l]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=l,s.onload=e,document.head.appendChild(s)}else s=l,importScripts(l),e()})).then((()=>{let s=e[l];if(!s)throw new Error(`Module ${l} didn’t register its module`);return s})));self.define=(i,n)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let o={};const u=s=>l(s,r),c={module:{uri:r},exports:o,require:u};e[r]=Promise.all(i.map((s=>c[s]||u(s)))).then((s=>(n(...s),o)))}}define(["./workbox-5b385ed2"],(function(s){"use strict";s.setCacheNameDetails({prefix:"ssm-saas"}),self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"/css/749.54fe6a5c.css",revision:null},{url:"/css/app.4d3911e6.css",revision:null},{url:"/img/logo.21cfd04d.png",revision:null},{url:"/index.html",revision:"7a4cc733e275ed8eab7bd32bd62c1613"},{url:"/js/12.5047481c.js",revision:null},{url:"/js/197.1318710f.js",revision:null},{url:"/js/39.c09d3e39.js",revision:null},{url:"/js/59.ca8d9592.js",revision:null},{url:"/js/749.dd5824a7.js",revision:null},{url:"/js/859.32b31ccf.js",revision:null},{url:"/js/913.dfbe6520.js",revision:null},{url:"/js/924.b4912ae5.js",revision:null},{url:"/js/942.9b125513.js",revision:null},{url:"/js/app.2c003e6b.js",revision:null},{url:"/js/chunk-vendors.797fcd80.js",revision:null},{url:"/manifest.json",revision:"49c5cfc274bef401a5be48e6159539db"},{url:"/robots.txt",revision:"b6216d61c03e6ce0c9aea6ca7808f7ca"}],{})}));
//# sourceMappingURL=service-worker.js.map