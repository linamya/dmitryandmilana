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


    // === Обработка формы анкеты с отправкой в Telegram ===
    const form = document.getElementById('wedding-form');
    
    // Токен и ID получателей
    const TELEGRAM_TOKEN = '8839239178:AAFBEQGbsVE5iPnx8scalx3kiVc0tI6hfbc';
    const CHAT_IDS = ['6361410725', '1801013206'];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const name = formData.get('name');
        const attendance = formData.get('attendance') === 'yes' ? 'Да, с удовольствием! ✅' : 'К сожалению, не смогу. ❌';

        // Формируем красивый текст для Telegram
        const message = `🔔 *Новый ответ на приглашение!*\n\n👤 *Имя:* ${name}\n❓ *Присутствие:* ${attendance}`;

        // Функция отправки запроса к API Telegram
        const sendToTelegram = (chatId) => {
            const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
            
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        };

        // Блокируем кнопку, чтобы избежать повторных кликов при отправке
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) submitBtn.disabled = true;

        // Отправляем сообщения на оба ID параллельно
        Promise.all(CHAT_IDS.map(id => sendToTelegram(id)))
            .then(responses => {
                // Если хотя бы одно сообщение ушло успешно
                if (responses.some(res => res.ok)) {
                    alert(`Спасибо, ${name}! Ответ успешно отправлен.`);
                    form.reset();
                } else {
                    alert('Произошла ошибка при отправке формы. Пожалуйста, убедитесь, что вы запустили бота в Telegram.');
                }
            })
            .catch(err => {
                console.error('Ошибка:', err);
                alert('Ошибка соединения. Проверьте интернет-подключение.');
            })
            .finally(() => {
                // Возвращаем кнопку в активное состояние
                if (submitBtn) submitBtn.disabled = false;
            });
    });
});