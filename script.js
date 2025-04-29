document.addEventListener('DOMContentLoaded', () => {
    const book = document.querySelector('.book'); // book 요소 선택
    const cover = document.querySelector('.cover');
    const pages = document.querySelectorAll('.page');
    const slider = document.getElementById('page-slider');
    const pageIndicator = document.getElementById('page-indicator');

    const totalPages = pages.length + 1; // 커버 포함 총 페이지 수
    let currentPage = 0; // 현재 보고 있는 페이지 (0: 커버, 1: 첫 페이지, ...)
    let zCounter = 1; // z-index 관리를 위한 카운터 (커버 제외)

    // 터치 이벤트 관련 변수
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // 최소 스와이프 거리 (px)

    // 네비게이션 초기화
    slider.max = totalPages - 1; // 슬라이더 최대값 설정 (0부터 시작)
    slider.value = currentPage;
    pageIndicator.textContent = `${currentPage} / ${totalPages - 1}`;

    // 네비게이션 업데이트 함수
    function updateNavigation(newPage) {
        currentPage = newPage;
        slider.value = currentPage;
        pageIndicator.textContent = `${currentPage} / ${totalPages - 1}`;

        // 페이지별 화살표 표시/숨김 처리
        pages.forEach((page, index) => {
            const pageNumber = index + 1;
            const leftArrow = page.querySelector('.left-arrow');
            const rightArrow = page.querySelector('.right-arrow');

            if (!leftArrow || !rightArrow) return; // 화살표 없으면 중단

            leftArrow.classList.remove('hidden'); // 모든 페이지에서 왼쪽 화살표 기본적으로 보이도록

            if (pageNumber === totalPages - 1) {
                rightArrow.classList.add('hidden'); // 마지막 페이지는 오른쪽 화살표 숨김
            } else {
                rightArrow.classList.remove('hidden');
            }
        });
    }

    // 특정 페이지로 이동하는 함수
    function goToPage(targetPage) {
        // 페이지 범위 확인
        if (targetPage < 0) targetPage = 0;
        if (targetPage >= totalPages) targetPage = totalPages - 1;

        // 1. 커버 처리
        const isCoverCurrentlyFlipped = cover.classList.contains('flipped');
        const shouldCoverBeFlipped = targetPage > 0;

        if (shouldCoverBeFlipped && !isCoverCurrentlyFlipped) {
            cover.classList.add('flipped');
            cover.style.zIndex = 1; // 넘겨진 커버는 뒤로
        } else if (!shouldCoverBeFlipped && isCoverCurrentlyFlipped) {
            cover.classList.remove('flipped');
            cover.style.zIndex = totalPages + 1; // 닫힌 커버는 맨 앞으로 (페이지 수 + 1)
        }

        // 2. 페이지 처리
        pages.forEach((page, index) => {
            const pageNumber = index + 1;
            const isPageCurrentlyFlipped = page.classList.contains('flipped');
            const shouldPageBeFlipped = pageNumber < targetPage; 

            if (shouldPageBeFlipped) {
                // 넘겨진 페이지: flipped 유지/추가, 낮은 z-index
                if (!isPageCurrentlyFlipped) {
                    page.classList.add('flipped');
                }
                page.style.zIndex = pageNumber + 1; // 넘겨진 순서대로 z-index 증가 (커버 z=1 다음)
            } else if (pageNumber === targetPage) {
                 // 현재 보여야 할 페이지: flipped 제거, 가장 높은 z-index
                if (isPageCurrentlyFlipped) {
                     page.classList.remove('flipped');
                }
                page.style.zIndex = totalPages; // 가장 높게 설정하여 보이도록
            } else { // pageNumber > targetPage
                // 아직 보이지 않는 페이지: flipped 제거, 가장 낮은 z-index
                 if (isPageCurrentlyFlipped) {
                    page.classList.remove('flipped');
                }
                page.style.zIndex = 1; // 넘겨진 페이지들 및 커버 뒤로
            }
        });

        // 현재 보여야 할 페이지(targetPage)의 z-index를 가장 높게 설정
        const currentPageElement = targetPage === 0 ? cover : pages[targetPage - 1];
        if (currentPageElement) {
             currentPageElement.style.zIndex = totalPages + 1; // 현재 페이지 z-index (가장 높게)
        }

        updateNavigation(targetPage);
    }

    // 커버 클릭 이벤트
    cover.addEventListener('click', () => {
        if (cover.classList.contains('flipped')) {
            goToPage(0);
        } else {
            goToPage(1);
        }
    });

    // 각 페이지 내 화살표 클릭 이벤트
    pages.forEach((page, index) => {
        const pageNumber = index + 1;
        const leftArrow = page.querySelector('.left-arrow');
        const rightArrow = page.querySelector('.right-arrow');

        if (leftArrow) {
            leftArrow.addEventListener('click', (event) => {
                event.stopPropagation(); // 이벤트 전파 중단
                goToPage(currentPage - 1);
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', (event) => {
                event.stopPropagation(); // 이벤트 전파 중단
                goToPage(currentPage + 1);
            });
        }

        // 페이지 자체 클릭 리스너 (선택적 유지 또는 수정)
        page.addEventListener('click', (event) => {
            // 화살표 클릭 시 페이지 클릭 이벤트는 무시
            if (event.target.classList.contains('nav-arrow')) return;

            if (pageNumber === currentPage && !page.classList.contains('flipped')) {
                 if (pageNumber < totalPages - 1) {
                     // goToPage(pageNumber + 1); // 화살표로 대체되었으므로 주석 처리 또는 삭제
                 }
            }
        });
    });

    // 슬라이더 이벤트
    slider.addEventListener('input', () => {
        const targetPage = parseInt(slider.value);
        goToPage(targetPage);
    });

    // 스와이프 이벤트 처리 (책 전체 영역 대상)
    book.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
    });

    book.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance < 0) {
                // 오른쪽에서 왼쪽으로 스와이프 (다음 페이지)
                goToPage(currentPage + 1);
            } else {
                // 왼쪽에서 오른쪽으로 스와이프 (이전 페이지)
                goToPage(currentPage - 1);
            }
        }
        // 스와이프 후 좌표 초기화 (선택사항)
        touchStartX = 0;
        touchEndX = 0;
    }

    // 초기 페이지 로드 시 화살표 상태 업데이트
    updateNavigation(currentPage);
}); 