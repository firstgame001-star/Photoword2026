(() => {
  'use strict';
  const pw = window.PW, $ = id => document.getElementById(id);
  const LEVELS = {
    1:{answer:'СОБАКА',pool:'СОБАКАНТЛДЕР',hint:'Домашнее животное, которое часто называют другом человека.',photos:[['🐕','Собака'],['🥣','Миска'],['🦴','Кость'],['🐾','Следы лап']]},
    2:{answer:'КОШКА',pool:'КОШКАТРМЕДЛС',hint:'Домашний питомец, который мурлычет.',photos:[['🐈','Кошка'],['🧶','Клубок ниток'],['🥛','Молоко'],['😺','Морда кошки']]},
    3:{answer:'МОРЕ',pool:'МОРЕЛКАСДТНБ',hint:'Большой солёный водоём.',photos:[['🌊','Волна'],['🐚','Ракушка'],['⛵','Парусник'],['🏖️','Пляж']]},
    4:{answer:'ДОЖДЬ',pool:'ДОЖДЬТКРСАЛМ',hint:'Он падает с неба и заставляет брать зонт.',photos:[['☔','Зонт'],['🌧️','Дождевое облако'],['💧','Капля'],['🌈','Радуга']]},
    5:{answer:'ВРЕМЯ',pool:'ВРЕМЯЧСДЛКОН',hint:'Его измеряют, но вернуть назад невозможно.',photos:[['⌚','Часы'],['⏳','Песочные часы'],['📅','Календарь'],['👴','Возраст']]},
    6:{answer:'ТЕПЛО',pool:'ТЕПЛОГРСМАКН',hint:'Его дают огонь и солнце, а зимой его особенно не хватает.',photos:[['🔥','Огонь'],['☀️','Солнце'],['🧣','Шарф'],['🌡️','Термометр']]},
    7:{answer:'ПАМЯТЬ',pool:'ПАМЯТЬКРСОНД',hint:'Она хранит то, что уже произошло.',photos:[['🧠','Мозг'],['📸','Фотография'],['💾','Накопитель'],['🕰️','Старые часы']]},
    8:{answer:'СВЕТ',pool:'СВЕТЛАМОРКНД',hint:'Без него трудно увидеть окружающий мир.',photos:[['💡','Лампочка'],['🔦','Фонарик'],['🌅','Рассвет'],['🕯️','Свеча']]},
    9:{answer:'ПУТЬ',pool:'ПУТЬДОРГАКСМ',hint:'Он может быть дорогой, маршрутом или направлением к цели.',photos:[['🛣️','Дорога'],['🧭','Компас'],['🥾','Ботинок путешественника'],['📍','Точка назначения']]},
    10:{answer:'ТАЙНА',pool:'ТАЙНАСЕКРМОЛ',hint:'То, что скрывают и пытаются разгадать.',photos:[['🔐','Замок'],['🤫','Тишина'],['🕵️','Детектив'],['❓','Вопрос']]},
    11:{answer:'ТЕНЬ',pool:'ТЕНЬСВЛКРАМД',hint:'Она появляется рядом с предметом, когда свет не может пройти сквозь него.',photos:[['👤','Силуэт'],['☀️','Солнце'],['🌳','Дерево'],['💡','Лампа']]},
    12:{answer:'СЛЕД',pool:'СЛЕДНОГАТКРМ',hint:'Он остаётся после того, кто или что здесь прошло.',photos:[['👣','Следы ног'],['🐾','Следы лап'],['🚗','След шины'],['🕵️','Улика']]},
    13:{answer:'ВОЛНА',pool:'ВОЛНАРДИОКС',hint:'Она бывает на воде, в звуке и в радиосигнале.',photos:[['🌊','Морская волна'],['📻','Радио'],['🔊','Звук'],['〰️','Волнистая линия']]},
    14:{answer:'КЛЮЧ',pool:'КЛЮЧЗАМНОТАР',hint:'Им открывают замок, но этим словом называют и способ решения.',photos:[['🔑','Ключ'],['🔒','Замок'],['🎼','Музыкальный ключ'],['⌨️','Клавиша']]},
    15:{answer:'КОРЕНЬ',pool:'КОРЕНЬЗУБМАТ',hint:'Он есть у дерева и зуба, а ещё встречается в математике.',photos:[['🌳','Корни дерева'],['🦷','Зуб'],['√','Корень числа'],['🥕','Корнеплод']]},
    16:{answer:'СЕТЬ',pool:'СЕТЬИНТРЫБАК',hint:'Она может ловить рыбу, соединять компьютеры или напоминать паутину.',photos:[['🕸️','Паутина'],['🎣','Рыболовная сеть'],['🌐','Интернет'],['📡','Связь']]},
    17:{answer:'ТОК',pool:'ТОКРЕКАЛМНИЯ',hint:'Он бывает электрическим, а ещё так называют движение воды.',photos:[['⚡','Электричество'],['🔌','Розетка'],['🏞️','Течение реки'],['💡','Лампочка']]},
    18:{answer:'КАДР',pool:'КАДРФОТОЛМЕН',hint:'Один момент изображения в фотографии или кино.',photos:[['🎞️','Киноплёнка'],['📸','Фотография'],['🖼️','Рамка'],['🎬','Кино']]},
    19:{answer:'СВЯЗЬ',pool:'СВЯЗЬТЕЛФОНК',hint:'Она объединяет людей, устройства и отдельные части.',photos:[['📱','Телефон'],['🔗','Цепь'],['📶','Сигнал'],['🤝','Люди']]},
    20:{answer:'ИСТОЧНИК',pool:'ИСТОЧНИКВОДАС',hint:'Место или объект, откуда что-либо берёт начало.',photos:[['⛲','Родник'],['💡','Источник света'],['📚','Источник информации'],['🔋','Источник энергии']]},
    21:{answer:"МОСТ",pool:"МОСТАБВГДЕ",hint:"Соединяет два берега или две части пути.",photos:[["🏞️","Берега"],["🌊","Вода"],["🚗","Дорога"],["🤝","Соединение"]]},
    22:{answer:"МАСКА",pool:"МАСКАБВГДЕЖ",hint:"Её надевают для защиты, красоты или роли.",photos:[["🎉","Праздник"],["👁️","Лицо и взгляд"],["🥷","Скрытое лицо"],["🎭","Театральный образ"]]},
    23:{answer:"ИСКРА",pool:"ИСКРАБВГДЕЖ",hint:"Маленькая вспышка огня или электричества.",photos:[["🔋","Энергия"],["⚡","Электричество"],["✨","Вспышка"],["🔥","Огонь"]]},
    24:{answer:"ЗЕРКАЛО",pool:"ЗЕРКАЛОБВГДЖИ",hint:"В нём видно отражение.",photos:[["💄","Макияж"],["👁️","Взгляд"],["🚿","Ванная"],["🪞","Отражение"]]},
    25:{answer:"ПУСТЫНЯ",pool:"ПУСТЫНЯАБВГДЕ",hint:"Жаркое место с песком и малым количеством воды.",photos:[["🐪","Верблюд"],["🌵","Кактус"],["☀️","Жара"],["🏜️","Пески"]]},
    26:{answer:"ШИФР",pool:"ШИФРАБВГДЕ",hint:"Секретная запись или пароль.",photos:[["🔢","Набор знаков"],["🕵️","Расследование"],["🔐","Секрет"],["✉️","Скрытое сообщение"]]},
    27:{answer:"ПЛАМЯ",pool:"ПЛАМЯБВГДЕЖ",hint:"Яркая часть огня.",photos:[["🕯️","Свеча"],["🪵","Дрова"],["🚒","Пожарные"],["🔥","Огонь"]]},
    28:{answer:"КОМЕТА",pool:"КОМЕТАБВГДЖЗ",hint:"Небесное тело с ярким хвостом.",photos:[["🔭","Наблюдение"],["🌌","Космос"],["✨","Яркий след"],["☄️","Небесное тело"]]},
    29:{answer:"ЛАБИРИНТ",pool:"ЛАБИРИНТВГДЕЖЗ",hint:"Сложная система ходов, в которой ищут выход.",photos:[["🚪","Выход"],["↩️","Повороты"],["🧭","Поиск пути"],["🌀","Запутанный путь"]]},
    30:{answer:"СИГНАЛ",pool:"СИГНАЛБВДЕЖЗ",hint:"Сообщение или знак, который что-то передаёт.",photos:[["🚦","Световой знак"],["🔔","Оповещение"],["📶","Передача"],["🚨","Предупреждение"]]},
    31:{answer:"ПЕЧАТЬ",pool:"ПЕЧАТЬБВГДЖЗ",hint:"Её ставят на документ или бумагу.",photos:[["📜","Документ"],["🖋️","Подпись"],["📨","Бумаги"],["🛂","Официальная отметка"]]},
    32:{answer:"УЗЕЛ",pool:"УЗЕЛАБВГДЖ",hint:"Его завязывают на верёвке, нитке или шнуре.",photos:[["👟","Шнурки"],["🧵","Нить"],["⚓","Канат"],["🪢","Завязка"]]},
    33:{answer:"СПУТНИК",pool:"СПУТНИКАБВГДЕ",hint:"Он вращается вокруг планеты или помогает связи.",photos:[["🌍","Планета"],["📡","Связь"],["🌌","Космос"],["🛰️","Объект на орбите"]]},
    34:{answer:"ОБЛАКО",pool:"ОБЛАКОВГДЕЖЗ",hint:"Оно бывает в небе, а ещё в цифровом мире.",photos:[["🌧️","Небо"],["💾","Хранение данных"],["🌐","Интернет"],["☁️","Облако"]]},
    35:{answer:"ГРАНЬ",pool:"ГРАНЬБВДЕЖЗ",hint:"Линия края или острая сторона предмета.",photos:[["💎","Поверхности"],["📐","Геометрия"],["🧊","Рёбра"],["🔪","Острый край"]]},
    36:{answer:"КОНТУР",pool:"КОНТУРАБВГДЕ",hint:"Внешняя линия формы предмета.",photos:[["👤","Силуэт"],["✏️","Рисунок"],["🗺️","Очертания"],["◻️","Форма"]]},
    37:{answer:"ОСКОЛОК",pool:"ОСКОЛОКАБВГДЕ",hint:"Маленькая часть разбитого предмета.",photos:[["💔","Разбитое"],["🧹","Осколки после уборки"],["🪞","Разбитое стекло"],["🧩","Часть целого"]]},
    38:{answer:"ИМПУЛЬС",pool:"ИМПУЛЬСАБВГДЕ",hint:"Короткий толчок, волна или сигнал.",photos:[["🫀","Ритм"],["⚡","Короткий толчок"],["📈","Резкий скачок"],["🚀","Старт"]]},
    39:{answer:"АРХИВ",pool:"АРХИВБГДЕЖЗ",hint:"Место, где хранят старые документы и данные.",photos:[["📦","Хранение"],["🕰️","Прошлое"],["📚","Документы"],["🗄️","Хранилище"]]},
    40:{answer:"ГОРИЗОНТ",pool:"ГОРИЗОНТАБВДЕЖ",hint:"Линия, где небо будто встречается с землёй или морем.",photos:[["👀","Дальний взгляд"],["🌊","Море"],["🌅","Линия вдали"],["🏞️","Пейзаж"]]},
    41:{answer:"ВЕКТОР",pool:"ВЕКТОРАБГДЖЗ",hint:"Направленная величина, которую часто изображают стрелкой.",photos:[["📐","Геометрия"],["🧭","Направление"],["➡️","Стрелка"],["🎯","Цель"]]},
    42:{answer:"СПЕКТР",pool:"СПЕКТРАБВГДЖ",hint:"Набор цветов, частот или возможных вариантов.",photos:[["💡","Свет"],["🔺","Преломление"],["🌈","Цвета"],["📡","Частоты"]]},
    43:{answer:"ОРБИТА",pool:"ОРБИТАВГДЕЖЗ",hint:"Путь, по которому движется планета или спутник.",photos:[["🌍","Планета"],["🛰️","Спутник"],["🔄","Движение вокруг"],["🪐","Космос"]]},
    44:{answer:"РЕЗОНАНС",pool:"РЕЗОНАНСБВГДЖИ",hint:"Усиление колебаний из-за совпадения частот.",photos:[["🎸","Колебание струны"],["🔊","Звук"],["〰️","Волна"],["🎵","Музыка"]]},
    45:{answer:"ПАРАДОКС",pool:"ПАРАДОКСБВГЕЖЗ",hint:"То, что выглядит противоречиво, но может иметь смысл.",photos:[["🧠","Логика"],["🔄","Противоречие"],["❓","Вопрос"],["♾️","Необычная идея"]]},
    46:{answer:"МАТРИЦА",pool:"МАТРИЦАБВГДЕЖ",hint:"Таблица, структура или система элементов.",photos:[["🧮","Вычисления"],["🟩","Ячейки"],["🔢","Числа"],["💻","Система"]]},
    47:{answer:"ТРАЕКТОРИЯ",pool:"ТРАЕКТОРИЯБВГДЖЗ",hint:"Линия движения тела или объекта.",photos:[["🏀","Полёт мяча"],["🏹","Полёт стрелы"],["🚀","Движение"],["📈","Линия движения"]]},
    48:{answer:"КОДЕКС",pool:"КОДЕКСАБВГЖЗ",hint:"Свод правил или законов.",photos:[["⚖️","Право"],["📜","Правила"],["🏛️","Законы"],["📚","Свод текстов"]]},
    49:{answer:"КОМПАС",pool:"КОМПАСБВГДЕЖ",hint:"Прибор, который помогает определить направление.",photos:[["🗺️","Маршрут"],["🥾","Поход"],["🧲","Магнит"],["🧭","Направление"]]},
    50:{answer:"БАЛАНС",pool:"БАЛАНСТРЕКО",hint:"Равновесие между разными сторонами, силами или решениями.",photos:[["🧘","Равновесие"],["⚖️","Две стороны"],["🤸","Удержание положения"],["📊","Соотношение"]]},
    51:{answer:"РИТМ",pool:"РИТМЛАСОКН",hint:"Повторяющийся рисунок звуков, движений или ударов.",photos:[["🎧","Музыка"],["🫀","Сердцебиение"],["🥁","Удары"],["⏱️","Темп"]]},
    52:{answer:"ФОКУС",pool:"ФОКУСДРАЛМН",hint:"Точка внимания или чёткости, на которой всё сосредоточено.",photos:[["📷","Камера"],["👀","Внимание"],["🎯","Цель"],["🔍","Чёткость"]]},
    53:{answer:"ЭХО",pool:"ЭХОТАРМСЛК",hint:"Звук, который возвращается после отражения.",photos:[["🏔️","Горы"],["🗣️","Голос"],["🔊","Звук"],["↩️","Возврат"]]},
    54:{answer:"ПУЛЬС",pool:"ПУЛЬСАКРМЕН",hint:"Ритмичные толчки, по которым можно судить о работе сердца.",photos:[["🏃","Нагрузка"],["🫀","Сердце"],["⌚","Измерение"],["📈","Ритм"]]},
    55:{answer:"ТОН",pool:"ТОНАЛМЕРСК",hint:"Он бывает у голоса, музыки и даже цвета.",photos:[["🎤","Голос"],["🎼","Музыка"],["🎨","Цвет"],["🔊","Звучание"]]},
    56:{answer:"ПОРТАЛ",pool:"ПОРТАЛМЕКСИН",hint:"Проход или вход, ведущий в другое пространство или раздел.",photos:[["🚪","Вход"],["🌌","Другой мир"],["🎮","Игра"],["🌀","Переход"]]},
    57:{answer:"КАНАЛ",pool:"КАНАЛТРЕСОМ",hint:"По нему может идти вода, сигнал, информация или транспорт.",photos:[["📺","Передача"],["🌊","Вода"],["📡","Сигнал"],["🚢","Судоходство"]]},
    58:{answer:"ФИЛЬТР",pool:"ФИЛЬТРСАКОН",hint:"Он пропускает нужное и задерживает лишнее.",photos:[["☕","Кофе"],["📷","Изображение"],["😷","Защита"],["💧","Очистка"]]},
    59:{answer:"СЦЕНА",pool:"СЦЕНАРТИМОК",hint:"Место, где происходит выступление, действие или важный эпизод.",photos:[["🎤","Выступление"],["💡","Свет"],["👥","Зрители"],["🎭","Театр"]]},
    60:{answer:"СИМВОЛ",pool:"СИМВОЛТАРЕКН",hint:"Знак или образ, который представляет идею, значение или объект.",photos:[["❤️","Значение"],["🚦","Знак"],["🏳️","Обозначение"],["🔣","Знаки"]]},
    61:{answer:"ПОТОК",pool:"ПОТОКАБВГДЕЖ",hint:"Непрерывное движение чего-либо в одном направлении.",photos:[["🚰","Движение воды"],["🚗","Дорога"],["📡","Данные"],["➡️","Направление"]]},
    62:{answer:"ПРЕДЕЛ",pool:"ПРЕДЕЛАБВГЖЗ",hint:"Граница, дальше которой что-либо не продолжается.",photos:[["📏","Измерение"],["⏱️","Ограничение"],["🛑","Стоп"],["🚧","Граница"]]},
    63:{answer:"МОМЕНТ",pool:"МОМЕНТАБВГДЖ",hint:"Короткий отрезок времени или важная точка события.",photos:[["📸","Снимок"],["⏳","Время"],["👀","Мгновение"],["✨","Особый миг"]]},
    64:{answer:"ОБРАЗ",pool:"ОБРАЗВГДЕЖИЙ",hint:"Представление, вид или мысленная картина чего-либо.",photos:[["🎨","Рисунок"],["👤","Силуэт"],["🪞","Отражение"],["🖼️","Картина"]]},
    65:{answer:"ЭНЕРГИЯ",pool:"ЭНЕРГИЯАБВДЖ",hint:"То, что даёт способность действовать, двигаться или выполнять работу.",photos:[["🔋","Запас"],["🏃","Движение"],["☀️","Солнце"],["⚡","Сила"]]},
    66:{answer:"ЧАСТОТА",pool:"ЧАСТОТАБВГДЕ",hint:"Показывает, как часто повторяется событие или колебание.",photos:[["📻","Радио"],["〰️","Колебание"],["⏱️","Повтор"],["📈","Измерение"]]},
    67:{answer:"СИСТЕМА",pool:"СИСТЕМАБВГДЖ",hint:"Набор связанных элементов, работающих как единое целое.",photos:[["⚙️","Механизмы"],["🧩","Части"],["🔗","Связи"],["💻","Работа вместе"]]},
    68:{answer:"МОДЕЛЬ",pool:"МОДЕЛЬАБВГЖЗ",hint:"Упрощённое представление реального объекта, процесса или идеи.",photos:[["🏗️","Макет"],["📐","Схема"],["🧠","Представление"],["🧩","Устройство"]]},
    69:{answer:"КОНТАКТ",pool:"КОНТАКТБВГДЕ",hint:"Связь или непосредственное взаимодействие между людьми или объектами.",photos:[["📞","Связь"],["🤝","Встреча"],["🔌","Соединение"],["👥","Взаимодействие"]]},
    70:{answer:"РЕСУРС",pool:"РЕСУРСАБВГДЖ",hint:"Запас или средство, которое можно использовать для достижения цели.",photos:[["📦","Запас"],["💰","Средства"],["🔋","Энергия"],["🧰","Возможности"]]},
    71:{answer:"МАСШТАБ",pool:"МАСШТАБВГДЕЖ",hint:"Соотношение размеров или степень охвата чего-либо.",photos:[["🗺️","Карта"],["🔍","Увеличение"],["📏","Размер"],["🌍","Охват"]]},
    72:{answer:"ТОЧКА",pool:"ТОЧКАБВГДЕЖЗ",hint:"Маленькая отметка, конкретное место или положение.",photos:[["📍","Место"],["✏️","Отметка"],["🎯","Позиция"],["•","Знак"]]},
    73:{answer:"ЛИНИЯ",pool:"ЛИНИЯАБВГДЕЖ",hint:"Протяжённый след, граница или направление между точками.",photos:[["✏️","Штрих"],["📈","График"],["🛣️","Направление"],["➖","Черта"]]},
    74:{answer:"ФОРМУЛА",pool:"ФОРМУЛАБВГДЕ",hint:"Краткая запись правила, зависимости или способа вычисления.",photos:[["🧮","Расчёт"],["🔢","Числа"],["🧪","Соотношение"],["➗","Вычисление"]]},
    75:{answer:"СТРУКТУРА",pool:"СТРУКТУРАБВГДЕ",hint:"Порядок расположения и связи частей внутри целого.",photos:[["🏗️","Каркас"],["🧱","Части"],["🗂️","Порядок"],["🔗","Связи"]]},
    76:{answer:"ПРОЦЕСС",pool:"ПРОЦЕССАБВГД",hint:"Последовательность действий или изменений, ведущих к результату.",photos:[["1️⃣","Начало"],["🔄","Изменение"],["⚙️","Работа"],["✅","Результат"]]},
    77:{answer:"ШАБЛОН",pool:"ШАБЛОНВГДЕЖЗ",hint:"Повторяющийся образец или форма, по которой создают похожие вещи.",photos:[["🧩","Повтор"],["🧵","Узор"],["📐","Форма"],["🔁","Повторение"]]},
    78:{answer:"СХЕМА",pool:"СХЕМАБВГДЖЗИ",hint:"Условное изображение устройства, связи или порядка действий.",photos:[["✏️","Черновик"],["🔗","Связи"],["📐","Чертёж"],["🗺️","План"]]},
    79:{answer:"КОНТЕКСТ",pool:"КОНТЕКСТАБВГД",hint:"Окружение и условия, которые помогают правильно понять смысл.",photos:[["💬","Фраза"],["📖","Текст"],["🧠","Смысл"],["🔎","Уточнение"]]},
    80:{answer:"ФАКТОР",pool:"ФАКТОРБВГДЕЖ",hint:"Причина или условие, влияющее на результат.",photos:[["⚙️","Влияние"],["📊","Результат"],["➕","Составляющая"],["🎯","Эффект"]]},
    81:{answer:"ДИАЛОГ",pool:"ДИАЛОГБВЕЖЗЙ",hint:"Обмен репликами или информацией между двумя сторонами.",photos:[["🗣️","Речь"],["👂","Слушать"],["💬","Реплики"],["👥","Две стороны"]]},
    82:{answer:"ГРАНИЦА",pool:"ГРАНИЦАБВДЕЖ",hint:"Линия или условный рубеж, отделяющий одно от другого.",photos:[["🗺️","Карта"],["🚧","Рубеж"],["↔️","Две стороны"],["📍","Разделение"]]},
    83:{answer:"ЦИКЛ",pool:"ЦИКЛАБВГДЕЖЗ",hint:"Последовательность, которая после завершения снова повторяется.",photos:[["🔄","Повтор"],["🌙","Фазы"],["🔁","Возврат"],["⏱️","Период"]]},
    84:{answer:"ЯДРО",pool:"ЯДРОАБВГЕЖЗИ",hint:"Центральная и наиболее важная часть системы или объекта.",photos:[["🍎","Середина"],["🎯","Центр"],["⚛️","Центральная часть"],["💻","Основа системы"]]},
    85:{answer:"МОДУЛЬ",pool:"МОДУЛЬАБВГЕЖ",hint:"Отдельная часть системы, которая выполняет определённую функцию.",photos:[["🧩","Часть"],["🔌","Подключение"],["⚙️","Функция"],["🏗️","Блок"]]},
    86:{answer:"ПАРАМЕТР",pool:"ПАРАМЕТРБВГДЖ",hint:"Характеристика или значение, задающее условия работы или сравнения.",photos:[["⚙️","Настройка"],["📏","Значение"],["🎚️","Регулировка"],["📊","Показатель"]]},
    87:{answer:"АЛГОРИТМ",pool:"АЛГОРИТМБВДЕЖ",hint:"Точная последовательность шагов для решения задачи.",photos:[["1️⃣","Шаг"],["2️⃣","Следующий шаг"],["💻","Выполнение"],["✅","Решение"]]},
    88:{answer:"СЦЕНАРИЙ",pool:"СЦЕНАРИЙБВГДЖ",hint:"Продуманная последовательность событий или возможный вариант развития.",photos:[["🎬","Сцена"],["📝","План"],["🔀","Варианты"],["➡️","Развитие"]]},
    89:{answer:"СМЫСЛ",pool:"СМЫСЛАБВГДЕЖ",hint:"Главная идея или значение, заключённое в словах, действиях или образах.",photos:[["💬","Слова"],["🧠","Понимание"],["🔎","Значение"],["💡","Идея"]]},
    90:{answer:"СВЯЗКА",pool:"СВЯЗКАБГДЕЖИ",hint:"То, что объединяет несколько элементов и помогает им работать вместе.",photos:[["🔗","Соединение"],["🧩","Части"],["🤝","Объединение"],["⚙️","Совместная работа"]]},
    91:{answer:"МЕХАНИЗМ",pool:"МЕХАНИЗМБВГДЖ",hint:"Система деталей или действий, благодаря которой что-либо работает.",photos:[["🧩","Части"],["🔄","Движение"],["🔧","Устройство"],["⚙️","Работа"]]},
    92:{answer:"КООРДИНАТА",pool:"КООРДИНАТАБВГЕЖ",hint:"Число или значение, которое задаёт точное положение точки.",photos:[["🗺️","Карта"],["📍","Положение"],["📐","Оси"],["🔢","Значение"]]},
    93:{answer:"ПЕРСПЕКТИВА",pool:"ПЕРСПЕКТИВАБГДЖЗ",hint:"Способ видеть пространство или оценивать ситуацию с определённой точки.",photos:[["👁️","Взгляд"],["🛣️","Даль"],["📐","Глубина"],["🏙️","Пространство"]]},
    94:{answer:"ИНТЕРВАЛ",pool:"ИНТЕРВАЛБГДЖЗ",hint:"Промежуток между двумя моментами, значениями или объектами.",photos:[["⏱️","Время"],["↔️","Промежуток"],["🎵","Расстояние в звуке"],["📏","Отрезок"]]},
    95:{answer:"ПРОПОРЦИЯ",pool:"ПРОПОРЦИЯАБВГД",hint:"Соотношение частей или величин между собой.",photos:[["⚖️","Соотношение"],["📐","Размеры"],["➗","Отношение"],["🧩","Части"]]},
    96:{answer:"ИЕРАРХИЯ",pool:"ИЕРАРХИЯБВГДЖ",hint:"Порядок уровней, где одни элементы находятся выше или ниже других.",photos:[["👑","Верх"],["🏢","Уровни"],["⬆️","Выше"],["⬇️","Ниже"]]},
    97:{answer:"КОНФИГУРАЦИЯ",pool:"КОНФИГУРАЦИЯБВДЕЖ",hint:"Определённое расположение и сочетание частей системы.",photos:[["🧩","Сочетание"],["⚙️","Настройка"],["🖥️","Система"],["🔧","Расположение"]]},
    98:{answer:"ТРАНСФОРМАЦИЯ",pool:"ТРАНСФОРМАЦИЯБВГДЕ",hint:"Заметное изменение формы, состояния или структуры.",photos:[["🐛","До"],["🦋","После"],["🔄","Изменение"],["✨","Новая форма"]]},
    99:{answer:"ИНТЕГРАЦИЯ",pool:"ИНТЕГРАЦИЯБВДЖЗ",hint:"Объединение отдельных частей в единую работающую систему.",photos:[["🧩","Части"],["🤝","Объединение"],["🔗","Связь"],["⚙️","Единая система"]]},
    100:{answer:"АБСТРАКЦИЯ",pool:"АБСТРАКЦИЯВГДЕЖ",hint:"Идея или образ, отвлечённый от конкретного предмета.",photos:[["🎨","Форма"],["🧠","Идея"],["〰️","Необычный образ"],["❓","Не конкретный предмет"]]}
  };
  const TRANSLATED={
    en:{
      1:{answer:'DOG',pool:'DOGCATRLMNES',hint:'A loyal domestic animal often called a human’s best friend.'},
      2:{answer:'CAT',pool:'CATDOGRLMNES',hint:'A domestic pet that purrs.'},
      3:{answer:'SEA',pool:'SEAWTRLMNOKD',hint:'A large body of salt water.'},
      4:{answer:'RAIN',pool:'RAINCLDOSTME',hint:'It falls from clouds and makes you reach for an umbrella.'},
      5:{answer:'TIME',pool:'TIMECLKAORNS',hint:'You can measure it, but you cannot turn it back.'},
      6:{answer:'WARMTH',pool:'WARMTHFIREOS',hint:'Fire and the sun give it; in winter we want more of it.'},
      7:{answer:'MEMORY',pool:'MEMORYPASTDK',hint:'It keeps what has already happened.'},
      8:{answer:'LIGHT',pool:'LIGHTSUNROPE',hint:'Without it, seeing the world becomes difficult.'},
      9:{answer:'PATH',pool:'PATHROADMNES',hint:'A road, route, or direction toward a destination.'},
      10:{answer:'SECRET',pool:'SECRETLOCKQAZ',hint:'Something hidden that others may try to discover.'},
      11:{answer:'SHADOW',pool:'SHADOWLIGHTER',hint:'It appears when an object blocks light.'},
      12:{answer:'TRACE',pool:'TRACEFOOTMNDS',hint:'A mark or sign left behind by someone or something.'},
      13:{answer:'WAVE',pool:'WAVERDIOSNMT',hint:'It can travel through water, sound, or radio.'},
      14:{answer:'KEY',pool:'KEYLOCKMUSICR',hint:'It opens a lock, but can also mean the solution to something.'},
      15:{answer:'ROOT',pool:'ROOTTOOTHMATH',hint:'A tree has one, a tooth has one, and mathematics uses the same word.'},
      16:{answer:'NET',pool:'NETWEBFISHRKA',hint:'It can catch fish or connect computers.'},
      17:{answer:'CURRENT',pool:'CURRENTPOWERA',hint:'It can mean flowing electricity or flowing water.'},
      18:{answer:'FRAME',pool:'FRAMEFILMPHOT',hint:'A single image in film, or a border around a picture.'},
      19:{answer:'LINK',pool:'LINKPHONEWEBAR',hint:'It connects people, devices, or pieces of information.'},
      20:{answer:'SOURCE',pool:'SOURCEWATEREN',hint:'The place or thing from which something begins or comes.'},
      21:{answer:"BRIDGE",pool:"BRIDGEACFHJK",hint:"It connects two sides or two parts of a path."},
      22:{answer:"MASK",pool:"MASKBCDEFG",hint:"It can be worn for protection, beauty, or a role."},
      23:{answer:"SPARK",pool:"SPARKBCDEFG",hint:"A small flash of fire or electricity."},
      24:{answer:"MIRROR",pool:"MIRRORABCDEF",hint:"You can see a reflection in it."},
      25:{answer:"DESERT",pool:"DESERTABCFGH",hint:"A hot place with sand and little water."},
      26:{answer:"CODE",pool:"CODEABFGHI",hint:"A secret writing system or password."},
      27:{answer:"FLAME",pool:"FLAMEBCDGHI",hint:"The bright part of a fire."},
      28:{answer:"COMET",pool:"COMETABDFGH",hint:"A celestial body with a bright tail."},
      29:{answer:"MAZE",pool:"MAZEBCDFGH",hint:"A complex path system where you must find the way out."},
      30:{answer:"SIGNAL",pool:"SIGNALBCDEFH",hint:"A sign or message that transmits something."},
      31:{answer:"STAMP",pool:"STAMPBCDEFG",hint:"It is put on a document or paper."},
      32:{answer:"KNOT",pool:"KNOTABCDEF",hint:"It is tied on a rope, thread, or lace."},
      33:{answer:"SATELLITE",pool:"SATELLITEBCDFGH",hint:"It orbits a planet or helps communication."},
      34:{answer:"CLOUD",pool:"CLOUDABEFGH",hint:"It exists in the sky and also in the digital world."},
      35:{answer:"EDGE",pool:"EDGEABCFHI",hint:"The line of an edge or a sharp side of something."},
      36:{answer:"OUTLINE",pool:"OUTLINEABCDFG",hint:"The outer line of an object's shape."},
      37:{answer:"SHARD",pool:"SHARDBCEFGI",hint:"A small broken piece of something."},
      38:{answer:"IMPULSE",pool:"IMPULSEABCDFG",hint:"A short push, wave, or signal."},
      39:{answer:"ARCHIVE",pool:"ARCHIVEBDFGJK",hint:"A place where old documents and data are stored."},
      40:{answer:"HORIZON",pool:"HORIZONABCDEF",hint:"The line where the sky seems to meet the earth or sea."},
      41:{answer:"VECTOR",pool:"VECTORABDFGH",hint:"A directed quantity often shown with an arrow."},
      42:{answer:"SPECTRUM",pool:"SPECTRUMABDFGH",hint:"A range of colors, frequencies, or possible variations."},
      43:{answer:"ORBIT",pool:"ORBITACDEFG",hint:"The path followed by a planet or satellite."},
      44:{answer:"RESONANCE",pool:"RESONANCEBDFGHI",hint:"The strengthening of vibrations when frequencies match."},
      45:{answer:"PARADOX",pool:"PARADOXBCEFGH",hint:"Something that seems contradictory but can still make sense."},
      46:{answer:"MATRIX",pool:"MATRIXBCDEFG",hint:"A table, structure, or system of elements."},
      47:{answer:"TRAJECTORY",pool:"TRAJECTORYBDFGHI",hint:"The path of movement of an object or body."},
      48:{answer:"CODEX",pool:"CODEXABFGHI",hint:"A set of rules or laws."},
      49:{answer:"COMPASS",pool:"COMPASSBDEFGH",hint:"A tool used to determine direction."},
      50:{answer:"BALANCE",pool:"BALANCETRMSO",hint:"A state where different sides, forces, or choices are in equilibrium."},
      51:{answer:"RHYTHM",pool:"RHYTHMALNOPS",hint:"A repeating pattern of sounds, movements, or beats."},
      52:{answer:"FOCUS",pool:"FOCUSDARLMP",hint:"The point of attention or sharpness where everything is concentrated."},
      53:{answer:"ECHO",pool:"ECHOTARMSLK",hint:"A sound that returns after being reflected."},
      54:{answer:"PULSE",pool:"PULSEAKRMEN",hint:"Regular beats that reveal the activity of the heart."},
      55:{answer:"TONE",pool:"TONEALMRSC",hint:"It can describe a voice, music, or even a color."},
      56:{answer:"PORTAL",pool:"PORTALMEKSIN",hint:"An entrance or passage leading to another space or section."},
      57:{answer:"CHANNEL",pool:"CHANNELTRSMO",hint:"Water, signals, information, or transport can pass through it."},
      58:{answer:"FILTER",pool:"FILTERSAKON",hint:"It lets wanted things through and holds unwanted things back."},
      59:{answer:"STAGE",pool:"STAGEARIMOK",hint:"A place where a performance, action, or important scene happens."},
      60:{answer:"SYMBOL",pool:"SYMBOLTAREKN",hint:"A sign or image that represents an idea, meaning, or object."},
      61:{answer:"FLOW",pool:"FLOWABCDEGHI",hint:"Continuous movement of something in one direction."},
      62:{answer:"LIMIT",pool:"LIMITABCDEFG",hint:"A boundary beyond which something does not continue."},
      63:{answer:"MOMENT",pool:"MOMENTABCDFG",hint:"A short point in time or an important instant in an event."},
      64:{answer:"IMAGE",pool:"IMAGEBCDFHJK",hint:"A representation, appearance, or mental picture of something."},
      65:{answer:"ENERGY",pool:"ENERGYABCDFH",hint:"What provides the ability to act, move, or do work."},
      66:{answer:"FREQUENCY",pool:"FREQUENCYABDGH",hint:"It shows how often an event or vibration repeats."},
      67:{answer:"SYSTEM",pool:"SYSTEMABCDFG",hint:"A set of connected elements working as one whole."},
      68:{answer:"MODEL",pool:"MODELABCFGHI",hint:"A simplified representation of a real object, process, or idea."},
      69:{answer:"CONTACT",pool:"CONTACTBDEFG",hint:"A connection or direct interaction between people or objects."},
      70:{answer:"RESOURCE",pool:"RESOURCEABDFG",hint:"A supply or means that can be used to achieve a goal."},
      71:{answer:"SCALE",pool:"SCALEBDFGHIJ",hint:"The ratio of sizes or the extent of something."},
      72:{answer:"POINT",pool:"POINTABCDEFG",hint:"A small mark, specific place, or position."},
      73:{answer:"LINE",pool:"LINEABCDFGHJ",hint:"A continuous mark, boundary, or direction between points."},
      74:{answer:"FORMULA",pool:"FORMULABCDEG",hint:"A concise expression of a rule, relationship, or calculation method."},
      75:{answer:"STRUCTURE",pool:"STRUCTUREABDFG",hint:"The arrangement and relationships of parts within a whole."},
      76:{answer:"PROCESS",pool:"PROCESSABDFG",hint:"A sequence of actions or changes leading to a result."},
      77:{answer:"PATTERN",pool:"PATTERNBCDFG",hint:"A repeating model or form used to create similar things."},
      78:{answer:"SCHEME",pool:"SCHEMEABDFGI",hint:"A simplified diagram of a device, connection, or sequence."},
      79:{answer:"CONTEXT",pool:"CONTEXTABDFG",hint:"The surrounding conditions that help clarify meaning."},
      80:{answer:"FACTOR",pool:"FACTORBDEGHI",hint:"A cause or condition that influences a result."},
      81:{answer:"DIALOGUE",pool:"DIALOGUEBCFHJ",hint:"An exchange of words or information between two sides."},
      82:{answer:"BOUNDARY",pool:"BOUNDARYCEFGH",hint:"A line or conceptual border separating one thing from another."},
      83:{answer:"CYCLE",pool:"CYCLEABDFGHI",hint:"A sequence that repeats again after it finishes."},
      84:{answer:"CORE",pool:"COREABDFGHIJ",hint:"The central and most important part of a system or object."},
      85:{answer:"MODULE",pool:"MODULEABCFGH",hint:"A separate part of a system that performs a specific function."},
      86:{answer:"PARAMETER",pool:"PARAMETERBCDFG",hint:"A characteristic or value defining conditions for operation or comparison."},
      87:{answer:"ALGORITHM",pool:"ALGORITHMBCDEF",hint:"A precise sequence of steps used to solve a problem."},
      88:{answer:"SCENARIO",pool:"SCENARIOBDFGH",hint:"A planned sequence of events or a possible course of development."},
      89:{answer:"MEANING",pool:"MEANINGBCDFH",hint:"The main idea or significance contained in words, actions, or images."},
      90:{answer:"LINKAGE",pool:"LINKAGEBCDFH",hint:"Something that joins several elements and helps them work together."},
      91:{answer:"MECHANISM",pool:"MECHANISMBDFGJ",hint:"A system of parts or actions through which something works."},
      92:{answer:"COORDINATE",pool:"COORDINATEBFGHJ",hint:"A number or value that specifies an exact position."},
      93:{answer:"PERSPECTIVE",pool:"PERSPECTIVEABDFG",hint:"A way of viewing space or judging a situation from a certain point."},
      94:{answer:"INTERVAL",pool:"INTERVALBCDFG",hint:"A gap between two moments, values, or objects."},
      95:{answer:"PROPORTION",pool:"PROPORTIONABCDE",hint:"The relationship in size or amount between parts or quantities."},
      96:{answer:"HIERARCHY",pool:"HIERARCHYBDFGJ",hint:"An arrangement of levels where some elements are above or below others."},
      97:{answer:"CONFIGURATION",pool:"CONFIGURATIONBDEHJ",hint:"A particular arrangement and combination of parts in a system."},
      98:{answer:"TRANSFORMATION",pool:"TRANSFORMATIONBCDEG",hint:"A significant change in form, state, or structure."},
      99:{answer:"INTEGRATION",pool:"INTEGRATIONBCDFH",hint:"Combining separate parts into one working system."},
      100:{answer:"ABSTRACTION",pool:"ABSTRACTIONDEFGH",hint:"An idea or image separated from a specific concrete object."}
    },
    az:{
      1:{answer:'İT',pool:'İTPİŞKALMONR',hint:'İnsanın ən yaxın dostu adlandırılan ev heyvanı.'},
      2:{answer:'PİŞİK',pool:'PİŞİKEVTOPAR',hint:'Mırıldayan ev heyvanı.'},
      3:{answer:'DƏNİZ',pool:'DƏNİZSUQLMAR',hint:'Böyük duzlu su hövzəsi.'},
      4:{answer:'YAĞIŞ',pool:'YAĞIŞBULUDKR',hint:'Göydən yağır və çətir götürməyə səbəb olur.'},
      5:{answer:'ZAMAN',pool:'ZAMANSAATLRK',hint:'Onu ölçmək olar, amma geri qaytarmaq olmaz.'},
      6:{answer:'İSTİ',pool:'İSTİODGÜNƏŞR',hint:'Od və günəş onu verir, qışda isə ona ehtiyac artır.'},
      7:{answer:'YADDAŞ',pool:'YADDAŞBEYİNR',hint:'Baş verənləri yadda saxlayır.'},
      8:{answer:'İŞIQ',pool:'İŞIQLAMPAGÜN',hint:'Onsuz ətrafı görmək çətindir.'},
      9:{answer:'YOL',pool:'YOLXƏRİTƏKMN',hint:'Məqsədə aparan istiqamət və ya marşrut.'},
      10:{answer:'SİRR',pool:'SİRRKİLİDAQZ',hint:'Gizli saxlanılan və açılmağa çalışılan şey.'},
      11:{answer:'KÖLGƏ',pool:'KÖLGƏGÜNƏŞAR',hint:'İşığın qarşısı kəsiləndə yaranır.'},
      12:{answer:'İZ',pool:'İZAYAQTƏKƏRLM',hint:'Kimsə və ya nəsə keçdikdən sonra qalan nişan.'},
      13:{answer:'DALĞA',pool:'DALĞASURADİOK',hint:'Dənizdə, səsdə və radio siqnalında ola bilər.'},
      14:{answer:'AÇAR',pool:'AÇARKİLİDMUS',hint:'Qapını açır, həm də problemin həlli mənasında işlənə bilər.'},
      15:{answer:'KÖK',pool:'KÖKAĞACDİŞMAT',hint:'Ağacda və dişdə olur, riyaziyyatda da bu söz işlənir.'},
      16:{answer:'ŞƏBƏKƏ',pool:'ŞƏBƏKƏTORNETA',hint:'İnsanları və cihazları birləşdirə bilər, tor formasında da olur.'},
      17:{answer:'CƏRƏYAN',pool:'CƏRƏYANELEKSU',hint:'Elektrikdə və suyun hərəkətində işlənən anlayışdır.'},
      18:{answer:'KADR',pool:'KADRFİLMŞƏKİL',hint:'Foto və ya filmdə bir görüntü anıdır.'},
      19:{answer:'ƏLAQƏ',pool:'ƏLAQƏTELFONR',hint:'İnsanları, cihazları və məlumatları bir-birinə bağlayır.'},
      20:{answer:'MƏNBƏ',pool:'MƏNBƏSUGÜCİNF',hint:'Bir şeyin başladığı və ya əldə edildiyi yer.'},
      21:{answer:"KÖRPÜ",pool:"KÖRPÜABCÇDE",hint:"İki sahili və ya yolun iki hissəsini birləşdirir."},
      22:{answer:"MASKA",pool:"MASKABCÇDEƏ",hint:"Onu qorunmaq, gözəllik və ya rol üçün taxırlar."},
      23:{answer:"QILCIM",pool:"QILCIMABÇDEƏ",hint:"Alovun və ya elektrik enerjisinin kiçik parıltısı."},
      24:{answer:"GÜZGÜ",pool:"GÜZGÜABCÇDE",hint:"Onda əksini görmək olar."},
      25:{answer:"SƏHRA",pool:"SƏHRABCÇDEF",hint:"Qumlu və suyun az olduğu isti ərazi."},
      26:{answer:"ŞİFRƏ",pool:"ŞİFRƏABCÇDE",hint:"Gizli yazı və ya parol."},
      27:{answer:"ALOV",pool:"ALOVBCÇDEƏ",hint:"Odun parlaq hissəsi."},
      28:{answer:"KOMETA",pool:"KOMETABCÇDƏF",hint:"Parlaq quyruğu olan səma cismi."},
      29:{answer:"LABİRİNT",pool:"LABİRİNTCÇDEƏF",hint:"Çıxışı tapmaq lazım olan mürəkkəb keçidlər sistemi."},
      30:{answer:"SİQNAL",pool:"SİQNALBCÇDEƏ",hint:"Nəyisə ötürən işarə və ya məlumat."},
      31:{answer:"MÖHÜR",pool:"MÖHÜRABCÇDE",hint:"Onu sənədə və ya kağıza vururlar."},
      32:{answer:"DÜYÜN",pool:"DÜYÜNABCÇEƏ",hint:"Onu kəndirdə, sapda və ya bağda düyünləyirlər."},
      33:{answer:"PEYK",pool:"PEYKABCÇDƏ",hint:"O, planetin ətrafında fırlanır və ya rabitəyə kömək edir."},
      34:{answer:"BULUD",pool:"BULUDACÇEƏF",hint:"O həm səmada, həm də rəqəmsal dünyada olur."},
      35:{answer:"KƏNAR",pool:"KƏNARBCÇDEF",hint:"Kənar xətt və ya əşyanın iti tərəfi."},
      36:{answer:"KONTUR",pool:"KONTURABCÇDE",hint:"Əşyanın formasının xarici xətti."},
      37:{answer:"QIRINTI",pool:"QIRINTIABCÇDE",hint:"Sınmış əşyanın kiçik parçası."},
      38:{answer:"İMPULS",pool:"İMPULSABCÇDE",hint:"Qısa təkan, dalğa və ya siqnal."},
      39:{answer:"ARXİV",pool:"ARXİVBCÇDEƏ",hint:"Köhnə sənədlərin və məlumatların saxlandığı yer."},
      40:{answer:"ÜFÜQ",pool:"ÜFÜQABCÇDE",hint:"Səmanın yer və ya dənizlə birləşdiyi kimi görünən xətt."},
      41:{answer:"VEKTOR",pool:"VEKTORABCÇDƏ",hint:"Çox vaxt oxla göstərilən istiqamətli kəmiyyət."},
      42:{answer:"SPEKTR",pool:"SPEKTRABCÇDƏ",hint:"Rənglərin, tezliklərin və ya variantların toplusu."},
      43:{answer:"ORBİT",pool:"ORBİTACÇDEƏ",hint:"Planetin və ya peykin hərəkət etdiyi yol."},
      44:{answer:"REZONANS",pool:"REZONANSBCÇDƏF",hint:"Tezliklər uyğun gələndə titrəyişlərin güclənməsi."},
      45:{answer:"PARADOKS",pool:"PARADOKSBCÇEƏF",hint:"Ziddiyyətli görünsə də, məna daşıyan hal."},
      46:{answer:"MATRİSA",pool:"MATRİSABCÇDEƏ",hint:"Elementlərdən ibarət cədvəl, struktur və ya sistem."},
      47:{answer:"TRAEKTORİYA",pool:"TRAEKTORİYABCÇDƏF",hint:"Cismin və ya obyektin hərəkət yolu."},
      48:{answer:"KODEKS",pool:"KODEKSABCÇƏF",hint:"Qaydalar və ya qanunlar toplusu."},
      49:{answer:"KOMPAS",pool:"KOMPASBCÇDEƏ",hint:"İstiqaməti müəyyən etməyə kömək edən cihaz."},
      50:{answer:"TARAZLIQ",pool:"TARAZLIQBCMN",hint:"Tərəflər, qüvvələr və ya seçimlər arasında tarazlıq vəziyyəti."},
      51:{answer:"RİTM",pool:"RİTMLASOKN",hint:"Səslərin, hərəkətlərin və ya vurğuların təkrarlanan ardıcıllığı."},
      52:{answer:"FOKUS",pool:"FOKUSDARLMN",hint:"Diqqətin və ya aydınlığın cəmləndiyi nöqtə."},
      53:{answer:"SƏDA",pool:"SƏDATRMKLN",hint:"Əks olunaraq geri qayıdan səs."},
      54:{answer:"NƏBZ",pool:"NƏBZAKRMLƏ",hint:"Ürəyin işini göstərən ritmik döyüntülər."},
      55:{answer:"TON",pool:"TONALMERSK",hint:"Səsdə, musiqidə və rəngdə işlənən anlayış."},
      56:{answer:"PORTAL",pool:"PORTALMEKSİN",hint:"Başqa məkana və ya bölməyə aparan keçid və ya giriş."},
      57:{answer:"KANAL",pool:"KANALTRƏSOM",hint:"Su, siqnal, məlumat və ya nəqliyyat onunla hərəkət edə bilər."},
      58:{answer:"FİLTR",pool:"FİLTRSAKON",hint:"Lazım olanı buraxır, artıq olanı saxlayır."},
      59:{answer:"SƏHNƏ",pool:"SƏHNƏARTİMO",hint:"Tamaşanın, çıxışın və ya mühüm hadisənin baş verdiyi yer."},
      60:{answer:"SİMVOL",pool:"SİMVOLTARƏKN",hint:"Fikri, mənanı və ya obyekti ifadə edən işarə və ya obraz."},
      61:{answer:"AXIN",pool:"AXINBCÇDEƏFG",hint:"Bir istiqamətdə fasiləsiz hərəkət."},
      62:{answer:"HƏDD",pool:"HƏDDABCÇEFGĞ",hint:"Bir şeyin davam etmədiyi sərhəd."},
      63:{answer:"AN",pool:"ANBCÇDEƏFGĞH",hint:"Qısa zaman anı və ya hadisənin mühüm nöqtəsi."},
      64:{answer:"TƏSVİR",pool:"TƏSVİRABCÇDE",hint:"Bir şeyin görünüşü, təsviri və ya zehni şəkli."},
      65:{answer:"ENERJİ",pool:"ENERJİABCÇDƏ",hint:"Hərəkət etməyə və iş görməyə imkan verən güc."},
      66:{answer:"TEZLİK",pool:"TEZLİKABCÇDƏ",hint:"Hadisənin və ya titrəyişin nə qədər tez-tez təkrarlandığını göstərir."},
      67:{answer:"SİSTEM",pool:"SİSTEMABCÇDƏ",hint:"Bir bütöv kimi işləyən əlaqəli elementlər toplusu."},
      68:{answer:"MODEL",pool:"MODELABCÇƏFG",hint:"Real obyektin, prosesin və ya ideyanın sadələşdirilmiş təsviri."},
      69:{answer:"TƏMAS",pool:"TƏMASBCÇDEFG",hint:"İnsanlar və ya obyektlər arasında birbaşa əlaqə."},
      70:{answer:"RESURS",pool:"RESURSABCÇDƏ",hint:"Məqsədə çatmaq üçün istifadə edilə bilən ehtiyat və ya vasitə."},
      71:{answer:"MİQYAS",pool:"MİQYASBCÇDEƏ",hint:"Ölçülərin nisbəti və ya bir şeyin əhatə dərəcəsi."},
      72:{answer:"NÖQTƏ",pool:"NÖQTƏABCÇDEF",hint:"Kiçik işarə, konkret yer və ya mövqe."},
      73:{answer:"XƏTT",pool:"XƏTTABCÇDEFG",hint:"Nöqtələr arasında uzanan iz, sərhəd və ya istiqamət."},
      74:{answer:"FORMUL",pool:"FORMULABCÇDE",hint:"Qaydanın, əlaqənin və ya hesablama üsulunun qısa yazılışı."},
      75:{answer:"STRUKTUR",pool:"STRUKTURABCÇD",hint:"Bütöv daxilində hissələrin yerləşmə və əlaqə qaydası."},
      76:{answer:"PROSES",pool:"PROSESABCÇDƏ",hint:"Nəticəyə aparan hərəkət və ya dəyişikliklər ardıcıllığı."},
      77:{answer:"NÜMUNƏ",pool:"NÜMUNƏABCÇDE",hint:"Oxşar şeylər yaratmaq üçün istifadə olunan təkrarlanan nümunə."},
      78:{answer:"SXEM",pool:"SXEMABCÇDƏFG",hint:"Qurğunun, əlaqənin və ya addımların şərti təsviri."},
      79:{answer:"KONTEKST",pool:"KONTEKSTABCÇD",hint:"Mənanı düzgün başa düşməyə kömək edən şərait və mühit."},
      80:{answer:"AMİL",pool:"AMİLBCÇDEƏFG",hint:"Nəticəyə təsir edən səbəb və ya şərt."},
      81:{answer:"DİALOQ",pool:"DİALOQBCÇEƏF",hint:"İki tərəf arasında söz və ya məlumat mübadiləsi."},
      82:{answer:"SƏRHƏD",pool:"SƏRHƏDABCÇEF",hint:"Bir şeyi digərindən ayıran xətt və ya şərti sərhəd."},
      83:{answer:"DÖVR",pool:"DÖVRABCÇEƏFG",hint:"Bitdikdən sonra yenidən təkrarlanan ardıcıllıq."},
      84:{answer:"NÜVƏ",pool:"NÜVƏABCÇDEFG",hint:"Sistemin və ya obyektin mərkəzi və əsas hissəsi."},
      85:{answer:"MODUL",pool:"MODULABCÇEƏF",hint:"Sistemin müəyyən funksiyanı yerinə yetirən ayrıca hissəsi."},
      86:{answer:"PARAMETR",pool:"PARAMETRBCÇDƏ",hint:"İş və ya müqayisə şərtlərini müəyyən edən göstərici və ya dəyər."},
      87:{answer:"ALQORİTM",pool:"ALQORİTMBCÇDE",hint:"Məsələni həll etmək üçün dəqiq addımlar ardıcıllığı."},
      88:{answer:"SSENARİ",pool:"SSENARİBCÇDƏ",hint:"Hadisələrin planlaşdırılmış ardıcıllığı və ya mümkün inkişaf variantı."},
      89:{answer:"MƏNA",pool:"MƏNABCÇDEFGĞ",hint:"Sözlərdə, hərəkətlərdə və ya obrazlarda olan əsas fikir və məna."},
      90:{answer:"BAĞLANTI",pool:"BAĞLANTICÇDEƏ",hint:"Bir neçə elementi birləşdirən və birlikdə işləməsinə kömək edən əlaqə."},
      91:{answer:"MEXANİZM",pool:"MEXANİZMBCÇDƏ",hint:"Bir şeyin işləməsini təmin edən hissələr və ya hərəkətlər sistemi."},
      92:{answer:"KOORDİNAT",pool:"KOORDİNATBCÇEƏ",hint:"Nöqtənin dəqiq mövqeyini göstərən ədəd və ya dəyər."},
      93:{answer:"PERSPEKTİV",pool:"PERSPEKTİVABCÇD",hint:"Məkana və ya vəziyyətə müəyyən nöqtədən baxış üsulu."},
      94:{answer:"İNTERVAL",pool:"İNTERVALBCÇDƏ",hint:"İki an, dəyər və ya obyekt arasındakı aralıq."},
      95:{answer:"NİSBƏT",pool:"NİSBƏTACÇDEF",hint:"Hissələr və ya kəmiyyətlər arasındakı ölçü münasibəti."},
      96:{answer:"İYERARXİYA",pool:"İYERARXİYABCÇDƏ",hint:"Bəzi elementlərin digərlərindən yuxarı və ya aşağı olduğu səviyyə qaydası."},
      97:{answer:"KONFİQURASİYA",pool:"KONFİQURASİYABCÇDE",hint:"Sistem hissələrinin müəyyən yerləşməsi və birləşməsi."},
      98:{answer:"TRANSFORMASİYA",pool:"TRANSFORMASİYABCÇDE",hint:"Forma, vəziyyət və ya strukturun nəzərəçarpan dəyişməsi."},
      99:{answer:"İNTEQRASİYA",pool:"İNTEQRASİYABCÇDƏ",hint:"Ayrı hissələrin vahid işləyən sistemdə birləşdirilməsi."},
      100:{answer:"ABSTRAKSİYA",pool:"ABSTRAKSİYACÇDEƏ",hint:"Konkret obyektdən ayrılmış ümumi fikir və ya obraz."}
    }
  };
  let gameLang='ru';try{gameLang=localStorage.getItem('pw.language')||'ru'}catch{}
  const track=(event,data={})=>pw.actionRequest('track_event',{event,language:gameLang,...data}).catch(()=>{});
  window.addEventListener('pw:error',e=>track('server_error',{metadata:{code:String(e.detail?.code||'error'),status:Number(e.detail?.status||0)}}));
  window.addEventListener('error',e=>track('client_error',{metadata:{message:String(e.message||'error').slice(0,120)}}));
  window.addEventListener('unhandledrejection',e=>track('client_error',{metadata:{message:String(e.reason?.message||e.reason||'rejection').slice(0,120)}}));
  if(TRANSLATED[gameLang]) Object.keys(LEVELS).forEach(k=>Object.assign(LEVELS[k],TRANSLATED[gameLang][k]));
  function validateLanguageLevels(){
    const supported=['ru','en','az'];
    for(const lang of supported){
      for(let n=1;n<=100;n++){
        const item=lang==='ru'?LEVELS[n]:TRANSLATED[lang][n];
        if(!item||!item.answer||!item.pool||!item.hint)throw new Error('Incomplete language level '+lang+' '+n);
        const need=[...item.answer].reduce((m,ch)=>(m[ch]=(m[ch]||0)+1,m),{});
        const have=[...item.pool].reduce((m,ch)=>(m[ch]=(m[ch]||0)+1,m),{});
        for(const ch in need)if((have[ch]||0)<need[ch])throw new Error('Missing answer letter '+lang+' '+n+' '+ch);
      }
    }
  }
  validateLanguageLevels();
  const GAME_UI={
    ru:{chapter:n=>'Глава '+n,warm:'Разминка',assoc:'Ассоциации',chapter3:'Связи',chapter4:'Глубина',level:n=>'Уровень '+n,textHint:'Текстовая подсказка',tap:'Нажми, чтобы открыть',wrong:'Неверное слово. Попробуй ещё раз.',checking:'Проверяю и сохраняю ответ…',passed:n=>'Уровень '+n+' пройден!',reward:'+20 монет · +15 XP',already:'Награда за этот уровень уже получена',next:'СЛЕДУЮЩИЙ УРОВЕНЬ',sync:'Профиль синхронизирован.',shuffle:'Буквы перемешаны. Бесплатно.',letter:'Буква открыта. −50 монет.',remove:'Лишние буквы убраны. −100 монет.',text:'Подсказка открыта. −150 монет.',textOpened:'Подсказка уже открыта.',allLetters:'Все буквы уже открыты.',noExtra:'Лишних букв не осталось.',hintWait:'Подсказка: ожидаю ответ сервера…',locked:n=>'Сначала пройди уровень '+n+'.',home:'НА ГЛАВНУЮ',nextChapter:'СЛЕДУЮЩАЯ ГЛАВА',chapterPassed:n=>'Глава '+n+' пройдена!',chapterUnlocked:n=>'Глава '+n+' открыта',newTitle:title=>'Новый титул: '+title,slot:n=>'Буква '+n,image:n=>'Изображение '+n,placeFail:'Не удалось разместить букву.'},
    en:{chapter:n=>'Chapter '+n,warm:'Warm-up',assoc:'Associations',chapter3:'Connections',chapter4:'Depth',level:n=>'Level '+n,textHint:'Text hint',tap:'Tap to reveal',wrong:'Wrong word. Try again.',checking:'Checking and saving your answer…',passed:n=>'Level '+n+' completed!',reward:'+20 coins · +15 XP',already:'Reward for this level has already been claimed',next:'NEXT LEVEL',sync:'Profile synced.',shuffle:'Letters shuffled. Free.',letter:'Letter revealed. −50 coins.',remove:'Extra letters removed. −100 coins.',text:'Hint revealed. −150 coins.',textOpened:'Hint already revealed.',allLetters:'All letters are already revealed.',noExtra:'No extra letters remain.',hintWait:'Getting hint from the server…',locked:n=>'Complete level '+n+' first.',home:'HOME',nextChapter:'NEXT CHAPTER',chapterPassed:n=>'Chapter '+n+' completed!',chapterUnlocked:n=>'Chapter '+n+' unlocked',newTitle:title=>'New title: '+title,slot:n=>'Letter '+n,image:n=>'Image '+n,placeFail:'Could not place the letter.'},
    az:{chapter:n=>'Fəsil '+n,warm:'İsinmə',assoc:'Assosiasiyalar',chapter3:'Əlaqələr',chapter4:'Dərinlik',level:n=>n+'-ci səviyyə',textHint:'Mətn ipucu',tap:'Açmaq üçün toxun',wrong:'Söz yanlışdır. Yenidən cəhd et.',checking:'Cavab yoxlanılır və yadda saxlanılır…',passed:n=>n+'-ci səviyyə keçildi!',reward:'+20 sikkə · +15 XP',already:'Bu səviyyənin mükafatı artıq alınıb',next:'NÖVBƏTİ SƏVİYYƏ',sync:'Profil sinxronlaşdırıldı.',shuffle:'Hərflər qarışdırıldı. Pulsuz.',letter:'Hərf açıldı. −50 sikkə.',remove:'Artıq hərflər silindi. −100 sikkə.',text:'İpucu açıldı. −150 sikkə.',textOpened:'İpucu artıq açılıb.',allLetters:'Bütün hərflər artıq açılıb.',noExtra:'Artıq hərf qalmayıb.',hintWait:'İpucu serverdən alınır…',locked:n=>'Əvvəlcə '+n+'-ci səviyyəni keç.',home:'ANA SƏHİFƏ',nextChapter:'NÖVBƏTİ FƏSİL',chapterPassed:n=>n+'-ci fəsil tamamlandı!',chapterUnlocked:n=>n+'-ci fəsil açıldı',newTitle:title=>'Yeni titul: '+title,slot:n=>n+'-ci hərf',image:n=>n+'-ci şəkil',placeFail:'Hərfi yerləşdirmək mümkün olmadı.'}
  };
  const CHAPTER_TITLES={
    ru:{1:'Новичок',2:'Любитель',3:'Знаток',4:'Опытный',5:'Эксперт',6:'Профессионал',7:'Мастер',8:'Виртуоз',9:'Легенда',10:'Мастер слов'},
    en:{1:'Novice',2:'Amateur',3:'Adept',4:'Experienced',5:'Expert',6:'Professional',7:'Master',8:'Virtuoso',9:'Legend',10:'Word Master'},
    az:{1:'Yeni başlayan',2:'Həvəskar',3:'Bilici',4:'Təcrübəli',5:'Ekspert',6:'Peşəkar',7:'Usta',8:'Virtuoz',9:'Əfsanə',10:'Söz ustası'}
  };
  const chapterEarnedTitle=n=>(CHAPTER_TITLES[gameLang]||CHAPTER_TITLES.ru)[n]||'';
  const requested = Number(new URLSearchParams(location.search).get('level') || 1);
  const levelId = LEVELS[requested] ? requested : 1, level = LEVELS[levelId], answer=[...level.answer];
  const tiles=[...level.pool].map((letter,id)=>({id,letter}));
  let order=tiles.map(t=>t.id), selected=Array(answer.length).fill(null), fixed=new Map(), removed=new Set();
  let busy=false, solved=false, textOpen=false, sessionKey=null;

  const ui=GAME_UI[gameLang]||GAME_UI.ru;
  document.documentElement.lang=gameLang;
  const chapterNum=levelId<=20?1:levelId<=50?2:levelId<=90?3:4;
  document.querySelector('.game-head>div b').textContent=ui.chapter(chapterNum);
  $('levelTitle').textContent=(chapterNum===1?ui.warm:chapterNum===2?ui.assoc:chapterNum===3?ui.chapter3:ui.chapter4)+' · '+ui.level(levelId);
  $('textHint').querySelector('b').textContent=ui.textHint;$('hintValue').textContent=ui.tap;
  $('slots').style.gridTemplateColumns='repeat('+answer.length+',1fr)';$('slots').classList.toggle('long-answer',answer.length>=9);
  level.photos.forEach(([emoji],index)=>{const d=document.createElement('div');d.className='photo';d.setAttribute('role','img');d.setAttribute('aria-label',ui.image(index+1));d.textContent=emoji;$('photos').append(d);});

  function shuffle(){
    const previous=order.join(',');
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    if(order.join(',')===previous)order.push(order.shift());
  }
  function save(){if(sessionKey)pw.store.set(sessionKey,{fixed:[...fixed],removed:[...removed],textOpen});}
  function restore(p){
    sessionKey='pw.hints.'+p.photoword_id+'.'+levelId;
    const saved=pw.store.get(sessionKey,{});
    fixed=new Map((saved.fixed||[]).filter(([pos,tile])=>Number.isInteger(pos)&&pos>=0&&pos<answer.length&&tiles[tile]?.letter===answer[pos]));
    removed=new Set((saved.removed||[]).filter(id=>tiles[id]&&!answer.includes(tiles[id].letter)));
    textOpen=saved.textOpen===true;
    selected=Array(answer.length).fill(null);
    for(const [pos,tile] of fixed)selected[pos]=tile;
    paint();
  }
  function paint(){
    const used=new Set(selected.filter(id=>id!==null));
    $('slots').replaceChildren();$('letters').replaceChildren();
    answer.forEach((_,pos)=>{
      const b=document.createElement('button');b.type='button';b.className='slot'+(fixed.has(pos)?' fixed':'');
      b.textContent=tiles[selected[pos]]?.letter||'';b.disabled=busy||solved||fixed.has(pos);b.setAttribute('aria-label',ui.slot(pos+1));
      b.onclick=()=>{selected[pos]=null;paint();};$('slots').append(b);
    });
    order.forEach(id=>{
      const b=document.createElement('button');b.type='button';b.className='letter'+(used.has(id)?' used':'')+(removed.has(id)?' removed':'');
      b.dataset.tile=id;b.textContent=tiles[id].letter;b.disabled=busy||solved||used.has(id)||removed.has(id);b.onclick=()=>choose(id);$('letters').append(b);
    });
    ['letterHint','removeHint','textHint','shuffle'].forEach(id=>$(id).disabled=busy||solved);
    if(textOpen)$('hintValue').textContent=level.hint;
  }
  function clearInput(){selected=Array(answer.length).fill(null);for(const [pos,id] of fixed)selected[pos]=id;}
  function showSuccess(rewarded){
    $('status').hidden=true;
    $('successPanel').hidden=false;
    $('successTitle').textContent=ui.passed(levelId);
    $('successReward').textContent=rewarded?ui.reward:ui.already;
    const next=$('nextLevel'),chapterNote=$('successChapter');
    if(chapterNote){chapterNote.hidden=true;chapterNote.textContent='';}
    if(levelId===20){if(chapterNote){chapterNote.hidden=false;chapterNote.textContent=ui.chapterPassed(1)+' '+ui.newTitle(chapterEarnedTitle(1))+'. '+ui.chapterUnlocked(2)+'.';}next.href='./game.html?level=21';next.innerHTML=ui.nextChapter+' <span>▶</span>';}
    else if(levelId===50){if(chapterNote){chapterNote.hidden=false;chapterNote.textContent=ui.chapterPassed(2)+' '+ui.newTitle(chapterEarnedTitle(2))+'. '+ui.chapterUnlocked(3)+'.';}next.href='./game.html?level=51';next.innerHTML=ui.nextChapter+' <span>▶</span>';}
    else if(levelId===90){if(chapterNote){chapterNote.hidden=false;chapterNote.textContent=ui.chapterPassed(3)+' '+ui.newTitle(chapterEarnedTitle(3))+'. '+ui.chapterUnlocked(4)+'.';}next.href='./game.html?level=91';next.innerHTML=ui.nextChapter+' <span>▶</span>';}
    else if(levelId<100){next.href='./game.html?level='+(levelId+1);next.innerHTML=ui.next+' <span>▶</span>';}
    else{next.href='./index.html';next.innerHTML=ui.home+' <span>✓</span>';}
  }
  async function check(){
    if(selected.some(id=>id===null))return;
    busy=true;paint();
    const word=selected.map(id=>tiles[id].letter).join('');
    if(word!==level.answer){
      track('wrong_answer',{levelId,chapterId:chapterNum});pw.status(ui.wrong);$('slots').classList.add('wrong');
      setTimeout(()=>{clearInput();busy=false;$('slots').classList.remove('wrong');paint();},700);
      pw.sfx('error');pw.haptic('error');return;
    }
    pw.status(ui.checking);
    try{
      await pw.login();
      const previous=pw.player?.completed_levels??0;
      const p=await pw.api('complete_level',{levelId,answer:word});
      solved=true;track('level_complete',{levelId,chapterId:chapterNum});pw.sfx('success');pw.haptic('success');showSuccess(p.completed_levels>previous);
    }catch(e){pw.status(e.message);clearInput();}
    finally{busy=false;paint();}
  }
  function choose(id){if(busy||solved)return;const pos=selected.indexOf(null);if(pos<0)return;pw.sfx('tap');pw.haptic();selected[pos]=id;paint();check();}
  async function hint(type){
    if(busy||solved)return;
    if(type==='text'&&textOpen){pw.status(ui.textOpened);return;}
    const available=answer.map((_,i)=>i).filter(i=>!fixed.has(i));
    const bad=tiles.filter(t=>!answer.includes(t.letter)&&!removed.has(t.id));
    if(type==='letter'&&!available.length){pw.status(ui.allLetters);return;}
    if(type==='remove'&&!bad.length){pw.status(ui.noExtra);return;}
    busy=true;paint();pw.status(ui.hintWait);
    try{
      await pw.login();
      const p=await pw.api('use_hint',{hintType:type,levelId});
      if(!sessionKey)sessionKey='pw.hints.'+p.photoword_id+'.'+levelId;
      if(type==='letter'){
        const pos=available[Math.floor(Math.random()*available.length)], reserved=new Set(fixed.values());
        const tile=tiles.find(t=>t.letter===answer[pos]&&!reserved.has(t.id));if(!tile)throw new Error(ui.placeFail);
        selected=selected.map(id=>id===tile.id?null:id);selected[pos]=tile.id;fixed.set(pos,tile.id);pw.status(ui.letter);
      }else if(type==='remove'){
        bad.slice(0,3).forEach(t=>{removed.add(t.id);selected=selected.map(id=>id===t.id?null:id);});pw.status(ui.remove);
      }else{textOpen=true;pw.status(ui.text);}
      save();track('hint_use',{levelId,chapterId:chapterNum,metadata:{type}});pw.sfx('hint');pw.haptic();
    }catch(e){pw.status(e.message);}
    finally{busy=false;paint();}
    if(selected.every(id=>id!==null))check();
  }
  $('shuffle').onclick=()=>{if(busy)return;shuffle();paint();pw.status(ui.shuffle);pw.sfx('tap');pw.haptic();};
  $('letterHint').onclick=()=>hint('letter');$('removeHint').onclick=()=>hint('remove');$('textHint').onclick=()=>hint('text');
  shuffle();paint();
  pw.login().then(p=>{
    if(levelId>(p.current_level??1)){pw.status(ui.locked(p.current_level??1));busy=true;paint();return;}
    restore(p);track('level_open',{levelId,chapterId:chapterNum});pw.status(ui.sync);
  }).catch(e=>pw.status(e.message));
})();