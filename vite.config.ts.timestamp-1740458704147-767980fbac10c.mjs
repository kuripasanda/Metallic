// vite.config.ts
import { defineConfig } from "file:///C:/Users/ytkur/Downloads/s/Metallic/Metallic/node_modules/vite/dist/node/index.js";
import preact from "file:///C:/Users/ytkur/Downloads/s/Metallic/Metallic/node_modules/@preact/preset-vite/dist/esm/index.mjs";
import { ChemicalVitePlugin } from "file:///C:/Users/ytkur/Downloads/s/Metallic/Metallic/node_modules/chemicaljs/dist/index.js";
import { ViteMinifyPlugin } from "file:///C:/Users/ytkur/Downloads/s/Metallic/Metallic/node_modules/vite-plugin-minify/dist/index.js";

// src/util/generateFileVite.ts
import fs, { writeFile } from "fs";
import path, { resolve, relative } from "path";
import ejs from "file:///C:/Users/ytkur/Downloads/s/Metallic/Metallic/node_modules/ejs/lib/ejs.js";
import * as mime from "file:///C:/Users/ytkur/Downloads/s/Metallic/Metallic/node_modules/mime-types/index.js";
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}
var listTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Generate File List</title>
<body>
<h1>Generate File List</h1>
<div>
    <ul>
        <% Object.keys(generateFiles).forEach(key => { %>
            <li><a href='<%= key %>'><%= generateFiles[key].output %></a></li>
        <% }) %>
    </ul>
</div>
</body>
</html>
`;
var config;
var distPath;
var generateFileMap = /* @__PURE__ */ new Map();
function normalizeOption(option) {
  const generateFileOption = {
    output: "./output.txt",
    template: "",
    ...option
  };
  const fullPath = resolve(distPath, generateFileOption.output);
  const relativePath = `/${relative(distPath, fullPath)}`;
  const contentType = generateFileOption.contentType || mime.lookup(generateFileOption.output || "") || "text/plain";
  return {
    ...generateFileOption,
    contentType,
    fullPath,
    relativePath
  };
}
function generateContent(option) {
  return option.data;
}
function generateFile(option) {
  const filePath = option.fullPath;
  const fileContent = generateContent(option);
  ensureDirectoryExistence(filePath);
  writeFile(filePath, fileContent, { flag: "w" }, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Generate File to ${filePath}`);
  });
}
function configureServer(server) {
  server.middlewares.use("/__generate_file_list", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(
      ejs.render(listTemplate, {
        generateFiles: Object.fromEntries(generateFileMap)
      })
    );
    res.end();
  });
  server.middlewares.use((req, res, next) => {
    const uri = new URL(req.originalUrl, `http://${req.headers.host}`);
    const pathname = uri.pathname;
    if (generateFileMap.has(pathname)) {
      const option = generateFileMap.get(pathname);
      const content = generateContent(option);
      res.writeHead(200, {
        "Content-Type": option.contentType
      });
      res.write(content);
      res.end();
    } else {
      next();
    }
  });
  const _print = server.printUrls;
  server.printUrls = () => {
    let host = `${config.server.https ? "https" : "http"}://localhost:${config.server.port || "80"}`;
    const url = server.resolvedUrls?.local[0];
    if (url) {
      try {
        const u = new URL(url);
        host = `${u.protocol}//${u.host}`;
      } catch (error) {
        console.warn("Parse resolved url failed:", error);
      }
    }
    _print();
    const colorUrl = (url2) => url2.replace(/:(\d+)\//, (_, port) => `:${port}/`);
    console.log(
      `  ${"\u279C"}  ${"Generate File List"}: ${colorUrl(
        `${host}/__generate_file_list/`
      )}`
    );
  };
}
function PluginGenerateFile(options) {
  return {
    name: "vite-plugin-generate-file",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      distPath = resolve(config.root, config.build.outDir);
      if (Array.isArray(options)) {
        options.forEach((option) => {
          const simpleOption = normalizeOption(option);
          generateFileMap.set(simpleOption.relativePath, simpleOption);
        });
      } else {
        const simpleOption = normalizeOption(options);
        generateFileMap.set(simpleOption.relativePath, simpleOption);
      }
    },
    closeBundle() {
      if (config.command === "serve") {
        return;
      }
      for (const option of generateFileMap.values()) {
        generateFile(option);
      }
    },
    configureServer
  };
}

// src/util/generateThemes.ts
function generateProperties(items, variables = false) {
  const varAdd = variables ? "--" : "";
  return Object.entries(items).map((prop) => {
    return "	" + varAdd + prop[0] + ": " + prop[1] + ";";
  }).join("\n");
}
function generateCustomStyle(custom, id) {
  if (!custom) {
    return "";
  }
  return Object.entries(custom).map((item) => {
    return '\n\nbody[data-theme="' + id + '"] ' + item[0] + " {\n" + generateProperties(item[1]) + "\n}";
  }).join("\n");
}
function generateThemes(themes) {
  return themes.map((theme) => {
    return 'body[data-theme="' + theme.id + '"] {\n' + generateProperties(theme.theme, true) + "\n}" + generateCustomStyle(theme.custom, theme.id);
  }).join("\n\n");
}

