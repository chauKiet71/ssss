
let scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
let currentRound = 0;
let previousAnswers = [];
let soundEnabled = true; // Âm nhạc mặc định bật
const audio = document.getElementById('backgroundMusic');

// Phát nhạc tự động khi tải trang
window.onload = function () {
    audio.play()
        .then(() => {
            document.getElementById('musicBtn').textContent = 'Tắt nhạc'; // Cập nhật nhãn nút khi phát thành công
        })
        .catch(error => {
            console.log("Lỗi phát nhạc nền:", error);
            document.getElementById('musicBtn').textContent = 'Bật nhạc'; // Nếu lỗi, giữ nút "Bật nhạc"
            soundEnabled = false; // Đặt lại trạng thái nếu không phát được
            alert("Không thể phát nhạc tự động do chính sách trình duyệt. Vui lòng nhấn 'Bật nhạc' để thưởng thức!"); // Dòng này đã bị tắt
        });
};

// Khai báo âm thanh click
const clickSound = new Audio('https://freesound.org/data/previews/245/245645_4055596-lq.mp3');
clickSound.preload = 'auto';
clickSound.volume = 1.0;

const buttonClickSound = new Audio('https://freesound.org/data/previews/245/245645_4055596-lq.mp3');
buttonClickSound.preload = 'auto';
buttonClickSound.volume = 0.7;

// Hàm phát âm thanh click cho nút
function playButtonClick() {
    if (soundEnabled) {
        buttonClickSound.currentTime = 0;
        buttonClickSound.play().catch(error => console.log("Lỗi phát âm thanh click:", error));
    }
}

// Hàm bật/tắt nhạc nền
function toggleMusic() {
    if (soundEnabled) {
        audio.pause();
        document.getElementById('musicBtn').textContent = 'Bật nhạc';
        soundEnabled = false;
    } else {
        audio.play()
            .then(() => {
                document.getElementById('musicBtn').textContent = 'Tắt nhạc';
                soundEnabled = true;
            })
            .catch(error => {
                console.log("Lỗi phát nhạc nền:", error);
                alert("Không thể phát nhạc. Vui lòng thử lại hoặc kiểm tra cài đặt trình duyệt.");
            });
    }
    playButtonClick(); // Phát âm thanh click sau khi thay đổi trạng thái
}

function startQuiz() {
    playButtonClick();
    document.getElementById('game-info').style.display = 'none';
    document.getElementById('infoBtn').style.display = 'none';
    document.getElementById('personal-info').style.display = 'block';
}

function startGame() {
    playButtonClick();
    const name = document.getElementById('name').value.trim();
    const className = document.getElementById('class').value.trim();
    const school = document.getElementById('school').value.trim();

    if (!name || !className || !school) {
        alert("Vui lòng nhập đầy đủ thông tin cá nhân!");
        return;
    }

    document.getElementById('personal-info').style.display = 'none';
    currentRound = 1;
    document.getElementById('round1').classList.add('active');
    document.getElementById('backBtn').style.display = 'none';
    checkAllAnswered();
}
function backToGameInfo() {
    playButtonClick(); // Phát âm thanh click
    document.getElementById('personal-info').style.display = 'none'; // Ẩn trang thông tin cá nhân
    document.getElementById('game-info').style.display = 'block'; // Hiện trang đầu
    document.getElementById('infoBtn').style.display = 'block'; // Hiện nút thông tin
}

// Thêm sự kiện để kiểm tra khi nhập liệu
document.querySelectorAll('#personal-info input').forEach(input => {
    input.addEventListener('input', () => {
        const name = document.getElementById('name').value.trim();
        const className = document.getElementById('class').value.trim();
        const school = document.getElementById('school').value.trim();
        const nextBtn = document.querySelector('#personal-info .next-btn');
        nextBtn.style.display = (name && className && school) ? 'block' : 'none';
    });
});

function answer(group, isYes) {
    if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch(error => console.log("Lỗi phát âm thanh tích:", error));
    }

    if (!previousAnswers[currentRound]) {
        previousAnswers[currentRound] = {};
    }

    const prevAnswer = previousAnswers[currentRound][group];
    if (prevAnswer !== undefined) {
        if (isYes && prevAnswer === 0) scores[group]++;
        if (!isYes && prevAnswer === 1) scores[group] = Math.max(0, scores[group] - 1);
    } else {
        if (isYes) scores[group]++;
    }
    previousAnswers[currentRound][group] = isYes ? 1 : 0;

    checkAllAnswered();
}

