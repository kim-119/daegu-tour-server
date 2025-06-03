// ==================== 전역 변수 ====================
let visitStartTime = Date.now();
let favorites = JSON.parse(localStorage.getItem('daeguFavorites')) || [];
let selectedPlaces = [];
let tripCount = 0;

// ==================== 데이터 ====================
const northeasternregion = [
  {
    src: "동화사.jpg",
    caption: "동화사",
    caption2: "동화사는 대구광역시 동구 팔공산에 위치한 유서 깊은 사찰로, 통일신라 흥덕왕 7년(832년)에 심지왕사가 중창하였습니다. 겨울에도 오동나무 꽃이 피었다는 전설에서 '동화사(桐華寺)'라는 이름이 유래되었습니다.",
    mapLink: "https://www.google.com/maps?q=동화사+대구",
    category: "northeasternregion",
    popularity: 95
  },
  {
    src: "도동 촉백나무.jpg",
    caption: "도동측백나무숲",
    caption2: "천연기념물 제1호로 지정된 희귀 측백나무 군락지입니다. 약 700여 그루의 측백나무가 절벽의 바위틈에 자생하는 독특한 생태계를 보여줍니다.",
    mapLink: "https://www.google.com/maps?q=도동측백나무숲",
    category: "northeasternregion",
    popularity: 78
  },
  {
    src: "하중도.webp",
    caption: "하중도",
    caption2: "금호강 위에 형성된 자연생태공원입니다. 봄에는 유채꽃과 청보리, 가을에는 코스모스와 억새가 장관을 이룹니다.",
    mapLink: "https://www.google.com/maps?q=하중도+대구",
    category: "northeasternregion",
    popularity: 82
  },
  {
    src: "갓바위.jpg",
    caption: "갓바위",
    caption2: "갓 모양을 쓴 석불좌상이 유명한 신앙의 명소입니다. 소원을 빌면 한 가지는 꼭 이루어진다는 전설이 있어 많은 사람들이 찾습니다.",
    mapLink: "https://www.google.com/maps?q=갓바위+팔공산",
    category: "northeasternregion",
    popularity: 92
  }
];

const JungguDistrict = [
  {
    src: "약령시 박물관.JPG",
    caption: "약령시 박물관",
    caption2: "한방 문화와 역사를 전시하는 대구 전통 약령시장 박물관입니다. 350여 년의 전통을 지닌 대구 약령시의 역사를 체험할 수 있습니다.",
    mapLink: "https://www.google.com/maps?q=약령시+박물관+대구",
    category: "JungguDistrict",
    popularity: 75
  },
  {
    src: "동성로.jfif",
    caption: "동성로",
    caption2: "대구의 대표적 쇼핑 거리이자 문화 중심지입니다. 다양한 브랜드 매장과 맛집, 카페가 즐비한 젊음의 거리입니다.",
    mapLink: "https://www.google.com/maps?q=동성로+대구",
    category: "JungguDistrict",
    popularity: 88
  },
  {
    src: "경삼감영 공원.jfif",
    caption: "경상감영공원",
    caption2: "조선시대 지방 행정의 중심이었던 감영이 위치했던 곳입니다. 선화당과 징청각 등 주요 건물이 복원되어 있습니다.",
    mapLink: "https://www.google.com/maps?q=경상감영공원+대구",
    category: "JungguDistrict",
    popularity: 70
  },
  {
    src: "2.28 중앙공원.jpg",
    caption: "2.28 중앙공원",
    caption2: "민주화 운동을 기념하는 도심 공원입니다. 1960년 대구에서 발생한 2·28 학생 민주운동을 기념하기 위해 조성되었습니다.",
    mapLink: "https://www.google.com/maps?q=2.28+중앙공원+대구",
    category: "JungguDistrict",
    popularity: 65
  }
];

const allAttractions = [...northeasternregion, ...JungguDistrict];

// ==================== 초기화 ====================
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  updateStats();
  startVisitTimer();
  loadFavoriteStates();
});

