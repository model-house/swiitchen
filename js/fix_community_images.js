// collectFormData 메서드에서 커뮤니티 섹션 부분을 수정하는 코드
// 이 코드를 admin.js의 collectFormData() 메서드 내 커뮤니티 섹션 부분에 적용해야 함

// 커뮤니티 시설
if (document.getElementById("community-title")) {
  data.community = {
    title: document.getElementById("community-title").value,
    description: document.getElementById("community-description").value,
    visible: document.getElementById("community-visible").checked,
    // 커뮤니티 전체 이미지 추가
    overviewImage: document.getElementById("community-overview-image")?.value || "assets/images/community/main.jpg",
    floorPlanImage: document.getElementByI