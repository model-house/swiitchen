// Admin Page JavaScript
import { DataLoader } from "./modules/dataLoader.js";

export class AdminPanel {
  constructor() {
    this.dataLoader = new DataLoader();
    this.currentData = null;
    this.activeTab = "site-settings"; // 기본 탭을 site-settings로 설정
    this.unsavedChanges = false;
  }

  async init() {
    // 데이터 로드
    await this.loadData();

    // 이벤트 리스너 설정
    this.setupNavigation();
    this.setupSiteSettings(); // SEO + 푸터 통합
    this.setupHeroSection();
    this.setupOverviewSection();
    this.setupLocationSection();
    this.setupFloorPlansSection();
    this.setupPremiumSection();
    this.setupOptionsSection();
    this.setupConvenienceSection();
    this.setupCommunitySection();
    this.setupContactSection(); // 단순화
    this.setupSaveButtons();
    this.setupCharCounters();

    // 평면도 카드 초기 로드
    console.log("평면도 데이터:", this.currentData.floorPlans);
    if (this.currentData.floorPlans?.plans) {
      console.log("평면도 카드 생성 중...");
      this.populateFloorPlans();
    }

    // 자동 저장 설정 (5분마다)
    setInterval(() => {
      if (this.unsavedChanges) {
        this.autoSave();
      }
    }, 300000);
  }

  async loadData() {
    try {
      this.currentData = await this.dataLoader.loadData();
      this.populateFields();
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      this.showNotification("데이터를 불러올 수 없습니다.", "error");
    }
  }

  populateFields() {
    // 사이트 정보
    if (this.currentData.site) {
      document.getElementById("site-title").value =
        this.currentData.site.title || "";
      document.getElementById("contact-phone").value =
        this.currentData.site.contact?.phone || "";
      document.getElementById("business-hours").value =
        this.currentData.site.contact?.hours || "";
    }

    // 통합 관리 필드 - contact 또는 footer에서 가져오기
    if (this.currentData.contact) {
      document.getElementById("site-address").value =
        this.currentData.contact.address || "";
      document.getElementById("site-kakao").value =
        this.currentData.contact.kakao || "";
    }

    // SEO 필드는 동적으로 생성
    this.generateSEOFields();

    // 히어로 섹션
    if (this.currentData.hero) {
      document.getElementById("hero-title").value =
        this.currentData.hero.title || "";
      document.getElementById("hero-subtitle").value =
        this.currentData.hero.subtitle || "";
      document.getElementById("hero-badge").value = "GRAND OPEN";

      // 슬라이드 이미지 로드
      this.loadHeroSlideImages();
    }

    // 사업개요 섹션
    if (this.currentData.overview) {
      this.populateOverviewItems();
    }

    // 입지환경 섹션
    if (this.currentData.location) {
      document.getElementById("location-title").value =
        this.currentData.location.title || "";
      document.getElementById("location-description").value =
        this.currentData.location.description || "";
    }

    // 평면도 섹션
    if (this.currentData.floorPlans) {
      document.getElementById("floorplans-title").value =
        this.currentData.floorPlans.title || "";
      document.getElementById("floorplans-description").value =
        this.currentData.floorPlans.description || "";
      this.populateFloorPlans();
    }

    // 옵션
    if (this.currentData.options) {
      document.getElementById("options-title").value =
        this.currentData.options.title || "";
      document.getElementById("options-description").value =
        this.currentData.options.description || "";
      document.getElementById("options-visible").checked =
        this.currentData.options.visible !== false;
      this.loadOptionsCategories();
    }

    // 시스템 (편의시설)
    if (this.currentData.convenience) {
      document.getElementById("convenience-title").value =
        this.currentData.convenience.title || "";
      document.getElementById("convenience-description").value =
        this.currentData.convenience.description || "";
      document.getElementById("convenience-subtitle").value =
        this.currentData.convenience.subtitle || "";
      document.getElementById("convenience-visible").checked =
        this.currentData.convenience.visible !== false;
      this.loadConvenienceCategories();
    }

    // 커뮤니티 시설
    if (this.currentData.community) {
      document.getElementById("community-title").value =
        this.currentData.community.title || "";
      document.getElementById("community-description").value =
        this.currentData.community.description || "";
      document.getElementById("community-visible").checked =
        this.currentData.community.visible !== false;
      this.loadCommunityFacilities();
    }

    // 연락처 섹션 (제목만 관리 - 나머지는 통합 관리)
    if (this.currentData.contact) {
      if (document.getElementById("contact-title")) {
        document.getElementById("contact-title").value =
          this.currentData.contact.title || "상담 문의";
      }
      if (document.getElementById("contact-subtitle")) {
        document.getElementById("contact-subtitle").value =
          this.currentData.contact.subtitle ||
          "위의 내용 중 궁금한 점이 있으신가요?";
      }
      // 전화번호, 주소, 운영시간, 카카오톡은 site-settings 섹션에서 통합 관리
    }

    // 푸터 설정
    if (this.currentData.footer) {
      document.getElementById("footer-project-name").value =
        this.currentData.footer.projectInfo?.projectName || "";
      document.getElementById("footer-manager").value =
        this.currentData.footer.projectInfo?.manager || "";
      document.getElementById("footer-description").value =
        this.currentData.footer.projectInfo?.description || "";
      document.getElementById("footer-address").value =
        this.currentData.footer.projectInfo?.address || "";

      document.getElementById("footer-developer").value =
        this.currentData.footer.companies?.developer || "";
      document.getElementById("footer-constructor").value =
        this.currentData.footer.companies?.constructor || "";
      document.getElementById("footer-trustee").value =
        this.currentData.footer.companies?.trustee || "";

      document.getElementById("footer-phone").value =
        this.currentData.footer.contacts?.phone || "";
      document.getElementById("footer-kakao").value =
        this.currentData.footer.contacts?.kakao || "";

      document.getElementById("footer-note").value =
        this.currentData.footer.additionalNote || "";

      // 경고 문구 로드
      this.loadFooterDisclaimers();
    }
  }

  generateSEOFields() {
    const title = this.currentData.site?.title || "김포 오퍼스 한강 스위첸";
    const location = "김포 한강신도시";

    // 기존 SEO 데이터가 있으면 사용, 없으면 자동 생성
    if (this.currentData.seo) {
      document.getElementById("meta-title").value =
        this.currentData.seo.title || "";
      document.getElementById("meta-description").value =
        this.currentData.seo.description || "";
      document.getElementById("meta-keywords").value =
        this.currentData.seo.keywords || "";

      // OG 이미지 설정
      if (this.currentData.seo.ogImage) {
        const previewImage = document.querySelector(".seo-form .preview-image");
        if (previewImage) {
          previewImage.src = this.currentData.seo.ogImage;
        }
      }
    } else {
      // 메타 타이틀 자동 생성
      const metaTitle = `${title} | ${location} 프리미엄 아파트 분양`;
      document.getElementById("meta-title").value = metaTitle;

      // 메타 설명 자동 생성
      const metaDesc = `${location} 프리미엄 아파트 ${title}. 지하철 도보 5분, 한강조망, 84㎡·99㎡ 분양. 모델하우스 오픈!`;
      document.getElementById("meta-description").value = metaDesc;

      // 키워드 자동 생성
      const keywords = `김포 아파트, ${location}, 김포 분양, 스위첸, 오퍼스, ${title}`;
      document.getElementById("meta-keywords").value = keywords;
    }

    this.updateSEOPreview();
  }

