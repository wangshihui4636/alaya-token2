(() => {
  const TEAM_PLANS = [
    {
      id: "ent-lite",
      name: "轻量型",
      price: "¥2999.00",
      unit: "/月",
      benefits: ["多模型混合调用", "按模型单价实时扣减", "约可支撑 29.84 亿 Tokens/月"],
      pos: "轻量接入与内部工具场景",
    },
    {
      id: "ent-standard",
      name: "标准型",
      price: "¥3999.00",
      unit: "/月",
      benefits: ["中高频开发支持", "内容生成 · 工作流", "约可支撑 39.79 亿 Tokens/月"],
      pos: "中高频开发、内容生成与工作流接入",
    },
    {
      id: "ent-pro",
      name: "专业型",
      price: "¥9999.00",
      unit: "/月",
      featured: true,
      badge: "企业主推",
      benefits: ["高频批量调用", "团队级项目 · 生产环境", "约可支撑 99.5 亿 Tokens/月"],
      pos: "高频批量调用、团队级项目与生产环境",
    },
    {
      id: "ent-custom",
      name: "定制型",
      price: "按需定制",
      unit: "",
      benefits: ["专属模型组合", "团队席位灵活配置", "企业级 SLA 支持"],
      pos: "按业务需求定制模型组合与团队席位",
    },
  ];

  function initPlans(options = {}) {
    const root = document.querySelector(".plans-section");
    if (!root) return;

    const planList = (options.plans || TEAM_PLANS).filter((p) =>
      options.videoOnly ? p.hasVideo : true
    );

    const notify =
      options.showToast ||
      ((msg) => {
        const toast = document.getElementById("toast");
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
      });

    let selectedPlanId =
      planList.find((p) => p.featured)?.id || planList[0]?.id || "team-standard";
    let selectedTopup = "10";
    const plansGrid = document.getElementById("plansGrid");
    const topupAmounts = document.getElementById("topupAmounts");
    const topupCustom = document.getElementById("topupCustom");
    const topupCustomInput = document.getElementById("topupCustomInput");
    const topupSummary = document.getElementById("topupSummary");
    const buyPersonal = document.getElementById("buyPersonal");
    const buyTeam = document.getElementById("buyTeam");

    function currentTopupAmount() {
      if (selectedTopup === "custom") {
        const n = Number(topupCustomInput?.value);
        return Number.isFinite(n) && n > 0 ? n : null;
      }
      return Number(selectedTopup);
    }

    function syncTopupSummary() {
      if (!topupSummary) return;
      const amount = currentTopupAmount();
      topupSummary.textContent = amount
        ? `已选充值 ¥${amount} · 基于消耗直接扣费，充多少扣多少 · 适配所有模型`
        : "请选择或输入自定义充值金额";
    }

    function syncBuyLinks() {
      const amount = currentTopupAmount();
      const teamPlan =
        planList.find((p) => p.id === selectedPlanId) ||
        planList.find((p) => p.featured) ||
        planList[0];
      if (buyPersonal) {
        const q = new URLSearchParams({ edition: "personal", mode: "topup" });
        if (amount) q.set("amount", String(amount));
        buyPersonal.href = `index.html#login?${q.toString()}`;
      }
      if (buyTeam && teamPlan) {
        buyTeam.href = `index.html#login?edition=team&plan=${encodeURIComponent(teamPlan.id)}`;
      }
    }

    function renderPlans() {
      if (plansGrid) {
        if (!planList.some((p) => p.id === selectedPlanId)) {
          selectedPlanId = planList.find((p) => p.featured)?.id || planList[0]?.id;
        }
        plansGrid.innerHTML = planList
          .map((p) => {
            const active = p.id === selectedPlanId ? " is-active" : "";
            const featured = p.featured ? " is-featured" : "";
            const badge = p.badge ? `<span class="plan-badge">${p.badge}</span>` : "";
            const benefits = p.benefits.map((b) => `<li>${b}</li>`).join("");
            return `
            <button type="button" class="plan-card${active}${featured}" data-plan="${p.id}" aria-pressed="${
              p.id === selectedPlanId ? "true" : "false"
            }">
              ${badge}
              <h3>${p.name}</h3>
              <div class="plan-price">${p.price}<span>${p.unit}</span></div>
              <span class="plan-video-tag">${p.video}</span>
              <ul class="plan-benefits">${benefits}</ul>
              <p class="plan-pos">${p.pos}</p>
            </button>
          `;
          })
          .join("");
      }

      if (topupCustom) topupCustom.hidden = selectedTopup !== "custom";
      syncTopupSummary();
      syncBuyLinks();
    }

    if (topupAmounts) {
      topupAmounts.addEventListener("click", (e) => {
        const btn = e.target.closest(".topup-amount");
        if (!btn) return;
        selectedTopup = btn.dataset.amount;
        topupAmounts.querySelectorAll(".topup-amount").forEach((el) => {
          el.classList.toggle("active", el === btn);
        });
        if (topupCustom) topupCustom.hidden = selectedTopup !== "custom";
        if (selectedTopup === "custom" && topupCustomInput) topupCustomInput.focus();
        syncTopupSummary();
        syncBuyLinks();
      });
    }

    if (topupCustomInput) {
      topupCustomInput.addEventListener("input", () => {
        syncTopupSummary();
        syncBuyLinks();
      });
    }

    if (plansGrid) {
      plansGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".plan-card");
        if (!card) return;
        selectedPlanId = card.dataset.plan;
        renderPlans();
        const plan = planList.find((p) => p.id === selectedPlanId);
        if (plan) notify(`已选择团队版 · ${plan.name}`);
      });
    }

    if (buyPersonal) {
      buyPersonal.addEventListener("click", () => {
        const amount = currentTopupAmount();
        notify(amount ? `前往个人版充值 · ¥${amount}` : "请先选择充值金额");
      });
    }

    if (buyTeam) {
      buyTeam.addEventListener("click", () => {
        const plan =
          planList.find((p) => p.id === selectedPlanId) ||
          planList.find((p) => p.featured) ||
          planList[0];
        if (plan) notify(`前往购买团队版 · ${plan.name}`);
      });
    }

    renderPlans();

    return {
      selectPlan(planId) {
        if (!planList.some((p) => p.id === planId)) return;
        selectedPlanId = planId;
        renderPlans();
      },
    };
  }

  const SCENE_RECOMMEND = {
    coding: {
      title: "编程研发场景",
      summary: "偏重代码生成、Agent 编排与长上下文调试，优先高性价比推理与编程旗舰。",
      models: [
        { name: "Kimi K3", reason: "长上下文旗舰 · 推理 / 编程 / Agent", href: "#experience", tag: "主推" },
        { name: "DeepSeek-V4 Flash", reason: "高性价比推理与代码加速", href: "#experience", tag: "性价比" },
      ],
      planByScale: { solo: "ent-lite", small: "ent-standard", mid: "ent-standard", large: "ent-pro" },
    },
    office: {
      title: "办公客服场景",
      summary: "多轮对话、知识问答与工单分流为主，通用对话模型即可覆盖日常吞吐。",
      models: [
        { name: "GLM-5.2", reason: "通用对话与办公创作主力", href: "#experience", tag: "主推" },
        { name: "DeepSeek-V4 Flash", reason: "成本友好的问答与摘要", href: "#experience", tag: "备用" },
      ],
      planByScale: { solo: "ent-lite", small: "ent-lite", mid: "ent-standard", large: "ent-standard" },
    },
    content: {
      title: "内容创作场景",
      summary: "文案、脚本与轻量多媒体协同，建议文本主力模型覆盖创作链路。",
      models: [
        { name: "GLM-5.2", reason: "办公创作与文案生成", href: "#experience", tag: "文案" },
        { name: "Kimi K3", reason: "长文策划与多文档整理", href: "#experience", tag: "策划" },
      ],
      planByScale: { solo: "ent-lite", small: "ent-standard", mid: "ent-standard", large: "ent-pro" },
    },
    video: {
      title: "视频生产场景",
      summary: "内容生产与多媒体协同，建议标准型及以上套餐支撑高频调用。",
      models: [
        { name: "Kimi K3", reason: "脚本策划与长文理解", href: "#experience", tag: "策划" },
        { name: "GLM-5.2", reason: "文案与分镜辅助", href: "#experience", tag: "文案" },
      ],
      planByScale: { solo: "ent-standard", small: "ent-standard", mid: "ent-pro", large: "ent-pro" },
    },
    auto: {
      title: "智能座舱场景",
      summary: "车机多轮对话与云端协同对延迟和高峰敏感，建议专业型高吞吐套餐。",
      models: [
        { name: "Kimi K3", reason: "长上下文车机对话与场景理解", href: "#experience", tag: "主推" },
        { name: "GLM-5.2", reason: "座舱助手与内容推荐", href: "#experience", tag: "协同" },
      ],
      planByScale: { solo: "ent-standard", small: "ent-standard", mid: "ent-pro", large: "ent-pro" },
    },
    finance: {
      title: "金融研报场景",
      summary: "研报摘要、合规问答与风控辅助，强调稳定吞吐与审计友好调用。",
      models: [
        { name: "DeepSeek-V4 Flash", reason: "研报摘要与指标抽取", href: "#experience", tag: "分析" },
        { name: "Kimi K3", reason: "长文档合规审查辅助", href: "#experience", tag: "合规" },
      ],
      planByScale: { solo: "ent-lite", small: "ent-standard", mid: "ent-pro", large: "ent-custom" },
    },
    agent: {
      title: "Agent 高峰场景",
      summary: "多工具并发与突发峰值明显，默认建议专业型或定制型支撑生产高峰。",
      models: [
        { name: "Kimi K3", reason: "Agent 编排与长链路推理", href: "#experience", tag: "主推" },
        { name: "DeepSeek-V4 Flash", reason: "工具调用与代码执行备份", href: "#experience", tag: "备份" },
      ],
      planByScale: { solo: "ent-standard", small: "ent-pro", mid: "ent-pro", large: "ent-custom" },
    },
  };

  function initRecommend(options = {}) {
    const root = document.getElementById("recommend");
    if (!root) return;

    const chips = document.getElementById("recommendScenes");
    const scaleEl = document.getElementById("recommendScale");
    const peakEl = document.getElementById("recommendPeak");
    const runBtn = document.getElementById("recommendRun");
    const result = document.getElementById("recommendResult");
    const notify =
      options.showToast ||
      ((msg) => {
        const toast = document.getElementById("toast");
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
      });

    let scene = "coding";
    let plansApi = options.plansApi || null;

    function currentScene() {
      return SCENE_RECOMMEND[scene] || SCENE_RECOMMEND.coding;
    }

    function buildRecommendation() {
      const conf = currentScene();
      const scale = scaleEl?.value || "small";
      const planId = conf.planByScale[scale] || "ent-standard";
      const plan = TEAM_PLANS.find((p) => p.id === planId) || TEAM_PLANS[1];
      return { conf, plan, scale };
    }

    function iconClass(name) {
      if (/Kimi/i.test(name)) return "icon-kimi";
      if (/Video|H3/i.test(name)) return "icon-video";
      if (/DeepSeek/i.test(name)) return "icon-ds";
      if (/GLM/i.test(name)) return "icon-glm";
      return "icon-kimi";
    }

    function renderRecommendation() {
      if (!result) return;
      const { conf, plan } = buildRecommendation();
      const modelsHtml = conf.models
        .map(
          (m) => `
          <li>
            <a class="latest-item" href="${m.href}">
              <span class="latest-icon ${iconClass(m.name)}" aria-hidden="true"></span>
              <span class="latest-body">
                <strong>${m.name}</strong>
                <em>${m.reason}</em>
              </span>
              <span class="latest-price">
                <span>${m.tag}</span>
              </span>
            </a>
          </li>`
        )
        .join("");

      result.innerHTML = `
        <div class="hub-latest-head">
          <h3>${conf.title}</h3>
          <a class="text-link" href="#subscribe">去订阅 <span aria-hidden="true">→</span></a>
        </div>
        <p class="recommend-summary">${conf.summary}</p>
        <ul class="latest-list">${modelsHtml}</ul>
        <div class="recommend-plan">
          <h4>建议套餐 · 企业版 ${plan.name} ${plan.price}${plan.unit}</h4>
          <p>${plan.pos}；${plan.benefits.join("；")}</p>
        </div>
        <div class="recommend-actions">
          <a class="btn btn-primary" href="#subscribe" data-apply-plan="${plan.id}">去购买 · ${plan.name}</a>
          <a class="btn btn-ghost" href="#subscribe">了解更多</a>
        </div>
      `;
    }

    if (chips) {
      chips.addEventListener("click", (e) => {
        const btn = e.target.closest(".industry-chip");
        if (!btn) return;
        scene = btn.dataset.scene || "coding";
        chips.querySelectorAll(".industry-chip").forEach((el) => {
          const on = el === btn;
          el.classList.toggle("active", on);
          el.setAttribute("aria-checked", on ? "true" : "false");
        });
      });
    }

    if (runBtn) {
      runBtn.addEventListener("click", () => {
        renderRecommendation();
        notify(`已生成 · ${currentScene().title}推荐`);
        result?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }

    if (result) {
      result.addEventListener("click", (e) => {
        const planBtn = e.target.closest("[data-apply-plan]");
        if (planBtn && plansApi?.selectPlan) {
          plansApi.selectPlan(planBtn.dataset.applyPlan);
          notify("已同步选中推荐套餐");
        }
      });
    }
  }

  window.AlayaPlans = {
    init: initPlans,
    initRecommend,
    TEAM_PLANS,
    SCENE_RECOMMEND,
  };
})();
