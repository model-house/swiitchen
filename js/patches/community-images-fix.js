// 커뮤니티 이미지 저장 수정 패치
// admin.js의 collectFormData() 함수에서 community 부분을 찾아서 아래 코드로 수정하세요.

// collectFormData() 함수 내 community 부분을 이렇게 수정:
/*
community: {
  title: document.getElementById("community-title")?.value || "",
  description: document.getElementById("community-description")?.value || "",
  visible: document.getElementById("community-visible")?.checked !== false,
  // 조감도와 평면도 이미지 추가
  overviewImage: document.getElementById("community-overview-image")?.value || "assets/images/community/main.jpg",
  floorPlanImage: document.getElementById("community-floor-plan")?.value || "assets/images/community/sub.jpg",
  // 기존 mainImage는 overviewImage로 대체
  mainImage: document.getElementById("community-overview-image")?.value || "assets/images/community/main.jpg",
  // 시설 목록
  facilities: (() => {
    const facilities = [];
    const cards = document.querySelectorAll("#