function checkAllAnswered() {
    const radios = document.querySelectorAll(`#round${currentRound} input[type="radio"]:checked`);
    document.getElementById('nextBtn').style.display = (radios.length === 6) ? 'block' : 'none';
}

function nextRound() {
    playButtonClick();
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById(`round${currentRound}`).classList.remove('active');
    document.getElementById('backBtn').style.display = 'block';

    currentRound++;
    if (currentRound <= 10) {
        document.getElementById(`round${currentRound}`).classList.add('active');
        loadPreviousAnswers();
        checkAllAnswered();
    } else {
        showResult();
    }
}

function prevRound() {
    playButtonClick();
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById(`round${currentRound}`).classList.remove('active');

    currentRound--;
    if (currentRound >= 1) {
        document.getElementById(`round${currentRound}`).classList.add('active');
        document.getElementById('backBtn').style.display = currentRound > 1 ? 'block' : 'none';
        loadPreviousAnswers();
        checkAllAnswered();
    }
}

function loadPreviousAnswers() {
    if (previousAnswers[currentRound]) {
        for (let group in previousAnswers[currentRound]) {
            const value = previousAnswers[currentRound][group];
            document.querySelector(`#${group.toLowerCase()}${currentRound}-yes`).checked = value === 1;
            document.querySelector(`#${group.toLowerCase()}${currentRound}-no`).checked = value === 0;
        }
    } else {
        document.querySelectorAll(`#round${currentRound} input[type="radio"]`).forEach(radio => radio.checked = false);
    }
}