function initializeApp() {
  showScreen('startScreen');
  
  // 시작 화면 클릭 이벤트
  const title = document.getElementById('startTitle');
  if (title) {
    title.addEventListener('click', function () {
      showScreen('loadingScreen');
      setTimeout(() => {
        showScreen('touristMapScreen');
      }, 500); // 로딩 시간 0.5초로 단축
    });
  }

  // 관광지 아이템 클릭 이벤트
  document.querySelectorAll('.tourist-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // 즐겨찾기 버튼 클릭 시에는 상세 화면으로 이동하지 않음
      if (e.target.closest('.favorite-btn')) return;
      
      const regionKey = item.getAttribute('data-region');
      loadRegion(regionKey);
    });
  });
}

// ==================== 화면 관리 ====================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  
  const target = document.getElementById(id);
  if (target) {
    target.style.display = 'block';
    setTimeout(() => {
      target.classList.add('active');
    }, 10);
  }
}

// 메인 화면 버튼 함수들
function showRegions() {
  showScreen('loadingScreen');
  setTimeout(() => {
    showScreen('touristMapScreen');
    // 관광지 섹션으로 스크롤
    setTimeout(() => {
      const touristSection = document.getElementById('touristItems');
      if (touristSection) {
        touristSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, 500); // 로딩 시간 0.5초로 단축
}

function showVideo() {
  showScreen('loadingScreen');
  setTimeout(() => {
    showScreen('touristMapScreen');
    // 비디오 섹션으로 스크롤
    setTimeout(() => {
      const videoSection = document.querySelector('.video-section');
      if (videoSection) {
        videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, 500); // 로딩 시간 0.5초로 단축
}

function showTips() {
  showScreen('loadingScreen');
  setTimeout(() => {
    showScreen('touristMapScreen');
    // 팁 섹션으로 스크롤
    setTimeout(() => {
      const tipsSection = document.querySelector('.tips-grid');
      if (tipsSection) {
        tipsSection.closest('.section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, 500); // 로딩 시간 0.5초로 단축
}

// ==================== 지역 로딩 ====================
function loadRegion(regionKey) {
  const regionMap = {
    northeasternregion,
    JungguDistrict
  };
  
  const regionData = regionMap[regionKey];
  const container = document.getElementById("regionContainer");
  const title = document.getElementById("regionTitle");

  if (!regionData || !container || !title) return;

  container.innerHTML = "";
  
  const titleMap = {
    northeasternregion: "동북권 관광지",
    JungguDistrict: "중구권 관광지"
  };
  
  title.textContent = titleMap[regionKey] || "관광지 상세";

  regionData.forEach(item => {
    const div = document.createElement("div");
    div.className = "example-item";
    div.innerHTML = `
      <img src="${item.src}" alt="${item.caption}" loading="lazy">
      <div class="example-content">
        <h3>${item.caption}</h3>
        <p class="example-description">${item.caption2}</p>
        <div class="example-actions">
          <a href="${item.mapLink}" target="_blank" class="btn btn-primary btn-small">
            <i class="fas fa-map-marker-alt"></i> 지도에서 보기
          </a>
          <button class="btn btn-secondary btn-small" onclick="toggleFavorite('${item.caption}', this)">
            <i class="fas fa-heart"></i> 즐겨찾기
          </button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  showScreen("touristDetailScreen");
}

// ==================== 개별 관광지 창 열기 ====================
function openAttractionWindow(attractionName) {
  // 모든 데이터 배열을 합쳐서 검색
  const attraction = allAttractions.find(item => item.caption === attractionName);
  
  if (!attraction) return;
  
  // 새 창 열기
  const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
  
  // 새 창에 HTML 내용 작성
  newWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>${attraction.caption} - 대구 투어 가이드</title>
      <style>
        body { font-family: 'Noto Sans KR', sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 20px; }
        img { width: 100%; height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 20px; }
        p { line-height: 1.8; color: #555; font-size: 16px; }
        .btn { display: inline-block; padding: 10px 20px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .btn:hover { background: #c0392b; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${attraction.caption}</h1>
        <img src="${attraction.src}" alt="${attraction.caption}">
        <p>${attraction.caption2}</p>
        <div style="text-align: center;">
          <a href="${attraction.mapLink}" target="_blank" class="btn">지도에서 보기</a>
          <a href="#" onclick="window.close()" class="btn">창 닫기</a>
        </div>
      </div>
    </body>
    </html>
  `);
  
  newWindow.document.close();
}

// ==================== 필터링 기능 ====================
function applyFilters() {
  const categoryFilter = document.getElementById('categoryFilter').value;
  const sortFilter = document.getElementById('sortFilter').value;
  const touristItems = document.querySelectorAll('.tourist-item');
  
  // 필터링
  touristItems.forEach(item => {
    const itemCategory = item.getAttribute('data-region');
    if (categoryFilter === 'all' || categoryFilter === itemCategory) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
  
  // 정렬
  const container = document.getElementById('touristItems');
  const items = Array.from(touristItems);
  
  items.sort((a, b) => {
    switch (sortFilter) {
      case 'name':
        return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
      case 'popularity':
        return parseInt(b.getAttribute('data-popularity')) - parseInt(a.getAttribute('data-popularity'));
      default:
        return 0;
    }
  });
  
  // DOM 재정렬
  items.forEach(item => container.appendChild(item));
  
  showNotification('필터가 적용되었습니다.', 'success');
}

// ==================== 즐겨찾기 기능 ====================
function toggleFavorite(placeName, button) {
  event.stopPropagation();
  
  const index = favorites.indexOf(placeName);
  const icon = button.querySelector('i');
  
  if (index === -1) {
    favorites.push(placeName);
    button.classList.add('active');
    if (icon) icon.className = 'fas fa-heart';
    showNotification(`${placeName}이(가) 즐겨찾기에 추가되었습니다.`, 'success');
  } else {
    favorites.splice(index, 1);
    button.classList.remove('active');
    if (icon) icon.className = 'far fa-heart';
    showNotification(`${placeName}이(가) 즐겨찾기에서 제거되었습니다.`, 'info');
  }
  
  localStorage.setItem('daeguFavorites', JSON.stringify(favorites));
  updateStats();
}

function loadFavoriteStates() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const item = btn.closest('.tourist-item');
    if (item) {
      const placeName = item.getAttribute('data-name');
      const icon = btn.querySelector('i');
      
      if (favorites.includes(placeName)) {
        btn.classList.add('active');
        if (icon) icon.className = 'fas fa-heart';
      } else {
        btn.classList.remove('active');
        if (icon) icon.className = 'far fa-heart';
      }
    }
  });
}

// ==================== 방문 시간 추적 ====================
function startVisitTimer() {
  setInterval(() => {
    const visitTime = Math.floor((Date.now() - visitStartTime) / 1000 / 60);
    const visitTimeElement = document.getElementById('visitTime');
    if (visitTimeElement) {
      visitTimeElement.textContent = `${visitTime}분`;
    }
  }, 1000);
}

// ==================== 통계 업데이트 ====================
function updateStats() {
  const favoriteCountElement = document.getElementById('favoriteCount');
  const selectedCountElement = document.getElementById('selectedCount');
  const tripCountElement = document.getElementById('tripCount');
  
  if (favoriteCountElement) favoriteCountElement.textContent = favorites.length;
  if (selectedCountElement) selectedCountElement.textContent = selectedPlaces.length;
  if (tripCountElement) tripCountElement.textContent = tripCount;
}

// ==================== 알림 시스템 ====================
function showNotification(message, type = 'info') {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 300px;
    font-size: 0.9rem;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 3000);
}
setTimeout(function () {
  // 코드 내용
  document.getElementById('loadingScreen').style.display = 'none';
}, 2000); 
async function readJSONFile(filename) {
  const fullPath = path.join(__dirname, filename)
  try {
    const data = await fs.readFile(fullPath, "utf8")
    console.log(`[Server] Successfully read file: ${fullPath}`)
    return JSON.parse(data)
  } catch (error) {
    console.error(`[Server] Failed to read/parse ${fullPath}:`, error.message)
    if (error.code === "ENOENT") {
      console.warn(`File not found: ${filename}. Returning default empty data.`)
      if (filename.endsWith("s.json") || filename === "bookmarks.json") return []
      return {}
    }
    return null
  }
}