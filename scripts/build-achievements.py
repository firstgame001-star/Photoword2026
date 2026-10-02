from pathlib import Path
import json
rows=[]
def add(id,cat,metric,target,reward,icon,title,description):
 rows.append(dict(id=id,category=cat,metric=metric,target=target,reward_coins=reward,icon=icon,title=dict(zip(['ru','en','az'],title)),description=dict(zip(['ru','en','az'],description))))
for n,r in [(10,15),(50,25),(150,50),(500,150)]:add(f'main_{n}','main','main',n,r,'🧩',[f'{n} уровней позади',f'{n} levels completed',f'{n} səviyyə tamamlandı'],[f'Впервые пройди {n} разных основных уровней.',f'Complete {n} different main levels for the first time.',f'{n} fərqli əsas səviyyəni ilk dəfə keç.'])
for n,r in [(5,10),(20,20),(40,30),(50,40)]:add(f'nohint_{n}','main','nohint',n,r,'💡',[f'Без помощи · {n}',f'Without hints · {n}',f'İpucusuz · {n}'],[f'Впервые пройди {n} основных уровней без платных подсказок. Перемешивание разрешено.',f'First-complete {n} main levels without paid hints. Shuffling is allowed.',f'{n} əsas səviyyəni ilk dəfə ödənişli ipucusuz keç. Qarışdırmaq olar.'])
for i,end in enumerate([20,50,90,130,180,230,280,330,380,430,480,530],1):add(f'chapter_{i}','main',f'chapter_{i}',1,10 if i<5 else 20,'📚',[f'Глава {i} завершена',f'Chapter {i} completed',f'{i}-ci fəsil tamamlandı'],[f'Пройди все уровни главы {i}.',f'Complete every level in chapter {i}.',f'{i}-ci fəslin bütün səviyyələrini keç.'])
for n,r in [(1,10),(5,15),(10,25),(25,40),(50,75)]:add(f'duel_win_{n}','duels','duel_wins',n,r,'⚔️',['Первая победа' if n==1 else f'{n} побед в дуэлях','First victory' if n==1 else f'{n} duel wins','İlk qələbə' if n==1 else f'{n} duel qələbəsi'],[f'Выиграй {n} завершённых дуэлей.',f'Win {n} settled duels.',f'{n} tamamlanmış dueldə qalib gəl.'])
add('duel_draw','duels','duel_draws',1,10,'🤝',['Достойный соперник','Worthy opponent','Layiqli rəqib'],['Заверши дуэль вничью. Отменённые комнаты не считаются.','Finish a duel in a draw. Cancelled rooms do not count.','Dueli heç-heçə bitir. Ləğv edilən otaqlar sayılmır.'])
for n,r in [(10,15),(50,40)]:add(f'duel_play_{n}','duels','duel_played',n,r,'🎮',[f'{n} дуэлей',f'{n} duels',f'{n} duel'],[f'Сыграй {n} дуэлей до завершения.',f'Finish {n} duels.',f'{n} dueli sona çatdır.'])
for n,r in [(5,15),(10,30)]:add(f'duel_score_{n}','duels','duel_best',n,r,'🎯',[f'Точный ответ · {n}',f'Sharp mind · {n}',f'Dəqiq cavab · {n}'],[f'Набери {n} очков в одной завершённой дуэли.',f'Score {n} points in one settled duel.',f'Bir tamamlanmış dueldə {n} xal topla.'])
for n,r in [(5,15),(10,25),(20,40),(30,60),(45,80),(60,100),(75,125),(90,150)]:add(f'daily_streak_{n}','daily','daily_streak',n,r,'☀️',[f'{n} дней подряд',f'{n} days in a row',f'{n} gün ardıcıl'],[f'Решай загадку дня {n} дней подряд. Учитывается лучшая серия.',f'Solve the daily puzzle {n} consecutive days. Your best streak counts.',f'Günün tapmacasını {n} gün ardıcıl həll et. Ən yaxşı seriya sayılır.'])
for n,r in [(1,10),(30,30),(100,75)]:add(f'daily_total_{n}','daily','daily_total',n,r,'📅',[f'Загадки дня · {n}',f'Daily puzzles · {n}',f'Günün tapmacaları · {n}'],[f'Реши загадку дня в {n} разных днях.',f'Solve the daily puzzle on {n} different days.',f'{n} fərqli gündə günün tapmacasını həll et.'])
for n,r in [(1,10),(10,25)]:add(f'daily_first_{n}','daily','daily_first',n,r,'✨',[f'С первой попытки · {n}',f'First try · {n}',f'İlk cəhddən · {n}'],[f'В {n} разных днях реши загадку с первой попытки.',f'Solve the daily puzzle on the first attempt on {n} different days.',f'{n} fərqli gündə tapmacanı ilk cəhddən həll et.'])
themes={'sport':('⚽','Спорт','Sport','İdman'),'art':('🎨','Искусство','Art','İncəsənət'),'professions':('🧑‍💼','Профессии','Professions','Peşələr'),'travel':('🌍','Путешествия','Travel','Səyahət'),'science':('🔬','Наука','Science','Elm'),'technology':('💻','Технологии','Technology','Texnologiya'),'cinema':('🎬','Кино','Cinema','Kino'),'food':('🍽️','Еда','Food','Yemək'),'animals':('🐾','Животные','Animals','Heyvanlar'),'transport':('🚗','Транспорт','Transport','Nəqliyyat'),'home':('🏠','Дом и быт','Home','Ev və məişət'),'nature':('🌿','Природа','Nature','Təbiət')}
for id,(icon,ru,en,az) in themes.items():add(f'theme_{id}','themes',f'theme_{id}',100,30,icon,[f'Знаток: {ru}',f'Expert: {en}',f'Bilici: {az}'],[f'Пройди все 100 уровней раздела «{ru}».',f'Complete all 100 levels in {en}.',f'«{az}» bölməsinin 100 səviyyəsini keç.'])
for n,r in [(1,15),(3,30),(6,60),(12,120)]:add(f'collector_{n}','themes','themes_complete',n,r,'🏅',['Коллекционер' if n==1 else f'Коллекционер · {n}','Collector' if n==1 else f'Collector · {n}','Kolleksiyaçı' if n==1 else f'Kolleksiyaçı · {n}'],[f'Полностью заверши {n} тематических разделов.',f'Fully complete {n} themes.',f'{n} mövzu bölməsini tam bitir.'])
for n,r in [(1,10),(10,20),(50,50)]:add(f'challenge_runs_{n}','challenges','challenge_runs',n,r,'⚡',[f'Испытатель · {n}',f'Challenger · {n}',f'Sınaqçı · {n}'],[f'Заверши {n} результативных испытаний с наградой.',f'Finish {n} qualifying rewarded challenge runs.',f'{n} mükafatlı nəticəli sınağı tamamla.'])
for n,r in [(5,15),(10,30)]:add(f'challenge_streak_{n}','challenges','challenge_streak',n,r,'🔥',[f'Серия ответов · {n}',f'Answer streak · {n}',f'Cavab seriyası · {n}'],[f'Собери серию из {n} правильных ответов в одном завершённом испытании.',f'Reach a streak of {n} correct answers in a finished challenge.',f'Tamamlanmış bir sınaqda {n} düzgün cavab seriyası qur.'])
for n,r in [(10,20),(20,40)]:add(f'blitz_{n}','challenges','blitz_best',n,r,'⏱️',[f'Мастер блица · {n}',f'Blitz master · {n}',f'Blits ustası · {n}'],[f'Набери {n} очков за один завершённый блиц.',f'Score {n} points in a finished Blitz run.',f'Tamamlanmış bir blitsdə {n} xal topla.'])
# Additional tiers keep every original ID and catalog position unchanged.
for n,r in [(20,15),(100,35),(250,75),(400,100)]:add(f'main_{n}','main','main',n,r,'🧩',[f'{n} уровней позади',f'{n} levels completed',f'{n} səviyyə tamamlandı'],[f'Впервые пройди {n} разных основных уровней.',f'Complete {n} different main levels for the first time.',f'{n} fərqli əsas səviyyəni ilk dəfə keç.'])
for n,r in [(100,60),(150,80),(200,100)]:add(f'nohint_{n}','main','nohint',n,r,'💡',[f'Без помощи · {n}',f'Without hints · {n}',f'İpucusuz · {n}'],[f'Впервые пройди {n} основных уровней без платных подсказок. Перемешивание разрешено.',f'First-complete {n} main levels without paid hints. Shuffling is allowed.',f'{n} əsas səviyyəni ilk dəfə ödənişli ipucusuz keç. Qarışdırmaq olar.'])
for n,r in [(75,90),(100,100),(200,150)]:add(f'duel_win_{n}','duels','duel_wins',n,r,'⚔️',[f'{n} побед в дуэлях',f'{n} duel wins',f'{n} duel qələbəsi'],[f'Выиграй {n} завершённых дуэлей.',f'Win {n} settled duels.',f'{n} tamamlanmış dueldə qalib gəl.'])
for n,r in [(1,10),(25,25),(100,60),(200,100)]:add(f'duel_play_{n}','duels','duel_played',n,r,'🎮',[f'{n} дуэлей',f'{n} duels',f'{n} duel'],[f'Сыграй {n} дуэлей до завершения.',f'Finish {n} duels.',f'{n} dueli sona çatdır.'])
for n,r in [(5,15),(10,20),(25,35)]:add(f'duel_draw_{n}','duels','duel_draws',n,r,'🤝',[f'Равные силы · {n}',f'Evenly matched · {n}',f'Bərabər güc · {n}'],[f'Заверши {n} дуэлей вничью. Отменённые комнаты не считаются.',f'Finish {n} duels in a draw. Cancelled rooms do not count.',f'{n} dueli heç-heçə bitir. Ləğv edilən otaqlar sayılmır.'])
for n,r in [(15,45),(20,60)]:add(f'duel_score_{n}','duels','duel_best',n,r,'🎯',[f'Точный ответ · {n}',f'Sharp mind · {n}',f'Dəqiq cavab · {n}'],[f'Набери {n} очков в одной завершённой дуэли.',f'Score {n} points in one settled duel.',f'Bir tamamlanmış dueldə {n} xal topla.'])
for n,r in [(5,15),(10,20),(60,50),(150,90),(200,110),(300,140),(365,175)]:add(f'daily_total_{n}','daily','daily_total',n,r,'📅',[f'Загадки дня · {n}',f'Daily puzzles · {n}',f'Günün tapmacaları · {n}'],[f'Реши загадку дня в {n} разных днях.',f'Solve the daily puzzle on {n} different days.',f'{n} fərqli gündə günün tapmacasını həll et.'])
for n,r in [(25,40),(50,60),(100,100)]:add(f'daily_first_{n}','daily','daily_first',n,r,'✨',[f'С первой попытки · {n}',f'First try · {n}',f'İlk cəhddən · {n}'],[f'В {n} разных днях реши загадку с первой попытки.',f'Solve the daily puzzle on the first attempt on {n} different days.',f'{n} fərqli gündə tapmacanı ilk cəhddən həll et.'])
for n,r in [(100,20),(300,40),(600,70),(1000,120)]:add(f'themes_levels_{n}','themes','theme_total',n,r,'🗂️',[f'Исследователь тем · {n}',f'Theme explorer · {n}',f'Mövzu araşdırıcısı · {n}'],[f'Впервые пройди {n} разных тематических уровней суммарно во всех разделах.',f'First-complete {n} different themed levels across all categories.',f'Bütün bölmələr üzrə {n} fərqli mövzu səviyyəsini ilk dəfə keç.'])
add('collector_9','themes','themes_complete',9,90,'🏅',['Коллекционер · 9','Collector · 9','Kolleksiyaçı · 9'],['Полностью заверши 9 тематических разделов.','Fully complete 9 themes.','9 mövzu bölməsini tam bitir.'])
# Keep the server catalogue and generated client-test data aligned with migration 20261002162207.
rows.extend(json.loads(r'''[
  {
    "id": "main_600",
    "category": "main",
    "metric": "main",
    "target": 600,
    "reward_coins": 100,
    "icon": "🏁",
    "title": {
      "ru": "600 уровней пройдено",
      "en": "600 levels completed",
      "az": "600 səviyyə tamamlandı"
    },
    "description": {
      "ru": "Впервые пройди 600 разных основных уровней.",
      "en": "First-complete 600 different main levels.",
      "az": "600 fərqli əsas səviyyəni ilk dəfə keç."
    }
  },
  {
    "id": "main_680",
    "category": "main",
    "metric": "main",
    "target": 680,
    "reward_coins": 150,
    "icon": "🏆",
    "title": {
      "ru": "Путь до конца",
      "en": "The whole journey",
      "az": "Sonadək yol"
    },
    "description": {
      "ru": "Пройди все 680 основных уровней.",
      "en": "Complete all 680 main levels.",
      "az": "680 əsas səviyyənin hamısını keç."
    }
  },
  {
    "id": "nohint_300",
    "category": "main",
    "metric": "nohint",
    "target": 300,
    "reward_coins": 100,
    "icon": "🧠",
    "title": {
      "ru": "Без помощи · 300",
      "en": "Without hints · 300",
      "az": "İpucusuz · 300"
    },
    "description": {
      "ru": "Впервые пройди 300 основных уровней без платных подсказок. Перемешивание разрешено.",
      "en": "First-complete 300 main levels without paid hints. Shuffling is allowed.",
      "az": "300 əsas səviyyəni ödənişli ipucusuz ilk dəfə keç. Hərfləri qarışdırmaq olar."
    }
  },
  {
    "id": "nohint_500",
    "category": "main",
    "metric": "nohint",
    "target": 500,
    "reward_coins": 150,
    "icon": "🧠",
    "title": {
      "ru": "Без помощи · 500",
      "en": "Without hints · 500",
      "az": "İpucusuz · 500"
    },
    "description": {
      "ru": "Впервые пройди 500 основных уровней без платных подсказок. Перемешивание разрешено.",
      "en": "First-complete 500 main levels without paid hints. Shuffling is allowed.",
      "az": "500 əsas səviyyəni ödənişli ipucusuz ilk dəfə keç. Hərfləri qarışdırmaq olar."
    }
  },
  {
    "id": "nohint_680",
    "category": "main",
    "metric": "nohint",
    "target": 680,
    "reward_coins": 200,
    "icon": "🧠",
    "title": {
      "ru": "Мастер без подсказок",
      "en": "No-hint master",
      "az": "İpucusuz usta"
    },
    "description": {
      "ru": "Пройди все 680 основных уровней без платных подсказок. Перемешивание разрешено.",
      "en": "Complete all 680 main levels without paid hints. Shuffling is allowed.",
      "az": "680 əsas səviyyənin hamısını ödənişli ipucusuz keç. Hərfləri qarışdırmaq olar."
    }
  },
  {
    "id": "chapter_13",
    "category": "main",
    "metric": "chapter_13",
    "target": 1,
    "reward_coins": 35,
    "icon": "📚",
    "title": {
      "ru": "Глава 13 завершена",
      "en": "Chapter 13 completed",
      "az": "13-cü fəsil tamamlandı"
    },
    "description": {
      "ru": "Пройди все уровни главы 13: 531–580.",
      "en": "Complete every level in chapter 13: 531–580.",
      "az": "13-cü fəslin bütün səviyyələrini keç: 531–580."
    }
  },
  {
    "id": "chapter_14",
    "category": "main",
    "metric": "chapter_14",
    "target": 1,
    "reward_coins": 40,
    "icon": "📚",
    "title": {
      "ru": "Глава 14 завершена",
      "en": "Chapter 14 completed",
      "az": "14-cü fəsil tamamlandı"
    },
    "description": {
      "ru": "Пройди все уровни главы 14: 581–630.",
      "en": "Complete every level in chapter 14: 581–630.",
      "az": "14-cü fəslin bütün səviyyələrini keç: 581–630."
    }
  },
  {
    "id": "chapter_15",
    "category": "main",
    "metric": "chapter_15",
    "target": 1,
    "reward_coins": 50,
    "icon": "📚",
    "title": {
      "ru": "Глава 15 завершена",
      "en": "Chapter 15 completed",
      "az": "15-ci fəsil tamamlandı"
    },
    "description": {
      "ru": "Пройди все уровни главы 15: 631–680.",
      "en": "Complete every level in chapter 15: 631–680.",
      "az": "15-ci fəslin bütün səviyyələrini keç: 631–680."
    }
  },
  {
    "id": "daily_streak_120",
    "category": "daily",
    "metric": "daily_streak",
    "target": 120,
    "reward_coins": 200,
    "icon": "☀️",
    "title": {
      "ru": "120 дней подряд",
      "en": "120 days in a row",
      "az": "120 gün ardıcıl"
    },
    "description": {
      "ru": "Решай загадку дня 120 дней подряд. Учитывается лучшая серия.",
      "en": "Solve the daily puzzle 120 consecutive days. Your best streak counts.",
      "az": "Günün tapmacasını 120 gün ardıcıl həll et. Ən yaxşı seriya sayılır."
    }
  },
  {
    "id": "daily_first_150",
    "category": "daily",
    "metric": "daily_first",
    "target": 150,
    "reward_coins": 100,
    "icon": "✨",
    "title": {
      "ru": "С первой попытки · 150",
      "en": "First try · 150",
      "az": "İlk cəhddən · 150"
    },
    "description": {
      "ru": "Реши 150 разных загадок дня с первой попытки.",
      "en": "Solve 150 different daily puzzles on the first try.",
      "az": "150 fərqli günün tapmacasını ilk cəhddən həll et."
    }
  },
  {
    "id": "duel_win_300",
    "category": "duels",
    "metric": "duel_wins",
    "target": 300,
    "reward_coins": 200,
    "icon": "⚔️",
    "title": {
      "ru": "300 побед в дуэлях",
      "en": "300 duel wins",
      "az": "300 duel qələbəsi"
    },
    "description": {
      "ru": "Выиграй 300 завершённых дуэлей.",
      "en": "Win 300 settled duels.",
      "az": "300 tamamlanmış dueldə qalib gəl."
    }
  },
  {
    "id": "duel_play_300",
    "category": "duels",
    "metric": "duel_played",
    "target": 300,
    "reward_coins": 100,
    "icon": "🎮",
    "title": {
      "ru": "300 дуэлей",
      "en": "300 duels",
      "az": "300 duel"
    },
    "description": {
      "ru": "Сыграй 300 дуэлей до завершения.",
      "en": "Finish 300 duels.",
      "az": "300 dueli sona çatdır."
    }
  },
  {
    "id": "duel_play_500",
    "category": "duels",
    "metric": "duel_played",
    "target": 500,
    "reward_coins": 150,
    "icon": "🎮",
    "title": {
      "ru": "500 дуэлей",
      "en": "500 duels",
      "az": "500 duel"
    },
    "description": {
      "ru": "Сыграй 500 дуэлей до завершения.",
      "en": "Finish 500 duels.",
      "az": "500 dueli sona çatdır."
    }
  },
  {
    "id": "duel_draw_50",
    "category": "duels",
    "metric": "duel_draws",
    "target": 50,
    "reward_coins": 80,
    "icon": "🤝",
    "title": {
      "ru": "50 ничьих",
      "en": "50 draws",
      "az": "50 heç-heçə"
    },
    "description": {
      "ru": "Заверши 50 дуэлей вничью. Отменённые комнаты не считаются.",
      "en": "Finish 50 duels in a draw. Cancelled rooms do not count.",
      "az": "50 dueli heç-heçə bitir. Ləğv edilən otaqlar sayılmır."
    }
  },
  {
    "id": "duel_score_25",
    "category": "duels",
    "metric": "duel_best",
    "target": 25,
    "reward_coins": 100,
    "icon": "🎯",
    "title": {
      "ru": "Точный ответ · 25",
      "en": "Sharp mind · 25",
      "az": "Dəqiq cavab · 25"
    },
    "description": {
      "ru": "Набери 25 очков в одной завершённой дуэли.",
      "en": "Score 25 points in one settled duel.",
      "az": "Bir tamamlanmış dueldə 25 xal topla."
    }
  },
  {
    "id": "challenge_runs_100",
    "category": "challenges",
    "metric": "challenge_runs",
    "target": 100,
    "reward_coins": 100,
    "icon": "🎟️",
    "title": {
      "ru": "100 наградных испытаний",
      "en": "100 rewarded challenges",
      "az": "100 mükafatlı sınaq"
    },
    "description": {
      "ru": "Заверши 100 испытаний, за которые сервер начислил награду.",
      "en": "Complete 100 challenge runs that receive a server reward.",
      "az": "Server mükafatı verilən 100 sınağı tamamla."
    }
  },
  {
    "id": "challenge_runs_200",
    "category": "challenges",
    "metric": "challenge_runs",
    "target": 200,
    "reward_coins": 150,
    "icon": "🎟️",
    "title": {
      "ru": "200 наградных испытаний",
      "en": "200 rewarded challenges",
      "az": "200 mükafatlı sınaq"
    },
    "description": {
      "ru": "Заверши 200 испытаний, за которые сервер начислил награду.",
      "en": "Complete 200 challenge runs that receive a server reward.",
      "az": "Server mükafatı verilən 200 sınağı tamamla."
    }
  },
  {
    "id": "challenge_streak_20",
    "category": "challenges",
    "metric": "challenge_streak",
    "target": 20,
    "reward_coins": 80,
    "icon": "🔥",
    "title": {
      "ru": "Серия · 20",
      "en": "Streak · 20",
      "az": "Seriya · 20"
    },
    "description": {
      "ru": "Собери серию из 20 правильных ответов в одном завершённом испытании.",
      "en": "Reach a streak of 20 correct answers in a finished challenge.",
      "az": "Tamamlanmış bir sınaqda 20 düzgün cavab seriyası qur."
    }
  },
  {
    "id": "blitz_30",
    "category": "challenges",
    "metric": "blitz_best",
    "target": 30,
    "reward_coins": 80,
    "icon": "⚡",
    "title": {
      "ru": "Блиц · 30 очков",
      "en": "Blitz · 30 points",
      "az": "Blits · 30 xal"
    },
    "description": {
      "ru": "Набери 30 очков за один раунд «Блица».",
      "en": "Score 30 points in one Blitz run.",
      "az": "Bir Blits oyununda 30 xal topla."
    }
  },
  {
    "id": "theme_levels_1200",
    "category": "themes",
    "metric": "theme_total",
    "target": 1200,
    "reward_coins": 150,
    "icon": "🌍",
    "title": {
      "ru": "Все темы пройдены",
      "en": "All themes explored",
      "az": "Bütün mövzular tamamlandı"
    },
    "description": {
      "ru": "Пройди все 1200 тематических уровней во всех 12 разделах.",
      "en": "Complete all 1,200 themed levels across all 12 categories.",
      "az": "12 bölmədəki 1 200 mövzu səviyyəsinin hamısını keç."
    }
  }
]'''))
Path('server/achievements/catalog.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(len(rows),'achievements, total rewards',sum(x['reward_coins'] for x in rows))