function showResult() {
    playButtonClick();

    // Kiểm tra số lượng câu trả lời
    let totalAnswers = 0;
    for (let i = 1; i <= 10; i++) {
        const radios = document.querySelectorAll(`#round${i} input[type="radio"]:checked`);
        totalAnswers += radios.length;
    }

    if (totalAnswers < 60) {
        alert("Vui lòng trả lời đầy đủ 60 câu hỏi trước khi xem kết quả!");
        return;
    }

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    document.getElementById('backBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';

    // Đếm số nhóm có điểm > 1
    const groupsAboveOne = Object.values(scores).filter(score => score >= 1).length;

    if (groupsAboveOne < 3) {
        // Trường hợp ít hơn 3 nhóm có điểm > 1
        document.getElementById('hollandCode').textContent = "Không xác định";
        document.getElementById('description').innerHTML = "Không tìm thấy kết quả phù hợp dựa trên câu trả lời của bạn.";
        document.getElementById('code-options').innerHTML = "";
        document.getElementById('suggestions').innerHTML = "<p style='text-align: center;'>Vui lòng thử lại với các lựa chọn đa dạng hơn để khám phá sở thích của bạn!</p>";
        document.getElementById('feedbackSection').style.display = 'block';
        document.getElementById('backToOptionsBtn').style.display = 'none';
        return;
    }

    // Sắp xếp các nhóm theo điểm từ cao đến thấp
    const sortedGroups = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(g => ({ group: g[0], score: g[1] }));

    // Lấy điểm cao nhất
    const maxScore = sortedGroups[0].score;
    // Lọc các nhóm có điểm bằng điểm cao nhất
    const topGroups = sortedGroups.filter(g => g.score === maxScore).map(g => g.group);

    const groupDescriptions = {
        'R': ' (Realistic): Thực tế, làm việc tay chân, yêu máy móc.<br><b>Nghề:</b> Kỹ sư, thợ cơ khí, nông dân.',
        'I': ' (Investigative): Nghiên cứu, phân tích, thích khoa học.<br><b>Nghề:</b> Nhà khoa học, lập trình viên, bác sĩ.',
        'A': ' (Artistic): Sáng tạo, nghệ thuật, thích tự do.<br><b>Nghề:</b> Nghệ sĩ, nhà văn, nhà thiết kế.',
        'S': ' (Social): Xã hội, giúp đỡ, giao tiếp.<br><b>Nghề:</b> Giáo viên, y tá, tư vấn viên.',
        'E': ' (Enterprising): Tham vọng, lãnh đạo, kinh doanh.<br><b>Nghề:</b> Doanh nhân, quản lý, luật sư.',
        'C': ' (Conventional): Quy củ, tổ chức, làm việc với dữ liệu.<br><b>Nghề:</b> Kế toán, thư ký, quản lý dữ liệu.'
    };

    // Hiển thị thông tin các nhóm cao nhất
    let topGroupsExplanation = '<h3>Các nhóm nổi bật của bạn:</h3><ul>';
    topGroups.forEach(group => {
        topGroupsExplanation += `<li>${group} - ${groupDescriptions[group]}</li>`;
    });
    topGroupsExplanation += '</ul><p>Nhấp chọn các mã dưới đây để xem gợi ý nghề nghiệp cụ thể!</p>';
    document.getElementById('description').innerHTML = topGroupsExplanation;

    let combinations = [];
    if (topGroups.length === 1) {
        // Nếu chỉ có 1 nhóm cao nhất, lấy thêm 2 nhóm tiếp theo
        const hollandCode = sortedGroups.slice(0, 3).map(g => g.group).join('');
        combinations = [hollandCode];
    } else {
        // Nếu có nhiều nhóm bằng điểm cao nhất, tạo tất cả tổ hợp 3 chữ cái
        if (topGroups.length >= 3) {
            // Tạo tổ hợp từ các nhóm có điểm cao nhất
            for (let i = 0; i < topGroups.length; i++) {
                for (let j = 0; j < topGroups.length; j++) {
                    for (let k = 0; k < topGroups.length; k++) {
                        if (i !== j && j !== k && i !== k) {
                            combinations.push(topGroups[i] + topGroups[j] + topGroups[k]);
                        }
                    }
                }
            }
        } else {
            // Nếu số nhóm bằng điểm cao nhất < 3, bổ sung nhóm tiếp theo
            const remainingGroups = sortedGroups.filter(g => g.score < maxScore);
            const thirdGroup = remainingGroups.length > 0 ? remainingGroups[0].group : sortedGroups[topGroups.length].group;
            combinations = topGroups.map(g1 =>
                topGroups.filter(g => g !== g1).map(g2 => g1 + g2 + thirdGroup)
            ).flat();
        }
    }

    // Hiển thị các tổ hợp mã Holland
    displayMultipleOptions(combinations);

    // Hiển thị phần feedback
    document.getElementById('feedbackSection').style.display = 'block';
    document.getElementById('feedback').disabled = false;
    document.getElementById('feedback').style.background = "rgba(255, 255, 255, 0.9)";
    document.getElementById('feedback').value = "";
    document.querySelector('#feedbackSection .select-code-btn').style.display = 'inline-block';
    document.getElementById('successMessage').style.display = 'none';
}
function displayResult(hollandCode) {
    playButtonClick();
    document.getElementById('hollandCode').textContent = hollandCode;
    document.getElementById('code-options').innerHTML = '';

    const descriptions = {
        'R': '🔧 Thực tế (Realistic): Thích làm việc tay chân, yêu máy móc.',
        'I': '🔬 Nghiên cứu (Investigative): Thích phân tích, khoa học.',
        'A': '🎨 Nghệ thuật (Artistic): Sáng tạo, thích tự do.',
        'S': '🤝 Xã hội (Social): Thích giúp đỡ, giao tiếp.',
        'E': '💼 Tham vọng (Enterprising): Lãnh đạo, kinh doanh.',
        'C': '📋 Quy củ (Conventional): Thích tổ chức, dữ liệu.'
    };
    const descText = hollandCode.split('').map(c => descriptions[c]).join(' ');
    document.getElementById('description').innerHTML = descText;

    const suggestions = {
        'RIA': 'Kỹ sư sáng tạo (thiết kế máy móc với tính thẩm mỹ)',
        'RIS': 'Nhà khoa học môi trường (nghiên cứu thực tế để hỗ trợ xã hội)',
        'RIE': 'Doanh nhân công nghệ thực tế (khởi nghiệp trong lĩnh vực kỹ thuật)',
        'RIC': 'Kỹ thuật viên phòng thí nghiệm (làm việc thực tế với dữ liệu)',
        'RAI': 'Kiến trúc sư (kết hợp thực tế và sáng tạo)',
        'RAS': 'Kiến trúc sư cộng đồng (thiết kế phục vụ xã hội)',
        'RAE': 'Nhà thiết kế công nghiệp (nghệ thuật thực tế với tham vọng)',
        'RAC': 'Nhà thiết kế kỹ thuật (nghệ thuật thực tế theo quy trình)',
        'RSI': 'Huấn luyện viên khoa học thể thao (thực tế, nghiên cứu, xã hội)',
        'RSE': 'Huấn luyện viên thể thao chuyên nghiệp (thực tế, xã hội, lãnh đạo)',
        'RSC': 'Nhân viên bảo trì (thực tế, xã hội, quy củ)',
        'REI': 'Kỹ sư nghiên cứu (thực tế, nghiên cứu, tham vọng)',
        'RES': 'Quản lý đội xây dựng (thực tế, tham vọng, xã hội)',
        'REC': 'Quản lý dự án xây dựng (thực tế, tham vọng, quy củ)',
        'RCA': 'Thợ thủ công nghệ thuật (thực tế, quy củ, sáng tạo)',
        'RCI': 'Kỹ thuật viên dữ liệu (thực tế, quy củ, nghiên cứu)',
        'RCS': 'Nhân viên bảo trì cộng đồng (thực tế, quy củ, xã hội)',
        'RCE': 'Quản lý cơ sở vật chất (thực tế, quy củ, tham vọng)',
        'RSA': 'Người làm vườn nghệ thuật (thực tế, xã hội, sáng tạo)',

        'IRA': 'Nhà khoa học sáng tạo (nghiên cứu với góc nhìn nghệ thuật)',
        'IRS': 'Nhà tâm lý học (nghiên cứu để hỗ trợ xã hội)',
        'IRE': 'Doanh nhân công nghệ (nghiên cứu để kinh doanh)',
        'IRC': 'Nhà nghiên cứu dữ liệu (nghiên cứu với quy trình)',
        'IAR': 'Nhà thiết kế khoa học (nghiên cứu, nghệ thuật, thực tế)',
        'IAS': 'Nhà tâm lý học nghệ thuật (nghiên cứu, nghệ thuật, xã hội)',
        'IAE': 'Nhà sáng tạo nội dung khoa học (nghiên cứu, nghệ thuật, tham vọng)',
        'IAC': 'Nhà phân tích sáng tạo (nghiên cứu, nghệ thuật, quy củ)',
        'ISR': 'Nhà sinh vật học thực địa (nghiên cứu, xã hội, thực tế)',
        'ISE': 'Quản lý nghiên cứu xã hội (nghiên cứu, xã hội, tham vọng)',
        'ISC': 'Nhà phân tích xã hội (nghiên cứu, xã hội, quy củ)',
        'IER': 'Nhà phát minh công nghệ (nghiên cứu, tham vọng, thực tế)',
        'IES': 'Chuyên gia tư vấn khoa học (nghiên cứu, tham vọng, xã hội)',
        'IEC': 'Quản lý dự án nghiên cứu (nghiên cứu, tham vọng, quy củ)',
        'ICA': 'Nhà phân tích nghệ thuật (nghiên cứu, quy củ, sáng tạo)',
        'ICR': 'Kỹ thuật viên nghiên cứu (nghiên cứu, quy củ, thực tế)',
        'ICS': 'Nhân viên thống kê xã hội (nghiên cứu, quy củ, xã hội)',
        'ICE': 'Chuyên gia phân tích dữ liệu (nghiên cứu, quy củ, tham vọng)',
        'ISA': 'Giáo viên khoa học sáng tạo (nghiên cứu, xã hội, nghệ thuật)',

        'ARI': 'Nhà văn khoa học viễn tưởng (nghệ thuật, thực tế, nghiên cứu)',
        'ARS': 'Nghệ sĩ cộng đồng (nghệ thuật, thực tế, xã hội)',
        'ARE': 'Đạo diễn phim (nghệ thuật, thực tế, tham vọng)',
        'ARC': 'Nhà thiết kế đồ họa kỹ thuật (nghệ thuật, thực tế, quy củ)',
        'AIR': 'Nhà thiết kế công nghệ sáng tạo (nghệ thuật, nghiên cứu, thực tế)',
        'AIS': 'Giáo viên nghệ thuật (nghệ thuật, nghiên cứu, xã hội)',
        'AIE': 'Nhà sản xuất nội dung (nghệ thuật, nghiên cứu, tham vọng)',
        'AIC': 'Nhà phân tích nghệ thuật (nghệ thuật, nghiên cứu, quy củ)',
        'ASR': 'Nghệ sĩ thực tế xã hội (nghệ thuật, xã hội, thực tế)',
        'ASE': 'Nhà thiết kế quảng cáo (nghệ thuật, xã hội, tham vọng)',
        'ASC': 'Quản lý sự kiện nghệ thuật (nghệ thuật, xã hội, quy củ)',
        'AER': 'Đạo diễn phim hành động (nghệ thuật, tham vọng, thực tế)',
        'AES': 'Nhà tổ chức sự kiện nghệ thuật (nghệ thuật, tham vọng, xã hội)',
        'AEC': 'Quản lý dự án sáng tạo (nghệ thuật, tham vọng, quy củ)',
        'ACR': 'Thợ thủ công nghệ thuật (nghệ thuật, quy củ, thực tế)',
        'ACI': 'Nhà phân tích sáng tạo (nghệ thuật, quy củ, nghiên cứu)',
        'ACS': 'Nhân viên thư viện nghệ thuật (nghệ thuật, quy củ, xã hội)',
        'ACE': 'Nhà kinh doanh nghệ thuật (nghệ thuật, quy củ, tham vọng)',
        'ASI': 'Giáo viên nghệ thuật nghiên cứu (nghệ thuật, xã hội, nghiên cứu)',

        'SRI': 'Huấn luyện viên khoa học thể thao (xã hội, thực tế, nghiên cứu)',
        'SRA': 'Giáo viên thể dục nghệ thuật (xã hội, thực tế, sáng tạo)',
        'SRE': 'Huấn luyện viên thể thao (xã hội, thực tế, tham vọng)',
        'SRC': 'Nhân viên bảo trì cộng đồng (xã hội, thực tế, quy củ)',
        'SIR': 'Nhà tâm lý học thực địa (xã hội, nghiên cứu, thực tế)',
        'SIA': 'Giáo viên nghệ thuật (xã hội, nghiên cứu, sáng tạo)',
        'SIE': 'Chuyên gia tư vấn xã hội (xã hội, nghiên cứu, tham vọng)',
        'SIC': 'Nhà phân tích xã hội (xã hội, nghiên cứu, quy củ)',
        'SAR': 'Giáo viên thể dục sáng tạo (xã hội, nghệ thuật, thực tế)',
        'SAE': 'Quản lý tổ chức từ thiện (xã hội, nghệ thuật, tham vọng)',
        'SAC': 'Nhân viên thư viện cộng đồng (xã hội, nghệ thuật, quy củ)',
        'SER': 'Quản lý đội cứu hộ (xã hội, tham vọng, thực tế)',
        'SEA': 'Quản lý sự kiện xã hội (xã hội, tham vọng, nghệ thuật)',
        'SEC': 'Quản lý tổ chức từ thiện (xã hội, tham vọng, quy củ)',
        'SCR': 'Nhân viên cộng đồng thực tế (xã hội, quy củ, thực tế)',
        'SCI': 'Nhà phân tích xã hội (xã hội, quy củ, nghiên cứu)',
        'SCA': 'Nhân viên thư viện nghệ thuật (xã hội, quy củ, sáng tạo)',
        'SCE': 'Quản lý dịch vụ cộng đồng (xã hội, quy củ, tham vọng)',
        'SAI': 'Giáo viên khoa học sáng tạo (xã hội, nghệ thuật, nghiên cứu)',

        'ERI': 'Doanh nhân công nghệ (tham vọng, thực tế, nghiên cứu)',
        'ERA': 'Nhà kinh doanh nghệ thuật (tham vọng, thực tế, sáng tạo)',
        'ERS': 'Quản lý đội thể thao (tham vọng, thực tế, xã hội)',
        'ERC': 'Quản lý dự án xây dựng (tham vọng, thực tế, quy củ)',
        'EIR': 'Nhà sáng lập startup công nghệ (tham vọng, nghiên cứu, thực tế)',
        'EIA': 'Nhà sản xuất nội dung (tham vọng, nghiên cứu, sáng tạo)',
        'EIS': 'Chuyên gia marketing nghiên cứu (tham vọng, nghiên cứu, xã hội)',
        'EIC': 'Quản lý dữ liệu kinh doanh (tham vọng, nghiên cứu, quy củ)',
        'EAR': 'Đạo diễn phim hành động (tham vọng, nghệ thuật, thực tế)',
        'EAS': 'Nhà tổ chức sự kiện (tham vọng, nghệ thuật, xã hội)',
        'EAC': 'Quản lý dự án sáng tạo (tham vọng, nghệ thuật, quy củ)',
        'ESR': 'Quản lý bán hàng thực tế (tham vọng, xã hội, thực tế)',
        'ESA': 'Quản lý sự kiện xã hội (tham vọng, xã hội, nghệ thuật)',
        'ESC': 'Quản lý sự kiện (tham vọng, xã hội, quy củ)',
        'ECR': 'Quản lý cơ sở vật chất (tham vọng, quy củ, thực tế)',
        'ECI': 'Quản lý tài chính nghiên cứu (tham vọng, quy củ, nghiên cứu)',
        'ECA': 'Nhà kinh doanh nghệ thuật (tham vọng, quy củ, sáng tạo)',
        'ECS': 'Quản lý dịch vụ cộng đồng (tham vọng, quy củ, xã hội)',
        'EAI': 'Nhà sản xuất nội dung sáng tạo (tham vọng, nghệ thuật, nghiên cứu)',

        'CRI': 'Kỹ thuật viên dữ liệu (quy củ, thực tế, nghiên cứu)',
        'CRA': 'Thợ thủ công có tổ chức (quy củ, thực tế, sáng tạo)',
        'CRS': 'Nhân viên bảo trì cộng đồng (quy củ, thực tế, xã hội)',
        'CRE': 'Quản lý cơ sở vật chất (quy củ, thực tế, tham vọng)',
        'CIR': 'Nhà phân tích kỹ thuật (quy củ, nghiên cứu, thực tế)',
        'CIA': 'Nhà phân tích sáng tạo (quy củ, nghiên cứu, nghệ thuật)',
        'CIS': 'Nhân viên thống kê xã hội (quy củ, nghiên cứu, xã hội)',
        'CIE': 'Quản lý dữ liệu kinh doanh (quy củ, nghiên cứu, tham vọng)',
        'CAR': 'Thợ thủ công nghệ thuật (quy củ, nghệ thuật, thực tế)',
        'CAS': 'Nhân viên thư viện cộng đồng (quy củ, nghệ thuật, xã hội)',
        'CAE': 'Nhà kinh doanh nghệ thuật (quy củ, nghệ thuật, tham vọng)',
        'CSR': 'Nhân viên cộng đồng thực tế (quy củ, xã hội, thực tế)',
        'CSA': 'Nhân viên thư viện nghệ thuật (quy củ, xã hội, sáng tạo)',
        'CSE': 'Quản lý dịch vụ cộng đồng (quy củ, xã hội, tham vọng)',
        'CER': 'Quản lý cơ sở vật chất (quy củ, tham vọng, thực tế)',
        'CEA': 'Quản lý dự án sáng tạo (quy củ, tham vọng, nghệ thuật)',
        'CES': 'Quản lý sự kiện xã hội (quy củ, tham vọng, xã hội)',
        'CRA': 'Nhân viên kế toán sáng tạo (quy củ, thực tế, nghệ thuật)',
        'CRI': 'Kỹ thuật viên dữ liệu (quy củ, thực tế, nghiên cứu)',
        'CIS': 'Nhân viên thống kê xã hội (quy củ, nghiên cứu, xã hội)'
    };
    const suggestionText = suggestions[hollandCode] || 'Không tìm thấy gợi ý nghề nghiệp phù hợp.';
    document.getElementById('suggestions').innerHTML = `<h3>Gợi ý nghề nghiệp:</h3><p>${suggestionText}</p>`;
    document.getElementById('backToOptionsBtn').style.display = 'inline-block';

    // Ẩn phần feedback khi xem chi tiết mã
    document.getElementById('feedbackSection').style.display = 'none';
}
function displayMultipleOptions(combinations) {
    playButtonClick();
    document.getElementById('hollandCode').textContent = '';
    const codeOptions = document.getElementById('code-options');
    codeOptions.innerHTML = '<h3>Các mã Holland phù hợp với bạn:</h3>';
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('backToOptionsBtn').style.display = 'none';

    combinations.forEach(code => {
        const btn = document.createElement('button');
        btn.classList.add('select-code-btn');
        btn.textContent = code;
        btn.onclick = () => {
            playButtonClick();
            displayResult(code);
        };
        codeOptions.appendChild(btn);
    });

    // Hiển thị phần feedback ở trang tổng quan
    document.getElementById('feedbackSection').style.display = 'block';
}

function backToStart() {
    playButtonClick();
    document.getElementById('result').style.display = 'none';
    document.getElementById('game-info').style.display = 'block';
    document.getElementById('infoBtn').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    currentRound = 0;
    previousAnswers = [];
}

function backToHome() {
    playButtonClick();
    const feedback = document.getElementById('feedback').value.trim();
    const feedbackDisabled = document.getElementById('feedback').disabled; // Kiểm tra xem ô nhập đã bị vô hiệu hóa chưa

    // Nếu chưa gửi ý kiến (ô nhập chưa bị vô hiệu hóa) hoặc chưa nhập nội dung
    if (!feedbackDisabled || !feedback) {
        alert("Vui lòng nhập và gửi ý kiến của bạn trước khi quay về màn hình chính!");
        return;
    }

    // Ẩn phần result và feedbackSection, quay về màn hình chính
    document.getElementById('result').style.display = 'none';
    document.getElementById('feedbackSection').style.display = 'none';
    document.getElementById('game-info').style.display = 'block';
    document.getElementById('infoBtn').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';

    // Reset tất cả các bảng câu hỏi về trạng thái ban đầu
    document.querySelectorAll('.question-table').forEach(table => {
        table.classList.remove('active');
    });

    // Reset dữ liệu
    scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    currentRound = 0;
    previousAnswers = [];

    // Reset trạng thái radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
}
function toggleInstructions() {
    playButtonClick();
    const instructions = document.getElementById('instructions');
    instructions.style.display = instructions.style.display === 'block' ? 'none' : 'block';
}

// Tạo nhân vật và icon di chuyển
const characters = ['🚀', '🌟', '🐱', '🎸', '⚽', '🍕', '🦄', '🎉', '🌈', '🤖', '🎨', '🔧', '🧪', '📚', '🐳', '🌍', '🎤', '✨'];
function createCharacter() {
    const char = document.createElement('div');
    char.classList.add('character');
    char.textContent = characters[Math.floor(Math.random() * characters.length)];
    char.style.left = Math.random() * 90 + 'vw';
    char.style.top = Math.random() * 90 + 'vh';
    char.style.animationDuration = (Math.random() * 5 + 5) + 's';
    document.body.appendChild(char);
    setTimeout(() => char.remove(), 10000);
}

setInterval(createCharacter, 500);
function submitFeedback() {
    playButtonClick();
    const feedback = document.getElementById('feedback').value.trim();
    if (!feedback) {
        alert("Nhập ý kiến của bạn đi nào!");
        return;
    }
    document.getElementById('feedback').disabled = true; // Vô hiệu hóa ô nhập sau khi gửi
    document.getElementById('feedback').style.background = "rgba(255, 255, 255, 0.5)"; // Làm mờ ô nhập
    document.querySelector('#feedbackSection .select-code-btn').style.display = 'none'; // Ẩn nút "Gửi ý kiến"
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = "Chúc bạn sau này sẽ luôn tỏa sáng trên hành trình bản thân đã chọn!🍀🍀💪💪";
    successMessage.style.display = 'block';
}