  updateSEOPreview() {
    // SEO 미리보기 업데이트
    const previewTitle = document.querySelector(".preview-title");
    const previewDescription = document.querySelector(".preview-description");
    const previewUrl = document.querySelector(".preview-url");

    // 메타 필드 값 가져오기
    const metaTitle = document.getElementById("meta-title")?.value || "";
    const metaDescription =
      document.getElementById("meta-description")?.value || "";
    const siteTitle =
      document.getElementById("site-title")?.value || "김포 오퍼스 한강 스위첸";

    // 미리보기 업데이트
    if (previewTitle) {
      // 타이틀이 비어있으면 사이트 제목 사용
      const displayTitle = metaTitle || siteTitle;
      // Google 검색 결과처럼 60자 제한 표시
      previewTitle.textContent =
        displayTitle.length > 60
          ? displayTitle.substring(0, 57) + "..."
          : displayTitle;
    }

    if (previewDescription) {
      // 설명이 비어있으면 기본 설명 사용
      const displayDesc =
        metaDescription || "김포 한강신도시 프리미엄 아파트 분양";
      // Google 검색 결과처럼 160자 제한 표시
      previewDescription.textContent =
        displayDesc.length > 160
          ? displayDesc.substring(0, 157) + "..."
          : displayDesc;
    }

    if (previewUrl) {
      // URL은 고정값 또는 실제 도메인 사용
      previewUrl.textContent = "https://kimpo-opus.co.kr";
    }
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll(".admin-nav a");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        this.switchTab(tab);
      });
    });
  }

  switchTab(tab) {
    // 탭 활성화
    document.querySelectorAll(".admin-nav li").forEach((li) => {
      li.classList.remove("active");
    });

    const activeTab = document.querySelector(`[data-tab="${tab}"]`);
    if (activeTab && activeTab.parentElement) {
      activeTab.parentElement.classList.add("active");
    }

    // 섹션 전환
    document.querySelectorAll(".admin-section").forEach((section) => {
      section.classList.remove("active");
    });

    const targetSection = document.getElementById(tab);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    this.activeTab = tab;
  }

  setupSiteSettings() {
    // 사이트 기본 설정 (프로젝트 정보, SEO, 회사 정보, 고지사항)

    // 프로젝트 정보
    if (document.getElementById("site-name")) {
      document.getElementById("site-name").value =
        this.currentData.site?.title || "";
    }
    if (document.getElementById("site-location")) {
      document.getElementById("site-location").value =
        this.currentData.footer?.projectInfo?.address ||
        this.currentData.overview?.items?.find((item) => item.label === "위치")
          ?.value ||
        "";
    }
    if (document.getElementById("site-phone")) {
      document.getElementById("site-phone").value =
        this.currentData.site?.contact?.phone || "";
    }
    if (document.getElementById("site-hours")) {
      document.getElementById("site-hours").value =
        this.currentData.site?.contact?.hours || "";
    }

    // SEO 설정
    if (document.getElementById("seo-title")) {
      document.getElementById("seo-title").value =
        this.currentData.seo?.title || "";
    }
    if (document.getElementById("seo-description")) {
      document.getElementById("seo-description").value =
        this.currentData.seo?.description || "";
    }
    if (document.getElementById("seo-keywords")) {
      document.getElementById("seo-keywords").value =
        this.currentData.seo?.keywords || "";
    }
    if (document.getElementById("seo-ogimage")) {
      document.getElementById("seo-ogimage").value =
        this.currentData.seo?.ogImage || "assets/images/hero/hero.jpg";
    }

    // 회사 정보
    if (document.getElementById("company-developer")) {
      document.getElementById("company-developer").value =
        this.currentData.footer?.companies?.developer || "";
    }
    if (document.getElementById("company-constructor")) {
      document.getElementById("company-constructor").value =
        this.currentData.footer?.companies?.constructor || "";
    }
    if (document.getElementById("company-trustee")) {
      document.getElementById("company-trustee").value =
        this.currentData.footer?.companies?.trustee || "";
    }

    // 고지사항
    this.loadDisclaimers();

    // 고지사항 추가 버튼
    const addDisclaimerBtn = document.getElementById("add-disclaimer");
    if (addDisclaimerBtn) {
      addDisclaimerBtn.addEventListener("click", () => {
        this.addDisclaimer();
      });
    }

    // OG 이미지 파일 업로드
    const ogImageUpload = document.getElementById("og-image-upload");
    if (ogImageUpload) {
      ogImageUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileName = file.name;
          const imagePath = `assets/images/${fileName}`;

          // 파일명 표시
          document.getElementById(
            "og-image-name"
          ).textContent = `선택된 파일: ${fileName}`;

          // 미리보기 업데이트
          const reader = new FileReader();
          reader.onload = (e) => {
            document.getElementById("og-image-preview").src = e.target.result;
            this.unsavedChanges = true;
          };
          reader.readAsDataURL(file);

          this.showNotification(
            `이미지가 선택되었습니다. 파일을 assets/images/ 폴더에 ${fileName}으로 저장해주세요.`,
            "info"
          );
        }
      });
    }

    // 변경 감지
    const inputs = [
      "site-name",
      "site-location",
      "site-phone",
      "site-hours",
      "seo-title",
      "seo-description",
      "seo-keywords",
      "seo-ogimage",
      "company-developer",
      "company-constructor",
      "company-trustee",
      "site-title",
      "contact-phone",
      "business-hours",
      "site-address",
      "site-kakao", // 통합 필드 추가
    ];

    inputs.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("input", () => {
          this.unsavedChanges = true;
        });
      }
    });
  }

  loadDisclaimers() {
    const container = document.getElementById("disclaimers-list");
    if (!container) return;

    container.innerHTML = "";

    const disclaimers = this.currentData.footer?.disclaimers || [
      "상기 내용은 인·허가 과정이나 실제 시공 시 현장 여건 등에 따라 일부 변경될 수 있습니다.",
      "사용된 이미지 혹은 CG는 소비자의 이해를 돕기 위한 것으로 실제와 차이가 날 수 있습니다.",
    ];

    disclaimers.forEach((text) => {
      this.createDisclaimerItem(text);
    });
  }

  createDisclaimerItem(text = "") {
    const container = document.getElementById("disclaimers-list");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "disclaimer-item";
    div.innerHTML = `
            <textarea rows="2" placeholder="예: 상기 내용은 인·허가 과정이나 실제 시공 시 현장 여건 등에 따라 일부 변경될 수 있습니다.">${text}</textarea>
            <button class="btn-remove-disclaimer">×</button>
        `;

    div
      .querySelector(".btn-remove-disclaimer")
      .addEventListener("click", () => {
        div.remove();
        this.unsavedChanges = true;
      });

    div.querySelector("textarea").addEventListener("input", () => {
      this.unsavedChanges = true;
    });

    container.appendChild(div);
  }

  addDisclaimer() {
    this.createDisclaimerItem("");
    this.unsavedChanges = true;
  }

  setupCharCounters() {
    // 글자 수 카운터
    const inputs = [
      { id: "meta-title", max: 60 },
      { id: "meta-description", max: 160 },
    ];

    inputs.forEach((input) => {
      const element = document.getElementById(input.id);
      if (element) {
        const counter = element.parentElement.querySelector(".char-count");

        const updateCounter = () => {
          const length = element.value.length;
          if (counter) {
            counter.textContent = `${length}/${input.max}`;
            counter.style.color = length > input.max ? "#e74c3c" : "#7f8c8d";
          }
          // SEO 미리보기 업데이트
          this.updateSEOPreview();
        };

        element.addEventListener("input", updateCounter);
        updateCounter();
      }
    });

    // 키워드 필드에도 이벤트 추가
    const keywordsField = document.getElementById("meta-keywords");
    if (keywordsField) {
      keywordsField.addEventListener("input", () => {
        this.updateSEOPreview();
      });
    }

    // 사이트 제목 필드에도 이벤트 추가
    const siteTitleField = document.getElementById("site-title");
    if (siteTitleField) {
      siteTitleField.addEventListener("input", () => {
        this.updateSEOPreview();
      });
    }
  }

  setupHeroSection() {
    // 슬라이드 추가 버튼
    const addSlideBtn = document.querySelector(".btn-add-slide");
    if (addSlideBtn) {
      addSlideBtn.addEventListener("click", () => {
        this.addHeroSlideImage();
      });
    }

    // 슬라이드 제거 버튼들
    this.setupRemoveButtons(".slide-item");
  }

  loadHeroSlideImages() {
    const container = document.querySelector(".slide-images");
    if (!container) return;

    // 기존 슬라이드 제거 (버튼 제외)
    container.querySelectorAll(".slide-item").forEach((item) => item.remove());

    // 슬라이드 이미지 배열 가져오기
    let images = [];
    if (
      this.currentData.hero.slideImages &&
      this.currentData.hero.slideImages.length > 0
    ) {
      images = this.currentData.hero.slideImages;
    } else if (this.currentData.hero.backgroundImage) {
      images = [this.currentData.hero.backgroundImage];
    } else {
      images = ["assets/images/hero/hero.jpg"];
    }

    // 슬라이드 아이템 생성
    images.forEach((imagePath) => {
      const div = document.createElement("div");
      div.className = "slide-item";
      div.innerHTML = `
                <img src="${imagePath}" alt="Slide">
                <button class="btn-remove">×</button>
            `;
      container.insertBefore(div, container.querySelector(".btn-add-slide"));
    });

    // 제거 버튼 이벤트 재설정
    this.setupRemoveButtons(".slide-item");
  }

  addHeroSlideImage() {
    // 파일 선택 대화상자 생성
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        // 실제 구현에서는 서버에 업로드 후 경로를 받아야 하지만,
        // 여기서는 로컬 경로를 사용
        const fileName = file.name;
        const imagePath = `assets/images/hero/${fileName}`;

        // FileReader를 사용해 미리보기 표시
        const reader = new FileReader();
        reader.onload = (e) => {
          const container = document.querySelector(".slide-images");
          const div = document.createElement("div");
          div.className = "slide-item";
          div.innerHTML = `
                        <img src="${e.target.result}" alt="Slide" data-path="${imagePath}">
                        <button class="btn-remove">×</button>
                    `;
          container.insertBefore(
            div,
            container.querySelector(".btn-add-slide")
          );

          // 제거 버튼 이벤트 재설정
          this.setupRemoveButtons(".slide-item");
          this.unsavedChanges = true;

          // 사용자에게 알림
          this.showNotification(
            `이미지가 추가되었습니다. 파일을 assets/images/hero/ 폴더에 ${fileName}으로 저장해주세요.`,
            "info"
          );
        };
        reader.readAsDataURL(file);
      }
    });

    input.click();
  }

  setupOverviewSection() {
    // 사업개요 항목 채우기
    this.populateOverviewItems();

    // 사업개요 이미지 채우기
    this.populateOverviewImages();

    // 항목 추가 버튼
    const addInfoBtn = document.querySelector(".btn-add-info");
    if (addInfoBtn) {
      addInfoBtn.addEventListener("click", () => {
        this.addInfoItem();
      });
    }

    // 이미지 추가 버튼
    const addImageBtn = document.querySelector(".btn-add-image");
    if (addImageBtn) {
      addImageBtn.addEventListener("click", () => {
        this.addOverviewImage();
      });
    }

    // 제거 버튼들
    this.setupRemoveButtons(".info-item");
    this.setupRemoveButtons(".image-item");
  }

  populateOverviewImages() {
    const container = document.querySelector(".overview-images .image-grid");
    if (!container || !this.currentData.overview) return;

    // 기존 이미지 제거 (버튼 제외)
    container.querySelectorAll(".image-item").forEach((item) => item.remove());

    // 이미지 배열 가져오기
    const images = this.currentData.overview.images || [];

    // 이미지 아이템 생성
    images.forEach((imagePath) => {
      const div = document.createElement("div");
      div.className = "image-item";
      div.innerHTML = `
                <img src="${imagePath}" alt="사업개요 이미지">
                <button class="btn-remove">×</button>
            `;
      container.insertBefore(div, container.querySelector(".btn-add-image"));
    });

    // 제거 버튼 이벤트 재설정
    this.setupRemoveButtons(".image-item");
  }

  addOverviewImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileName = file.name;
        const imagePath = `assets/images/gaeyo/${fileName}`;

        const reader = new FileReader();
        reader.onload = (e) => {
          const container = document.querySelector(
            ".overview-images .image-grid"
          );
          const div = document.createElement("div");
          div.className = "image-item";
          div.innerHTML = `
                        <img src="${e.target.result}" alt="사업개요" data-path="${imagePath}">
                        <button class="btn-remove">×</button>
                    `;
          container.insertBefore(
            div,
            container.querySelector(".btn-add-image")
          );

          // 제거 버튼 이벤트 재설정
          this.setupRemoveButtons(".image-item");
          this.unsavedChanges = true;

          this.showNotification(
            `이미지가 추가되었습니다. 파일을 assets/images/gaeyo/ 폴더에 ${fileName}으로 저장해주세요.`,
            "info"
          );
        };
        reader.readAsDataURL(file);
      }
    });

    input.click();
  }

  setupLocationSection() {
    // 입지환경 특징 채우기
    this.populateLocationHighlights();

    // 특징 추가 버튼
    const addHighlightBtn = document.querySelector(".btn-add-highlight");
    if (addHighlightBtn) {
      addHighlightBtn.addEventListener("click", () => {
        this.addHighlightItem();
      });
    }

    // 이미지 변경 버튼
    const changeImageBtn = document.querySelector(".btn-change-location-image");
    if (changeImageBtn) {
      changeImageBtn.addEventListener("click", () => {
        this.changeLocationImage();
      });
    }
  }

  populateLocationHighlights() {
    const container = document.querySelector(".location-highlights");
    if (!container || !this.currentData.location) return;

    // 기존 항목 제거 (버튼 제외)
    container
      .querySelectorAll(".highlight-item")
      .forEach((item) => item.remove());

    // 데이터로 항목 생성
    this.currentData.location.highlights.forEach((highlight) => {
      const itemElement = this.createHighlightItem(
        highlight.icon,
        highlight.title,
        highlight.description
      );
      container.insertBefore(
        itemElement,
        container.querySelector(".btn-add-highlight")
      );
    });
  }

  createHighlightItem(icon = "", title = "", description = "") {
    const div = document.createElement("div");
    div.className = "highlight-item";
    div.innerHTML = `
            <input type="text" placeholder="아이콘" value="${icon}" style="width: 60px;">
            <input type="text" placeholder="제목" value="${title}">
            <input type="text" placeholder="설명" value="${description}">
            <button class="btn-remove">×</button>
        `;

    // 제거 버튼 이벤트
    div.querySelector(".btn-remove").addEventListener("click", () => {
      div.remove();
      this.unsavedChanges = true;
    });

    // 변경 감지
    div.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        this.unsavedChanges = true;
      });
    });

    return div;
  }

  addHighlightItem() {
    const container = document.querySelector(".location-highlights");
    const newItem = this.createHighlightItem("🎆", "특징", "설명을 입력하세요");
    container.insertBefore(
      newItem,
      container.querySelector(".btn-add-highlight")
    );
    this.unsavedChanges = true;
  }

  setupFloorPlansSection() {
    // 탭 버튼 설정
    this.setupFloorplanTabs();

    // 평면도 추가 버튼
    const addFloorplanBtn = document.getElementById("add-floorplan");
    if (addFloorplanBtn) {
      addFloorplanBtn.addEventListener("click", () => {
        this.openFloorPlanModal();
      });
    }

    // 단지 개요 제거로 면적 항목 추가 버튼도 제거
  }

  setupPremiumSection() {
    // 프리미엄 섹션 설정
    if (this.currentData.premium) {
      document.getElementById("premium-title").value =
        this.currentData.premium.title || "";
      document.getElementById("premium-description").value =
        this.currentData.premium.description || "";
      document.getElementById("premium-additional").value =
        this.currentData.premium.additionalInfo || "";
      document.getElementById("premium-visible").checked =
        this.currentData.premium.visible !== false;

      // 레이아웃 타입 설정
      const layoutSelect = document.getElementById("premium-layout-type");
      if (layoutSelect) {
        layoutSelect.value = this.currentData.premium.layoutType || "cards";
      }

      // 프리미엄 특징 로드
      this.loadPremiumFeatures();

      // 프리미엄 이미지 로드
      this.loadPremiumImages();
    }

    // 특징 추가 버튼
    const addFeatureBtn = document.getElementById("add-premium-feature");
    if (addFeatureBtn) {
      addFeatureBtn.addEventListener("click", () => {
        this.addPremiumFeature();
      });
    }

    // 이미지 추가 버튼
    const addImageBtn = document.querySelector(".btn-add-premium-image");
    if (addImageBtn) {
      addImageBtn.addEventListener("click", () => {
        this.addPremiumImage();
      });
    }
  }

  loadPremiumFeatures() {
    const container = document.getElementById("premium-features-list");
    if (!container || !this.currentData.premium?.features) return;

    container.innerHTML = "";
    this.currentData.premium.features.forEach((feature) => {
      this.addPremiumFeature(feature);
    });
  }

  addPremiumFeature(data = null) {
    const container = document.getElementById("premium-features-list");
    if (!container) return;

    const featureCount = container.children.length;
    const featureIndex = featureCount;

    // 탭 버튼 추가
    const tabsContainer = document.getElementById("premium-tabs");
    if (!tabsContainer) {
      // 탭 컨테이너가 없으면 생성
      const tabsHtml = '<div id="premium-tabs" class="premium-tabs"></div>';
      container.insertAdjacentHTML("beforebegin", tabsHtml);
    }

    const tabButton = document.createElement("button");
    tabButton.className = `premium-tab ${featureCount === 0 ? "active" : ""}`;
    tabButton.textContent = featureCount + 1;
    tabButton.dataset.index = featureIndex;

    // 탭 클릭 이벤트
    tabButton.addEventListener("click", () => {
      document
        .querySelectorAll(".premium-tab")
        .forEach((tab) => tab.classList.remove("active"));
      document
        .querySelectorAll(".premium-feature-item")
        .forEach((item) => item.classList.remove("active"));
      tabButton.classList.add("active");
      container.children[featureIndex]?.classList.add("active");
    });

    document.getElementById("premium-tabs")?.appendChild(tabButton);

    // 특징 카드 생성
    const div = document.createElement("div");
    div.className = `premium-feature-item ${
      featureCount === 0 ? "active" : ""
    }`;
    div.dataset.index = featureIndex;

    div.innerHTML = `
            <div class="feature-card">
                <div class="feature-card-header">
                    <h4>프리미엄 특징 ${featureCount + 1}</h4>
                    <button class="btn-delete-feature" title="삭제">
                        <span>삭제</span>
                    </button>
                </div>
                
                <div class="feature-card-body">
                    <div class="form-row">
                        <div class="form-col-icon">
                            <label>아이콘</label>
                            <input type="text" 
                                   class="feature-icon-input" 
                                   placeholder="🏢" 
                                   value="${data?.icon || "⭐"}" 
                                   maxlength="2">
                        </div>
                        <div class="form-col-title">
                            <label>제목</label>
                            <input type="text" 
                                   class="feature-title-input" 
                                   placeholder="예: 놀라운 미래가치" 
                                   value="${data?.title || ""}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-col-full">
                            <label>설명</label>
                            <textarea class="feature-description-input"
                                      placeholder="예: 한강시내플러스 내 공동주택의 가치&#10;입구 도시개발 및 김포메디컬 캠퍼스 계획 등" 
                                      rows="3">${
                                        data?.description || ""
                                      }</textarea>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-col-full">
                            <label>상세 항목 (선택, 엔터로 구분)</label>
                            <textarea class="feature-details-input"
                                      placeholder="예시:\n• 한강시내플러스 내 공동주택의 가치\n• 입구 도시개발 계획\n• 김포메디컬 캠퍼스 계획" 
                                      rows="4">${
                                        data?.details
                                          ? data.details.join("\n")
                                          : ""
                                      }</textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // 삭제 버튼
    div.querySelector(".btn-delete-feature").addEventListener("click", () => {
      const index = parseInt(div.dataset.index);

      // 탭과 컨텐츠 삭제
      div.remove();
      document.getElementById("premium-tabs")?.children[index]?.remove();

      // 탭 번호 재정렬
      document.querySelectorAll(".premium-tab").forEach((tab, idx) => {
        tab.textContent = idx + 1;
        tab.dataset.index = idx;
      });

      // 컨텐츠 인덱스 재정렬
      document
        .querySelectorAll(".premium-feature-item")
        .forEach((item, idx) => {
          item.dataset.index = idx;
          item.querySelector("h4").textContent = `프리미엄 특징 ${idx + 1}`;
        });

      // 첫 번째 탭 활성화
      if (container.children.length > 0) {
        document.querySelector(".premium-tab")?.click();
      }

      this.unsavedChanges = true;
    });

    // 변경 감지
    div.querySelectorAll("input, textarea").forEach((element) => {
      element.addEventListener("input", () => {
        this.unsavedChanges = true;
      });
    });

    container.appendChild(div);
  }

  loadPremiumImages() {
    const container = document.getElementById("premium-images-list");
    if (!container || !this.currentData.premium?.images) return;

    container.innerHTML = "";
    this.currentData.premium.images.forEach((image) => {
      this.addPremiumImage(image);
    });
  }

  addPremiumImage(data = null) {
    const container = document.getElementById("premium-images-list");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "premium-image-item";
    div.style.cssText = "display: flex; gap: 10px; margin-bottom: 10px;";

    div.innerHTML = `
            <input type="text" placeholder="이미지 URL" value="${
              data?.url || ""
            }" style="flex: 2;">
            <input type="text" placeholder="제목" value="${
              data?.title || ""
            }" style="flex: 1;">
            <input type="text" placeholder="설명" value="${
              data?.caption || ""
            }" style="flex: 1;">
            <button class="btn-remove" style="padding: 5px 15px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">×</button>
        `;

    div.querySelector(".btn-remove").addEventListener("click", () => {
      div.remove();
      this.unsavedChanges = true;
    });

    container.appendChild(div);
  }

  setupFloorplanTabs() {
    const tabButtons = document.querySelectorAll("#floorplans .tab-btn");
    const tabContents = document.querySelectorAll("#floorplans .tab-content");

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;

        // 모든 탭 비활성화
        tabButtons.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));

        // 선택한 탭 활성화
        btn.classList.add("active");
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.add("active");
        }
      });
    });
  }

  populateAreaDetails() {
    // 단지 개요 제거로 인해 이 함수는 더 이상 필요 없음
    return;
  }

  addAreaDetail(data = null) {
    const container = document.getElementById("area-details");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "area-item";
    div.innerHTML = `
            <input type="text" placeholder="항목명" value="${
              data?.label || ""
            }">
            <input type="text" placeholder="값" value="${data?.value || ""}">
            <input type="text" placeholder="세대수(선택)" value="${
              data?.units || ""
            }">
            <button class="btn-remove">×</button>
        `;

    div.querySelector(".btn-remove").addEventListener("click", () => {
      div.remove();
      this.unsavedChanges = true;
    });

    div.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        this.unsavedChanges = true;
      });
    });

    container.appendChild(div);
    this.unsavedChanges = true;
  }

  populateFloorPlans() {
    const container = document.getElementById("floorplans-grid");
    if (!container || !this.currentData.floorPlans?.plans) return;

    // 기존 항목 제거
    container.innerHTML = "";

    // 데이터로 카드 생성
    this.currentData.floorPlans.plans.forEach((plan, index) => {
      this.createFloorPlanCard(plan, index);
    });
  }

  createFloorPlanCard(plan, index) {
    const container = document.getElementById("floorplans-grid");
    if (!container) {
      console.error("평면도 그리드 컨테이너를 찾을 수 없습니다.");
      return;
    }

    console.log("평면도 카드 생성:", plan);

    const card = document.createElement("div");
    card.className = "floorplan-card";
    card.dataset.index = index;

    card.innerHTML = `
            <div class="floorplan-card-header">
                <span class="floorplan-type">${
                  plan.type || "타입 미지정"
                }</span>
                <span style="color: #27ae60; font-weight: 600;">${
                  plan.area || ""
                }</span>
            </div>
            <div class="floorplan-card-body">
                <div class="floorplan-info">
                    <span><strong>세대수:</strong></span>
                    <span style="color: #2c3e50; font-weight: 500;">${
                      plan.units || "-"
                    }</span>
                </div>
                <div class="floorplan-info">
                    <span><strong>설명:</strong></span>
                    <span style="color: #555;">${plan.description || "-"}</span>
                </div>
                ${
                  plan.features && plan.features.length > 0
                    ? `
                    <div class="floorplan-info" style="flex-direction: column; gap: 5px;">
                        <span><strong>특징:</strong></span>
                        <ul style="margin: 0; padding-left: 20px; font-size: 0.8rem; color: #666;">
                            ${plan.features
                              .slice(0, 2)
                              .map((f) => `<li>${f}</li>`)
                              .join("")}
                        </ul>
                    </div>
                `
                    : ""
                }
                <div class="floorplan-image-preview">
                    ${
                      plan.image
                        ? `<img src="${plan.image}" alt="${plan.type}" title="${plan.type} 평면도">`
                        : '<span style="font-size: 0.9rem;">평면도 이미지를 추가해주세요</span>'
                    }
                </div>
                <div class="floorplan-card-actions">
                    <button class="btn-edit-floorplan" data-index="${index}">수정</button>
                    <button class="btn-delete-floorplan" data-index="${index}">삭제</button>
                </div>
            </div>
        `;

    // 수정/삭제 버튼 이벤트
    card.querySelector(".btn-edit-floorplan").addEventListener("click", () => {
      this.openFloorPlanModal(plan, index);
    });

    card
      .querySelector(".btn-delete-floorplan")
      .addEventListener("click", () => {
        if (confirm(`${plan.type} 평면도를 삭제하시겠습니까?`)) {
          // DOM에서 제거
          card.remove();

          // 데이터에서도 제거
          if (typeof index === "number" && this.currentData.floorPlans?.plans) {
            this.currentData.floorPlans.plans.splice(index, 1);
            // 삭제 후 다시 그리기 (인덱스 재정렬)
            this.populateFloorPlans();
          }

          this.unsavedChanges = true;
        }
      });

    container.appendChild(card);
  }

  openFloorPlanModal(data = null, index = null) {
    // 모달 없으면 생성
    let modal = document.getElementById("floorplan-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "floorplan-modal";
      modal.className = "modal";
      modal.innerHTML = `
                <div class="modal-content" style="max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h2>평면도 ${index !== null ? "수정" : "추가"}</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row" style="display: flex; gap: 20px;">
                            <div class="form-group" style="flex: 1;">
                                <label>타입 *</label>
                                <input type="text" id="modal-plan-type" placeholder="예: 84A">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>면적 *</label>
                                <input type="text" id="modal-plan-area" placeholder="예: 84.92㎡">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>세대수</label>
                                <input type="text" id="modal-plan-units" placeholder="예: 250세대">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>설명</label>
                            <input type="text" id="modal-plan-description" placeholder="예: 4Bay 남향 위주">
                        </div>
                        
                        <div class="form-group">
                            <label>특징 (쉼표로 구분)</label>
                            <textarea id="modal-plan-features" rows="3" placeholder="예: 4Bay 남향 위주 배치, 탄탄한 공간 구성"></textarea>
                        </div>
                        
                        <h3 style="margin-top: 20px; margin-bottom: 10px;">면적 상세 정보</h3>
                        <div class="area-details-modal" id="modal-area-details" style="margin-bottom: 15px;">
                            <!-- 면적 항목들이 여기 추가됨 -->
                        </div>
                        <button class="btn-add-area-modal" id="modal-add-area" style="padding: 8px 15px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">+ 면적 항목 추가</button>
                        
                        <h3 style="margin-top: 20px; margin-bottom: 10px;">이미지 관리</h3>
                        <div class="image-management">
                            <div class="form-group">
                                <label>메인 평면도 이미지 *</label>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="modal-plan-image" placeholder="assets/images/pungsu/..." style="flex: 1;">
                                    <button class="btn-upload-main" style="padding: 8px 15px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">파일 선택</button>
                                </div>
                                <small style="color: #666; font-size: 12px;">권장: assets/images/pungsu/ 폴더에 저장</small>
                            </div>
                            
                            <div class="form-group">
                                <label>추가 이미지들 (예: 확대 평면도, 샤듀라인 등)</label>
                                <div id="modal-additional-images" style="margin-bottom: 10px;">
                                    <!-- 추가 이미지 입력 필드들 -->
                                </div>
                                <button class="btn-add-image-modal" id="modal-add-image" style="padding: 8px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">+ 이미지 추가</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                        <button class="btn-cancel" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">취소</button>
                        <button class="btn-save" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">저장</button>
                    </div>
                </div>
            `;
      document.body.appendChild(modal);
    }

    // 데이터 채우기
    if (data) {
      document.getElementById("modal-plan-type").value = data.type || "";
      document.getElementById("modal-plan-area").value = data.area || "";
      document.getElementById("modal-plan-units").value = data.units || "";
      document.getElementById("modal-plan-description").value =
        data.description || "";
      document.getElementById("modal-plan-features").value = data.features
        ? data.features.join(", ")
        : "";
      document.getElementById("modal-plan-image").value = data.image || "";

      // 면적 상세 정보 채우기
      const areaContainer = document.getElementById("modal-area-details");
      areaContainer.innerHTML = "";
      if (data.areaDetails && data.areaDetails.length > 0) {
        data.areaDetails.forEach((detail) => {
          this.addAreaDetailToModal(detail);
        });
      }

      // 추가 이미지 채우기
      const imagesContainer = document.getElementById(
        "modal-additional-images"
      );
      imagesContainer.innerHTML = "";
      if (data.additionalImages && data.additionalImages.length > 0) {
        data.additionalImages.forEach((img) => {
          this.addImageFieldToModal(img.url, img.description);
        });
      }
    } else {
      // 새 평면도인 경우 폼 초기화
      document.getElementById("modal-plan-type").value = "";
      document.getElementById("modal-plan-area").value = "";
      document.getElementById("modal-plan-units").value = "";
      document.getElementById("modal-plan-description").value = "";
      document.getElementById("modal-plan-features").value = "";
      document.getElementById("modal-plan-image").value = "";
      document.getElementById("modal-area-details").innerHTML = "";
      document.getElementById("modal-additional-images").innerHTML = "";

      // 기본 면적 항목 추가
      this.addAreaDetailToModal({ label: "주거전용면적", value: "" });
      this.addAreaDetailToModal({ label: "주거공용면적", value: "" });
      this.addAreaDetailToModal({ label: "공급면적", value: "" });
      this.addAreaDetailToModal({ label: "계약면적", value: "" });
    }

    // 모달 표시
    modal.classList.add("active");

    // 이벤트 핸들러 설정
    const closeBtn = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".btn-cancel");
    const saveBtn = modal.querySelector(".btn-save");

    const closeModal = () => {
      modal.classList.remove("active");
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    // 메인 이미지 업로드 버튼
    const uploadMainBtn = modal.querySelector(".btn-upload-main");
    if (uploadMainBtn) {
      uploadMainBtn.onclick = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            // 파일명을 pungsu 폴더 경로로 설정
            const fileName = file.name;
            const imagePath = `assets/images/pungsu/${fileName}`;
            document.getElementById("modal-plan-image").value = imagePath;

            // 실제 서버에 업로드하려면 추가 처리 필요
            this.showNotification(
              `이미지 경로가 설정되었습니다: ${fileName}`,
              "info"
            );
          }
        };
        input.click();
      };
    }

    // 면적 항목 추가 버튼 이벤트
    const addAreaBtn = document.getElementById("modal-add-area");
    if (addAreaBtn && !addAreaBtn.hasEventListener) {
      addAreaBtn.hasEventListener = true;
      addAreaBtn.addEventListener("click", () => {
        this.addAreaDetailToModal();
      });
    }

    // 이미지 추가 버튼 이벤트
    const addImageBtn = document.getElementById("modal-add-image");
    if (addImageBtn && !addImageBtn.hasEventListener) {
      addImageBtn.hasEventListener = true;
      addImageBtn.addEventListener("click", () => {
        this.addImageFieldToModal();
      });
    }

    saveBtn.onclick = () => {
      // 면적 상세 수집
      const areaDetails = [];
      document
        .querySelectorAll("#modal-area-details .area-detail-item")
        .forEach((item) => {
          const inputs = item.querySelectorAll("input");
          if (inputs[0].value && inputs[1].value) {
            areaDetails.push({
              label: inputs[0].value,
              value: inputs[1].value,
            });
          }
        });

      // 추가 이미지 수집
      const additionalImages = [];
      document
        .querySelectorAll("#modal-additional-images .image-field-item")
        .forEach((item) => {
          const inputs = item.querySelectorAll("input");
          if (inputs[0].value) {
            additionalImages.push({
              url: inputs[0].value,
              description: inputs[1].value || "",
            });
          }
        });

      const planData = {
        type: document.getElementById("modal-plan-type").value,
        area: document.getElementById("modal-plan-area").value,
        units: document.getElementById("modal-plan-units").value,
        description: document.getElementById("modal-plan-description").value,
        features: document
          .getElementById("modal-plan-features")
          .value.split(",")
          .map((f) => f.trim())
          .filter((f) => f),
        image: document.getElementById("modal-plan-image").value,
        areaDetails: areaDetails,
        additionalImages: additionalImages,
      };

      if (!planData.type || !planData.area) {
        alert("타입과 면적은 필수 항목입니다.");
        return;
      }

      if (index !== null) {
        // 수정
        const card = document.querySelector(
          `.floorplan-card[data-index="${index}"]`
        );
        if (card) {
          card.remove();
        }
      }

      // 새 카드 추가
      this.createFloorPlanCard(planData, index !== null ? index : Date.now());

      // 데이터 업데이트
      if (index !== null) {
        // 기존 평면도 수정
        if (this.currentData.floorPlans.plans[index]) {
          this.currentData.floorPlans.plans[index] = planData;
        }
      } else {
        // 새 평면도 추가
        if (!this.currentData.floorPlans.plans) {
          this.currentData.floorPlans.plans = [];
        }
        this.currentData.floorPlans.plans.push(planData);
      }

      this.unsavedChanges = true;
      closeModal();
    };
  }

  setupOptionsSection() {
    // 옵션 섹션 설정
    if (this.currentData.options) {
      document.getElementById("options-title").value =
        this.currentData.options.title || "";
      document.getElementById("options-description").value =
        this.currentData.options.description || "";
      document.getElementById("options-visible").checked =
        this.currentData.options.visible !== false;

      // 카테고리 로드
      this.loadOptionsCategories();
    }

    // 카테고리 추가 버튼
    const addCategoryBtn = document.getElementById("add-options-category");
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener("click", () => {
        this.addOptionsCategory();
      });
    }
  }

  loadOptionsCategories() {
    const container = document.getElementById("options-categories-list");
    const tabsContainer = document.getElementById("options-tabs");

    if (!container || !this.currentData.options?.categories) return;

    // 기존 내용 초기화
    container.innerHTML = "";
    if (tabsContainer) tabsContainer.innerHTML = "";

    // 탭 컨테이너가 없으면 생성
    if (!tabsContainer) {
      const tabsHtml = '<div id="options-tabs" class="options-tabs"></div>';
      container.insertAdjacentHTML("beforebegin", tabsHtml);
    }

    this.currentData.options.categories.forEach((category, index) => {
      this.addOptionsCategory(category, index);
    });
  }

  addOptionsCategory(data = null, existingIndex = null) {
    const container = document.getElementById("options-categories-list");
    const tabsContainer = document.getElementById("options-tabs");
    if (!container) return;

    // 탭 컨테이너가 없으면 생성
    if (!tabsContainer) {
      const newTabsContainer = document.createElement("div");
      newTabsContainer.id = "options-tabs";
      newTabsContainer.className = "options-tabs";
      container.parentElement.insertBefore(newTabsContainer, container);
    }

    const categoryCount = container.children.length;
    const categoryIndex =
      existingIndex !== null ? existingIndex : categoryCount;

    // 탭 버튼 추가
    const tabButton = document.createElement("button");
    tabButton.className = `options-tab ${categoryCount === 0 ? "active" : ""}`;
    tabButton.textContent = data?.title || `카테고리 ${categoryIndex + 1}`;
    tabButton.dataset.index = categoryIndex;

    // 탭 클릭 이벤트
    tabButton.addEventListener("click", () => {
      document
        .querySelectorAll(".options-tab")
        .forEach((tab) => tab.classList.remove("active"));
      document
        .querySelectorAll(".options-category-item")
        .forEach((item) => item.classList.remove("active"));
      tabButton.classList.add("active");
      container.children[categoryIndex]?.classList.add("active");
    });

    document.getElementById("options-tabs")?.appendChild(tabButton);

    // 카테고리 카드 생성
    const categoryDiv = document.createElement("div");
    categoryDiv.className = `options-category-item ${
      categoryCount === 0 ? "active" : ""
    }`;
    categoryDiv.dataset.index = categoryIndex;

    categoryDiv.innerHTML = `
            <div class="category-card">
                <div class="category-card-header">
                    <div class="category-title-row">
                        <label>카테고리명</label>
                        <input type="text" 
                               class="category-title-input" 
                               placeholder="예: 시스템, 주방, 욕실 등" 
                               value="${data?.title || ""}">
                    </div>
                    <button class="btn-delete-category" title="카테고리 삭제">
                        <span>삭제</span>
                    </button>
                </div>
                
                <div class="category-card-body">
                    <div class="items-header">
                        <h4>품목 목록</h4>
                        <button class="btn-add-item">+ 품목 추가</button>
                    </div>
                    
                    <div class="category-items-list">
                        ${
                          data?.items
                            ? data.items
                                .map(
                                  (item, idx) => `
                            <div class="option-item">
                                <div class="item-number">${idx + 1}</div>
                                <div class="item-fields">
                                    <input type="text" 
                                           placeholder="품목명 (예: 시스템 에어컨)" 
                                           value="${item.title || ""}" 
                                           class="item-title">
                                    <input type="text" 
                                           placeholder="상세 설명 (예: 거실+침실1+침실2+침실3)" 
                                           value="${item.description || ""}" 
                                           class="item-description">
                                </div>
                                <button class="btn-remove-item" title="품목 삭제">×</button>
                            </div>
                        `
                                )
                                .join("")
                            : ""
                        }
                    </div>
                </div>
            </div>
        `;

    // 카테고리 제목 변경 시 탭 업데이트
    const titleInput = categoryDiv.querySelector(".category-title-input");
    titleInput.addEventListener("input", () => {
      const tabBtn = document.querySelectorAll(".options-tab")[categoryIndex];
      if (tabBtn) {
        tabBtn.textContent =
          titleInput.value || `카테고리 ${categoryIndex + 1}`;
      }
      this.unsavedChanges = true;
    });

    // 카테고리 삭제
    categoryDiv
      .querySelector(".btn-delete-category")
      .addEventListener("click", () => {
        const index = parseInt(categoryDiv.dataset.index);

        // 탭과 컨텐츠 삭제
        categoryDiv.remove();
        document.getElementById("options-tabs")?.children[index]?.remove();

        // 탭과 컨텐츠 인덱스 재정렬
        this.reindexOptionsTabs();

        // 첫 번째 탭 활성화
        if (container.children.length > 0) {
          document.querySelector(".options-tab")?.click();
        }

        this.unsavedChanges = true;
      });

    // 품목 추가
    categoryDiv.querySelector(".btn-add-item").addEventListener("click", () => {
      this.addOptionItem(categoryDiv);
    });

    // 기존 품목 삭제 버튼
    categoryDiv.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".option-item").remove();
        this.updateItemNumbers(categoryDiv);
        this.unsavedChanges = true;
      });
    });

    // 변경 감지
    categoryDiv.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        this.unsavedChanges = true;
      });
    });

    container.appendChild(categoryDiv);
  }

  addOptionItem(categoryDiv) {
    const itemsList = categoryDiv.querySelector(".category-items-list");
    const itemCount = itemsList.children.length;

    const itemDiv = document.createElement("div");
    itemDiv.className = "option-item";
    itemDiv.innerHTML = `
            <div class="item-number">${itemCount + 1}</div>
            <div class="item-fields">
                <input type="text" 
                       placeholder="품목명 (예: 시스템 에어컨)" 
                       class="item-title">
                <input type="text" 
                       placeholder="상세 설명 (예: 거실+침실1+침실2+침실3)" 
                       class="item-description">
            </div>
            <button class="btn-remove-item" title="품목 삭제">×</button>
        `;

    itemDiv.querySelector(".btn-remove-item").addEventListener("click", () => {
      itemDiv.remove();
      this.updateItemNumbers(categoryDiv);
      this.unsavedChanges = true;
    });

    // 변경 감지
    itemDiv.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        this.unsavedChanges = true;
      });
    });

    itemsList.appendChild(itemDiv);
    this.unsavedChanges = true;
  }

  updateItemNumbers(categoryDiv) {
    const items = categoryDiv.querySelectorAll(".option-item");
    items.forEach((item, index) => {
      const numberDiv = item.querySelector(".item-number");
      if (numberDiv) {
        numberDiv.textContent = index + 1;
      }
    });
  }

  reindexOptionsTabs() {
    const tabs = document.querySelectorAll(".options-tab");
    const categories = document.querySelectorAll(".options-category-item");

    tabs.forEach((tab, idx) => {
      tab.dataset.index = idx;
      if (!tab.textContent || tab.textContent.startsWith("카테고리")) {
        tab.textContent = `카테고리 ${idx + 1}`;
      }
    });

    categories.forEach((category, idx) => {
      category.dataset.index = idx;
    });
  }

  setupConvenienceSection() {
    // 시스템 섹션 설정
    if (this.currentData.convenience) {
      document.getElementById("convenience-title").value =
        this.currentData.convenience.title || "";
      document.getElementById("convenience-description").value =
        this.currentData.convenience.description || "";
      document.getElementById("convenience-subtitle").value =
        this.currentData.convenience.subtitle || "";
      document.getElementById("convenience-visible").checked =
        this.currentData.convenience.visible !== false;

      // 카테고리 로드
      this.loadConvenienceCategories();
    }

    // 카테고리 추가 버튼
    const addCategoryBtn = document.getElementById("add-convenience-category");
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener("click", () => {
        this.addConvenienceCategory();
      });
    }
  }

  loadConvenienceCategories() {
    const container = document.getElementById("convenience-categories-list");
    const tabsContainer = document.getElementById("convenience-tabs");

    if (!container || !tabsContainer) return;

    // 기존 내용 초기화
    container.innerHTML = "";
    tabsContainer.innerHTML = "";

    // 데이터가 없으면 기본 카테고리 생성
    if (
      !this.currentData.convenience?.facilities ||
      this.currentData.convenience.facilities.length === 0
    ) {
      const defaultCategories = [
        { category: "시스템", items: [] },
        { category: "주방/가전", items: [] },
        { category: "욕실/발코니", items: [] },
        { category: "시스템/보안", items: [] },
      ];
      defaultCategories.forEach((category, index) => {
        this.addConvenienceCategory(category, index);
      });
    } else {
      this.currentData.convenience.facilities.forEach((category, index) => {
        this.addConvenienceCategory(category, index);
      });
    }

    // 첫 번째 탭 활성화
    const firstTab = tabsContainer.querySelector(".convenience-tab");
    if (firstTab) {
      firstTab.click();
    }
  }

  addConvenienceCategory(data = null, existingIndex = null) {
    const container = document.getElementById("convenience-categories-list");
    const tabsContainer = document.getElementById("convenience-tabs");
    if (!container || !tabsContainer) return;

    const categoryCount = container.children.length;
    const categoryIndex =
      existingIndex !== null ? existingIndex : categoryCount;

    // 탭 버튼 추가
    const tabButton = document.createElement("button");
    tabButton.className = "convenience-tab";
    tabButton.dataset.index = categoryIndex;

    const tabText = document.createElement("span");
    tabText.textContent = data?.category || `카테고리 ${categoryIndex + 1}`;
    tabButton.appendChild(tabText);

    // 탭 삭제 버튼
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "tab-delete-btn";
    deleteBtn.innerHTML = "×";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm("이 카테고리를 삭제하시겠습니까?")) {
        // 탭과 컨텐츠 삭제
        tabButton.remove();
        const contentDiv = container.querySelector(
          `[data-category-index="${categoryIndex}"]`
        );
        if (contentDiv) contentDiv.remove();

        // 탭 인덱스 재정렬
        this.reindexConvenienceTabs();

        // 첫 번째 탭 활성화
        const firstTab = tabsContainer.querySelector(".convenience-tab");
        if (firstTab) firstTab.click();

        this.unsavedChanges = true;
      }
    };
    tabButton.appendChild(deleteBtn);

    // 탭 클릭 이벤트
    tabButton.addEventListener("click", () => {
      // 모든 탭 비활성화
      document.querySelectorAll(".convenience-tab").forEach((tab) => {
        tab.classList.remove("active");
      });

      // 모든 컨텐츠 숨기기
      document
        .querySelectorAll(".convenience-category-content")
        .forEach((content) => {
          content.style.display = "none";
        });

      // 선택한 탭 활성화
      tabButton.classList.add("active");

      // 해당 컨텐츠 표시
      const targetContent = container.querySelector(
        `[data-category-index="${categoryIndex}"]`
      );
      if (targetContent) {
        targetContent.style.display = "block";
      }
    });

    tabsContainer.appendChild(tabButton);

    // 카테고리 컨텐츠 추가
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "convenience-category-content";
    categoryDiv.dataset.categoryIndex = categoryIndex;
    categoryDiv.style.display = "none";

    categoryDiv.innerHTML = `
            <div class="category-content-wrapper">
                <div class="category-header">
                    <label>카테고리명</label>
                    <input type="text" 
                           class="category-title-input" 
                           placeholder="예: 가족의 안전을 지켜주는 보안 시스템" 
                           value="${data?.category || ""}">
                </div>
                
                <div class="category-items">
                    <h4>항목 목록</h4>
                    <div class="items-list">
                        ${
                          data?.items
                            ? data.items
                                .map(
                                  (item) => `
                            <div class="convenience-item">
                                <input type="text" 
                                       placeholder="항목명 (예: 무인경비 시스템)" 
                                       value="${item.name || ""}">
                                <input type="text" 
                                       placeholder="설명" 
                                       value="${item.description || ""}">
                                <button class="btn-remove-item">×</button>
                            </div>
                        `
                                )
                                .join("")
                            : ""
                        }
                    </div>
                    <button class="btn-add-item">+ 항목 추가</button>
                </div>
            </div>
        `;

    // 카테고리 제목 변경 시 탭 업데이트
    const titleInput = categoryDiv.querySelector(".category-title-input");
    titleInput.addEventListener("input", () => {
      tabText.textContent = titleInput.value || `카테고리 ${categoryIndex + 1}`;
      this.unsavedChanges = true;
    });

    // 항목 추가 버튼
    categoryDiv.querySelector(".btn-add-item").addEventListener("click", () => {
      this.addConvenienceItem(categoryDiv);
    });

    // 기존 항목 삭제 버튼
    categoryDiv.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".convenience-item").remove();
        this.unsavedChanges = true;
      });
    });

    // 변경 감지
    categoryDiv.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        this.unsavedChanges = true;
      });
    });

    container.appendChild(categoryDiv);
  }

  reindexConvenienceTabs() {
    const tabs = document.querySelectorAll(".convenience-tab");
    const contents = document.querySelectorAll(".convenience-category-content");

    tabs.forEach((tab, index) => {
      tab.dataset.index = index;
      const tabText = tab.querySelector("span:first-child");
      if (
        (tabText && !tabText.textContent) ||
        tabText.textContent.startsWith("카테고리")
      ) {
        tabText.textContent = `카테고리 ${index + 1}`;
      }
    });

    contents.forEach((content, index) => {
      content.dataset.categoryIndex = index;
    });
  }

  addConvenienceItem(categoryDiv) {
    const itemsList = categoryDiv.querySelector(".items-list");

    const itemDiv = document.createElement("div");
    itemDiv.className = "convenience-item";
    itemDiv.innerHTML = `
            <input type="text" 
                   placeholder="항목명 (예: 무인경비 시스템)">
            <input type="text" 
                   placeholder="설명">
            <button class="btn-remove-item">×</button>
        `;

    itemDiv.querySelector(".btn-remove-item").addEventListener("click", () => {
      itemDiv.remove();
      this.unsavedChanges = true;
    });

    itemDiv.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        this.unsavedChanges = true;
      });
    });

    itemsList.appendChild(itemDiv);
    this.unsavedChanges = true;
  }

  setupCommunitySection() {
    // 커뮤니티 시설 설정
    if (this.currentData.community) {
      document.getElementById("community-title").value =
        this.currentData.community.title || "";
      document.getElementById("community-description").value =
        this.currentData.community.description || "";
      document.getElementById("community-visible").checked =
        this.currentData.community.visible !== false;

      // 커뮤니티 전체 이미지 설정 (조감도, 평면도)
      this.setupCommunityImages();

      // 커뮤니티 시설 로드
      this.loadCommunityFacilities();
    }

    // 시설 추가 버튼
    const addFacilityBtn = document.getElementById("add-community-facility");
    if (addFacilityBtn) {
      addFacilityBtn.addEventListener("click", () => {
        this.openCommunityFacilityModal();
      });
    }
  }

  setupCommunityImages() {
    // 조감도와 평면도 설정을 위한 UI 추가
    const communityForm = document.querySelector(".community-form");
    if (!communityForm) return;

    // 커뮤니티 전체 이미지 섹션이 없으면 추가
    let imagesSection = document.getElementById("community-overview-images");
    if (!imagesSection) {
      // 설명 필드 다음에 삽입
      const descField = communityForm.querySelector(".form-group:nth-child(2)");
      if (descField) {
        const imagesSectionHTML = `
                    <div class="form-group" id="community-overview-images">
                        <label>커뮤니티 전체 이미지</label>
                        <div class="community-overview-images">
                            <div class="image-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <label style="font-size: 0.9rem; color: #666; margin-bottom: 10px; display: block;">조감도</label>
                                    <input type="file" id="community-overview-file" accept="image/*" style="display: none;">
                                    <button onclick="document.getElementById('community-overview-file').click()" style="width: 100%; padding: 8px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">파일 선택</button>
                                    <span id="community-overview-name" style="display: block; color: #666; font-size: 0.9rem; margin-bottom: 10px;">선택된 파일 없음</span>
                                    <input type="hidden" id="community-overview-image" value="assets/images/community/main.jpg">
                                    <div id="community-overview-preview" style="width: 100%; height: 150px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                        <span style="color: #999;">조감도 미리보기</span>
                                    </div>
                                </div>
                                <div>
                                    <label style="font-size: 0.9rem; color: #666; margin-bottom: 10px; display: block;">평면도</label>
                                    <input type="file" id="community-floor-file" accept="image/*" style="display: none;">
                                    <button onclick="document.getElementById('community-floor-file').click()" style="width: 100%; padding: 8px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">파일 선택</button>
                                    <span id="community-floor-name" style="display: block; color: #666; font-size: 0.9rem; margin-bottom: 10px;">선택된 파일 없음</span>
                                    <input type="hidden" id="community-floor-plan" value="assets/images/community/sub.jpg">
                                    <div id="community-floor-preview" style="width: 100%; height: 150px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                        <span style="color: #999;">평면도 미리보기</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        descField.insertAdjacentHTML("afterend", imagesSectionHTML);

        // 이벤트 리스너 추가
        this.setupCommunityImageListeners();
      }
    }

    // 기존 데이터 로드
    if (this.currentData.community) {
      const overviewImage =
        this.currentData.community.overviewImage ||
        this.currentData.community.mainImage ||
        "assets/images/community/main.jpg";
      const floorPlanImage =
        this.currentData.community.floorPlanImage ||
        "assets/images/community/sub.jpg";

      const overviewInput = document.getElementById("community-overview-image");
      const floorInput = document.getElementById("community-floor-plan");

      if (overviewInput) {
        overviewInput.value = overviewImage;
        document.getElementById(
          "community-overview-preview"
        ).innerHTML = `<img src="${overviewImage}" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
      }

      if (floorInput) {
        floorInput.value = floorPlanImage;
        document.getElementById(
          "community-floor-preview"
        ).innerHTML = `<img src="${floorPlanImage}" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
      }
    }
  }

  setupCommunityImageListeners() {
    // 조감도 파일 업로드
    const overviewFile = document.getElementById("community-overview-file");
    if (overviewFile) {
      overviewFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileName = file.name;
          const imagePath = `assets/images/community/${fileName}`;

          // 파일명 표시
          document.getElementById("community-overview-name").textContent =
            fileName;
          document.getElementById("community-overview-image").value = imagePath;

          // 미리보기 업데이트
          const reader = new FileReader();
          reader.onload = (e) => {
            const preview = document.getElementById(
              "community-overview-preview"
            );
            if (preview) {
              preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
            }
          };
          reader.readAsDataURL(file);

          this.unsavedChanges = true;
          this.showNotification(
            `조감도 이미지가 선택되었습니다. 파일을 assets/images/community/ 폴더에 ${fileName}으로 저장해주세요.`,
            "info"
          );
        }
      });
    }

    // 평면도 파일 업로드
    const floorFile = document.getElementById("community-floor-file");
    if (floorFile) {
      floorFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileName = file.name;
          const imagePath = `assets/images/community/${fileName}`;

          // 파일명 표시
          document.getElementById("community-floor-name").textContent =
            fileName;
          document.getElementById("community-floor-plan").value = imagePath;

          // 미리보기 업데이트
          const reader = new FileReader();
          reader.onload = (e) => {
            const preview = document.getElementById("community-floor-preview");
            if (preview) {
              preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
            }
          };
          reader.readAsDataURL(file);

          this.unsavedChanges = true;
          this.showNotification(
            `평면도 이미지가 선택되었습니다. 파일을 assets/images/community/ 폴더에 ${fileName}으로 저장해주세요.`,
            "info"
          );
        }
      });
    }
  }

  loadCommunityFacilities() {
    const container = document.getElementById("community-facilities-list");
    if (!container || !this.currentData.community?.facilities) return;

    container.innerHTML = "";

    // 기본 시설 데이터 생성 (초기 설정일 경우)
    const defaultFacilities = [
      {
        name: "키즈카페",
        mainImage: "assets/images/community/1.jpg",
        subImage: "assets/images/community/sub.jpg",
        description: "아이들을 위한 안전하고 재미있는 놀이공간",
      },
      {
        name: "영화감상공간",
        mainImage: "assets/images/community/2.jpg",
        subImage: "assets/images/community/sub.jpg",
        description: "프라이빗 영화관에서 즐기는 특별한 시간",
      },
      {
        name: "피트니스 클럽",
        mainImage: "assets/images/community/3.jpg",
        subImage: "assets/images/community/sub.jpg",
        description: "최첨단 시설의 프리미엄 피트니스",
      },
      {
        name: "도서관",
        mainImage: "assets/images/community/4.jpg",
        subImage: "assets/images/community/sub.jpg",
        description: "조용한 독서와 학습을 위한 공간",
      },
      {
        name: "광장",
        mainImage: "assets/images/community/5.jpg",
        subImage: "assets/images/community/sub.jpg",
        description: "주민들의 소통과 휴식을 위한 열린 공간",
      },
      {
        name: "음악 휴게공간",
        mainImage: "assets/images/community/6.jpg",
        subImage: "assets/images/community/sub.jpg",
        description: "음악과 함께하는 힌링 라운지",
      },
      {
        name: "골프연습장",
        mainImage: "assets/images/community/7.jpg",
        subImage: "assets/images/community/sub.jpg",
        description: "실내 골프 연습을 위한 전문 시설",
      },
      {
        name: "학습 공간",
        mainImage: "assets/images/community/8.jpg",
        subImage: "assets/images/community/sub.jpg",
        description: "집중 학습을 위한 독립된 공간",
      },
    ];

    // 비어있거나 기본 텍스트만 있는 경우 기본 데이터로 채우기
    if (
      !this.currentData.community.facilities ||
      (Array.isArray(this.currentData.community.facilities) &&
        this.currentData.community.facilities.length > 0 &&
        typeof this.currentData.community.facilities[0] === "string")
    ) {
      // 기본 데이터로 교체
      this.currentData.community.facilities = defaultFacilities;
    }

    this.currentData.community.facilities.forEach((facility, index) => {
      this.createCommunityFacilityCard(facility, index);
    });
  }

  createCommunityFacilityCard(facility, index) {
    const container = document.getElementById("community-facilities-list");
    if (!container) return;

    const card = document.createElement("div");
    card.className = "community-facility-card";
    card.dataset.index = index;

    card.innerHTML = `
            <div class="facility-card-content">
                <div class="facility-info">
                    <h3 class="facility-name">${
                      facility.name || "시설명 미입력"
                    }</h3>
                    <p class="facility-description">${
                      facility.description || "설명 미입력"
                    }</p>
                </div>
                <div class="facility-image">
                    <div class="image-preview">
                        ${
                          facility.image || facility.mainImage
                            ? `<img src="${
                                facility.image || facility.mainImage
                              }" alt="${facility.name}">`
                            : "<span>이미지 미등록</span>"
                        }
                    </div>
                </div>
                <div class="facility-actions">
                    <button class="btn-edit-facility" data-index="${index}">수정</button>
                    <button class="btn-delete-facility" data-index="${index}">삭제</button>
                </div>
            </div>
        `;

    // 수정/삭제 버튼 이벤트
    card.querySelector(".btn-edit-facility").addEventListener("click", () => {
      this.openCommunityFacilityModal(facility, index);
    });

    card.querySelector(".btn-delete-facility").addEventListener("click", () => {
      if (confirm(`${facility.name} 시설을 삭제하시겠습니까?`)) {
        card.remove();
        this.currentData.community.facilities.splice(index, 1);
        this.loadCommunityFacilities(); // 인덱스 재정렬
        this.unsavedChanges = true;
      }
    });

    container.appendChild(card);
  }

  openCommunityFacilityModal(data = null, index = null) {
    // 모달 없으면 생성
    let modal = document.getElementById("community-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "community-modal";
      modal.className = "modal";
      modal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2>커뮤니티 시설 ${
                          index !== null ? "수정" : "추가"
                        }</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>시설명 *</label>
                            <input type="text" id="modal-facility-name" placeholder="예: 키즈카페">
                        </div>
                        
                        <div class="form-group">
                            <label>설명</label>
                            <textarea id="modal-facility-description" rows="3" 
                                      placeholder="예: 아이들을 위한 안전하고 재미있는 놀이공간"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>시설 이미지 *</label>
                            <div style="margin-bottom: 10px;">
                                <input type="file" id="modal-facility-image-file" accept="image/*" style="display: none;">
                                <button onclick="document.getElementById('modal-facility-image-file').click()" style="padding: 8px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">파일 선택</button>
                                <span id="modal-facility-image-name" style="margin-left: 10px; color: #666;">선택된 파일 없음</span>
                                <input type="hidden" id="modal-facility-image" value="">
                            </div>
                            <small style="color: #666; font-size: 12px;">권장: assets/images/community/ 폴더</small>
                        </div>
                        
                        <div class="image-preview-section" style="margin-top: 20px;">
                            <h4 style="margin-bottom: 10px;">이미지 미리보기</h4>
                            <div id="modal-facility-preview" style="width: 100%; height: 200px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
                                <span style="color: #999;">이미지 미리보기</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancel">취소</button>
                        <button class="btn-save">저장</button>
                    </div>
                </div>
            `;
      document.body.appendChild(modal);
    }

    // 데이터 채우기
    if (data) {
      document.getElementById("modal-facility-name").value = data.name || "";
      document.getElementById("modal-facility-description").value =
        data.description || "";

      // 이미지 경로 설정
      const imageUrl = data.image || data.mainImage || "";
      document.getElementById("modal-facility-image").value = imageUrl;

      // 파일명 표시
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop();
        document.getElementById("modal-facility-image-name").textContent =
          fileName || "선택된 파일 없음";

        // 미리보기 업데이트
        document.getElementById(
          "modal-facility-preview"
        ).innerHTML = `<img src="${imageUrl}" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
      } else {
        document.getElementById("modal-facility-image-name").textContent =
          "선택된 파일 없음";
        document.getElementById("modal-facility-preview").innerHTML =
          '<span style="color: #999;">이미지 미리보기</span>';
      }
    } else {
      // 새 시설인 경우 폼 초기화
      document.getElementById("modal-facility-name").value = "";
      document.getElementById("modal-facility-description").value = "";
      document.getElementById("modal-facility-image").value = "";
      document.getElementById("modal-facility-image-name").textContent =
        "선택된 파일 없음";
      document.getElementById("modal-facility-preview").innerHTML =
        '<span style="color: #999;">이미지 미리보기</span>';
    }

    // 파일 업로드 이벤트 리스너
    const fileInput = document.getElementById("modal-facility-image-file");
    if (fileInput && !fileInput.hasEventListener) {
      fileInput.hasEventListener = true;
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileName = file.name;
          const imagePath = `assets/images/community/${fileName}`;

          // 파일명 표시
          document.getElementById("modal-facility-image-name").textContent =
            fileName;
          document.getElementById("modal-facility-image").value = imagePath;

          // 미리보기 업데이트
          const reader = new FileReader();
          reader.onload = (e) => {
            document.getElementById(
              "modal-facility-preview"
            ).innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
          };
          reader.readAsDataURL(file);

          this.showNotification(
            `이미지가 선택되었습니다. 파일을 assets/images/community/ 폴더에 ${fileName}으로 저장해주세요.`,
            "info"
          );
        }
      });
    }

    // 모달 표시
    modal.classList.add("active");

    // 이벤트 핸들러
    const closeBtn = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".btn-cancel");
    const saveBtn = modal.querySelector(".btn-save");

    const closeModal = () => {
      modal.classList.remove("active");
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    saveBtn.onclick = () => {
      const facilityName = document.getElementById("modal-facility-name").value;
      const facilityDescription = document.getElementById(
        "modal-facility-description"
      ).value;
      const facilityImage = document.getElementById(
        "modal-facility-image"
      ).value;

      if (!facilityName) {
        alert("시설명은 필수 항목입니다.");
        return;
      }

      if (!facilityImage) {
        alert("시설 이미지는 필수 항목입니다.");
        return;
      }

      // 데이터 객체 생성 - mainImage로 저장
      const facilityData = {
        name: facilityName,
        description: facilityDescription,
        mainImage: facilityImage, // mainImage로 저장
        image: facilityImage, // 호환성을 위해 두 필드 모두에 저장
      };

      if (index !== null) {
        // 수정
        this.currentData.community.facilities[index] = facilityData;
      } else {
        // 새 시설 추가
        if (!this.currentData.community.facilities) {
          this.currentData.community.facilities = [];
        }
        this.currentData.community.facilities.push(facilityData);
      }

      this.loadCommunityFacilities();
      this.unsavedChanges = true;
      closeModal();
    };
  }

  setupContactSection() {
    // 단순화된 문의 섹션 설정
    if (this.currentData.contact) {
      if (document.getElementById("contact-title")) {
        document.getElementById("contact-title").value =
          this.currentData.contact.title || "빠른 문의";
      }
      if (document.getElementById("contact-subtitle")) {
        document.getElementById("contact-subtitle").value =
          this.currentData.contact.subtitle ||
          "위의 내용 중 궤금한 점이 있으신가요?";
      }
      if (document.getElementById("contact-address")) {
        document.getElementById("contact-address").value =
          this.currentData.contact.address || "";
      }
      if (document.getElementById("contact-kakao")) {
        document.getElementById("contact-kakao").value =
          this.currentData.contact.kakao || "";
      }
    }

    // 변경 감지
    const inputs = [
      "contact-title",
      "contact-subtitle",
      "contact-address",
      "contact-kakao",
    ];
    inputs.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("input", () => {
          this.unsavedChanges = true;
        });
      }
    });
  }

  setupFooterSection() {
    // 푸터 설정 섹션

    // 경고 문구 추가 버튼
    const addDisclaimerBtn = document.getElementById("add-disclaimer");
    if (addDisclaimerBtn) {
      addDisclaimerBtn.addEventListener("click", () => {
        this.addFooterDisclaimer();
      });
    }

    // 입력 필드 변경 감지
    const footerInputs = [
      "footer-project-name",
      "footer-manager",
      "footer-description",
      "footer-address",
      "footer-developer",
      "footer-constructor",
      "footer-trustee",
      "footer-phone",
      "footer-kakao",
      "footer-note",
    ];

    footerInputs.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("input", () => {
          this.unsavedChanges = true;
        });
      }
    });
  }

  loadFooterDisclaimers() {
    const container = document.getElementById("footer-disclaimers");
    if (!container || !this.currentData.footer?.disclaimers) return;

    container.innerHTML = "";
    this.currentData.footer.disclaimers.forEach((text) => {
      this.createDisclaimerItem(text);
    });
  }

  createDisclaimerItem(text = "") {
    const container = document.getElementById("footer-disclaimers");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "disclaimer-item";
    div.style.cssText =
      "background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 10px; position: relative;";

    div.innerHTML = `
            <textarea style="width: 100%; border: none; background: transparent; resize: vertical; font-size: 0.9rem; color: #666; padding: 0; margin: 0;" 
                      rows="2" placeholder="경고 문구를 입력하세요">${text}</textarea>
            <button class="btn-remove-disclaimer" style="position: absolute; top: 5px; right: 5px; background: #e74c3c; color: white; border: none; border-radius: 3px; padding: 2px 8px; cursor: pointer;">×</button>
        `;

    // 제거 버튼
    div
      .querySelector(".btn-remove-disclaimer")
      .addEventListener("click", () => {
        div.remove();
        this.unsavedChanges = true;
      });

    // 텍스트 변경 감지
    div.querySelector("textarea").addEventListener("input", () => {
      this.unsavedChanges = true;
    });

    container.appendChild(div);
  }

  addFooterDisclaimer() {
    this.createDisclaimerItem("· ");
    this.unsavedChanges = true;
  }

  addAreaDetailToModal(data = null) {
    const container = document.getElementById("modal-area-details");
    if (!container) {
      console.error("modal-area-details 컨테이너를 찾을 수 없습니다.");
      return;
    }

    const div = document.createElement("div");
    div.className = "area-detail-item";
    div.style.cssText = "display: flex; gap: 10px; margin-bottom: 10px;";
    div.innerHTML = `
            <input type="text" placeholder="항목명 (예: 주거전용면적)" value="${
              data?.label || ""
            }" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <input type="text" placeholder="값 (예: 84.92㎡)" value="${
              data?.value || ""
            }" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <button class="btn-remove-area" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
        `;

    // 제거 버튼 이벤트 - 클래스명 변경
    const removeBtn = div.querySelector(".btn-remove-area");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        div.remove();
      });
    } else {
      console.error("제거 버튼을 찾을 수 없습니다.");
    }

    container.appendChild(div);
  }

  addImageFieldToModal(url = "", description = "") {
    const container = document.getElementById("modal-additional-images");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "image-field-item";
    div.style.cssText = "display: flex; gap: 10px; margin-bottom: 10px;";
    div.innerHTML = `
            <input type="text" placeholder="이미지 경로 (assets/images/pungsu/...)" value="${url}" style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <input type="text" placeholder="설명 (선택, 예: 확대 평면도)" value="${description}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <button class="btn-upload" style="padding: 8px 12px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">파일</button>
            <button class="btn-remove" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
        `;

    // 파일 업로드 버튼
    const uploadBtn = div.querySelector(".btn-upload");
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        const inputField = div.querySelector('input[type="text"]');
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const fileName = file.name;
            const imagePath = `assets/images/pungsu/${fileName}`;
            inputField.value = imagePath;
            this.showNotification(
              `이미지 경로가 설정되었습니다: ${fileName}`,
              "info"
            );
          }
        };
        fileInput.click();
      });
    }

    // 제거 버튼
    const removeBtn = div.querySelector(".btn-remove");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        div.remove();
      });
    }

    container.appendChild(div);
  }

  changeLocationImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileName = file.name;
        const imagePath = `assets/images/ipzi/${fileName}`;

        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = document.getElementById("location-preview");
          if (preview) {
            preview.src = e.target.result;
            this.unsavedChanges = true;
            this.showNotification(
              `이미지가 선택되었습니다. 파일을 assets/images/ipzi/ 폴더에 ${fileName}으로 저장해주세요.`,
              "info"
            );
          }
        };
        reader.readAsDataURL(file);
      }
    });

    input.click();
  }

  populateOverviewItems() {
    const container = document.querySelector(".info-items");
    if (!container || !this.currentData.overview) return;

    // 기존 항목 제거 (버튼 제외)
    container.querySelectorAll(".info-item").forEach((item) => item.remove());

    // 데이터로 항목 생성
    this.currentData.overview.items.forEach((item) => {
      const itemElement = this.createInfoItem(item.label, item.value);
      container.insertBefore(
        itemElement,
        container.querySelector(".btn-add-info")
      );
    });
  }

  createInfoItem(label = "", value = "") {
    const div = document.createElement("div");
    div.className = "info-item";
    div.innerHTML = `
            <input type="text" placeholder="항목명" value="${label}">
            <input type="text" placeholder="내용" value="${value}">
            <button class="btn-remove">×</button>
        `;

    // 제거 버튼 이벤트
    div.querySelector(".btn-remove").addEventListener("click", () => {
      div.remove();
      this.unsavedChanges = true;
    });

    // 변경 감지
    div.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        this.unsavedChanges = true;
      });
    });

    return div;
  }

  addInfoItem() {
    const container = document.querySelector(".info-items");
    const newItem = this.createInfoItem();
    container.insertBefore(newItem, container.querySelector(".btn-add-info"));
    this.unsavedChanges = true;
  }

  addImageSlot(type) {
    // 파일 선택 다이얼로그 시뮬레이션
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = type === "overview";

    input.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        this.handleImageUpload(file, type);
      });
    });

    input.click();
  }

  handleImageUpload(file, type) {
    // 실제 구현에서는 서버 업로드 처리
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target.result;

      if (type === "slide") {
        this.addSlideImage(imageUrl);
      } else if (type === "overview") {
        this.addOverviewImage(imageUrl);
      }

      this.unsavedChanges = true;
      this.showNotification("이미지가 추가되었습니다.", "success");
    };

    reader.readAsDataURL(file);
  }

  addSlideImage(url) {
    const container = document.querySelector(".slide-images");
    const div = document.createElement("div");
    div.className = "slide-item";
    div.innerHTML = `
            <img src="${url}" alt="Slide">
            <button class="btn-remove">×</button>
        `;

    container.insertBefore(div, container.querySelector(".btn-add-slide"));
    this.setupRemoveButtons(".slide-item");
  }

  addOverviewImage(url) {
    const container = document.querySelector(".image-grid");
    const div = document.createElement("div");
    div.className = "image-item";
    div.innerHTML = `
            <img src="${url}" alt="Image">
            <button class="btn-remove">×</button>
        `;

    container.insertBefore(div, container.querySelector(".btn-add-image"));
    this.setupRemoveButtons(".image-item");
  }

  setupRemoveButtons(selector) {
    document.querySelectorAll(`${selector} .btn-remove`).forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });

    document.querySelectorAll(`${selector} .btn-remove`).forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.parentElement.remove();
        this.unsavedChanges = true;
      });
    });
  }

  setupSaveButtons() {
    // 전체 저장 버튼
    const saveAllBtn = document.querySelector(".btn-save-all");
    if (saveAllBtn) {
      saveAllBtn.addEventListener("click", () => {
        this.saveAllData();
      });
    }

    // SEO HTML 생성 버튼
    const generateSeoBtn = document.querySelector(".btn-generate-seo");
    if (generateSeoBtn) {
      generateSeoBtn.addEventListener("click", () => {
        this.generateSEOHTML();
      });
    }

    // 미리보기 버튼
    const previewBtn = document.querySelector(".btn-preview");
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        this.openPreview();
      });
    }

    // 페이지 떠나기 경고
    window.addEventListener("beforeunload", (e) => {
      if (this.unsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "저장하지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?";
      }
    });
  }

  generateSEOHTML() {
    const data = this.collectFormData();

    // SEO 최적화된 HTML 생성
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${
      data.seo?.title || data.site?.title || "김포 오퍼스 한강 스위첸"
    }</title>
    <meta name="description" content="${
      data.seo?.description || "김포 한강신도시 프리미엄 주거공간"
    }">
    <meta name="keywords" content="${
      data.seo?.keywords || "김포, 한강신도시, 아파트, 분양"
    }">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${data.seo?.title || data.site?.title}">
    <meta property="og:description" content="${data.seo?.description}">
    <meta property="og:image" content="${
      data.seo?.ogImage || "assets/images/hero/hero.jpg"
    }">
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/common.css">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/sections.css">
    <link rel="stylesheet" href="css/design.css">
    <link rel="stylesheet" href="css/responsive.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- SEO를 위한 기본 HTML 구조 (JS 로드 전 표시) -->
    <div id="initial-content">
        <!-- 로딩 중 표시 -->
        <div class="initial-loading">
            <div class="loading-spinner"></div>
            <h1>${
              data.site?.title || data.hero?.title || "김포 오퍼스 한강 스위첸"
            }</h1>
            <p>페이지를 불러오는 중입니다...</p>
        </div>
        
        <!-- SEO용 기본 콘텐츠 (숨김 처리) -->
        <div class="seo-fallback" style="opacity: 0; position: absolute; pointer-events: none;">
            <header>
                <h1>${data.site?.title || data.hero?.title || ""}</h1>
                <nav>
                    <a href="#overview">사업개요</a>
                    <a href="#location">입지환경</a>
                    <a href="#floorplans">평면도</a>
                    <a href="#contact">문의</a>
                </nav>
            </header>
            
            <main>
                <section id="hero">
                    <h1>${data.hero?.title || ""}</h1>
                    <p>${data.hero?.subtitle || ""}</p>
                </section>
                
                <section id="overview">
                    <h2>사업개요</h2>
                    <dl>
                        ${
                          data.overview?.items
                            ?.map(
                              (item) =>
                                `<dt>${item.label}</dt><dd>${item.value}</dd>`
                            )
                            .join("") || ""
                        }
                    </dl>
                </section>
                
                <section id="location">
                    <h2>입지환경</h2>
                    <p>${data.location?.description || ""}</p>
                    ${
                      data.location?.highlights
                        ?.map(
                          (h) =>
                            `<div><h3>${h.title}</h3><p>${h.description}</p></div>`
                        )
                        .join("") || ""
                    }
                </section>
                
                <section id="contact">
                    <h2>문의</h2>
                    <p>전화: <a href="tel:${
                      data.contact?.phone || "1811-0000"
                    }">${data.contact?.phone || "1811-0000"}</a></p>
                    <p>운영시간: ${
                      data.contact?.hours || "오전 10시 - 오후 6시"
                    }</p>
                </section>
            </main>
        </div>
    </div>

    <!-- JavaScript Modules -->
    <script type="module" src="js/main.js"></script>
    
    <style>
        .initial-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: 'Noto Sans KR', sans-serif;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #e0e0e0;
            border-top-color: #1a5490;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        body.js-loaded #initial-content {
            display: none;
        }
    </style>
</body>
</html>`;

    // HTML 파일 다운로드
    const blob = new Blob([html], { type: "text/html; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification(
      "✅ SEO 최적화된 index.html이 생성되었습니다!",
      "success"
    );
    setTimeout(() => {
      this.showNotification(
        "📌 생성된 파일을 기존 index.html에 덮어쓰세요",
        "info"
      );
    }, 1500);
  }

  async saveAllData() {
    try {
      // 데이터 수집
      const updatedData = this.collectFormData();

      // 서버 API로 저장
      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("서버 저장 실패");
      }

      const result = await response.json();

      // localStorage도 업데이트 (백업용)
      localStorage.setItem("adminData", JSON.stringify(updatedData));

      this.unsavedChanges = false;
      this.showNotification("✅ data.json 파일이 저장되었습니다!", "success");
    } catch (error) {
      console.error("저장 실패:", error);
      this.showNotification(
        "저장 중 오류가 발생했습니다. 서버가 실행 중인지 확인하세요.",
        "error"
      );
    }
  }

  collectFormData() {
    const data = { ...this.currentData };

    // 사이트 정보
    data.site = {
      ...data.site,
      title: document.getElementById("site-title").value,
      contact: {
        phone: document.getElementById("contact-phone").value,
        hours: document.getElementById("business-hours").value,
      },
    };

    // SEO 정보
    const ogImageSrc =
      document.querySelector(".seo-form .preview-image")?.src || "";
    // 절대 경로를 상대 경로로 변환
    const ogImagePath = ogImageSrc.replace(window.location.origin + "/", "");

    data.seo = {
      title: document.getElementById("meta-title").value,
      description: document.getElementById("meta-description").value,
      keywords: document.getElementById("meta-keywords").value,
      ogImage: ogImagePath || "assets/images/hero/hero.jpg",
    };

    // 히어로 섹션
    const slideImages = [];
    document.querySelectorAll(".slide-item").forEach((item) => {
      const img = item.querySelector("img");
      if (img) {
        // data-path 속성이 있으면 사용, 없으면 src 사용
        let imagePath = img.dataset.path || img.src;

        // 절대 경로를 상대 경로로 변환
        if (imagePath.startsWith("http")) {
          imagePath = imagePath.replace(window.location.origin + "/", "");
        }

        // base64 이미지가 아닌 경우만 추가
        if (!imagePath.startsWith("data:")) {
          slideImages.push(imagePath);
        }
      }
    });

    data.hero = {
      ...data.hero,
      title: document.getElementById("hero-title").value,
      subtitle: document.getElementById("hero-subtitle").value,
      slideImages:
        slideImages.length > 0
          ? slideImages
          : [data.hero.backgroundImage || "assets/images/hero/hero.jpg"],
    };

    // 사업개요
    const infoItems = [];
    document.querySelectorAll(".info-item").forEach((item) => {
      const inputs = item.querySelectorAll("input");
      if (inputs[0]?.value && inputs[1]?.value) {
        infoItems.push({
          label: inputs[0].value,
          value: inputs[1].value,
        });
      }
    });

    const overviewImages = [];
    document
      .querySelectorAll(".overview-images .image-item")
      .forEach((item) => {
        const img = item.querySelector("img");
        if (img) {
          let imagePath = img.dataset.path || img.src;
          if (imagePath.startsWith("http")) {
            imagePath = imagePath.replace(window.location.origin + "/", "");
          }
          if (!imagePath.startsWith("data:")) {
            overviewImages.push(imagePath);
          }
        }
      });

    data.overview = {
      ...data.overview,
      items: infoItems,
      images: overviewImages,
    };

    // 입지환경
    const locationHighlights = [];
    document
      .querySelectorAll(".location-highlights .highlight-item")
      .forEach((item) => {
        const inputs = item.querySelectorAll("input");
        if (inputs[0]?.value && inputs[1]?.value && inputs[2]?.value) {
          locationHighlights.push({
            icon: inputs[0].value,
            title: inputs[1].value,
            description: inputs[2].value,
          });
        }
      });
    data.location = {
      ...data.location,
      title: document.getElementById("location-title").value,
      description: document.getElementById("location-description").value,
      highlights: locationHighlights,
      image:
        document.getElementById("location-preview")?.src ||
        "assets/images/ipzi/ipzi.jpg",
    };

    // 평면도 - currentData에서 직접 가져오기 (이미 업데이트됨)
    data.floorPlans = {
      ...this.currentData.floorPlans,
      title: document.getElementById("floorplans-title")?.value || "평면도",
      description:
        document.getElementById("floorplans-description")?.value || "",
    };

    // 프리미엄
    const premiumFeatures = [];
    document.querySelectorAll(".premium-feature-item").forEach((item) => {
      const icon = item.querySelector(".feature-icon-input")?.value;
      const title = item.querySelector(".feature-title-input")?.value;
      const description = item.querySelector(
        ".feature-description-input"
      )?.value;
      const detailsText = item.querySelector(".feature-details-input")?.value;

      if (title) {
        const feature = {
          icon,
          title,
          description,
        };
        if (detailsText) {
          // 줄바꿈으로 구분
          feature.details = detailsText
            .split("\n")
            .map((d) => d.replace(/^[•\-\*]\s*/, "").trim())
            .filter((d) => d);
        }
        premiumFeatures.push(feature);
      }
    });

    const premiumImages = [];
    document.querySelectorAll(".premium-image-item").forEach((item) => {
      const inputs = item.querySelectorAll("input");
      if (inputs[0]?.value) {
        premiumImages.push({
          url: inputs[0].value,
          title: inputs[1]?.value || "",
          caption: inputs[2]?.value || "",
        });
      }
    });

    data.premium = {
      title: document.getElementById("premium-title")?.value || "프리미엄",
      description: document.getElementById("premium-description")?.value || "",
      layoutType:
        document.getElementById("premium-layout-type")?.value || "cards",
      visible: document.getElementById("premium-visible")?.checked !== false,
      features: premiumFeatures,
      additionalInfo:
        document.getElementById("premium-additional")?.value || "",
      images: premiumImages,
    };

    // 시스템 (편의시설)
    const convenienceCategories = [];
    document
      .querySelectorAll(".convenience-category-content")
      .forEach((categoryDiv) => {
        const categoryTitle = categoryDiv.querySelector(
          ".category-title-input"
        )?.value;
        const items = [];

        categoryDiv.querySelectorAll(".convenience-item").forEach((itemDiv) => {
          const inputs = itemDiv.querySelectorAll("input");
          const name = inputs[0]?.value;
          const description = inputs[1]?.value;

          if (name) {
            items.push({ name, description });
          }
        });

        if (categoryTitle && items.length > 0) {
          convenienceCategories.push({
            category: categoryTitle,
            items,
          });
        }
      });

    data.convenience = {
      title: document.getElementById("convenience-title")?.value || "시스템",
      description:
        document.getElementById("convenience-description")?.value || "",
      subtitle: document.getElementById("convenience-subtitle")?.value || "",
      visible:
        document.getElementById("convenience-visible")?.checked !== false,
      facilities: convenienceCategories,
    };

    // 커뮤니티 시설
    const communityFacilities = [];
    document.querySelectorAll(".community-facility-card").forEach((card) => {
      const name = card.querySelector(".facility-name")?.textContent;
      const description = card.querySelector(
        ".facility-description"
      )?.textContent;
      const imageElement = card.querySelector(
        ".facility-image img"
      );
      const image = imageElement
        ? imageElement.src.replace(window.location.origin + "/", "")
        : "";

      if (name && name !== "시설명 미입력") {
        communityFacilities.push({
          name,
          description: description !== "설명 미입력" ? description : "",
          image: image,
          mainImage: image // 호환성을 위해 추가
        });
      }
    });

    // 커뮤니티 전체 이미지 (조감도, 평면도)
    const overviewImageInput = document.getElementById(
      "community-overview-image"
    );
    const floorPlanInput = document.getElementById("community-floor-plan");

    data.community = {
      title:
        document.getElementById("community-title")?.value || "커뮤니티 시설",
      description:
        document.getElementById("community-description")?.value || "",
      visible: document.getElementById("community-visible")?.checked !== false,
      overviewImage:
        overviewImageInput?.value || "assets/images/community/main.jpg",
      floorPlanImage:
        floorPlanInput?.value || "assets/images/community/sub.jpg",
      mainImage:
        overviewImageInput?.value || "assets/images/community/main.jpg", // 호환성을 위해 추가
      facilities: communityFacilities,
    };

    // 옵션
    const optionsCategories = [];
    document
      .querySelectorAll(".options-category-item")
      .forEach((categoryDiv) => {
        const title = categoryDiv.querySelector(".category-title-input")?.value;
        const items = [];

        categoryDiv.querySelectorAll(".option-item").forEach((itemDiv) => {
          const itemTitle = itemDiv.querySelector(".item-title")?.value;
          const itemDescription =
            itemDiv.querySelector(".item-description")?.value;

          if (itemTitle) {
            items.push({
              title: itemTitle,
              description: itemDescription,
            });
          }
        });

        if (title && items.length > 0) {
          optionsCategories.push({
            title,
            items,
          });
        }
      });

    data.options = {
      title: document.getElementById("options-title")?.value || "옵션",
      description: document.getElementById("options-description")?.value || "",
      visible: document.getElementById("options-visible")?.checked !== false,
      categories: optionsCategories,
    };

    // 연락처
    data.contact = {
      ...data.contact,
      title: document.getElementById("contact-title")?.value || "상담 문의",
      phone: document.getElementById("contact-number")?.value || "",
      hours: document.getElementById("contact-hours")?.value || "",
      address: document.getElementById("contact-address")?.value || "",
      kakao: document.getElementById("contact-kakao")?.value || "",
    };

    return data;
  }

  autoSave() {
    console.log("자동 저장 중...");
    this.saveAllData();
  }

  openPreview() {
    // 미리보기 - 새 탭에서 사이트 열기
    window.open("/", "_blank");
  }

  showNotification(message, type = "info") {
    // 알림 표시
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${
              type === "success"
                ? "#27ae60"
                : type === "error"
                ? "#e74c3c"
                : "#3498db"
            };
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// 스타일 추가
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  const admin = new AdminPanel();
  admin.init();

  // 디버깅을 위해 전역 변수로 노출
  window.admin = admin;
});
