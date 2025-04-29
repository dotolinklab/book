document.addEventListener('DOMContentLoaded', () => {
    const book = document.querySelector('.book');
    const cover = document.querySelector('.cover');
    const slider = document.getElementById('page-slider');
    const pageIndicator = document.getElementById('page-indicator');
    
    let pages = []; // 페이지 요소를 저장할 배열 (동적 생성 후 채움)
    const totalPages = pageData.length + 1; // 커버 포함 총 페이지 수
    let currentPage = 0; 

    // --- 페이지 동적 생성 함수 ---
    function createBookPages() {
        pageData.forEach((data, index) => {
            const page = document.createElement('div');
            page.classList.add('page');

            // 왼쪽 화살표 추가
            page.appendChild(createArrow('left'));

            // 페이지 내용 추가
            const contentDiv = createPageContent(data);
            page.appendChild(contentDiv);

            // 오른쪽 화살표 추가 (숨김)
            page.appendChild(createArrow('right'));
            
            // 페이지 번호 추가
            const pageNumberDiv = document.createElement('div');
            pageNumberDiv.classList.add('page-number');
            pageNumberDiv.textContent = `- ${index + 1} -`; // 페이지 번호 설정
            page.appendChild(pageNumberDiv);

            book.appendChild(page);
        });
        // 생성된 페이지들 다시 선택
        pages = document.querySelectorAll('.page');
    }

    function createArrow(direction) {
        const arrowDiv = document.createElement('div');
        arrowDiv.classList.add('nav-arrow', `${direction}-arrow`);
        if (direction === 'right') {
             arrowDiv.style.display = 'none'; // CSS에서도 숨겼지만 JS에서도 명시
        }
        arrowDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
                <path d="${direction === 'left' ? 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' : 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'}"/>
            </svg>
        `;
        return arrowDiv;
    }

    function createPageContent(data) {
        const contentDiv = document.createElement('div');
        if (data.type === 'poem') {
            contentDiv.classList.add('poem-content');
            const title = document.createElement('h4');
            title.textContent = data.title;
            contentDiv.appendChild(title);

            let currentParagraph = document.createElement('p');
            data.content.forEach(line => {
                if (line === '') {
                    // 빈 줄이면 현재 단락 마무리하고 새 단락 시작
                    if (currentParagraph.innerHTML !== '') {
                        contentDiv.appendChild(currentParagraph);
                    }
                    currentParagraph = document.createElement('p');
                } else {
                    // 내용이 있으면 <br>로 연결
                    if (currentParagraph.innerHTML !== '') {
                        currentParagraph.innerHTML += '<br>';
                    }
                    currentParagraph.innerHTML += line;
                }
            });
            // 마지막 단락 추가
            if (currentParagraph.innerHTML !== '') {
                 contentDiv.appendChild(currentParagraph);
            }
        } else if (data.type === 'illustration') {
            contentDiv.classList.add('illustration-content');
            const img = document.createElement('img');
            img.src = data.imagePath;
            img.alt = data.altText;
            img.style.maxWidth = '80%'; // 이미지 크기 제한 (CSS로 옮겨도 됨)
            img.style.maxHeight = '60%';
            img.style.objectFit = 'contain';
            contentDiv.appendChild(img);
            
            const caption = document.createElement('p');
            caption.textContent = data.caption;
            caption.style.position = 'absolute'; 
            caption.style.bottom = '10%';
            caption.style.right = '10%';
            caption.style.fontSize = '14px';
            contentDiv.appendChild(caption); 
            // 이미지 로드 실패 처리 등 추가 가능
        }
        return contentDiv;
    }

    // --- 초기화 및 이벤트 리스너 설정 (기존 로직 활용 및 수정) ---
    // 터치 이벤트 관련 변수
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; 

    // 네비게이션 초기화
    function initializeNavigation() {
        slider.max = totalPages - 1; 
        slider.value = currentPage;
        pageIndicator.textContent = `${currentPage} / ${totalPages - 1}`;
        updateNavigation(currentPage); // 초기 화살표 상태 등 설정
    }
    
    // 네비게이션 업데이트 함수 (화살표 숨김 로직 포함)
    function updateNavigation(newPage) {
        currentPage = newPage;
        slider.value = currentPage;
        pageIndicator.textContent = `${currentPage} / ${totalPages - 1}`;

        // 페이지별 화살표 표시/숨김 처리
        pages.forEach((page, index) => {
            const pageNumber = index + 1;
            const leftArrow = page.querySelector('.left-arrow');
            const rightArrow = page.querySelector('.right-arrow'); // 필요 시 사용

            if (!leftArrow) return; 

            leftArrow.classList.remove('hidden'); 

            // 마지막 페이지 오른쪽 화살표 숨김 처리 (CSS에서 이미 숨겼지만, 필요시 JS 로직 추가)
            // if (rightArrow) {
            //     if (pageNumber === totalPages - 1) rightArrow.classList.add('hidden'); 
            //     else rightArrow.classList.remove('hidden');
            // }
        });
    }

    // 특정 페이지로 이동하는 함수 (기존 로직 유지)
    function goToPage(targetPage) {
         // ... (이전 goToPage 함수 내용 그대로 사용) ...
         // 페이지 범위 확인
        if (targetPage < 0) targetPage = 0;
        if (targetPage >= totalPages) targetPage = totalPages - 1;

        // 현재 페이지와 목표 페이지가 같으면 아무것도 안 함
        if (targetPage === currentPage) return;

        // 현재 페이지에서 목표 페이지로 이동하는 방향 결정
        const goingForward = targetPage > currentPage;
        
        // 첫 페이지에서 메인으로 넘어가는 특수 케이스 처리
        const isFirstToMain = currentPage === 0 || currentPage === 1 && targetPage > currentPage;

        // 페이지 z-index 초기화 (이동 방향에 따라 다르게 설정)
        if (targetPage === 0) {
            // 커버로 돌아가는 경우
            cover.style.zIndex = totalPages + 10;
            pages.forEach((page) => {
                page.style.zIndex = 1;
            });
        } else {
            // 페이지로 이동하는 경우
            cover.style.zIndex = 1;
            
            // 모든 페이지의 z-index를 우선 낮게 설정 (초기화)
            pages.forEach(page => {
                page.style.zIndex = 1;
            });
            
            // 이동 방향에 따라 z-index 다르게 설정
            if (goingForward) {
                // 앞으로 이동 (1→2, 2→3 등)
                pages.forEach((page, index) => {
                    const pageNumber = index + 1;
                    if (pageNumber === targetPage) {
                        page.style.zIndex = totalPages + 10; // 목표 페이지 최상위
                    } else if (pageNumber < targetPage) {
                        page.style.zIndex = totalPages - pageNumber; // 앞 페이지들 순차적으로
                    }
                    
                    // 특수 케이스: 첫 페이지에서 다음 페이지로 넘어갈 때 마지막 페이지 숨김
                    if (isFirstToMain && pageNumber === totalPages - 1) {
                        page.style.zIndex = 0; // 마지막 페이지는 완전히 숨김
                    }
                });
            } else {
                // 뒤로 이동 (3→2, 2→1 등)
                pages.forEach((page, index) => {
                    const pageNumber = index + 1;
                    if (pageNumber === targetPage) {
                        page.style.zIndex = totalPages + 10; // 목표 페이지 최상위
                    } else if (pageNumber < targetPage) {
                        page.style.zIndex = totalPages - pageNumber; // 앞 페이지들 순차적으로
                    } else if (pageNumber === targetPage + 1) {
                        page.style.zIndex = totalPages + 5; // 현재 넘기는 페이지는 준-최상위
                    }
                });
            }
        }

        // 2. Flipped 클래스 적용 (애니메이션 시작)
        // 커버 처리
        if (targetPage > 0 && !cover.classList.contains('flipped')) {
            cover.classList.add('flipped');
        } else if (targetPage === 0 && cover.classList.contains('flipped')) {
            cover.classList.remove('flipped');
        }

        // 페이지 처리
        pages.forEach((page, index) => {
            const pageNumber = index + 1;
            if (pageNumber < targetPage && !page.classList.contains('flipped')) {
                // 목표 이전 페이지: 넘김
                page.classList.add('flipped');
            } else if (pageNumber >= targetPage && page.classList.contains('flipped')) {
                // 목표 또는 이후 페이지: 닫음 (이전으로 갈 때)
                page.classList.remove('flipped');
            }
        });

        // 3. 네비게이션 업데이트
        updateNavigation(targetPage); // currentPage 업데이트 등
    }

    // --- 이벤트 리스너 (Event Delegation 사용) ---
    book.addEventListener('click', (event) => {
        // 왼쪽 화살표 클릭 처리
        const leftArrow = event.target.closest('.left-arrow');
        if (leftArrow) {
            event.stopPropagation(); 
            goToPage(currentPage - 1);
            return; 
        }
        
        // 페이지 클릭 처리 (다음 페이지)
        const clickedPageElement = event.target.closest('.page');
        if (clickedPageElement) {
            // 페이지 요소 배열에서 인덱스 찾기
            const pageIndex = Array.from(pages).indexOf(clickedPageElement);
            if (pageIndex !== -1) {
                 const pageNumber = pageIndex + 1; // 페이지 번호 (1부터 시작)
                 // 현재 보이는 페이지이고, 마지막 페이지가 아닐 때만 다음으로
                 if (pageNumber === currentPage && !clickedPageElement.classList.contains('flipped') && currentPage < totalPages - 1) {
                    goToPage(currentPage + 1);
                }
            }
        }
        
        // 커버 클릭 처리
        const clickedCover = event.target.closest('.cover');
        if(clickedCover) {
            if (cover.classList.contains('flipped')) {
                goToPage(0);
            } else {
                goToPage(1);
            }
        }
    });

    // 슬라이더 이벤트
    slider.addEventListener('input', () => {
        const targetPage = parseInt(slider.value);
        goToPage(targetPage);
    });

    // 스와이프 이벤트 처리
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
                goToPage(currentPage + 1);
            } else {
                goToPage(currentPage - 1);
            }
        }
        touchStartX = 0;
        touchEndX = 0;
    }

    // --- 페이지 생성 및 초기화 실행 ---
    createBookPages();
    initializeNavigation();

}); 