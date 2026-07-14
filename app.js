const JSONBIN_API_KEY = '$2a$10$fuyJjSPztFHlaKC4O/yQJ.wi1F1JwubQoqjmtOOPg1HiUHTClV9dS';
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_BIN_ID = '6a558429da38895dfe598eab'; // 新しい BIN ID を入力してください
const STORAGE_KEY = 'events';

let events = [];

async function loadEvents() {
    showLoading(true);
    try {
        const response = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        if (response.ok) {
            const data = await response.json();
            events = data.record.events || [];
        } else {
            // エラー時はローカルストレージから読み込み
            const localData = localStorage.getItem(STORAGE_KEY);
            events = localData ? JSON.parse(localData) : [];
        }
    } catch (error) {
        console.error('Error loading events:', error);
        // エラー時はローカルストレージから読み込み
        const localData = localStorage.getItem(STORAGE_KEY);
        events = localData ? JSON.parse(localData) : [];
    } finally {
        showLoading(false);
        renderEventList();
    }
}

function renderEventList() {
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = '';
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-card';
        eventDiv.innerHTML = `
            <h2>${event.title}</h2>
            <p><strong>説明:</strong> ${event.description}</p>
            <p><strong>日時候補:</strong> ${event.dateCandidates.join(', ')}</p>
            <button onclick="showEventDetail('${event.id}')">詳細</button>
        `;
        eventList.appendChild(eventDiv);
    });
}

async function saveEvents() {
    showLoading(true);
    try {
        const response = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ events })
        });
        if (!response.ok) {
            throw new Error('Failed to save events');
        }
    } catch (error) {
        console.error('Error saving events:', error);
        // エラー時はローカルストレージに保存
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        alert('イベントの保存に失敗しました。再度お試しください。');
    } finally {
        showLoading(false);
    }
}

async function createEvent() {
    const title = document.getElementById('event-title-input').value.trim();
    const description = document.getElementById('event-description-input').value.trim();
    const date = new Date(document.getElementById('event-date-input').value).toISOString();

    if (!title || !description || !date) {
        alert('タイトル、説明、日時を入力してください');
        return;
    }

    const eventId = Date.now().toString(); // シンプルなID生成
    events.push({
        id: eventId,
        title,
        description,
        dateCandidates: [date],
        participants: []
    });

    try {
        await saveEvents();
        alert('イベントが正常に保存されました。');
    } catch (error) {
        console.error('Error creating event:', error);
        alert('イベントの作成に失敗しました。再度お試しください。');
    } finally {
        closeModal(); // フォームを閉じる
        loadEvents();  // イベントリストを再読み込み
    }
}

function showEventDetail(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) {
        alert('イベントが見つかりません');
        return;
    }

    document.getElementById('event-id').textContent = event.id;
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-description').textContent = event.description;
    document.getElementById('event-dates').textContent = event.dateCandidates.join(', ');

    const modal = document.getElementById('modal');
    modal.style.display = 'block';
}

function showParticipantRegistrationForm() {
    const participantForm = document.getElementById('participant-form');
    participantForm.style.display = 'block';
}

async function addParticipant() {
    const name = document.getElementById('participant-name').value.trim();
    const email = document.getElementById('participant-email').value.trim();

    if (!name || !email) {
        alert('名前とメールアドレスを入力してください');
        return;
    }

    const eventId = document.getElementById('event-id').textContent;
    const event = events.find(e => e.id === eventId);
    if (event) {
        event.participants.push({ name, email });
        try {
            await saveEvents();
            alert('参加者が正常に追加されました。');
        } catch (error) {
            console.error('Error adding participant:', error);
            alert('参加者の追加に失敗しました。再度お試しください。');
        } finally {
            closeModal(); // フォームを閉じる
            showEventDetail(eventId);  // イベント詳細を再表示
        }
    } else {
        alert('イベントが見つかりません');
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('participant-form').style.display = 'none';
    document.getElementById('create-event-form').style.display = 'none';
}

function showLoading(isLoading) {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (isLoading) {
        if (!loadingOverlay) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<p>Loading...</p>';
            document.body.appendChild(overlay);
        }
    } else {
        if (loadingOverlay) {
            document.body.removeChild(loadingOverlay);
        }
    }
}

function showCreateEventForm() {
    const createEventForm = document.getElementById('create-event-form');
    createEventForm.style.display = 'block';
}
