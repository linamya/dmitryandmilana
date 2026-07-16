document.addEventListener('DOMContentLoaded', () => {
    
    // === Фикс автозапуска видео-фона на смартфонах ===
    const bgVideo = document.getElementById('bg-video');
    
    function forcePlayVideo() {
        if (bgVideo && bgVideo.paused) {
            bgVideo.play().catch(err => {
                console.log("Автозапуск видео заблокирован системой или включен энергосберегающий режим.");
            });
        }
    }

    // Будим видео при первом взаимодействии с сайтом
    document.addEventListener('click', forcePlayVideo, { once: true });
    document.addEventListener('touchstart', forcePlayVideo, { once: true });

    // === Музыкальный плеер ===
    const audio = document.getElementById('audio-track');
    const playBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');

    playBtn.addEventListener('click', () => {
        // Принудительно будим видео-фон при клике на музыку
        forcePlayVideo();

        if (audio.paused) {
            audio.play().catch(err => console.log("Плеер ожидает взаимодействия."));
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;
            
            let mins = Math.floor(audio.currentTime / 60);
            let secs = Math.floor(audio.currentTime % 60);
            if (secs < 10) secs = '0' + secs;
            currentTimeEl.innerText = mins + ':' + secs;
        }
    });

    progressBar.addEventListener('input', () => {
        const time = (progressBar.value / 100) * audio.duration;
        audio.currentTime = time;
    });

    audio.addEventListener('ended', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        progressBar.value = 0;
        currentTimeEl.innerText = '0:00';
    });

    // === Таймер обратного отсчета (до 28.08.2026 17:30) ===
    const targetDate = new Date(2026, 7, 28, 17, 30, 0).getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;
        const timerContainer = document.getElementById("dual-font-timer");

        if (diff <= 0) {
            timerContainer.innerHTML = "<div style='font-size: 24px; font-weight: bold; font-style: italic;'>СОБЫТИЕ НАЧАЛОСЬ</div>";
            clearInterval(timerInterval);
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById("d-val").innerHTML = d < 10 ? "0" + d : d;
        document.getElementById("h-val").innerHTML = h < 10 ? "0" + h : h;
        document.getElementById("m-val").innerHTML = m < 10 ? "0" + m : m;
        document.getElementById("s-val").innerHTML = s < 10 ? "0" + s : s;
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    // === Обработка формы анкеты с отправкой через Google-мост ===
    const form = document.getElementById('wedding-form');
    
    // Ссылка на ваше веб-приложение в Google Script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzqkVLcnUptjkTYISmJlacySRjUkm715o3QUr4aQ4uPIBkr238fypfCjp0D1CHMam5L/exec';
    
    // ID получателей в Telegram
    const CHAT_IDS = ['6361410725', '1801013206'];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new


ta(form);
        const name = formData.get('name');
        const attendance = formData.get('attendance') === 'yes' ? 'Да, с удовольствием! ✅' : 'К сожалению, не смогу. ❌';

        const message = `🔔 *Новый ответ на приглашение!*\n\n👤 *Имя:* ${name}\n❓ *Присутствие:* ${attendance}`;

        const sendToTelegram = (chatId) => {
            return fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Позволяет отправлять запросы без конфликтов безопасности
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message
                })
            });
        };

        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) submitBtn.disabled = true;

        Promise.all(CHAT_IDS.map(id => sendToTelegram(id)))
            .then(() => {
                alert(`Спасибо, ${name}! Ответ успешно отправлен.`);
                form.reset();
            })
            .catch(err => {
                console.error('Ошибка:', err);
                alert('Ошибка соединения. Проверьте интернет-подключение.');
            })
            .finally(() => {
                if (submitBtn) submitBtn.disabled = false;
            });
    });
}); FormDa
