(() => {
  "use strict";

  const pages = [
    ["二阶行列式可视化.html", "二阶行列式"],
    ["三阶行列式可视化.html", "三阶行列式"],
    ["n阶行列式可视化.html", "n阶行列式"],
    ["行列式性质可视化.html", "行列式性质"],
    ["矩阵运算可视化.html", "矩阵运算"],
    ["初等方阵可视化.html", "初等方阵"],
    ["矩阵高斯消元法可视化.html", "高斯消元法"],
    ["矩阵秩的可视化.html", "矩阵秩"],
    ["向量空间可视化.html", "向量空间"],
    ["向量投影可视化.html", "向量投影"],
    ["线性方程组可视化.html", "线性方程组"],
    ["特征值分解可视化.html", "特征值分解"],
    ["正交分解可视化.html", "正交分解"],
    ["旋转矩阵可视化.html", "旋转矩阵"],
    ["奇异值分解可视化.html", "奇异值分解"],
    ["最小二乘法可视化.html", "最小二乘法"],
    ["二次型标准化可视化.html", "二次型标准化"],
    ["线性变换可视化.html", "线性变换"],
  ];

  const route = decodeURIComponent(window.location.pathname.split("/").pop() || "");
  const activePage = pages.find(([file]) => file === route);
  if (!activePage) return;

  const stateKey = "linear-algebra-layout-v1";
  const defaults = { navigation: 220, concept: 390 };
  const minimums = { navigation: 170, concept: 290, visualization: 390 };
  const splitterWidth = 12;

  function readSavedWidths() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(stateKey) || "{}");
      return {
        navigation: Number.isFinite(saved.navigation) ? saved.navigation : defaults.navigation,
        concept: Number.isFinite(saved.concept) ? saved.concept : defaults.concept,
      };
    } catch (_error) {
      return { ...defaults };
    }
  }

  function createCourseNavigation() {
    const nav = document.createElement("nav");
    nav.className = "sidebar la-sidebar";
    nav.setAttribute("aria-label", "线性代数可视化导航");
    const title = document.createElement("h3");
    title.textContent = "模块导航";
    const overview = document.createElement("a");
    overview.href = "../index.html";
    overview.className = "nav-item la-overview-link";
    overview.textContent = "模块概览";
    const list = document.createElement("ul");
    list.className = "la-course-nav-list";
    pages.forEach(([file, label]) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `./${file}`;
      link.className = "nav-item";
      link.textContent = label;
      if (file === activePage[0]) link.setAttribute("aria-current", "page");
      item.append(link);
      list.append(item);
    });
    const home = document.createElement("a");
    home.href = "../../../index.html";
    home.className = "nav-item la-home-link";
    home.textContent = "返回课程主页";
    nav.append(title, overview, list, home);
    return nav;
  }

  function hasVisualization(element) {
    return element.matches(".visualization-section, .viz, .plot, .plot-container, .right-column") ||
      Boolean(element.querySelector(".visualization-section, .viz, .plot, .plot-container, .js-plotly-plot, [id*='plot'], [id*='chart'], canvas, svg"));
  }

  function createSplitter(name, label) {
    const splitter = document.createElement("button");
    splitter.type = "button";
    splitter.className = `la-layout-splitter la-splitter-${name}`;
    splitter.setAttribute("role", "separator");
    splitter.setAttribute("aria-label", label);
    splitter.setAttribute("aria-orientation", "vertical");
    splitter.setAttribute("aria-valuemin", String(minimums[name]));
    splitter.setAttribute("aria-valuenow", String(defaults[name]));
    splitter.setAttribute("tabindex", "0");
    return splitter;
  }

  function init() {
    const shell = document.querySelector(".page-content") || document.querySelector(".page") || document.body;
    const originalNavigation = document.querySelector(".sidebar");
    const navigation = createCourseNavigation();
    if (originalNavigation) originalNavigation.remove();
    shell.classList.add("la-layout-shell");

    if (navigation.parentElement !== shell) shell.insertBefore(navigation, shell.firstChild);
    navigation.classList.add("la-sidebar");

    const splitterA = createSplitter("navigation", "调整导航栏宽度");
    const concept = document.createElement("section");
    concept.className = "la-concept-column";
    concept.setAttribute("aria-label", "概念与操作");
    const visualization = document.createElement("section");
    visualization.className = "la-visualization-column";
    visualization.setAttribute("aria-label", "交互式可视化");
    const responsiveTabs = route === "矩阵运算可视化.html" || route === "向量空间可视化.html";
    let splittersB = [];

    if (responsiveTabs) {
      const workspace = document.createElement("div");
      workspace.className = "la-tab-workspace";
      Array.from(shell.children).forEach((child) => {
        if (child === navigation || child.matches(".header, .page-header, .module-header, script")) return;
        workspace.append(child);
      });
      workspace.querySelectorAll(".tab-content .main-content").forEach((tabMain) => {
        tabMain.classList.add("la-tab-main");
        const controls = tabMain.querySelector(":scope > .controls-section");
        const plot = tabMain.querySelector(":scope > .visualization-section");
        if (!controls || !plot) return;
        controls.classList.add("la-tab-controls");
        plot.classList.add("la-tab-visual");
        const splitter = createSplitter("concept", "调整概念区和可视化区宽度");
        splitter.classList.add("la-tab-splitter");
        controls.after(splitter);
        splittersB.push(splitter);
      });
      shell.append(navigation, splitterA, workspace);
    } else {
      const source = shell.querySelector(".content") ||
        shell.querySelector(".dual") ||
        shell.querySelector(".main-content");
      if (source) {
        const children = Array.from(source.children);
        children.filter((child) => !hasVisualization(child)).forEach((child) => concept.append(child));
        children.filter(hasVisualization).forEach((child) => visualization.append(child));
        source.remove();
      }
      const splitterB = createSplitter("concept", "调整概念区和可视化区宽度");
      splittersB = [splitterB];
      shell.append(navigation, splitterA, concept, splitterB, visualization);
    }

    const title = shell.querySelector(".header, .page-header, .module-header");
    if (title) title.classList.add("la-layout-heading");
    shell.querySelectorAll(".container, .page").forEach((wrapper) => {
      if (wrapper !== shell && !wrapper.closest(".la-sidebar")) wrapper.classList.add("la-layout-contents");
    });
    shell.querySelectorAll(".examples-section, .examples").forEach((section) => section.classList.add("la-layout-extras"));

    const state = readSavedWidths();

    function bounds() {
      const width = shell.clientWidth;
      const shellStyles = window.getComputedStyle(shell);
      const horizontalPadding = (parseFloat(shellStyles.paddingLeft) || 0) + (parseFloat(shellStyles.paddingRight) || 0);
      const contentWidth = Math.max(0, width - horizontalPadding);
      const maxNavigation = Math.max(minimums.navigation, contentWidth - minimums.concept - minimums.visualization - splitterWidth * 2);
      const maxConcept = Math.max(minimums.concept, contentWidth - state.navigation - minimums.visualization - splitterWidth * 2);
      return { contentWidth, maxNavigation, maxConcept };
    }

    function clampWidths() {
      const limits = bounds();
      state.navigation = Math.min(Math.max(state.navigation, minimums.navigation), limits.maxNavigation);
      const conceptLimit = Math.max(minimums.concept, limits.contentWidth - state.navigation - minimums.visualization - splitterWidth * 2);
      state.concept = Math.min(Math.max(state.concept, minimums.concept), conceptLimit);
    }

    function updateGrid(save = false) {
      clampWidths();
      shell.style.setProperty("--la-nav-width", `${state.navigation}px`);
      shell.style.setProperty("--la-concept-width", `${state.concept}px`);
      splitterA.setAttribute("aria-valuenow", String(Math.round(state.navigation)));
      splitterA.setAttribute("aria-valuemax", String(bounds().maxNavigation));
      splittersB.forEach((splitter) => {
        splitter.setAttribute("aria-valuenow", String(Math.round(state.concept)));
        splitter.setAttribute("aria-valuemax", String(bounds().maxConcept));
      });
      if (save) {
        try { window.localStorage.setItem(stateKey, JSON.stringify(state)); } catch (_error) { /* storage is optional */ }
      }
      requestAnimationFrame(resizePlots);
    }

    function resizePlots() {
      if (!window.Plotly || !window.Plotly.Plots || typeof window.Plotly.Plots.resize !== "function") return;
      document.querySelectorAll(".la-visualization-column .js-plotly-plot, .la-tab-visual .js-plotly-plot").forEach((plot) => {
        try {
          const containerWidth = Math.floor(plot.parentElement.getBoundingClientRect().width);
          plot.style.setProperty("width", "100%", "important");
          if (plot._context) plot._context.responsive = true;
          else plot._context = { responsive: true };
          if (containerWidth > 0 && typeof window.Plotly.relayout === "function") {
            const relayout = window.Plotly.relayout(plot, { width: containerWidth, autosize: true });
            if (relayout && typeof relayout.then === "function") {
              relayout.then(() => window.Plotly.Plots.resize(plot)).catch(() => {});
            } else window.Plotly.Plots.resize(plot);
          } else window.Plotly.Plots.resize(plot);
        } catch (_error) { /* a plot may be mid-render */ }
      });
    }

    function setWidth(name, width) {
      state[name] = width;
      updateGrid(true);
    }

    function attachPointerResize(splitter, name) {
      splitter.addEventListener("pointerdown", (event) => {
        if (window.matchMedia("(max-width: 1120px)").matches) return;
        event.preventDefault();
        splitter.setPointerCapture(event.pointerId);
        const startX = event.clientX;
        const startWidth = state[name];
        const onMove = (moveEvent) => {
          const direction = name === "navigation" ? 1 : 1;
          setWidth(name, startWidth + (moveEvent.clientX - startX) * direction);
        };
        const onEnd = () => {
          splitter.removeEventListener("pointermove", onMove);
          splitter.removeEventListener("pointerup", onEnd);
          splitter.removeEventListener("pointercancel", onEnd);
        };
        splitter.addEventListener("pointermove", onMove);
        splitter.addEventListener("pointerup", onEnd, { once: true });
        splitter.addEventListener("pointercancel", onEnd, { once: true });
      });
      splitter.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const delta = (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 50 : 20);
        setWidth(name, state[name] + delta);
      });
    }

    attachPointerResize(splitterA, "navigation");
    splittersB.forEach((splitter) => attachPointerResize(splitter, "concept"));
    updateGrid();
    window.addEventListener("resize", () => updateGrid());
    window.addEventListener("load", () => updateGrid(), { once: true });
    if ("ResizeObserver" in window) new ResizeObserver(resizePlots).observe(shell);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
