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
            // cover.style.zIndex = totalPages + 1; // z-index는 아래에서 최종 결정
        }

        // 2. 페이지 처리
        let targetPageElement = null; // 목표 페이지 요소를 저장할 변수
        pages.forEach((page, index) => {
            const pageNumber = index + 1;
            const isPageCurrentlyFlipped = page.classList.contains('flipped');
            // 목표 페이지 *이전*의 페이지만 flipped 상태가 되어야 함
            const shouldPageBeFlipped = pageNumber < targetPage;

            if (shouldPageBeFlipped) {
                // 넘겨진 페이지 처리 (뒤쪽에 위치)
                if (!isPageCurrentlyFlipped) {
                    page.classList.add('flipped');
                }
                page.style.zIndex = pageNumber + 1; // 넘겨진 순서대로 z-index (커버보다 위)
            } else {
                 // 목표 페이지 또는 그 이후 페이지 처리 (앞쪽에 위치해야 함)
                 if (isPageCurrentlyFlipped) {
                    // 만약 flipped 상태였다면 제거 (뒤로 갈 때)
                    page.classList.remove('flipped');
                 }
                 // 일단 z-index를 낮게 설정 (목표 페이지만 나중에 높일 것임)
                 page.style.zIndex = 1;
                 if (pageNumber === targetPage) {
                     targetPageElement = page; // 목표 페이지 요소 저장
                 }
            }
        });

        // 3. 최종 z-index 설정 (가장 위에 보일 요소 결정)
        if (targetPage === 0) {
            // 목표가 커버일 경우
            cover.style.zIndex = totalPages + 1; // 커버 z-index 가장 높게
        } else {
            // 목표가 페이지일 경우
            if (targetPageElement) {
                targetPageElement.style.zIndex = totalPages + 1; // 목표 페이지 z-index 가장 높게
            }
            // 커버는 확실히 뒤로 보냄 (만약 flipped 상태라면)
            if (cover.classList.contains('flipped')) {
                 cover.style.zIndex = 1;
            }
        }

        updateNavigation(targetPage); // 네비게이션 업데이트
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