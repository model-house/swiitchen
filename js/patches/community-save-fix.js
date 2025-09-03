// 커뮤니티 이미지 저장 수정 코드
// admin.js의 collectFormData() 함수에서 community 부분을 찾아서 아래 코드로 교체하세요.

// collectFormData() 함수 내의 community: 부분을 다음과 같이 수정:

community: {
  title: document.getElementById("community-title")?.value || "",
  description: document.getElementById("community-description")?.value || "",
  visible: document.getElementById("community-visible")?.checked !== false,
  // 조감도와 평면도 이미지 추가
  overviewImage: document.getElementById("community-overview-image")?.value || "assets/images/community/main.jpg",
  floorPlanImage: document.getElementById("community-floor-plan")?.value || "assets/images/community/sub.jpg",
  // 기존 mainImage는 overviewImage로 대체 (호환성 유지)
  mainImage: document.getElementById("community-overview-image")?.value || "assets/images/community/main.jpg",
  // 시설 목록
  facilities: (() => {
    const facilities = [];
    const cards = document.querySelectorAll("#community-facilities-list .community-facility-card");
    cards.forEach(card => {
      const facilityData = {
        name: card.querySelector(".facility-name")?.textContent || "",
        description: card.querySelector(".facility-description")?.textContent || "",
        mainImage: card.querySelector(".facility-image img")?.src || "",
        image: card.querySelector(".facility-image img")?.src || "" // 호환성을 위해 두 필드 모두에 저장
      };
      facilities.push(facilityData);
    });
    return facilities;
  })()
},

// 위 코드로 교체하면 커뮤니티의 조감도(overviewImage)와 평면도(floorPlanImage) 이미지가 
// JSON에 정상적으로 저장됩니다.