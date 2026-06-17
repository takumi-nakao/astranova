// ==========================================================================
// 0. 初回アクセスチェック (FOUC防止のための早期セッションストレージ判定)
// ==========================================================================
(function () {
  if (sessionStorage.getItem("astranova_intro_seen") === "true") {
    document.documentElement.classList.add("intro-skipped");
  }
})();

/**
 * ==========================================================================
 * AstraNova OFFICIAL WEBSITE - INTERACTIVE JAVASCRIPT
 * ==========================================================================
 *
 * 本ファイルは、jQuery等の外部依存ライブラリを一切排除した「バニラJavaScript」と、
 * イントロアニメーションのための「GSAP」で構築されています。
 */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // イントロ中やリロード時の不意なスクロール位置のズレを防ぐため、スクロール復元を手動に設定
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  // ==========================================================================
  // 1. グローバル設定・セレクター定義
  // ==========================================================================
  const select = (selector) => document.querySelector(selector);
  const selectAll = (selector) => document.querySelectorAll(selector);

  // DOM要素
  const loader = select("#loader");
  const skipHint = select("#intro-skip-hint");

  const customCursor = select("#custom-cursor");
  const scrollProgress = select("#scroll-progress");

  const header = select(".site-header");
  const menuToggle = select("#menu-toggle");
  const mobileNav = select("#mobile-nav");
  const mobileNavLinks = selectAll(".mobile-nav-link");

  const heroBg = select("#hero-bg");

  const galleryCards = selectAll(".gallery-card");
  const lightboxModal = select("#lightbox-modal");
  const lightboxClose = select("#lightbox-close");
  const lightboxPlaceholder = select("#lightbox-img-placeholder");
  const lightboxCaption = select("#lightbox-caption");

  const contactForm = select("#contact-form");
  const formSubmitBtn = select("#form-submit-btn");
  const formAlert = select("#form-alert");

  // ==========================================================================
  // 2. 没入型サイバーSF イントロ演出 (Immersive Sci-Fi GSAP Intro)
  // ==========================================================================
  // ページ読み込み完了までのスクロールロック＆最上部に強制スクロール
  document.body.classList.add("lock-scroll");
  window.scrollTo(0, 0);

  // セッション内既読または prefers-reduced-motion によるスキップ処理
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isIntroSeen = sessionStorage.getItem("astranova_intro_seen") === "true";

  if (
    isIntroSeen ||
    document.documentElement.classList.contains("intro-skipped")
  ) {
    skipIntroInstantly();
  } else if (prefersReducedMotion) {
    playSimpleFadeIntro();
  } else {
    initIntroAnimation();
  }

  function skipIntroInstantly() {
    if (loader) loader.style.display = "none";
    document.body.classList.remove("lock-scroll");
    window.scrollTo(0, 0);
    initHeroSlideshow();
  }

  function playSimpleFadeIntro() {
    if (!loader) {
      document.body.classList.remove("lock-scroll");
      window.scrollTo(0, 0);
      initHeroSlideshow();
      return;
    }
    gsap.to(loader, {
      opacity: 0,
      duration: 1.5,
      ease: "power2.out",
      onComplete: () => {
        loader.style.display = "none";
        document.body.classList.remove("lock-scroll");
        window.scrollTo(0, 0);
        sessionStorage.setItem("astranova_intro_seen", "true");
        initHeroSlideshow();
      },
    });
  }

  function initIntroAnimation() {
    if (!loader) {
      document.body.classList.remove("lock-scroll");
      return;
    }

    const percentageEl = select("#loader-percentage");
    const spinnerFill = select("#loader-spinner-fill");
    const statusText = select("#loader-status-text");
    const logoText = select("#loader-logo-text");
    const hackingContainer = select("#loader-hacking-container");
    const consoleLogContainer = select("#loader-console-log");

    let triggeredAlertsCount = 0;
    let triggeredLastAlert = false;

    // 左上の超高速起動ダミーログ出力
    const dummyLogs = [
      "CRITICAL: INTRUSION ATTEMPT DETECTED",
      "BYPASSING FIREWALL... [SUCCESS]",
      "DECRYPTING CORE DATA SEGMENTS...",
      "PORT:8080 STATUS: OVERRIDDEN",
      "ESTABLISHING HOST CONNECTION...",
      "WARNING: LOG FILES CORRUPTED",
      "INJECTING MALWARE SEQUENCE (0x5F3C)...",
      "ROOT PRIVILEGES ACQUIRED: ASTRANOVA_MAIN",
      "DATALINK ACTIVE. SYNCING PROTOCOLS...",
      "ALERT: SYSTEM OVERFLOW DETECTED",
      "OVERWRITING INTERFACE SUBSYSTEM...",
    ];

    function printConsoleLog(index = 0) {
      if (!consoleLogContainer || index >= dummyLogs.length) return;
      const line = document.createElement("div");
      line.className = "console-line";
      line.textContent = `> ${dummyLogs[index]}`;
      consoleLogContainer.appendChild(line);

      consoleLogContainer.scrollTop = consoleLogContainer.scrollHeight;

      if (consoleLogContainer.childNodes.length > 8) {
        consoleLogContainer.removeChild(consoleLogContainer.firstChild);
      }

      setTimeout(
        () => {
          printConsoleLog(index + 1);
        },
        50 + Math.random() * 80,
      );
    }

    // サイバー警告ウィンドウ/ログの動的生成
    function spawnHackingAlert() {
      if (!hackingContainer) return;

      const el = document.createElement("div");
      const rand = Math.random();

      if (rand < 0.7) {
        // パターンA: 警告ダイアログウィンドウ
        el.className = "hacking-window";

        const header = document.createElement("div");
        header.className = "hw-header";

        const title = document.createElement("span");
        title.textContent = "☣ CRITICAL INTRUSION";
        header.appendChild(title);

        const closeBtn = document.createElement("span");
        closeBtn.className = "hw-close";
        closeBtn.textContent = "☠";
        header.appendChild(closeBtn);

        el.appendChild(header);

        const body = document.createElement("div");
        body.className = "hw-body";

        const msg = document.createElement("div");
        msg.className = "hw-msg";
        msg.textContent = "☠ Welcome to ASTRANOVA ☠";
        body.appendChild(msg);

        const details = document.createElement("div");
        details.className = "hw-details";
        const errorCodes = [
          "RAT_VECTOR_INJECTED: SUCCESS\nDATALINK: EXFILTRATING...\nIP_TARGET: OVERLAYED",
          "SYSTEM PRIVILEGES: COMPROMISED\nPORT EXPLOIT ACTIVE [Port 22]\nENCRYPTION SEQUENCE: 84%",
          "WARNING: VOID DETECTED IN KERNEL\nMEM_DUMP: 0xDEADBEEF\nHOST MACHINE CONTROLLED: TRUE",
          "FIREWALL STATUS: DESTROYED\nINJECTING CORRUPTION CODE\nDEPLOYING ASTRANOVA INTERFACE",
          "CRITICAL: SECTOR_4_ENCRYPTION_FAIL\nPORT_8080: SYN_RECV OVERRIDE\nSYSTEM INTEGRITY: VOID",
        ];
        details.textContent =
          errorCodes[Math.floor(Math.random() * errorCodes.length)];
        body.appendChild(details);

        el.appendChild(body);
      } else if (rand < 0.9) {
        // パターンB: ターミナルログストリーム
        el.className = "hacking-msg-stream";

        const logs = [
          `> ☣ RAT INJECTED INTO SYSTEM MEMORY [OK]`,
          `> ☠ EXFILTRATING SYSTEM LOGS TO SHADOW_HOST`,
          `> ☣ DATA LEAK: Welcome to ASTRANOVA`,
          `> ☠ SYSTEM PRIVILEGES OVERRIDDEN BY ASTRANOVA`,
          `> ☣ SECURITY BREACH DETECTED: VOID PRIVILEGES`,
        ];
        el.textContent = logs[Math.floor(Math.random() * logs.length)];
      } else {
        // パターンC: 巨大グリッチテキスト
        el.className = "huge-glitch";
        el.textContent = "ASTRANOVA";
      }

      const randomTop = 10 + Math.random() * 80;
      const randomLeft = 10 + Math.random() * 80;

      el.style.top = `${randomTop}%`;
      el.style.left = `${randomLeft}%`;

      hackingContainer.appendChild(el);

      setTimeout(() => {
        el.remove();
      }, 1600);
    }

    // 特大ボス警告ウィンドウの生成 (クライマックス演出)
    function spawnGiantHackingAlert() {
      if (!hackingContainer) return;

      const el = document.createElement("div");
      el.className = "hacking-window giant";

      const header = document.createElement("div");
      header.className = "hw-header";

      const title = document.createElement("span");
      title.textContent = "[☣ ☣ ☣] SYSTEM COMPROMISED: VOID STATUS";
      header.appendChild(title);

      const closeBtn = document.createElement("span");
      closeBtn.className = "hw-close";
      closeBtn.textContent = "☠";
      header.appendChild(closeBtn);

      el.appendChild(header);

      const body = document.createElement("div");
      body.className = "hw-body";

      const msg = document.createElement("div");
      msg.className = "hw-msg";
      msg.textContent = "☠ Welcome to ASTRANOVA ☠";
      body.appendChild(msg);

      const details = document.createElement("div");
      details.className = "hw-details";
      details.textContent =
        "========================================================\n" +
        "☠☠☠ ATTENTION: YOUR MACHINE IS UNDER OUR CONTROL ☠☠☠\n" +
        "ESTABLISHED SECURE DATALINK TO ASTRANOVA CORE NETWORKS\n" +
        "DECRYPTING ALL FILES & PORTFOLIOS... 100% COMPLETE\n" +
        "--------------------------------------------------------\n" +
        "IP_TARGET: 127.0.0.1 (COMPROMISED) | SYSTEM_INTEGRITY: VOID\n" +
        "FIREWALL STATUS: TERMINATED | SECURITY GATEWAYS: BYPASSED\n" +
        "INITIALIZING FRONTEND UI RENDER SEQUENCE... [OK]";
      body.appendChild(details);

      el.appendChild(body);

      el.style.top = "50%";
      el.style.left = "50%";

      hackingContainer.appendChild(el);

      setTimeout(() => {
        el.remove();
      }, 1900);
    }

    // 初期状態セット
    gsap.set(logoText, { opacity: 0, scale: 0.95 });
    gsap.set(percentageEl, { opacity: 0 });

    // GSAP タイムライン構築
    const tl = gsap.timeline({
      onComplete: () => {
        finishIntro();
      },
    });

    // 1. ロゴのフェードイン & 進捗テキスト表示 & システムログの高速出力開始
    tl.to(logoText, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
      onStart: () => {
        printConsoleLog(); // 起動ログの出力開始
      },
    })
      .to(
        percentageEl,
        {
          opacity: 0.8,
          duration: 0.2,
        },
        "-=0.2",
      )

      // 2. システムテキストの更新とローディングの開始
      .to(
        {},
        {
          duration: 0.4,
          onStart: () => {
            statusText.textContent = "CONNECTING...";
          },
        },
      );

    // 3. ローディングカウンターとバーの同期アニメーション (3.2秒)
    const progressObj = { value: 0 };
    tl.to(
      progressObj,
      {
        value: 100,
        duration: 3.2,
        ease: "power1.inOut",
        onUpdate: () => {
          const val = Math.floor(progressObj.value);

          if (percentageEl) {
            // 15%の確率で、数字の代わりにサイバーチックな文字化け記号を一瞬表示する (デジタルグリッチ)
            if (Math.random() < 0.15 && val < 100) {
              const glitchChars = [
                "$%",
                "X#",
                "@9",
                "01",
                "[*]",
                "??",
                "!?",
                "##",
              ];
              const randChar =
                glitchChars[Math.floor(Math.random() * glitchChars.length)];
              percentageEl.textContent = `${val}${randChar}`;
            } else {
              percentageEl.textContent = `${val}%`;
            }
          }

          // 円形ゲージの塗りつぶし更新
          const dashoffset = 251.2 - val * 2.512;
          if (spinnerFill) spinnerFill.style.strokeDashoffset = dashoffset;

          // 95%に達した瞬間に、これまでの全ポップアップを一掃して「静寂」を作る
          if (val >= 95 && val < 98) {
            if (hackingContainer && hackingContainer.childNodes.length > 0) {
              hackingContainer.innerHTML = "";
            }
          }

          // 進捗度に応じて出現数を急激に増加させ、最終的に約400個のテキストで画面を覆い尽くす
          // 95%〜97%の間は一時的に生成を完全に停止する（静寂の演出）
          let targetCount = 0;
          if (val < 95) {
            if (val <= 30) {
              targetCount = Math.floor(val * 2);
            } else if (val <= 60) {
              targetCount = 60 + Math.floor((val - 30) * 3);
            } else if (val <= 85) {
              targetCount = 150 + Math.floor((val - 60) * 4);
            } else {
              targetCount = 250 + Math.floor((val - 85) * 8);
            }

            let delay = 0;
            while (triggeredAlertsCount < targetCount) {
              // 一斉に生成せず、微妙な時間ディレイ（delay）をかけて1つずつ滑らかに出現させる
              setTimeout(
                (function (cnt) {
                  return function () {
                    // すでに95%以上（静寂フェーズ以降）に移行している場合は、古い遅延生成を防ぐ
                    const currentVal = Math.floor(progressObj.value);
                    if (currentVal < 95) {
                      spawnHackingAlert();
                    }
                  };
                })(triggeredAlertsCount),
                delay,
              );

              // 進行度に応じて1つずつの生成間隔をランダム化し、パラパラと綺麗に出す
              delay += 10 + Math.random() * 25;
              triggeredAlertsCount++;
            }
          }

          // 98%以上に達した瞬間に、超巨大なラストアラートを1回だけ発火
          if (val >= 98 && !triggeredLastAlert) {
            triggeredLastAlert = true;
            spawnGiantHackingAlert();
          }

          // 進行度に応じたログ変更
          if (
            val > 45 &&
            val < 85 &&
            statusText.textContent !== "CONNECTING..."
          ) {
            statusText.textContent = "CONNECTING...";
          } else if (val >= 85 && statusText.textContent !== "SYNC COMPLETE") {
            statusText.textContent = "SYNC COMPLETE";
          }
        },
      },
      "-=0.2",
    )

      // 4. ローディング完了表示
      .to(
        {},
        {
          duration: 0.3,
          onStart: () => {
            statusText.textContent = "ASTRANOVA READY TO DEPLOY";
            statusText.style.color = "#ffffff";
            statusText.style.textShadow =
              "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px #00f3ff";
          },
        },
      )

      // 5. 映画風グリッチの起動
      .to(loader, {
        duration: 0.35,
        onStart: () => {
          loader.classList.add("glitch-active");
        },
        onComplete: () => {
          loader.classList.remove("glitch-active");
        },
      })

      // 6. ローダー全体のフェードアウト
      .to(loader, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.inOut",
      });

    function finishIntro() {
      if (loader) loader.style.display = "none";
      document.body.classList.remove("lock-scroll");
      window.scrollTo(0, 0);
      sessionStorage.setItem("astranova_intro_seen", "true");
      initHeroSlideshow();
    }
  }

  // ==========================================================================
  // 2.5 ヒーロー背景スライドショー (3秒間隔フェード自動切り替え)
  // ==========================================================================
  let isSlideshowStarted = false;
  const initHeroSlideshow = () => {
    if (isSlideshowStarted) return;
    isSlideshowStarted = true;

    const slides = selectAll(".hero-bg-slide");
    if (slides.length <= 1) return;

    let currentSlideIndex = 0;
    setInterval(() => {
      slides[currentSlideIndex].classList.remove("active");
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      slides[currentSlideIndex].classList.add("active");
    }, 3000);
  };

  // ==========================================================================
  // 3. インタラクティブカスタムカーソル (Custom Cursor)
  // ==========================================================================
  // 線形補間（Lerp: Linear Interpolation）アルゴリズムを用いて、
  // マウスの軌跡に対してカーソルリングが少し遅れて吸い付く高級感のあるモーションを表現します。
  let cursorX = 0;
  let cursorY = 0;
  let mouseX = -100; // 初期位置は画面外
  let mouseY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const renderCursor = () => {
    // イージング係数 0.15 (15%ずつ目標座標に近づける)
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    // カスタムカーソル位置の更新
    if (customCursor) {
      customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(renderCursor);
  };

  // カーソルのアニメーションループ開始
  requestAnimationFrame(renderCursor);

  // ホバーエフェクト登録 (リンク、ボタン、モーダル、スポンサー等のインタラクティブ要素)
  if (customCursor) {
    const interactives = selectAll(
      "a, button, input, select, textarea, .gallery-card, .sponsor-logo-box, .cf-turnstile",
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        customCursor.classList.add("hovered");
      });
      el.addEventListener("mouseleave", () => {
        customCursor.classList.remove("hovered");
      });
    });
  }

  // ==========================================================================
  // 4. スクロール進捗インジケーター & ヘッダー固定 (Header Scroll State)
  // ==========================================================================
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    // スクロール進捗率の算出とインジケーター反映
    if (scrollHeight > 0) {
      const scrolledPercentage = (scrollTop / scrollHeight) * 100;
      scrollProgress.style.width = `${scrolledPercentage}%`;
    }

    // ヘッダーデザインのスクロール追従切り替え（一定スクロールで黒背景化）
    if (scrollTop > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // 微細なパララックス効果 (ヒーロー背景画像を視差スクロール)
    if (heroBg && window.innerWidth > 768) {
      // 画面スクロール量の 30% をY軸移動に反映
      heroBg.style.transform = `translate3d(0, ${scrollTop * 0.3}px, 0)`;
    }
  });

  // ==========================================================================
  // 5. Intersection Observer (スクロール出現演出)
  // ==========================================================================
  const revealOptions = {
    root: null,
    threshold: 0.15,
  };

  const revealCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(
    revealCallback,
    revealOptions,
  );

  selectAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  // ==========================================================================
  // 6. ハンバーガーメニュー (Mobile Navigation)
  // ==========================================================================
  const toggleMenu = () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", !isOpen);
    mobileNav.classList.toggle("active");
    mobileNav.setAttribute("aria-hidden", isOpen);
    document.body.classList.toggle("lock-scroll");
  };

  menuToggle.addEventListener("click", toggleMenu);

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("active");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lock-scroll");
    });
  });

  // ==========================================================================
  // 7. 画像ギャラリーモーダル (Lightbox)
  // ==========================================================================
  galleryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const svg = card.querySelector(".gallery-svg");
      if (!svg) return;

      const clonedSvg = svg.cloneNode(true);
      clonedSvg.removeAttribute("class");
      clonedSvg.removeAttribute("style");

      const label = svg.getAttribute("aria-label") || "ギャラリーハイライト";

      lightboxPlaceholder.innerHTML = "";
      lightboxPlaceholder.appendChild(clonedSvg);
      lightboxCaption.textContent = label;

      lightboxModal.classList.add("active");
      document.body.classList.add("lock-scroll");
    });
  });

  const closeLightbox = () => {
    lightboxModal.classList.remove("active");
    document.body.classList.remove("lock-scroll");
    setTimeout(() => {
      lightboxPlaceholder.innerHTML = "";
      lightboxCaption.textContent = "";
    }, 500);
  };

  lightboxClose.addEventListener("click", closeLightbox);

  lightboxModal.addEventListener("click", (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxModal.classList.contains("active")) {
      closeLightbox();
    }
  });

  // ==========================================================================
  // 8. 採用応募フォーム送信 & バリデーション & Turnstile対策
  // ==========================================================================

  // 入力値バリデーション関数 (年齢、希望職種、Discord、ポートフォリオ等に対応)
  const validateField = (input) => {
    const errorSpan = select(`#${input.id}-error`);
    if (!errorSpan) return true;

    let isValid = true;
    let errorMsg = "";

    // 空チェック (必須項目)
    if (input.required && (!input.value || !input.value.trim())) {
      isValid = false;
      errorMsg = "このフィールドは入力必須です。";
    }
    // メールアドレス形式チェック
    else if (input.type === "email" && input.value.trim()) {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!emailRegex.test(input.value.trim())) {
        isValid = false;
        errorMsg = "有効なメールアドレス形式で入力してください。";
      }
    }
    // 年齢バリデーション (数値かつ12才以上100才以下)
    else if (input.id === "age" && input.value.trim()) {
      const ageVal = parseInt(input.value.trim(), 10);
      if (isNaN(ageVal) || ageVal < 12 || ageVal > 100) {
        isValid = false;
        errorMsg = "有効な年齢（12〜100）を入力してください。";
      }
    }
    // SNS/動画/ポートフォリオURLバリデーション (入力がある場合のみ検証。セキュリティのためhttpsのみ許容)
    else if (
      (input.id === "portfolio" || input.type === "url") &&
      input.value.trim()
    ) {
      try {
        const parsedUrl = new URL(input.value.trim());
        if (parsedUrl.protocol !== "https:") {
          isValid = false;
          errorMsg =
            "セキュリティ保護のため、https:// で始まるURLのみ入力可能です。";
        }
      } catch (_) {
        isValid = false;
        errorMsg = "有効なURL（https://...）を入力してください。";
      }
    }

    // エラー表示状態のUI切り替え
    if (!isValid) {
      errorSpan.textContent = errorMsg;
      input.classList.add("invalid");
    } else {
      errorSpan.textContent = "";
      input.classList.remove("invalid");
    }

    return isValid;
  };

  if (contactForm) {
    // 各入力項目のフォーカス離脱(blur)イベントで即座に個別検証
    const formInputs = contactForm.querySelectorAll(".form-input");
    formInputs.forEach((input) => {
      input.addEventListener("blur", () => validateField(input));
    });

    // セレクトボックスの選択変更時にも即時バリデーション
    const roleSelect = select("#role");
    if (roleSelect) {
      roleSelect.addEventListener("change", () => validateField(roleSelect));
    }

    // フォーム送信ハンドラー
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. 全入力値の検証
      let isFormValid = true;
      formInputs.forEach((input) => {
        const isValid = validateField(input);
        if (!isValid) isFormValid = false;
      });

      // 2. Cloudflare Turnstile のトークン取得確認
      const turnstileResponse = contactForm.querySelector(
        '[name="cf-turnstile-response"]',
      );
      const turnstileErrorSpan = select("#turnstile-error");

      if (!turnstileResponse || !turnstileResponse.value) {
        isFormValid = false;
        turnstileErrorSpan.textContent =
          "セキュリティ認証（Botチェック）を完了してください。";
      } else {
        turnstileErrorSpan.textContent = "";
      }

      if (!isFormValid) {
        formAlert.className = "form-alert error";
        formAlert.textContent =
          "入力内容、またはセキュリティ認証に不備があります。";
        formAlert.style.display = "block";
        return;
      }

      // 3. 送信処理状態への遷移（ボタンローディング化、入力の不活性化）
      formSubmitBtn.classList.add("submitting");
      formSubmitBtn.disabled = true;
      formInputs.forEach((input) => (input.disabled = true));
      formAlert.style.display = "none";

      // 応募データの payload 構築
      const payload = {
        name: select("#name").value.trim(),
        email: select("#email").value.trim(),
        age: parseInt(select("#age").value.trim(), 10),
        discord: select("#discord").value.trim(),
        role: select("#role").value,
        portfolio: select("#portfolio").value.trim(),
        message: select("#message").value.trim(),
        turnstileToken: turnstileResponse.value,
      };

      try {
        // サーバーレスお問い合わせ/応募エンドポイントへPOST送信
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          formAlert.className = "form-alert success";
          formAlert.textContent =
            result.message ||
            "エントリーを受け付けました。ご応募ありがとうございます。";
          formAlert.style.display = "block";

          contactForm.reset();
          if (window.turnstile) {
            window.turnstile.reset("#turnstile-widget");
          }
        } else {
          throw new Error(result.message || "送信中にエラーが発生しました。");
        }
      } catch (error) {
        formAlert.className = "form-alert error";
        formAlert.textContent =
          error.message || "接続エラーが発生しました。再度お試しください。";
        formAlert.style.display = "block";

        if (window.turnstile) {
          window.turnstile.reset("#turnstile-widget");
        }
      } finally {
        formSubmitBtn.classList.remove("submitting");
        formSubmitBtn.disabled = false;
        formInputs.forEach((input) => (input.disabled = false));
      }
    });
  }

  // ==========================================================================
  // 9. トップに戻るボタン (Back to Top Button)
  // ==========================================================================
  const backToTopBtn = select("#back-to-top");

  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // 300px以上スクロールしたら表示
      if (scrollTop > 300) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    // スムーズスクロールでトップに戻る
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    // ホバーエフェクト登録 (カスタムカーソル用)
    if (customCursor) {
      backToTopBtn.addEventListener("mouseenter", () => {
        customCursor.classList.add("hovered");
      });
      backToTopBtn.addEventListener("mouseleave", () => {
        customCursor.classList.remove("hovered");
      });
    }
  }

  // ==========================================================================
  // 10. ダーク／ライトモード切り替え（サイバーグリッチ遷移演出付き）
  // ==========================================================================
  const themeToggleBtn = select("#theme-toggle-btn");
  const glitchOverlay = select("#theme-glitch-overlay");

  if (themeToggleBtn && glitchOverlay) {
    // 保存されたテーマの復元（未保存の場合はdark）
    const savedTheme = localStorage.getItem("astranova_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    themeToggleBtn.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      // グリッチアニメーションのトリガー
      glitchOverlay.classList.add("glitch-active");

      // グリッチ演出の中間タイミング（100ms後）で実際にテーマ変数を切り替え
      setTimeout(() => {
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("astranova_theme", newTheme);
      }, 100);

      // 0.25秒後にアニメーションクラスを除去
      setTimeout(() => {
        glitchOverlay.classList.remove("glitch-active");
      }, 250);
    });
  }
});