// src/themes.json
var themes_default = [
  {
    name: "Default",
    id: "default",
    theme: {
      background: "#0c1618",
      secondary: "#002931",
      primary: "#2a7152",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Winter",
    id: "winter",
    theme: {
      background: "#d8dee9",
      secondary: "#c2c7d1",
      primary: "#004953",
      text: "black",
      textInverse: "black",
      font: "Roboto"
    }
  },
  {
    name: "3kh0",
    id: "echo",
    theme: {
      background: "#1c1c1c",
      secondary: "#333333",
      primary: "#4caf50",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    },
    custom: {
      ".nav": {
        "box-shadow": "0 5px 200px var(--primary)"
      }
    }
  },
  {
    name: "Lime",
    id: "lime",
    theme: {
      background: "#0c1618",
      secondary: "#002931",
      primary: "#32CD32",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Space",
    id: "space",
    theme: {
      background: "#121212",
      secondary: "#1a1a1a",
      primary: "#662d91",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Molten",
    id: "molten",
    theme: {
      background: "black",
      secondary: "#211414",
      primary: "#ff6868",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "EagleNet",
    id: "eaglenet",
    theme: {
      background: "linear-gradient(to right, #665fd2, #9824d3)",
      secondary: "#9b219b",
      primary: "#4d004d",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Honey",
    id: "honey",
    theme: {
      background: "#ffa15f",
      secondary: "#f2883e",
      primary: "black",
      text: "black",
      textInverse: "black",
      font: "Roboto"
    }
  },
  {
    name: "Swamp",
    id: "swamp",
    theme: {
      background: "#006072",
      secondary: "#004755",
      primary: "#15fc95",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Ruby",
    id: "ruby",
    theme: {
      background: "#0c1618",
      secondary: "#002931",
      primary: "#c01c73",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Squid",
    id: "squid",
    theme: {
      background: "#0c1618",
      secondary: "#002931",
      primary: "#00b0f4",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Lemon",
    id: "lemon",
    theme: {
      background: "#0c1618",
      secondary: "#002931",
      primary: "#feeb01",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Connection",
    id: "connection",
    theme: {
      background: "#1c1b29",
      secondary: "#2e835c",
      primary: "#99ffd0",
      text: "#43b581",
      textInverse: "#1c1b29",
      font: "Roboto"
    }
  },
  {
    name: "Dune",
    id: "dune",
    theme: {
      background: "#d2c59d",
      secondary: "#7d7259",
      primary: "#282425",
      text: "#282425",
      textInverse: "#282425",
      font: "Roboto"
    }
  },
  {
    name: "Ice",
    id: "ice",
    theme: {
      background: "#e8e8ea",
      secondary: "#cacae2",
      primary: "#005882",
      text: "black",
      textInverse: "black",
      font: "Roboto"
    }
  },
  {
    name: "Campfire",
    id: "campfire",
    theme: {
      background: "#333538",
      secondary: "#232528",
      primary: "#f17755",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Butter",
    id: "butter",
    theme: {
      background: "#f7d5c5",
      secondary: "#e79974",
      primary: "#ff5200",
      text: "black",
      textInverse: "black",
      font: "Roboto"
    }
  },
  {
    name: "Box",
    id: "box",
    theme: {
      background: "#282828",
      secondary: "#000000",
      primary: "#fdf4c1",
      text: "#fdf4c1",
      textInverse: "#fdf4c1",
      font: "Roboto"
    }
  },
  {
    name: "Blackpink",
    id: "blackpink",
    theme: {
      background: "black",
      secondary: "#202020",
      primary: "#f8708c",
      text: "#f8708c",
      textInverse: "#f8708c",
      font: "Roboto"
    }
  },
  {
    name: "Infinity",
    id: "infinity",
    theme: {
      background: "#030b11",
      secondary: "#0f4a7a",
      primary: "#008dff",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Fracital",
    id: "fracital",
    theme: {
      background: "#222",
      secondary: "#333",
      primary: "#f971e4",
      text: "#f971e4",
      textInverse: "#f971e4",
      font: "Roboto"
    }
  },
  {
    name: "Baja Blast",
    id: "baja-blast",
    theme: {
      background: "#3b8680",
      secondary: "#225450",
      primary: "#00d5c4",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Tsunami",
    id: "tsunami",
    theme: {
      background: "#121212",
      secondary: "#292929",
      primary: "#2493ff",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Chrome",
    id: "chrome",
    theme: {
      background: "#3c3c3c",
      secondary: "#2a2a2a",
      primary: "#abc6ff",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "TikTok",
    id: "tiktok",
    theme: {
      background: "#121212",
      secondary: "#292929",
      primary: "#ff3b5c",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Kahoot",
    id: "kahoot",
    theme: {
      background: "#381272",
      secondary: "#623d9a",
      primary: "white",
      text: "white",
      textInverse: "white",
      font: "Montserrat"
    }
  },
  {
    name: "Nebelung",
    id: "nebelung",
    theme: {
      background: "#dabc9a",
      secondary: "#190f05",
      primary: "#85684b",
      text: "#190f05",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Simple",
    id: "simple",
    theme: {
      background: "#18191c",
      secondary: "#292b2f",
      primary: "white",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Nord",
    id: "nord",
    theme: {
      background: "#2E3440 /* nord0 */",
      secondary: "#3B4252 /* nord1 */",
      primary: "#81A1C1 /* nord9 */",
      text: "#E5E9F0 /* nord5 */",
      textInverse: "#E5E9F0 /* nord5 */",
      font: "Roboto"
    }
  },
  {
    name: "Nord Green",
    id: "nord-green",
    theme: {
      background: "#2E3440 /* nord0 */",
      secondary: "#3B4252 /* nord1 */",
      primary: "#8FBCBB /* nord7 */",
      text: "#E5E9F0 /* nord5 */",
      textInverse: "#E5E9F0 /* nord5 */",
      font: "Roboto"
    }
  },
  {
    name: "Ros\xE9 Pine",
    id: "rose-pine",
    theme: {
      background: "#191724 /* Base */",
      secondary: "#26233a /* Overlay */",
      primary: "#c4a7e7 /* Text */",
      text: "#e0def4 /* Text */",
      textInverse: "#e0def4  /* Iris */",
      font: "Roboto"
    }
  },
  {
    name: "Hub",
    id: "hub",
    theme: {
      background: "black",
      secondary: "#ff9000",
      primary: "black",
      text: "white",
      textInverse: "black",
      font: "Arial"
    },
    custom: {
      ".logo": {
        "--primary": "var(--secondary)"
      },
      ".button:not(.activeButton)": {
        "--primary": "var(--secondary)"
      },
      ".settingsButton:not(.settingsButtonActive)": {
        "--primary": "var(--secondary)"
      }
    }
  },
  {
    name: "Hacker",
    id: "hacker",
    theme: {
      background: "#090909",
      secondary: "#232323",
      primary: "#7de38d",
      text: "#7de38d",
      textInverse: "#7de38d",
      font: "JetBrains Mono"
    },
    custom: {
      ".title": {
        "font-family": "JetBrains Mono"
      }
    }
  },
  {
    name: "Cobalt",
    id: "cobalt",
    theme: {
      background: "#030303",
      secondary: "#09283e",
      primary: "#0095ff",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Catppuccin Mocha",
    id: "catppuccin-mocha",
    theme: {
      background: "#1e1e2e /* Base */",
      secondary: "#313244 /* Surface0 */",
      primary: "#89b4fa /* Blue */",
      text: "#cdd6f4 /* Text */",
      textInverse: "#cdd6f4 /* Text */",
      font: "Roboto"
    }
  },
  {
    name: "Catppuccin Macchiato",
    id: "catppuccin-macchiato",
    theme: {
      background: "#24273a /* Base */",
      secondary: "#363a4f /* Surface0 */",
      primary: "#8aadf4 /* Blue */",
      text: "#cad3f5 /* Text */",
      textInverse: "#cad3f5 /* Text */",
      font: "Roboto"
    }
  },
  {
    name: "Catppuccin Frapp\xE9",
    id: "catppuccin-frappe",
    theme: {
      background: "#303446 /* Base */",
      secondary: "#414559 /* Surface0 */",
      primary: "#8caaee /* Blue */",
      text: "#c6d0f5 /* Text */",
      textInverse: "#c6d0f5 /* Text */",
      font: "Roboto"
    }
  },
  {
    name: "Catppuccin Latte",
    id: "catppuccin-latte",
    theme: {
      background: "#eff1f5 /* Base */",
      secondary: "#ccd0da /* Surface0 */",
      primary: "#1e66f5 /* Blue */",
      text: "#4c4f69 /* Text */",
      textInverse: "#4c4f69 /* Text */",
      font: "Roboto"
    }
  },
  {
    name: "Mercury Workshop",
    id: "hg",
    theme: {
      background: "#0b0f3d",
      secondary: "#3d4065",
      primary: "white",
      text: "white",
      textInverse: "white",
      font: "Space Grotesk"
    },
    custom: {
      ".logo svg": {
        filter: "drop-shadow(0 0 15px var(--primary))"
      }
    }
  },
  {
    name: "Ludicrous",
    id: "ludicrous",
    theme: {
      background: "#091b2c",
      secondary: "#114067",
      primary: "white",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Discord",
    id: "discord",
    theme: {
      background: "#313338",
      secondary: "#2B2D31",
      primary: "#5865F2",
      text: "white",
      textInverse: "white",
      font: "Open Sans"
    }
  },
  {
    name: "FlowOS",
    id: "flow",
    theme: {
      background: "#11111b",
      secondary: "#1e1e2e",
      primary: "#89B4FA",
      text: "#cdd6f4",
      textInverse: "#cdd6f4",
      font: "monospace"
    },
    custom: {
      "": {
        "font-size": "16px"
      }
    }
  },
  {
    name: "Bubblegum",
    id: "bubblegum",
    theme: {
      background: "#EE6176",
      secondary: "#F58092",
      primary: "#ffc1cc",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Noctura",
    id: "noctura",
    theme: {
      background: "black",
      secondary: "#242424",
      primary: "white",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    },
    custom: {
      ".title": {
        "font-family": "Major Mono Display"
      }
    }
  },
  {
    name: "VS Code",
    id: "vscode",
    theme: {
      background: "#1f1f1f",
      secondary: "#181818",
      primary: "#0078d4",
      text: "#CCC",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Pride",
    id: "pride",
    theme: {
      background: "linear-gradient(180deg, #FE0000 16.66%, #FD8C00 16.66%, 33.32%, #FFE500 33.32%, 49.98%, #119F0B 49.98%, 66.64%, #0644B3 66.64%, 83.3%, #C22EDC 83.3%), #000000c4",
      secondary: "white",
      primary: "black",
      text: "black",
      textInverse: "black",
      font: "Roboto"
    },
    custom: {
      "": {
        "background-attachment": "fixed"
      }
    }
  },
  {
    name: "Immortal",
    id: "immortal",
    theme: {
      background: "linear-gradient(120deg, rgba(01,06,15,1) 21%, rgba(01,21,49,1) 97%)",
      secondary: "#1E293B",
      primary: "#155E75",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Deep Sea",
    id: "deepsea",
    theme: {
      background: "#0a244a",
      secondary: "#051730",
      primary: "white",
      text: "white",
      textInverse: "white",
      font: "Roboto"
    }
  },
  {
    name: "Astro",
    id: "astro",
    theme: {
      background: "#2B1C3D",
      secondary: "#351E4F",
      primary: "purple",
      text: "white",
      textInverse: "#D88FD8",
      font: "Roboto"
    }
  },
  {
    name: "Greatsword",
    id: "greatsword",
    theme: {
      background: "#141414",
      secondary: "#222222",
      primary: "#636363",
      text: "#A9A9A9",
      textInverse: "#636363",
      font: "Roboto"
    }
  }
];

// vite.config.ts
var vite_config_default = defineConfig({
  build: {
    outDir: "build"
  },
  plugins: [
    ChemicalVitePlugin(),
    PluginGenerateFile([
      {
        contentType: "text/css",
        output: "themes.css",
        data: generateThemes(themes_default)
      }
    ]),
    ViteMinifyPlugin(),
    preact()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3V0aWwvZ2VuZXJhdGVGaWxlVml0ZS50cyIsICJzcmMvdXRpbC9nZW5lcmF0ZVRoZW1lcy50cyIsICJzcmMvdGhlbWVzLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dGt1clxcXFxEb3dubG9hZHNcXFxcc1xcXFxNZXRhbGxpY1xcXFxNZXRhbGxpY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxceXRrdXJcXFxcRG93bmxvYWRzXFxcXHNcXFxcTWV0YWxsaWNcXFxcTWV0YWxsaWNcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3l0a3VyL0Rvd25sb2Fkcy9zL01ldGFsbGljL01ldGFsbGljL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHByZWFjdCBmcm9tIFwiQHByZWFjdC9wcmVzZXQtdml0ZVwiO1xyXG5pbXBvcnQgeyBDaGVtaWNhbFZpdGVQbHVnaW4gfSBmcm9tIFwiY2hlbWljYWxqc1wiO1xyXG5pbXBvcnQgeyBWaXRlTWluaWZ5UGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLW1pbmlmeVwiO1xyXG4vL0B0cy1pZ25vcmVcclxuaW1wb3J0IHsgZ2VuZXJhdGVGaWxlIH0gZnJvbSBcIi4vc3JjL3V0aWwvZ2VuZXJhdGVGaWxlVml0ZVwiO1xyXG4vL0B0cy1pZ25vcmVcclxuaW1wb3J0IHsgZ2VuZXJhdGVUaGVtZXMgfSBmcm9tIFwiLi9zcmMvdXRpbC9nZW5lcmF0ZVRoZW1lc1wiO1xyXG5pbXBvcnQgdGhlbWVzIGZyb20gXCIuL3NyYy90aGVtZXMuanNvblwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuXHRidWlsZDoge1xyXG5cdFx0b3V0RGlyOiBcImJ1aWxkXCIsXHJcblx0fSxcclxuXHRwbHVnaW5zOiBbXHJcblx0XHRDaGVtaWNhbFZpdGVQbHVnaW4oKSxcclxuXHRcdGdlbmVyYXRlRmlsZShbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjb250ZW50VHlwZTogXCJ0ZXh0L2Nzc1wiLFxyXG5cdFx0XHRcdG91dHB1dDogXCJ0aGVtZXMuY3NzXCIsXHJcblx0XHRcdFx0ZGF0YTogZ2VuZXJhdGVUaGVtZXModGhlbWVzKSxcclxuXHRcdFx0fSxcclxuXHRcdF0pLFxyXG5cdFx0Vml0ZU1pbmlmeVBsdWdpbigpLFxyXG5cdFx0cHJlYWN0KCksXHJcblx0XSxcclxufSk7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxceXRrdXJcXFxcRG93bmxvYWRzXFxcXHNcXFxcTWV0YWxsaWNcXFxcTWV0YWxsaWNcXFxcc3JjXFxcXHV0aWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHl0a3VyXFxcXERvd25sb2Fkc1xcXFxzXFxcXE1ldGFsbGljXFxcXE1ldGFsbGljXFxcXHNyY1xcXFx1dGlsXFxcXGdlbmVyYXRlRmlsZVZpdGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3l0a3VyL0Rvd25sb2Fkcy9zL01ldGFsbGljL01ldGFsbGljL3NyYy91dGlsL2dlbmVyYXRlRmlsZVZpdGUudHNcIjsvKipcclxuICogTW9kaWZpZWQgZnJvbSBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS92aXRlLXBsdWdpbi1nZW5lcmF0ZS1maWxlXHJcbiAqL1xyXG5cclxuaW1wb3J0IGZzLCB7IHdyaXRlRmlsZSB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHBhdGgsIHsgcmVzb2x2ZSwgcmVsYXRpdmUgfSBmcm9tICdwYXRoJztcclxuLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgZWpzIGZyb20gJ2Vqcyc7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0ICogYXMgbWltZSBmcm9tICdtaW1lLXR5cGVzJztcclxuXHJcbmZ1bmN0aW9uIGVuc3VyZURpcmVjdG9yeUV4aXN0ZW5jZShmaWxlUGF0aDogYW55KSB7XHJcbiAgICBjb25zdCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcclxuICAgIGlmIChmcy5leGlzdHNTeW5jKGRpcm5hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZW5zdXJlRGlyZWN0b3J5RXhpc3RlbmNlKGRpcm5hbWUpO1xyXG4gICAgZnMubWtkaXJTeW5jKGRpcm5hbWUpO1xyXG59XHJcblxyXG5jb25zdCBsaXN0VGVtcGxhdGUgPSBcIjwhRE9DVFlQRSBodG1sPlxcbjxodG1sIGxhbmc9XFxcImVuXFxcIj5cXG48aGVhZD5cXG4gICAgPG1ldGEgY2hhcnNldD1cXFwiVVRGLThcXFwiPlxcbiAgICA8dGl0bGU+R2VuZXJhdGUgRmlsZSBMaXN0PC90aXRsZT5cXG48Ym9keT5cXG48aDE+R2VuZXJhdGUgRmlsZSBMaXN0PC9oMT5cXG48ZGl2PlxcbiAgICA8dWw+XFxuICAgICAgICA8JSBPYmplY3Qua2V5cyhnZW5lcmF0ZUZpbGVzKS5mb3JFYWNoKGtleSA9PiB7ICU+XFxuICAgICAgICAgICAgPGxpPjxhIGhyZWY9JzwlPSBrZXkgJT4nPjwlPSBnZW5lcmF0ZUZpbGVzW2tleV0ub3V0cHV0ICU+PC9hPjwvbGk+XFxuICAgICAgICA8JSB9KSAlPlxcbiAgICA8L3VsPlxcbjwvZGl2PlxcbjwvYm9keT5cXG48L2h0bWw+XFxuXCI7XHJcblxyXG5sZXQgY29uZmlnOiBhbnk7XHJcbmxldCBkaXN0UGF0aDogYW55O1xyXG5jb25zdCBnZW5lcmF0ZUZpbGVNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xyXG5mdW5jdGlvbiBub3JtYWxpemVPcHRpb24ob3B0aW9uOiBhbnkpIHtcclxuICAgIGNvbnN0IGdlbmVyYXRlRmlsZU9wdGlvbiA9IHtcclxuICAgICAgICBvdXRwdXQ6IFwiLi9vdXRwdXQudHh0XCIsXHJcbiAgICAgICAgdGVtcGxhdGU6IFwiXCIsXHJcbiAgICAgICAgLi4ub3B0aW9uXHJcbiAgICB9O1xyXG4gICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlKGRpc3RQYXRoLCBnZW5lcmF0ZUZpbGVPcHRpb24ub3V0cHV0KTtcclxuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGAvJHtyZWxhdGl2ZShkaXN0UGF0aCwgZnVsbFBhdGgpfWA7XHJcbiAgICBjb25zdCBjb250ZW50VHlwZSA9IGdlbmVyYXRlRmlsZU9wdGlvbi5jb250ZW50VHlwZSB8fCBtaW1lLmxvb2t1cChnZW5lcmF0ZUZpbGVPcHRpb24ub3V0cHV0IHx8IFwiXCIpIHx8IFwidGV4dC9wbGFpblwiO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAuLi5nZW5lcmF0ZUZpbGVPcHRpb24sXHJcbiAgICAgICAgY29udGVudFR5cGUsXHJcbiAgICAgICAgZnVsbFBhdGgsXHJcbiAgICAgICAgcmVsYXRpdmVQYXRoXHJcbiAgICB9O1xyXG59XHJcbmZ1bmN0aW9uIGdlbmVyYXRlQ29udGVudChvcHRpb246IGFueSkge1xyXG4gICAgcmV0dXJuIG9wdGlvbi5kYXRhO1xyXG59XHJcbmZ1bmN0aW9uIGdlbmVyYXRlRmlsZShvcHRpb246IGFueSkge1xyXG4gICAgY29uc3QgZmlsZVBhdGggPSBvcHRpb24uZnVsbFBhdGg7XHJcbiAgICBjb25zdCBmaWxlQ29udGVudCA9IGdlbmVyYXRlQ29udGVudChvcHRpb24pO1xyXG4gICAgZW5zdXJlRGlyZWN0b3J5RXhpc3RlbmNlKGZpbGVQYXRoKTtcclxuICAgIHdyaXRlRmlsZShmaWxlUGF0aCwgZmlsZUNvbnRlbnQsIHsgZmxhZzogXCJ3XCIgfSwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZyhgR2VuZXJhdGUgRmlsZSB0byAke2ZpbGVQYXRofWApO1xyXG4gICAgfSk7XHJcbn1cclxuZnVuY3Rpb24gY29uZmlndXJlU2VydmVyKHNlcnZlcjogYW55KSB7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKFwiL19fZ2VuZXJhdGVfZmlsZV9saXN0XCIsIChyZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcclxuICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvaHRtbFwiIH0pO1xyXG4gICAgICAgIHJlcy53cml0ZShcclxuICAgICAgICAgICAgZWpzLnJlbmRlcihsaXN0VGVtcGxhdGUsIHtcclxuICAgICAgICAgICAgICAgIGdlbmVyYXRlRmlsZXM6IE9iamVjdC5mcm9tRW50cmllcyhnZW5lcmF0ZUZpbGVNYXApXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXMuZW5kKCk7XHJcbiAgICB9KTtcclxuICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdXJpID0gbmV3IFVSTChyZXEub3JpZ2luYWxVcmwsIGBodHRwOi8vJHtyZXEuaGVhZGVycy5ob3N0fWApO1xyXG4gICAgICAgIGNvbnN0IHBhdGhuYW1lID0gdXJpLnBhdGhuYW1lO1xyXG4gICAgICAgIGlmIChnZW5lcmF0ZUZpbGVNYXAuaGFzKHBhdGhuYW1lKSkge1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSBnZW5lcmF0ZUZpbGVNYXAuZ2V0KHBhdGhuYW1lKTtcclxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGdlbmVyYXRlQ29udGVudChvcHRpb24pO1xyXG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xyXG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogb3B0aW9uLmNvbnRlbnRUeXBlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXMud3JpdGUoY29udGVudCk7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBfcHJpbnQgPSBzZXJ2ZXIucHJpbnRVcmxzO1xyXG4gICAgc2VydmVyLnByaW50VXJscyA9ICgpID0+IHtcclxuICAgICAgICBsZXQgaG9zdCA9IGAke2NvbmZpZy5zZXJ2ZXIuaHR0cHMgPyBcImh0dHBzXCIgOiBcImh0dHBcIn06Ly9sb2NhbGhvc3Q6JHtjb25maWcuc2VydmVyLnBvcnQgfHwgXCI4MFwifWA7XHJcbiAgICAgICAgY29uc3QgdXJsID0gc2VydmVyLnJlc29sdmVkVXJscz8ubG9jYWxbMF07XHJcbiAgICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdSA9IG5ldyBVUkwodXJsKTtcclxuICAgICAgICAgICAgICAgIGhvc3QgPSBgJHt1LnByb3RvY29sfS8vJHt1Lmhvc3R9YDtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlBhcnNlIHJlc29sdmVkIHVybCBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBfcHJpbnQoKTtcclxuICAgICAgICBjb25zdCBjb2xvclVybCA9ICh1cmwyOiBhbnkpID0+IHVybDIucmVwbGFjZSgvOihcXGQrKVxcLy8sIChfOiBhbnksIHBvcnQ6IGFueSkgPT4gYDoke3BvcnR9L2ApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICBgICAke1wiXFx1Mjc5Q1wifSAgJHtcIkdlbmVyYXRlIEZpbGUgTGlzdFwifTogJHtjb2xvclVybChcclxuICAgICAgICAgICAgICAgIGAke2hvc3R9L19fZ2VuZXJhdGVfZmlsZV9saXN0L2BcclxuICAgICAgICAgICAgKX1gXHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcbn1cclxuZnVuY3Rpb24gUGx1Z2luR2VuZXJhdGVGaWxlKG9wdGlvbnM6IGFueSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuYW1lOiBcInZpdGUtcGx1Z2luLWdlbmVyYXRlLWZpbGVcIixcclxuICAgICAgICBjb25maWdSZXNvbHZlZChyZXNvbHZlZENvbmZpZzogYW55KSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHJlc29sdmVkQ29uZmlnO1xyXG4gICAgICAgICAgICBkaXN0UGF0aCA9IHJlc29sdmUoY29uZmlnLnJvb3QsIGNvbmZpZy5idWlsZC5vdXREaXIpO1xyXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW1wbGVPcHRpb24gPSBub3JtYWxpemVPcHRpb24ob3B0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUZpbGVNYXAuc2V0KHNpbXBsZU9wdGlvbi5yZWxhdGl2ZVBhdGgsIHNpbXBsZU9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNpbXBsZU9wdGlvbiA9IG5vcm1hbGl6ZU9wdGlvbihvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGdlbmVyYXRlRmlsZU1hcC5zZXQoc2ltcGxlT3B0aW9uLnJlbGF0aXZlUGF0aCwgc2ltcGxlT3B0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2VCdW5kbGUoKSB7XHJcbiAgICAgICAgICAgIGlmIChjb25maWcuY29tbWFuZCA9PT0gXCJzZXJ2ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGdlbmVyYXRlRmlsZU1hcC52YWx1ZXMoKSkge1xyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVGaWxlKG9wdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbmZpZ3VyZVNlcnZlclxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IHsgUGx1Z2luR2VuZXJhdGVGaWxlIGFzIGdlbmVyYXRlRmlsZSB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxceXRrdXJcXFxcRG93bmxvYWRzXFxcXHNcXFxcTWV0YWxsaWNcXFxcTWV0YWxsaWNcXFxcc3JjXFxcXHV0aWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHl0a3VyXFxcXERvd25sb2Fkc1xcXFxzXFxcXE1ldGFsbGljXFxcXE1ldGFsbGljXFxcXHNyY1xcXFx1dGlsXFxcXGdlbmVyYXRlVGhlbWVzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy95dGt1ci9Eb3dubG9hZHMvcy9NZXRhbGxpYy9NZXRhbGxpYy9zcmMvdXRpbC9nZW5lcmF0ZVRoZW1lcy50c1wiO2Z1bmN0aW9uIGdlbmVyYXRlUHJvcGVydGllcyhpdGVtczogYW55LCB2YXJpYWJsZXMgPSBmYWxzZSkge1xyXG4gICAgY29uc3QgdmFyQWRkID0gdmFyaWFibGVzID8gXCItLVwiIDogXCJcIlxyXG5cclxuICAgIHJldHVybiBPYmplY3QuZW50cmllcyhpdGVtcykubWFwKChwcm9wKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIFwiXFx0XCIgKyB2YXJBZGQgKyBwcm9wWzBdICsgXCI6IFwiICsgcHJvcFsxXSArIFwiO1wiXHJcbiAgICB9KS5qb2luKFwiXFxuXCIpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQ3VzdG9tU3R5bGUoY3VzdG9tOiBhbnksIGlkOiBhbnkpIHtcclxuICAgIGlmICghY3VzdG9tKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiXCJcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMoY3VzdG9tKS5tYXAoKGl0ZW0pID0+IHtcclxuICAgICAgICByZXR1cm4gXCJcXG5cXG5ib2R5W2RhdGEtdGhlbWU9XFxcIlwiICsgaWQgKyBcIlxcXCJdIFwiICsgaXRlbVswXSArIFwiIHtcXG5cIiArIGdlbmVyYXRlUHJvcGVydGllcyhpdGVtWzFdKSArIFwiXFxufVwiXHJcbiAgICB9KS5qb2luKFwiXFxuXCIpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlVGhlbWVzKHRoZW1lczogYW55KSB7XHJcbiAgICByZXR1cm4gdGhlbWVzLm1hcCgodGhlbWU6IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBcImJvZHlbZGF0YS10aGVtZT1cXFwiXCIgKyB0aGVtZS5pZCArIFwiXFxcIl0ge1xcblwiICsgZ2VuZXJhdGVQcm9wZXJ0aWVzKHRoZW1lLnRoZW1lLCB0cnVlKSArIFwiXFxufVwiICsgZ2VuZXJhdGVDdXN0b21TdHlsZSh0aGVtZS5jdXN0b20sIHRoZW1lLmlkKVxyXG4gICAgfSkuam9pbihcIlxcblxcblwiKVxyXG59XHJcblxyXG5leHBvcnQgeyBnZW5lcmF0ZVRoZW1lcyB9OyIsICJbXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiRGVmYXVsdFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJkZWZhdWx0XCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMwYzE2MThcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMDAyOTMxXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMyYTcxNTJcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJXaW50ZXJcIixcclxuICAgICAgICBcImlkXCI6IFwid2ludGVyXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiNkOGRlZTlcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjYzJjN2QxXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMwMDQ5NTNcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiYmxhY2tcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcImJsYWNrXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCIza2gwXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImVjaG9cIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzFjMWMxY1wiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMzMzMzMzNcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiIzRjYWY1MFwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiY3VzdG9tXCI6IHtcclxuICAgICAgICAgICAgXCIubmF2XCI6IHtcclxuICAgICAgICAgICAgICAgIFwiYm94LXNoYWRvd1wiOiBcIjAgNXB4IDIwMHB4IHZhcigtLXByaW1hcnkpXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiTGltZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJsaW1lXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMwYzE2MThcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMDAyOTMxXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMzMkNEMzJcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJTcGFjZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJzcGFjZVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMTIxMjEyXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzFhMWExYVwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjNjYyZDkxXCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiTW9sdGVuXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIm1vbHRlblwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCJibGFja1wiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMyMTE0MTRcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiI2ZmNjg2OFwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkVhZ2xlTmV0XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImVhZ2xlbmV0XCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcImxpbmVhci1ncmFkaWVudCh0byByaWdodCwgIzY2NWZkMiwgIzk4MjRkMylcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjOWIyMTliXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiM0ZDAwNGRcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJIb25leVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJob25leVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjZmZhMTVmXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiI2YyODgzZVwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCJibGFja1wiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJibGFja1wiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwiYmxhY2tcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIlN3YW1wXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInN3YW1wXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMwMDYwNzJcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMDA0NzU1XCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMxNWZjOTVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJSdWJ5XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInJ1YnlcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzBjMTYxOFwiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMwMDI5MzFcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiI2MwMWM3M1wiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIlNxdWlkXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInNxdWlkXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMwYzE2MThcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMDAyOTMxXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMwMGIwZjRcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJMZW1vblwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJsZW1vblwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMGMxNjE4XCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzAwMjkzMVwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjZmVlYjAxXCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiQ29ubmVjdGlvblwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJjb25uZWN0aW9uXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMxYzFiMjlcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMmU4MzVjXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiM5OWZmZDBcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiIzQzYjU4MVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwiIzFjMWIyOVwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiRHVuZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJkdW5lXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiNkMmM1OWRcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjN2Q3MjU5XCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMyODI0MjVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiIzI4MjQyNVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwiIzI4MjQyNVwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiSWNlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImljZVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjZThlOGVhXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiI2NhY2FlMlwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjMDA1ODgyXCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcImJsYWNrXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCJibGFja1wiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiQ2FtcGZpcmVcIixcclxuICAgICAgICBcImlkXCI6IFwiY2FtcGZpcmVcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzMzMzUzOFwiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMyMzI1MjhcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiI2YxNzc1NVwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkJ1dHRlclwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJidXR0ZXJcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiI2Y3ZDVjNVwiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiNlNzk5NzRcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiI2ZmNTIwMFwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJibGFja1wiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwiYmxhY2tcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkJveFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJib3hcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzI4MjgyOFwiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMwMDAwMDBcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiI2ZkZjRjMVwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCIjZmRmNGMxXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCIjZmRmNGMxXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJCbGFja3BpbmtcIixcclxuICAgICAgICBcImlkXCI6IFwiYmxhY2twaW5rXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcImJsYWNrXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzIwMjAyMFwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjZjg3MDhjXCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIiNmODcwOGNcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIiNmODcwOGNcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkluZmluaXR5XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImluZmluaXR5XCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMwMzBiMTFcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMGY0YTdhXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMwMDhkZmZcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJGcmFjaXRhbFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmcmFjaXRhbFwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMjIyXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzMzM1wiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjZjk3MWU0XCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIiNmOTcxZTRcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIiNmOTcxZTRcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkJhamEgQmxhc3RcIixcclxuICAgICAgICBcImlkXCI6IFwiYmFqYS1ibGFzdFwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjM2I4NjgwXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzIyNTQ1MFwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjMDBkNWM0XCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiVHN1bmFtaVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJ0c3VuYW1pXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMxMjEyMTJcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMjkyOTI5XCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMyNDkzZmZcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJDaHJvbWVcIixcclxuICAgICAgICBcImlkXCI6IFwiY2hyb21lXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMzYzNjM2NcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMmEyYTJhXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiNhYmM2ZmZcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJUaWtUb2tcIixcclxuICAgICAgICBcImlkXCI6IFwidGlrdG9rXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMxMjEyMTJcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMjkyOTI5XCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiNmZjNiNWNcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJLYWhvb3RcIixcclxuICAgICAgICBcImlkXCI6IFwia2Fob290XCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMzODEyNzJcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjNjIzZDlhXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJNb250c2VycmF0XCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIk5lYmVsdW5nXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIm5lYmVsdW5nXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiNkYWJjOWFcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMTkwZjA1XCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiM4NTY4NGJcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiIzE5MGYwNVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIlNpbXBsZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJzaW1wbGVcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzE4MTkxY1wiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMyOTJiMmZcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJOb3JkXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIm5vcmRcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzJFMzQ0MCAvKiBub3JkMCAqL1wiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMzQjQyNTIgLyogbm9yZDEgKi9cIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiIzgxQTFDMSAvKiBub3JkOSAqL1wiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCIjRTVFOUYwIC8qIG5vcmQ1ICovXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCIjRTVFOUYwIC8qIG5vcmQ1ICovXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJOb3JkIEdyZWVuXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIm5vcmQtZ3JlZW5cIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzJFMzQ0MCAvKiBub3JkMCAqL1wiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMzQjQyNTIgLyogbm9yZDEgKi9cIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiIzhGQkNCQiAvKiBub3JkNyAqL1wiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCIjRTVFOUYwIC8qIG5vcmQ1ICovXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCIjRTVFOUYwIC8qIG5vcmQ1ICovXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJSb3NcdTAwRTkgUGluZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJyb3NlLXBpbmVcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzE5MTcyNCAvKiBCYXNlICovXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzI2MjMzYSAvKiBPdmVybGF5ICovXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiNjNGE3ZTcgLyogVGV4dCAqL1wiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCIjZTBkZWY0IC8qIFRleHQgKi9cIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIiNlMGRlZjQgIC8qIElyaXMgKi9cIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkh1YlwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJodWJcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiYmxhY2tcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjZmY5MDAwXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcImJsYWNrXCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCJibGFja1wiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJBcmlhbFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImN1c3RvbVwiOiB7XHJcbiAgICAgICAgICAgIFwiLmxvZ29cIjoge1xyXG4gICAgICAgICAgICAgICAgXCItLXByaW1hcnlcIjogXCJ2YXIoLS1zZWNvbmRhcnkpXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCIuYnV0dG9uOm5vdCguYWN0aXZlQnV0dG9uKVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcIi0tcHJpbWFyeVwiOiBcInZhcigtLXNlY29uZGFyeSlcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi5zZXR0aW5nc0J1dHRvbjpub3QoLnNldHRpbmdzQnV0dG9uQWN0aXZlKVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcIi0tcHJpbWFyeVwiOiBcInZhcigtLXNlY29uZGFyeSlcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJIYWNrZXJcIixcclxuICAgICAgICBcImlkXCI6IFwiaGFja2VyXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMwOTA5MDlcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMjMyMzIzXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiM3ZGUzOGRcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiIzdkZTM4ZFwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwiIzdkZTM4ZFwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJKZXRCcmFpbnMgTW9ub1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImN1c3RvbVwiOiB7XHJcbiAgICAgICAgICAgIFwiLnRpdGxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZm9udC1mYW1pbHlcIjogXCJKZXRCcmFpbnMgTW9ub1wiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkNvYmFsdFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJjb2JhbHRcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzAzMDMwM1wiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMwOTI4M2VcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiIzAwOTVmZlwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkNhdHBwdWNjaW4gTW9jaGFcIixcclxuICAgICAgICBcImlkXCI6IFwiY2F0cHB1Y2Npbi1tb2NoYVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMWUxZTJlIC8qIEJhc2UgKi9cIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMzEzMjQ0IC8qIFN1cmZhY2UwICovXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiM4OWI0ZmEgLyogQmx1ZSAqL1wiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCIjY2RkNmY0IC8qIFRleHQgKi9cIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIiNjZGQ2ZjQgLyogVGV4dCAqL1wiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiQ2F0cHB1Y2NpbiBNYWNjaGlhdG9cIixcclxuICAgICAgICBcImlkXCI6IFwiY2F0cHB1Y2Npbi1tYWNjaGlhdG9cIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzI0MjczYSAvKiBCYXNlICovXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzM2M2E0ZiAvKiBTdXJmYWNlMCAqL1wiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjOGFhZGY0IC8qIEJsdWUgKi9cIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiI2NhZDNmNSAvKiBUZXh0ICovXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCIjY2FkM2Y1IC8qIFRleHQgKi9cIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkNhdHBwdWNjaW4gRnJhcHBcdTAwRTlcIixcclxuICAgICAgICBcImlkXCI6IFwiY2F0cHB1Y2Npbi1mcmFwcGVcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzMwMzQ0NiAvKiBCYXNlICovXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzQxNDU1OSAvKiBTdXJmYWNlMCAqL1wiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjOGNhYWVlIC8qIEJsdWUgKi9cIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiI2M2ZDBmNSAvKiBUZXh0ICovXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCIjYzZkMGY1IC8qIFRleHQgKi9cIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkNhdHBwdWNjaW4gTGF0dGVcIixcclxuICAgICAgICBcImlkXCI6IFwiY2F0cHB1Y2Npbi1sYXR0ZVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjZWZmMWY1IC8qIEJhc2UgKi9cIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjY2NkMGRhIC8qIFN1cmZhY2UwICovXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiMxZTY2ZjUgLyogQmx1ZSAqL1wiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCIjNGM0ZjY5IC8qIFRleHQgKi9cIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIiM0YzRmNjkgLyogVGV4dCAqL1wiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiTWVyY3VyeSBXb3Jrc2hvcFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJoZ1wiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMGIwZjNkXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzNkNDA2NVwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiU3BhY2UgR3JvdGVza1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImN1c3RvbVwiOiB7XHJcbiAgICAgICAgICAgIFwiLmxvZ28gc3ZnXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6IFwiZHJvcC1zaGFkb3coMCAwIDE1cHggdmFyKC0tcHJpbWFyeSkpXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiTHVkaWNyb3VzXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImx1ZGljcm91c1wiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMDkxYjJjXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzExNDA2N1wiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkRpc2NvcmRcIixcclxuICAgICAgICBcImlkXCI6IFwiZGlzY29yZFwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMzEzMzM4XCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzJCMkQzMVwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjNTg2NUYyXCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJPcGVuIFNhbnNcIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiRmxvd09TXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZsb3dcIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzExMTExYlwiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMxZTFlMmVcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiIzg5QjRGQVwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCIjY2RkNmY0XCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCIjY2RkNmY0XCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIm1vbm9zcGFjZVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImN1c3RvbVwiOiB7XHJcbiAgICAgICAgICAgIFwiXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZm9udC1zaXplXCI6IFwiMTZweFwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkJ1YmJsZWd1bVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJidWJibGVndW1cIixcclxuICAgICAgICBcInRoZW1lXCI6IHtcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiI0VFNjE3NlwiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiNGNTgwOTJcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiI2ZmYzFjY1wiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIk5vY3R1cmFcIixcclxuICAgICAgICBcImlkXCI6IFwibm9jdHVyYVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCJibGFja1wiLFxyXG4gICAgICAgICAgICBcInNlY29uZGFyeVwiOiBcIiMyNDI0MjRcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImN1c3RvbVwiOiB7XHJcbiAgICAgICAgICAgIFwiLnRpdGxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZm9udC1mYW1pbHlcIjogXCJNYWpvciBNb25vIERpc3BsYXlcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJWUyBDb2RlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInZzY29kZVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMWYxZjFmXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzE4MTgxOFwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjMDA3OGQ0XCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIiNDQ0NcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJQcmlkZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJwcmlkZVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjRkUwMDAwIDE2LjY2JSwgI0ZEOEMwMCAxNi42NiUsIDMzLjMyJSwgI0ZGRTUwMCAzMy4zMiUsIDQ5Ljk4JSwgIzExOUYwQiA0OS45OCUsIDY2LjY0JSwgIzA2NDRCMyA2Ni42NCUsIDgzLjMlLCAjQzIyRURDIDgzLjMlKSwgIzAwMDAwMGM0XCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJwcmltYXJ5XCI6IFwiYmxhY2tcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiYmxhY2tcIixcclxuICAgICAgICAgICAgXCJ0ZXh0SW52ZXJzZVwiOiBcImJsYWNrXCIsXHJcbiAgICAgICAgICAgIFwiZm9udFwiOiBcIlJvYm90b1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImN1c3RvbVwiOiB7XHJcbiAgICAgICAgICAgIFwiXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1hdHRhY2htZW50XCI6IFwiZml4ZWRcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcIm5hbWVcIjogXCJJbW1vcnRhbFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJpbW1vcnRhbFwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCJsaW5lYXItZ3JhZGllbnQoMTIwZGVnLCByZ2JhKDAxLDA2LDE1LDEpIDIxJSwgcmdiYSgwMSwyMSw0OSwxKSA5NyUpXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzFFMjkzQlwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCIjMTU1RTc1XCIsXHJcbiAgICAgICAgICAgIFwidGV4dFwiOiBcIndoaXRlXCIsXHJcbiAgICAgICAgICAgIFwidGV4dEludmVyc2VcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiRGVlcCBTZWFcIixcclxuICAgICAgICBcImlkXCI6IFwiZGVlcHNlYVwiLFxyXG4gICAgICAgIFwidGhlbWVcIjoge1xyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjMGEyNDRhXCIsXHJcbiAgICAgICAgICAgIFwic2Vjb25kYXJ5XCI6IFwiIzA1MTczMFwiLFxyXG4gICAgICAgICAgICBcInByaW1hcnlcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwid2hpdGVcIixcclxuICAgICAgICAgICAgXCJmb250XCI6IFwiUm9ib3RvXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwibmFtZVwiOiBcIkFzdHJvXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImFzdHJvXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMyQjFDM0RcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMzUxRTRGXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcInB1cnBsZVwiLFxyXG4gICAgICAgICAgICBcInRleHRcIjogXCJ3aGl0ZVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwiI0Q4OEZEOFwiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiR3JlYXRzd29yZFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJncmVhdHN3b3JkXCIsXHJcbiAgICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiMxNDE0MTRcIixcclxuICAgICAgICAgICAgXCJzZWNvbmRhcnlcIjogXCIjMjIyMjIyXCIsXHJcbiAgICAgICAgICAgIFwicHJpbWFyeVwiOiBcIiM2MzYzNjNcIixcclxuICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiI0E5QTlBOVwiLFxyXG4gICAgICAgICAgICBcInRleHRJbnZlcnNlXCI6IFwiIzYzNjM2M1wiLFxyXG4gICAgICAgICAgICBcImZvbnRcIjogXCJSb2JvdG9cIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXSJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1UsU0FBUyxvQkFBb0I7QUFDalcsT0FBTyxZQUFZO0FBQ25CLFNBQVMsMEJBQTBCO0FBQ25DLFNBQVMsd0JBQXdCOzs7QUNDakMsT0FBTyxNQUFNLGlCQUFpQjtBQUM5QixPQUFPLFFBQVEsU0FBUyxnQkFBZ0I7QUFFeEMsT0FBTyxTQUFTO0FBRWhCLFlBQVksVUFBVTtBQUV0QixTQUFTLHlCQUF5QixVQUFlO0FBQzdDLFFBQU0sVUFBVSxLQUFLLFFBQVEsUUFBUTtBQUNyQyxNQUFJLEdBQUcsV0FBVyxPQUFPLEdBQUc7QUFDeEI7QUFBQSxFQUNKO0FBQ0EsMkJBQXlCLE9BQU87QUFDaEMsS0FBRyxVQUFVLE9BQU87QUFDeEI7QUFFQSxJQUFNLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVyQixJQUFJO0FBQ0osSUFBSTtBQUNKLElB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Q0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1B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Q2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxJQUNBLFFBQVU7QUFBQSxNQUNOLElBQUk7QUFBQSxRQUNBLGFBQWE7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxJQUNBLFFBQVU7QUFBQSxNQUNOLFVBQVU7QUFBQSxRQUNOLGVBQWU7QUFBQSxNQUNuQjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0ksTUFBUTtBQUFBLElBQ1IsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLE1BQ0wsWUFBYztBQUFBLE1BQ2QsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLE1BQ1gsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLElBQ1o7QUFBQSxJQUNBLFFBQVU7QUFBQSxNQUNOLElBQUk7QUFBQSxRQUNBLHlCQUF5QjtBQUFBLE1BQzdCO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSSxNQUFRO0FBQUEsSUFDUixJQUFNO0FBQUEsSUFDTixPQUFTO0FBQUEsTUFDTCxZQUFjO0FBQUEsTUFDZCxXQUFhO0FBQUEsTUFDYixTQUFXO0FBQUEsTUFDWCxNQUFRO0FBQUEsTUFDUixhQUFlO0FBQUEsTUFDZixNQUFRO0FBQUEsSUFDWjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSSxNQUFRO0FBQUEsSUFDUixJQUFNO0FBQUEsSUFDTixPQUFTO0FBQUEsTUFDTCxZQUFjO0FBQUEsTUFDZCxXQUFhO0FBQUEsTUFDYixTQUFXO0FBQUEsTUFDWCxNQUFRO0FBQUEsTUFDUixhQUFlO0FBQUEsTUFDZixNQUFRO0FBQUEsSUFDWjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSSxNQUFRO0FBQUEsSUFDUixJQUFNO0FBQUEsSUFDTixPQUFTO0FBQUEsTUFDTCxZQUFjO0FBQUEsTUFDZCxXQUFhO0FBQUEsTUFDYixTQUFXO0FBQUEsTUFDWCxNQUFRO0FBQUEsTUFDUixhQUFlO0FBQUEsTUFDZixNQUFRO0FBQUEsSUFDWjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSSxNQUFRO0FBQUEsSUFDUixJQUFNO0FBQUEsSUFDTixPQUFTO0FBQUEsTUFDTCxZQUFjO0FBQUEsTUFDZCxXQUFhO0FBQUEsTUFDYixTQUFXO0FBQUEsTUFDWCxNQUFRO0FBQUEsTUFDUixhQUFlO0FBQUEsTUFDZixNQUFRO0FBQUEsSUFDWjtBQUFBLEVBQ0o7QUFDSjs7O0FIdm5CQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixPQUFPO0FBQUEsSUFDTixRQUFRO0FBQUEsRUFDVDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsbUJBQW1CO0FBQUEsSUFDbkIsbUJBQWE7QUFBQSxNQUNaO0FBQUEsUUFDQyxhQUFhO0FBQUEsUUFDYixRQUFRO0FBQUEsUUFDUixNQUFNLGVBQWUsY0FBTTtBQUFBLE1BQzVCO0FBQUEsSUFDRCxDQUFDO0FBQUEsSUFDRCxpQkFBaUI7QUFBQSxJQUNqQixPQUFPO0FBQUEsRUFDUjtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
