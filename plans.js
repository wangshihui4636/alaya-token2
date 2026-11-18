(() => {
  const TEAM_PLANS = [
    {
      id: "team-light",
      name: "Light",
      price: "¥150",
      unit: "/席/月",
      video: "不含视频模型",
      hasVideo: false,
      benefits: ["25,000 Credits", "TPM 不保障（或 ≤2,000）", "不含视频模型"],
      pos: "个人→团队试用、流程验证；非生产主力",
    },
    {
      id: "team-small",
      name: "Small",
      price: "¥300",
      unit: "/席/月",
      video: "不含视频模型",
      hasVideo: false,
      benefits: ["50,000 Credits", "TPM 5,000", "不含视频模型", "建议起购 3 席"],
      pos: "小团队轻量协作",
    },
    {
      id: "team-standard",
      name: "Standard",
      price: "¥550",
      unit: "/席/月",
      video: "含视频额度 ¥200",
      hasVideo: true,
      featured: true,
      badge: "主推",
      benefits: ["100,000 Credits", "TPM 20,000 · 含文本/视频/图片", "含视频额度 ¥200（增强+生成+超分）"],
      pos: "研发/数据默认主力席位",
    },
    {
      id: "team-pro",
      name: "Pro",
      price: "¥1,298",
      unit: "/席/月",
      video: "含视频额度 ¥500",
      hasVideo: true,
      benefits: ["250,000 Credits", "共享吞吐上限 TPM 50,000", "含文本/视频/图片", "含视频额度 ¥500（增强+生成+超分）"],
      pos: "重度核心 / 内容生产席位",
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

    const buyTpm = document.getElementById("buyTpm");
    const tpmTiers = document.getElementById("tpmTiers");
    const tpmTierDesc = document.getElementById("tpmTierDesc");
    const tpmTierFit = document.getElementById("tpmTierFit");
    const tpmSummary = document.getElementById("tpmSummary");
    const TPM_META = {
      day: {
        label: "按天预付费",
        desc: "预留规格 · 用不满也收；适合已知高峰窗口",
        fit: "发布日 / 营销峰值 / 批处理",
      },
      hour: {
        label: "按小时后付费",
        desc: "弹性启用 · 按实际开启计费；适合突发扩容",
        fit: "临时压测 / 短时活动",
      },
      month: {
        label: "月保障包",
        desc: "价 ≈ 备机成本 ÷ 利用率 × 1.3 × (1+毛利)",
        fit: "长期生产 / 专属高优吞吐",
      },
    };
    let selectedTpmTier = "day";

    function syncTpmBuy() {
      const meta = TPM_META[selectedTpmTier] || TPM_META.day;
      if (tpmTierDesc) tpmTierDesc.textContent = meta.desc;
      if (tpmTierFit) tpmTierFit.textContent = meta.fit;
      if (tpmSummary) {
        tpmSummary.textContent = `已选 · ${meta.label} · 与团队席位叠加购买`;
      }
      if (buyTpm) {
        buyTpm.href = `index.html#login?edition=tpm&tier=${encodeURIComponent(selectedTpmTier)}`;
      }
    }

    if (tpmTiers) {
      tpmTiers.addEventListener("click", (e) => {
        const btn = e.target.closest(".topup-amount");
        if (!btn) return;
        selectedTpmTier = btn.dataset.tier || "day";
        tpmTiers.querySelectorAll(".topup-amount").forEach((el) => {
          el.classList.toggle("active", el === btn);
        });
        syncTpmBuy();
        notify(`已选择 · ${(TPM_META[selectedTpmTier] || TPM_META.day).label}`);
      });
    }

    if (buyTpm) {
      buyTpm.addEventListener("click", () => {
        notify(`前往购买 TPM 保障包 · ${(TPM_META[selectedTpmTier] || TPM_META.day).label}`);
      });
    }

    syncTpmBuy();
    renderPlans();

    return {
      selectPlan(planId) {
        if (!planList.some((p) => p.id === planId)) return;
        selectedPlanId = planId;
        renderPlans();
      },
      selectTpmTier(tier) {
        if (!TPM_META[tier]) return;
        selectedTpmTier = tier;
        if (tpmTiers) {
          tpmTiers.querySelectorAll(".topup-amount").forEach((el) => {
            el.classList.toggle("active", el.dataset.tier === tier);
          });
        }
        syncTpmBuy();
      },
    };
  }

  const SCENE_RECOMMEND = {
    coding: {
      title: "编程研发场景",
      summary: "偏重代码生成、Agent 编排与长上下文调试，优先高性价比推理与编程旗舰。",
      models: [
        { name: "Kimi K3", reason: "长上下文旗舰 · 推理 / 编程 / Agent", href: "models.html?q=Kimi", tag: "主推" },
        { name: "DeepSeek V3", reason: "高性价比推理与代码", href: "models.html?q=DeepSeek", tag: "性价比" },
      ],
      planByScale: { solo: "team-small", small: "team-standard", mid: "team-standard", large: "team-pro" },
      tpmWhen: ["hard", "steady"],
    },
    office: {
      title: "办公客服场景",
      summary: "多轮对话、知识问答与工单分流为主，通用对话模型即可覆盖日常吞吐。",
      models: [
        { name: "GLM-4.6", reason: "通用对话与办公创作主力", href: "models.html?q=GLM", tag: "主推" },
        { name: "DeepSeek V3", reason: "成本友好的问答与摘要", href: "models.html?q=DeepSeek", tag: "备用" },
      ],
      planByScale: { solo: "team-light", small: "team-small", mid: "team-standard", large: "team-standard" },
      tpmWhen: ["hard"],
    },
    content: {
      title: "内容创作场景",
      summary: "文案、脚本与轻量多媒体协同，建议文本主力 + 按需视频额度。",
      models: [
        { name: "GLM-4.6", reason: "办公创作与文案生成", href: "models.html?q=GLM", tag: "文案" },
        { name: "Kimi K3", reason: "长文策划与多文档整理", href: "models.html?q=Kimi", tag: "策划" },
      ],
      planByScale: { solo: "team-small", small: "team-standard", mid: "team-standard", large: "team-pro" },
      tpmWhen: ["hard"],
    },
    video: {
      title: "视频生产场景",
      summary: "提示词增强、生成与超分闭环，优先含视频额度的席位，并预留加购包。",
      models: [
        { name: "Alaya Video / H3", reason: "成片画质与风格控制", href: "video.html", tag: "工作台" },
        { name: "H3-Highspeed", reason: "日常内容批量试错", href: "generate.html", tag: "效率" },
      ],
      planByScale: { solo: "team-standard", small: "team-standard", mid: "team-pro", large: "team-pro" },
      tpmWhen: ["hard", "steady"],
      videoPack: true,
    },
    auto: {
      title: "智能座舱场景",
      summary: "车机多轮对话与云端协同对延迟和高峰敏感，建议高吞吐席位并叠加 TPM。",
      models: [
        { name: "Kimi K3", reason: "长上下文车机对话与场景理解", href: "models.html?q=Kimi", tag: "主推" },
        { name: "GLM-4.6", reason: "座舱助手与内容推荐", href: "models.html?q=GLM", tag: "协同" },
      ],
      planByScale: { solo: "team-standard", small: "team-standard", mid: "team-pro", large: "team-pro" },
      tpmWhen: ["flex", "steady", "hard"],
      forceTpmOnLarge: true,
    },
    finance: {
      title: "金融研报场景",
      summary: "研报摘要、合规问答与风控辅助，强调稳定吞吐与审计友好调用。",
      models: [
        { name: "DeepSeek V3", reason: "研报摘要与指标抽取", href: "models.html?q=DeepSeek", tag: "分析" },
        { name: "Kimi K3", reason: "长文档合规审查辅助", href: "models.html?q=Kimi", tag: "合规" },
      ],
      planByScale: { solo: "team-small", small: "team-standard", mid: "team-pro", large: "team-pro" },
      tpmWhen: ["steady", "hard"],
    },
    agent: {
      title: "Agent 高峰场景",
      summary: "多工具并发与突发峰值明显，默认建议 Pro + TPM 保障包，降低 429 风险。",
      models: [
        { name: "Kimi K3", reason: "Agent 编排与长链路推理", href: "models.html?q=Kimi", tag: "主推" },
        { name: "DeepSeek V3", reason: "工具调用与代码执行备份", href: "models.html?q=DeepSeek", tag: "备份" },
      ],
      planByScale: { solo: "team-standard", small: "team-pro", mid: "team-pro", large: "team-pro" },
      tpmWhen: ["flex", "steady", "hard"],
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
      const peak = peakEl?.value || "flex";
      const planId = conf.planByScale[scale] || "team-standard";
      const plan = TEAM_PLANS.find((p) => p.id === planId) || TEAM_PLANS[2];
      let needTpm = conf.tpmWhen.includes(peak);
      if (conf.forceTpmOnLarge && (scale === "mid" || scale === "large")) needTpm = true;
      if (scene === "agent") needTpm = true;
      const tpmTier = peak === "hard" || scale === "large" ? "month" : peak === "steady" ? "day" : "hour";
      return { conf, plan, needTpm, tpmTier, scale, peak };
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
      const { conf, plan, needTpm, tpmTier } = buildRecommendation();
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

      const tpmHtml = needTpm
        ? `<span class="tpm-flag">建议叠加 TPM · ${
            tpmTier === "month" ? "月保障包" : tpmTier === "day" ? "按天预付费" : "按小时后付费"
          }</span>`
        : `<span class="tpm-flag is-optional">共享吞吐可满足 · 暂可不加 TPM</span>`;

      const videoNote = conf.videoPack
        ? `<p>视频额度用尽后可叠加「视频模型加购包」。</p>`
        : "";

      result.innerHTML = `
        <div class="hub-latest-head">
          <h3>${conf.title}</h3>
          <a class="text-link" href="#subscribe">去订阅 <span aria-hidden="true">→</span></a>
        </div>
        <p class="recommend-summary">${conf.summary}</p>
        <ul class="latest-list">${modelsHtml}</ul>
        <div class="recommend-plan">
          <h4>建议套餐 · 团队版 ${plan.name} ${plan.price}${plan.unit}</h4>
          <p>${plan.pos}；${plan.benefits.join("；")}</p>
          ${tpmHtml}
          ${videoNote}
        </div>
        <div class="recommend-actions">
          <a class="btn btn-primary" href="#subscribe" data-apply-plan="${plan.id}">去购买 · ${plan.name}</a>
          ${
            needTpm
              ? `<a class="btn btn-ghost" href="#tpm" data-apply-tpm="${tpmTier}">购买 TPM 保障包</a>`
              : `<a class="btn btn-ghost" href="#tpm">查看 TPM 保障包</a>`
          }
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
        const tpmBtn = e.target.closest("[data-apply-tpm]");
        if (tpmBtn && plansApi?.selectTpmTier) {
          plansApi.selectTpmTier(tpmBtn.dataset.applyTpm);
          notify("已同步 TPM 计费方式");
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
