const path = require("path");
const fs = require("fs");
const compile = require("vue-template-compiler");

import stylus from "stylus";
import sass from "sass";
import less from "less";
import { v4 as uuidv4 } from "uuid";

const tagToUuid = (tpl, id) => {
  var pattern = /<[^\/]("[^"]*"|'[^']*'|[^'">])*>/g;
  return tpl.replace(pattern, ($1) => {
    return $1.replace(/<([\w\-]+)/i, ($2, $3) => `<${$3} data-u-${id}`);
  });
};

const formatStyl = (sty, css, componentId) => {
  let cssText = css;
  if (sty.scoped) {
    cssText = css.replace(/[\.\w\>\s]+{/g, ($1) => {
      if (/>>>/.test($1))
        return $1.replace(/\s+>>>/, `[data-u-${componentId}]`);
      return $1.replace(/\s+{/g, ($2) => `[data-u-${componentId}]${$2}`);
    });
  }
  return cssText;
};

const $require = (filepath, scriptContext) => {
  const filename = path.resolve(__dirname, `../${filepath}`);
  let code = scriptContext ? scriptContext : fs.readFileSync(filename, "utf-8");
  code = code.replace(/export default\s+/, 'return ');
  let data = (new Function(code))()
  return data;
};

const getComponentOption = (sfc) => {
  // 生成data-u-id
  const componentId = uuidv4();
  // 标签添加data-u-id属性
  const template = sfc.template
    ? tagToUuid(sfc.template.content, componentId)
    : "";
  // 转化style（less、sass、stylus）
  let styles = [];
  sfc.styles.forEach((sty) => {
    switch (sty.lang) {
      case "stylus":
        stylus.render(sty.content, (err, css) =>
          styles.push(formatStyl(sty, css, componentId))
        );
        break;
      case "sass":
      case "scss":
        styles.push(
          formatStyl(
            sty,
            sass.renderSync({ data: sty.content }).css.toString(),
            componentId
          )
        );
        break;
      case "less":
        less.render(sty.content, (err, css) =>
          styles.push(formatStyl(sty, css, componentId))
        );
        break;
    }
  });
  let options = {
    script: sfc.script ? $require(null, sfc.script.content) : {},
    styles,
    template,
  };
  // console.log(options)
  return JSON.stringify(options, (k, v) => {
    if (typeof v === "function") {
      let _fn = v.toString();
      return /^function()/.test(_fn) ? _fn : _fn.replace(/^/, "function ");
    }
    return v;
  });
};

const sfc_path = path.join(__dirname, "/vue-component", "/test.vue");
const sfc_str = fs.readFileSync(sfc_path, "utf-8");
let sfc = compile.parseComponent(sfc_str);
const remote = getComponentOption(sfc);

const express = require('express')
const app = express()
const port = 3000

app.get('/template', (req, res) => {
  res.send(remote)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// use

// <component :is="remote"></component>

// created() {
//   axios.get('/template').then((res) => {
//     const options = this.parseObj(res.data)
//     options.styles.forEach((css) => this.appendSty(css))
//     this.remote = Vue.extend({
//       ...options.script,
//       name: options.script.name || '',
//       template: options.template
//     })
//   })
// }

// const sfc =
//       '{"script":{"name":"Test","components":{},"props":{},"computed":{},"data":"function data() {return {msg: \'oumq\'}}","created":"function created() {}","mounted":"function mounted() {}","methods":{}},"styles":[".my_div[data-u-9a65bb0f-3363-4bfd-bfdb-28eab2098a62] {width: 100vh;height: 100vh;}.my_div .my_h1[data-u-9a65bb0f-3363-4bfd-bfdb-28eab2098a62] {color: red;}.my_div .my_p[data-u-9a65bb0f-3363-4bfd-bfdb-28eab2098a62] {padding: 20px 0;}.my_div .my_p .my_span[data-u-9a65bb0f-3363-4bfd-bfdb-28eab2098a62] {font-size: 24px;}"],"template":"<div data-u-9a65bb0f-3363-4bfd-bfdb-28eab2098a62 class=\'my_div\'><h1 data-u-9a65bb0f-3363-4bfd-bfdb-28eab2098a62 class=\'my_h1\'>Hello world</h1><p data-u-9a65bb0f-3363-4bfd-bfdb-28eab2098a62 class=\'my_p\'><span data-u-9a65bb0f-3363-4bfd-bfdb-28eab2098a62 class=\'my_span\'>{{ msg }}</span></p></div>"}'
//     const options = this.parseObj(JSON.parse(sfc))
//     options.styles.forEach((css) => this.appendSty(css))
//     console.log(options)
//     this.remote = Vue.extend({
//       ...options.script,
//       name: options.script.name || '',
//       template: options.template
//     })

// methods: {
//   isObject(v) {
//     return Object.prototype.toString.call(v).includes('Object')
//   },
//   parseObj(data) {
//     if (Array.isArray(data)) return data.map((row) => this.parseObj(row))
//     if (this.isObject(data)) {
//       const ret = {}
//       for (const k in data) {
//         ret[k] = this.parseObj(data[k])
//       }
//       return ret
//     }
//     try {
//       const pattern = /function ([\w]+)\(\) \{ \[native code\] \}/
//       if (pattern.test(data)) {
//         return window[pattern.exec(data)[1]]
//       } else {
//         const evalData = eval(`(${data})`)
//         return typeof evalData === 'function' ? evalData : data
//       }
//     } catch (err) {
//       return data
//     }
//   },
//   appendSty(css) {
//     // 生成组件样式
//     const style = document.createElement('style')
//     style.setAttribute('type', 'text/css')
//     var cssText = document.createTextNode(css)
//     style.appendChild(cssText)
//     var head = document.querySelector('head')
//     head.appendChild(style)
//   }
// }
