// translations for My Page (menu, shipment form, lists, profile); run: node scripts/i18n-mypage.mjs
import fs from 'node:fs';
const PHRASES = [
	['Assigned shipments', 'Назначенные грузы', '배정된 배송'],
	['Admin panel', 'Панель администратора', '관리자 패널'],
	['Account', 'Аккаунт', '계정'],
	['Note (optional)', 'Заметка (необязательно)', '메모 (선택)'],
	['Add', 'Добавить', '추가'],
	['No Shipment found!', 'Грузы не найдены', '배송이 없습니다'],
	['Change the shipment to {{status}}?', 'Изменить статус груза на «{{status}}»?', '배송 상태를 "{{status}}"(으)로 변경할까요?'],
	['Upload profile image', 'Загрузить фото профиля', '프로필 사진 업로드'],
	['Update profile', 'Обновить профиль', '프로필 수정'],
	['Edit shipment', 'Изменить груз', '배송 수정'],
	['This shipment is already on its way and can no longer be edited.', 'Груз уже в пути, его нельзя изменить.', '이미 배송이 시작되어 더 이상 수정할 수 없습니다.'],
	['Tell us what you are sending', 'Расскажите, что вы отправляете', '무엇을 보내는지 알려 주세요'],
	['Title', 'Название', '제목'],
	['Price in won', 'Цена в вонах', '원화 가격'],
	['Select Type', 'Тип груза', '유형 선택'],
	['Select', 'Выберите', '선택'],
	['Pickup Address', 'Адрес забора', '픽업 주소'],
	['Address', 'Адрес', '주소'],
	['Carrier (optional)', 'Перевозчик (необязательно)', '운송사 (선택)'],
	['Any carrier can claim it', 'Любой перевозчик может взять', '아무 운송사나 맡을 수 있음'],
	['Shipment Description', 'Описание груза', '배송 설명'],
	['Description (optional)', 'Описание (необязательно)', '설명 (선택)'],
	['Upload photos of your cargo', 'Загрузите фото груза', '화물 사진 업로드'],
	['Drag and drop images here', 'Перетащите изображения сюда', '이미지를 여기로 끌어다 놓으세요'],
	['Photos must be JPEG or PNG format and least 2048x768', 'Фото в формате JPEG или PNG, не меньше 2048×768', 'JPEG 또는 PNG, 최소 2048x768 크기의 사진'],
	['Browse Files', 'Выбрать файлы', '파일 선택'],
	['Save', 'Сохранить', '저장'],
	['Title must be at least 3 characters.', 'Название должно быть не короче 3 символов.', '제목은 3자 이상이어야 합니다.'],
	['Title can be at most 100 characters.', 'Название может быть не длиннее 100 символов.', '제목은 최대 100자까지 가능합니다.'],
	['Pickup address must be at least 3 characters.', 'Адрес забора должен быть не короче 3 символов.', '픽업 주소는 3자 이상이어야 합니다.'],
	['Pickup address can be at most 100 characters.', 'Адрес забора может быть не длиннее 100 символов.', '픽업 주소는 최대 100자까지 가능합니다.'],
	['Weight must be greater than 0 kg.', 'Вес должен быть больше 0 кг.', '무게는 0kg보다 커야 합니다.'],
	['Description must be 5–500 characters, or leave it empty.', 'Описание: от 5 до 500 символов или оставьте пустым.', '설명은 5–500자이거나 비워 두세요.'],
];
for (const [lang, col] of [['en', 0], ['ru', 1], ['kr', 2]]) {
	const file = `public/locales/${lang}/common.json`;
	const dict = JSON.parse(fs.readFileSync(file, 'utf8'));
	for (const row of PHRASES) if (lang !== 'en' || !(row[0] in dict)) dict[row[0]] = row[col];
	fs.writeFileSync(file, JSON.stringify(dict, null, 2) + '\n');
	console.log(lang, Object.keys(dict).length);
}
// chat widget
const WIDGET = [
	['Assistant and community chat', 'Ассистент и чат сообщества', '어시스턴트와 커뮤니티 채팅'],
	['Message', 'Сообщение', '메시지'],
	['Write a message', 'Напишите сообщение', '메시지를 입력하세요'],
	['Log in to join the community chat', 'Войдите, чтобы участвовать в чате сообщества', '커뮤니티 채팅에 참여하려면 로그인하세요'],
	['Guest', 'Гость', '게스트'],
	['Close assistant and chat', 'Закрыть ассистента и чат', '어시스턴트와 채팅 닫기'],
	['Open assistant and chat', 'Открыть ассистента и чат', '어시스턴트와 채팅 열기'],
];
for (const [lang, col] of [['en', 0], ['ru', 1], ['kr', 2]]) {
	const file = `public/locales/${lang}/common.json`;
	const dict = JSON.parse(fs.readFileSync(file, 'utf8'));
	for (const row of WIDGET) if (lang !== 'en' || !(row[0] in dict)) dict[row[0]] = row[col];
	fs.writeFileSync(file, JSON.stringify(dict, null, 2) + '\n');
}
// assistant service replies (backend AssistantService Reply)
const ASSISTANT = [
	['Daily assistant limit reached. Try again tomorrow.', 'Дневной лимит вопросов исчерпан. Попробуйте завтра.', '오늘의 질문 한도에 도달했습니다. 내일 다시 시도하세요.'],
	["You've reached the guest limit for today. Log in to ask more questions.", 'Гостевой лимит на сегодня исчерпан. Войдите, чтобы задать больше вопросов.', '오늘의 게스트 한도에 도달했습니다. 더 물어보려면 로그인하세요.'],
	['The assistant is busy today. Log in to keep asking.', 'Сегодня ассистент перегружен. Войдите, чтобы продолжить.', '오늘은 어시스턴트가 바쁩니다. 계속하려면 로그인하세요.'],
	['The assistant is not configured yet.', 'Ассистент ещё не настроен.', '어시스턴트가 아직 설정되지 않았습니다.'],
	['The assistant is busy right now, please try again in a minute.', 'Ассистент сейчас занят, попробуйте через минуту.', '어시스턴트가 지금 바쁩니다. 잠시 후 다시 시도하세요.'],
	['Sorry, something went wrong.', 'Извините, что-то пошло не так.', '죄송합니다. 문제가 발생했습니다.'],
	["Sorry, I couldn't answer that. Please rephrase.", 'Не получилось ответить. Попробуйте переформулировать.', '답변하지 못했습니다. 다르게 질문해 주세요.'],
];
for (const [lang, col] of [['en', 0], ['ru', 1], ['kr', 2]]) {
	const file = `public/locales/${lang}/common.json`;
	const dict = JSON.parse(fs.readFileSync(file, 'utf8'));
	for (const row of ASSISTANT) if (lang !== 'en' || !(row[0] in dict)) dict[row[0]] = row[col];
	fs.writeFileSync(file, JSON.stringify(dict, null, 2) + '\n');
}
