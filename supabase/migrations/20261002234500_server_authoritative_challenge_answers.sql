
alter table public.challenge_runs
  add column if not exists language text not null default 'ru',
  add column if not exists best_streak integer not null default 0,
  add column if not exists mistakes integer not null default 0,
  add column if not exists blitz_adjustment_seconds integer not null default 0,
  add column if not exists last_answer_at timestamptz;

create table if not exists public.challenge_question_answers(
 question_id integer primary key references public.challenge_question_catalog(question_id) on delete cascade,
 answer_ru text not null, answer_en text not null, answer_az text not null
);
insert into public.challenge_question_answers(question_id,answer_ru,answer_en,answer_az) values
(100,'ГОЛ','GOAL','QOL'),
(101,'МАТЧ','MATCH','MATÇ'),
(102,'ТРЕНЕР','COACH','MƏŞQÇİ'),
(103,'СТАДИОН','STADIUM','STADİON'),
(104,'РЕКОРД','RECORD','REKORD'),
(105,'МЕДАЛЬ','MEDAL','MEDAL'),
(106,'КОМАНДА','TEAM','KOMANDA'),
(107,'СУДЬЯ','REFEREE','HAKİM'),
(108,'РАКЕТКА','RACKET','RAKETKA'),
(109,'ЛЫЖИ','SKIS','XİZƏK'),
(110,'ШЛЕМ','HELMET','DƏBİLQƏ'),
(111,'ЭСТАФЕТА','RELAY','ESTAFET'),
(112,'ФИНИШ','FINISH','FİNİŞ'),
(113,'СЕТКА','MESH','TOR'),
(114,'ПОДАЧА','SERVE','SERVİS'),
(115,'ТАЙМ','HALF','HİSSƏ'),
(116,'ПРЫЖОК','JUMP','TULLANMA'),
(117,'СКОРОСТЬ','SPEED','SÜRƏT'),
(118,'ПОБЕДА','VICTORY','QƏLƏBƏ'),
(119,'ЧЕМПИОН','CHAMPION','ÇEMPİON'),
(120,'БОКС','BOXING','BOKS'),
(121,'БАСКЕТБОЛ','BASKETBALL','BASKETBOL'),
(122,'ВОЛЕЙБОЛ','VOLLEYBALL','VOLEYBOL'),
(123,'ПЛАВАНИЕ','SWIMMING','ÜZGÜÇÜLÜK'),
(124,'ГОНКА','RACE','YARIŞ'),
(125,'ПЕНАЛЬТИ','PENALTY','PENALTİ'),
(126,'ДРИБЛИНГ','DRIBBLE','DRİBLİNQ'),
(127,'БАССЕЙН','POOL','HOVUZ'),
(128,'РИНГ','RING','RİNQ'),
(129,'ТАБЛО','SCOREBOARD','TABLO'),
(130,'КУБОК','TROPHY','KUBOK'),
(131,'ФОРМА','UNIFORM','FORMA'),
(132,'РАЗМИНКА','WARMUP','İSİNMƏ'),
(133,'ТРИБУНА','STANDS','TRİBUNA'),
(134,'ТУРНИР','TOURNAMENT','TURNİR'),
(135,'ВРАТАРЬ','GOALKEEPER','QAPIÇI'),
(136,'ЗАЩИТА','DEFENSE','MÜDAFİƏ'),
(137,'АТАКА','ATTACK','HÜCUM'),
(138,'ПАС','PASS','ÖTÜRMƏ'),
(139,'НОКАУТ','KNOCKOUT','NOKAUT'),
(140,'МАРАФОН','MARATHON','MARAFON'),
(141,'СПРИНТ','SPRINT','SPRİNT'),
(142,'ФИТНЕС','FITNESS','FİTNES'),
(143,'ГАНТЕЛЬ','DUMBBELL','QANTEL'),
(144,'ШТАНГА','BARBELL','ŞTANQ'),
(145,'БАРЬЕР','HURDLE','MANEƏ'),
(146,'СВИСТОК','WHISTLE','FİT'),
(147,'ДИСТАНЦИЯ','DISTANCE','MƏSAFƏ'),
(148,'ТАКТИКА','TACTICS','TAKTİKA'),
(149,'СЕКУНДОМЕР','STOPWATCH','SANİYƏÖLÇƏN'),
(150,'ФУТБОЛ','FOOTBALL','FUTBOL'),
(151,'ТЕННИС','TENNIS','TENNİS'),
(152,'ХОККЕЙ','HOCKEY','HOKEY'),
(153,'ГОЛЬФ','GOLF','QOLF'),
(154,'БЕЙСБОЛ','BASEBALL','BEYSBOL'),
(155,'РЕГБИ','RUGBY','REQBİ'),
(156,'БОРЬБА','WRESTLING','GÜLƏŞ'),
(157,'ДЗЮДО','JUDO','CÜDO'),
(158,'КАРАТЭ','KARATE','KARATE'),
(159,'ФЕХТОВАНИЕ','FENCING','QILINCOYNATMA'),
(160,'ГИМНАСТИКА','GYMNASTICS','GİMNASTİKA'),
(161,'АКРОБАТИКА','ACROBATICS','AKROBATİKA'),
(162,'БИАТЛОН','BIATHLON','BİATLON'),
(163,'СКЕЙТ','SKATE','SKEYT'),
(164,'СЕРФИНГ','SURFING','SÖRFİNQ'),
(165,'ГРЕБЛЯ','ROWING','AVARÇƏKMƏ'),
(166,'ЯХТИНГ','SAILING','YELKƏN'),
(167,'ВЕЛОСПОРТ','CYCLING','VELOSİPED'),
(168,'ТРИАТЛОН','TRIATHLON','TRİATLON'),
(169,'АЛЬПИНИЗМ','CLIMBING','ALPİNİZM'),
(170,'СТРЕЛЬБА','SHOOTING','ATICILIQ'),
(171,'МИШЕНЬ','TARGET','HƏDƏF'),
(172,'КЛЮШКА','STICK','ÇUBUQ'),
(173,'ШАЙБА','PUCK','ŞAYBA'),
(174,'КОРТ','COURT','KORT'),
(175,'ДОРОЖКА','LANE','ZOLAQ'),
(176,'СЕКТОР','SECTOR','SEKTOR'),
(177,'РАУНД','ROUND','RAUND'),
(178,'СЕТ','SET','SET'),
(179,'ПЕРИОД','PERIOD','PERİOD'),
(180,'ОВЕРТАЙМ','OVERTIME','ƏLAVƏVAXT'),
(181,'РЕЗУЛЬТАТ','RESULT','NƏTİCƏ'),
(182,'СЧЕТ','SCORE','HESAB'),
(183,'НИЧЬЯ','DRAW','BƏRABƏRLİK'),
(184,'ФОЛ','FOUL','FOL'),
(185,'ОФСАЙД','OFFSIDE','OFSAYD'),
(186,'УГЛОВОЙ','CORNER','KÜNC'),
(187,'СТАРТ','START','START'),
(188,'ОТБОР','QUALIFIER','SEÇİM'),
(189,'ЛИГА','LEAGUE','LİQA'),
(190,'ДИВИЗИОН','DIVISION','DİVİZİON'),
(191,'СЕЗОН','SEASON','MÖVSÜM'),
(192,'ПЛЕЙОФФ','PLAYOFF','PLEYOFF'),
(193,'ФИНАЛ','FINAL','FİNAL'),
(194,'ПОЛУФИНАЛ','SEMIFINAL','YARIMFİNAL'),
(195,'КАПИТАН','CAPTAIN','KAPİTAN'),
(196,'БОЛЕЛЬЩИК','FAN','AZARKEŞ'),
(197,'ЭКИПИРОВКА','EQUIPMENT','AVADANLIQ'),
(198,'ТРЕНИРОВКА','TRAINING','MƏŞQ'),
(199,'ОЛИМПИАДА','OLYMPICS','OLİMPİADA'),
(200,'СТОЛ','TABLE','MASA'),
(201,'СТУЛ','CHAIR','STUL'),
(202,'ДИВАН','SOFA','DİVAN'),
(203,'КРОВАТЬ','BED','ÇARPAYI'),
(204,'ШКАФ','WARDROBE','ŞKAF'),
(205,'ДВЕРЬ','DOOR','QAPI'),
(206,'ОКНО','WINDOW','PƏNCƏRƏ'),
(207,'ЛАМПА','LAMP','LAMPA'),
(208,'ЧАЙНИК','KETTLE','ÇAYDAN'),
(209,'ТАРЕЛКА','PLATE','BOŞQAB'),
(210,'ЛОЖКА','SPOON','QAŞIQ'),
(211,'ВИЛКА','FORK','ÇƏNGƏL'),
(212,'НОЖ','KNIFE','BIÇAQ'),
(213,'ЧАШКА','CUP','FİNCAN'),
(214,'ПОДУШКА','PILLOW','YASTIQ'),
(215,'ОДЕЯЛО','BLANKET','YORĞAN'),
(216,'КОВЕР','CARPET','XALÇA'),
(217,'ПОЛКА','SHELF','RƏF'),
(218,'КРЕСЛО','ARMCHAIR','KRESLO'),
(219,'ХОЛОДИЛЬНИК','FRIDGE','SOYUDUCU'),
(220,'ПЫЛЕСОС','VACUUM','TOZSORAN'),
(221,'УТЮГ','IRON','ÜTÜ'),
(222,'СТИРАЛКА','WASHER','PALTARYUYAN'),
(223,'МИКРОВОЛНОВКА','MICROWAVE','MİKRODALĞA'),
(224,'БУДИЛЬНИК','ALARM','ZƏNGSAATI'),
(225,'ЗОНТ','UMBRELLA','ÇƏTİR'),
(226,'РЮКЗАК','BACKPACK','RÜKZAK'),
(227,'КОШЕЛЕК','WALLET','PULQABI'),
(228,'ОЧКИ','GLASSES','EYNƏK'),
(229,'ПЕРЧАТКИ','GLOVES','ƏLCƏK'),
(230,'ГОРА','MOUNTAIN','DAĞ'),
(231,'РЕКА','RIVER','ÇAY'),
(232,'ОЗЕРО','LAKE','GÖL'),
(233,'ЛЕС','FOREST','MEŞƏ'),
(234,'ДЕРЕВО','TREE','AĞAC'),
(235,'ЦВЕТОК','FLOWER','GÜL'),
(236,'ТРАВА','GRASS','OT'),
(237,'КАМЕНЬ','STONE','DAŞ'),
(238,'ПЕСОК','SAND','QUM'),
(239,'СНЕГ','SNOW','QAR'),
(240,'ЛЕД','ICE','BUZ'),
(241,'ТУМАН','FOG','DUMAN'),
(242,'ВЕТЕР','WIND','KÜLƏK'),
(243,'ГРОМ','THUNDER','GÖYGURULTUSU'),
(244,'МОЛНИЯ','LIGHTNING','ŞİMŞƏK'),
(245,'РАДУГА','RAINBOW','GÖYQURŞAĞI'),
(246,'ЗАКАТ','SUNSET','GÜNBATIMI'),
(247,'РАССВЕТ','DAWN','SÜBH'),
(248,'ОСТРОВ','ISLAND','ADA'),
(249,'ВОДОПАД','WATERFALL','ŞƏLALƏ'),
(250,'ВУЛКАН','VOLCANO','VULKAN'),
(251,'ПЕЩЕРА','CAVE','MAĞARA'),
(252,'ПОЛЕ','FIELD','TARLA'),
(253,'БЕРЕГ','SHORE','SAHİL'),
(254,'НЕБО','SKY','SƏMA'),
(255,'ХЛЕБ','BREAD','ÇÖRƏK'),
(256,'СЫР','CHEESE','PENDİR'),
(257,'МОЛОКО','MILK','SÜD'),
(258,'КОФЕ','COFFEE','QƏHVƏ'),
(259,'СОК','JUICE','ŞİRƏ'),
(260,'СУП','SOUP','ŞORBA'),
(261,'САЛАТ','SALAD','SALAT'),
(262,'ПИЦЦА','PIZZA','PİZZA'),
(263,'БУРГЕР','BURGER','BURGER'),
(264,'ПАСТА','PASTA','MAKARON'),
(265,'РИС','RICE','DÜYÜ'),
(266,'ЯЙЦО','EGG','YUMURTA'),
(267,'ЯБЛОКО','APPLE','ALMA'),
(268,'БАНАН','BANANA','BANAN'),
(269,'АПЕЛЬСИН','ORANGE','PORTAĞAL'),
(270,'ЛИМОН','LEMON','LİMON'),
(271,'ВИНОГРАД','GRAPE','ÜZÜM'),
(272,'АРБУЗ','WATERMELON','QARPIZ'),
(273,'КЛУБНИКА','STRAWBERRY','ÇİYƏLƏK'),
(274,'МОРКОВЬ','CARROT','YERKÖKÜ'),
(275,'КАРТОФЕЛЬ','POTATO','KARTOF'),
(276,'ПОМИДОР','TOMATO','POMİDOR'),
(277,'ОГУРЕЦ','CUCUMBER','XİYAR'),
(278,'ШОКОЛАД','CHOCOLATE','ŞOKOLAD'),
(279,'МОРОЖЕНОЕ','ICECREAM','DONDURMA'),
(280,'ЛЕВ','LION','ŞİR'),
(281,'ТИГР','TIGER','PƏLƏNG'),
(282,'СЛОН','ELEPHANT','FİL'),
(283,'ЖИРАФ','GIRAFFE','ZÜRAFƏ'),
(284,'ЗЕБРА','ZEBRA','ZEBRA'),
(285,'ОБЕЗЬЯНА','MONKEY','MEYMUN'),
(286,'МЕДВЕДЬ','BEAR','AYI'),
(287,'ВОЛК','WOLF','CANAVAR'),
(288,'ЛИСА','FOX','TÜLKÜ'),
(289,'ЗАЯЦ','HARE','DOVŞAN'),
(290,'ОЛЕНЬ','DEER','MARAL'),
(291,'ЛОШАДЬ','HORSE','AT'),
(292,'КОРОВА','COW','İNƏK'),
(293,'ОВЦА','SHEEP','QOYUN'),
(294,'КОЗА','GOAT','KEÇİ'),
(295,'СВИНЬЯ','PIG','DONUZ'),
(296,'КУРИЦА','CHICKEN','TOYUQ'),
(297,'УТКА','DUCK','ÖRDƏK'),
(298,'ОРЕЛ','EAGLE','QARTAL'),
(299,'СОВА','OWL','BAYQUŞ'),
(300,'ПОПУГАЙ','PARROT','TUTUQUŞU'),
(301,'ДЕЛЬФИН','DOLPHIN','DELFİN'),
(302,'КИТ','WHALE','BALİNA'),
(303,'АКУЛА','SHARK','KÖPƏKBALIĞI'),
(304,'ЧЕРЕПАХА','TURTLE','TISBAĞA'),
(305,'ТЕЛЕФОН','PHONE','TELEFON'),
(306,'НОУТБУК','LAPTOP','NOUTBUK'),
(307,'ПЛАНШЕТ','TABLET','PLANŞET'),
(308,'КАМЕРА','CAMERA','KAMERA'),
(309,'НАУШНИКИ','HEADPHONES','QULAQLIQ'),
(310,'КЛАВИАТУРА','KEYBOARD','KLAVİATURA'),
(311,'МЫШЬ','MOUSE','SİÇAN'),
(312,'МОНИТОР','MONITOR','MONİTOR'),
(313,'ПРИНТЕР','PRINTER','PRİNTER'),
(314,'РОБОТ','ROBOT','ROBOT'),
(315,'ДРОН','DRONE','DRON'),
(316,'БАТАРЕЯ','BATTERY','BATAREYA'),
(317,'ЗАРЯДКА','CHARGER','ŞARJ'),
(318,'ИНТЕРНЕТ','INTERNET','İNTERNET'),
(319,'ПАРОЛЬ','PASSWORD','PAROL'),
(320,'ФАЙЛ','FILE','FAYL'),
(321,'ПАПКА','FOLDER','QOVLUQ'),
(322,'ВИДЕО','VIDEO','VİDEO'),
(323,'ФОТО','PHOTO','FOTO'),
(324,'МИКРОФОН','MICROPHONE','MİKROFON'),
(325,'САМОЛЕТ','PLANE','TƏYYARƏ'),
(326,'ПОЕЗД','TRAIN','QATAR'),
(327,'АВТОБУС','BUS','AVTOBUS'),
(328,'ТАКСИ','TAXI','TAKSİ'),
(329,'САМОКАТ','SCOOTER','SAMOKAT'),
(330,'КОРАБЛЬ','SHIP','GƏMİ'),
(331,'ЛОДКА','BOAT','QAYIQ'),
(332,'МЕТРО','METRO','METRO'),
(333,'ВОКЗАЛ','STATION','VAĞZAL'),
(334,'АЭРОПОРТ','AIRPORT','AEROPORT'),
(335,'БИЛЕТ','TICKET','BİLET'),
(336,'ЧЕМОДАН','SUITCASE','ÇAMADAN'),
(337,'КАРТА','MAP','XƏRİTƏ'),
(338,'ОТЕЛЬ','HOTEL','OTEL'),
(339,'ПАСПОРТ','PASSPORT','PASPORT'),
(340,'КИНО','CINEMA','KİNO'),
(341,'МУЗЫКА','MUSIC','MUSİQİ'),
(342,'ПЕСНЯ','SONG','MAHNI'),
(343,'ТАНЕЦ','DANCE','RƏQS'),
(344,'КНИГА','BOOK','KİTAB'),
(345,'ТЕАТР','THEATER','TEATR'),
(346,'ФИЛЬМ','FILM','FİLM'),
(347,'АКТЕР','ACTOR','AKTYOR'),
(348,'ГИТАРА','GUITAR','GİTARA'),
(349,'ПИАНИНО','PIANO','PİANİNO'),
(350,'ДОКТОР','DOCTOR','HƏKİM'),
(351,'УЧИТЕЛЬ','TEACHER','MÜƏLLİM'),
(352,'ПОВАР','CHEF','AŞPAZ'),
(353,'ПИЛОТ','PILOT','PİLOT'),
(354,'ВОДИТЕЛЬ','DRIVER','SÜRÜCÜ'),
(355,'ПОЖАРНЫЙ','FIREFIGHTER','YANĞINSÖNDÜRƏN'),
(356,'ПОЛИЦЕЙСКИЙ','POLICE','POLİS'),
(357,'СТРОИТЕЛЬ','BUILDER','İNŞAATÇI'),
(358,'ДИЗАЙНЕР','DESIGNER','DİZAYNER'),
(359,'ПРОГРАММИСТ','PROGRAMMER','PROQRAMÇI'),
(360,'ФОТОГРАФ','PHOTOGRAPHER','FOTOQRAF'),
(361,'МУЗЫКАНТ','MUSICIAN','MUSİQİÇİ'),
(362,'ХУДОЖНИК','ARTIST','RƏSSAM'),
(363,'ФЕРМЕР','FARMER','FERMER'),
(364,'МЕХАНИК','MECHANIC','MEXANİK'),
(365,'ПАРИКМАХЕР','HAIRDRESSER','BƏRBƏR'),
(366,'ЖУРНАЛИСТ','JOURNALIST','JURNALİST'),
(367,'АРХИТЕКТОР','ARCHITECT','MEMAR'),
(368,'АДВОКАТ','LAWYER','VƏKİL'),
(369,'ПРОДАВЕЦ','SELLER','SATICI'),
(370,'АТОМ','ATOM','ATOM'),
(371,'МОЛЕКУЛА','MOLECULE','MOLEKUL'),
(372,'КЛЕТКА','CELL','HÜCEYRƏ'),
(373,'ДНК','DNA','DNT'),
(374,'ПЛАНЕТА','PLANET','PLANET'),
(375,'ЗВЕЗДА','STAR','ULDUZ'),
(376,'ГАЛАКТИКА','GALAXY','QALAKTİKA'),
(377,'ТЕЛЕСКОП','TELESCOPE','TELESKOP'),
(378,'МИКРОСКОП','MICROSCOPE','MİKROSKOP'),
(379,'МАГНИТ','MAGNET','MAQNİT'),
(380,'ЭЛЕКТРОН','ELECTRON','ELEKTRON'),
(381,'КИСЛОРОД','OXYGEN','OKSİGEN'),
(382,'ТЕМПЕРАТУРА','TEMPERATURE','TEMPERATUR'),
(383,'ДАВЛЕНИЕ','PRESSURE','TƏZYİQ'),
(384,'ПЛОТНОСТЬ','DENSITY','SIXLIQ'),
(385,'УЛИЦА','STREET','KÜÇƏ'),
(386,'ПЛОЩАДЬ','SQUARE','MEYDAN'),
(387,'ПАРК','PARK','PARK'),
(388,'ФОНТАН','FOUNTAIN','FƏVVƏRƏ'),
(389,'МУЗЕЙ','MUSEUM','MUZEY'),
(390,'БИБЛИОТЕКА','LIBRARY','KİTABXANA'),
(391,'ШКОЛА','SCHOOL','MƏKTƏB'),
(392,'БОЛЬНИЦА','HOSPITAL','XƏSTƏXANA'),
(393,'МАГАЗИН','STORE','MAĞAZA'),
(394,'РЫНОК','MARKET','BAZAR'),
(395,'БАНК','BANK','BANK'),
(396,'АПТЕКА','PHARMACY','APTEK'),
(397,'РЕСТОРАН','RESTAURANT','RESTORAN'),
(398,'КАФЕ','CAFE','KAFE'),
(399,'СВЕТОФОР','TRAFFICLIGHT','İŞIQFOR')
on conflict(question_id) do update set answer_ru=excluded.answer_ru,answer_en=excluded.answer_en,answer_az=excluded.answer_az;

create table if not exists public.challenge_run_questions(
 run_id uuid not null references public.challenge_runs(id) on delete cascade,
 seq integer not null,
 question_id integer not null references public.challenge_question_catalog(question_id),
 answered_at timestamptz,
 primary key(run_id,seq)
);
create table if not exists public.challenge_answer_attempts(
 id bigint generated by default as identity primary key,
 run_id uuid not null,
 seq integer not null,
 submitted_answer text not null,
 is_correct boolean not null,
 created_at timestamptz not null default now(),
 foreign key(run_id,seq) references public.challenge_run_questions(run_id,seq) on delete cascade
);
alter table public.challenge_question_answers enable row level security;
alter table public.challenge_run_questions enable row level security;
alter table public.challenge_answer_attempts enable row level security;
revoke all on public.challenge_question_answers,public.challenge_run_questions,public.challenge_answer_attempts from anon,authenticated,public;
grant select,insert,update,delete on public.challenge_question_answers,public.challenge_run_questions,public.challenge_answer_attempts to service_role;
grant usage,select on sequence public.challenge_answer_attempts_id_seq to service_role;

CREATE OR REPLACE FUNCTION public.reserve_challenge_questions(p_telegram_id bigint, p_run_id uuid, p_mode text, p_initial_seen integer[] DEFAULT '{}'::integer[])
 RETURNS integer[]
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v public.players; h public.challenge_question_history; eligible integer[]; fresh integer[]; chosen integer[]; inserted integer; v_run public.challenge_runs;
begin
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found'; end if;
 select * into v_run from public.challenge_runs where id=p_run_id and player_id=v.id and mode=p_mode and finished_at is null for update;
 if v_run.id is null then raise exception 'run_not_found'; end if;
 insert into public.challenge_question_history(player_id) values(v.id) on conflict do nothing;
 get diagnostics inserted=row_count;
 select * into h from public.challenge_question_history where player_id=v.id for update;
 if inserted=1 then
  select coalesce(array_agg(distinct x),'{}'::integer[]) into h.seen from unnest(p_initial_seen) x where x between 0 and 399;
 end if;
 select array_agg(c.question_id order by c.question_id) into eligible
 from public.challenge_question_catalog c
 where not exists(select 1 from unnest(c.main_ids) n where n<=v.completed_levels)
 and not exists(select 1 from public.theme_progress p where p.player_id=v.id
   and exists(select 1 from jsonb_array_elements_text(coalesce(c.themes->p.theme_id,'[]'::jsonb)) n where n::integer=p.level_id));
 if coalesce(cardinality(eligible),0)=0 then select array_agg(question_id order by question_id) into eligible from public.challenge_question_catalog; end if;
 select array_agg(n) into fresh from unnest(eligible) n where not(n=any(h.seen));
 if coalesce(cardinality(fresh),0)=0 then h.seen:='{}';h.cycle:=h.cycle+1;fresh:=eligible;end if;
 select array_agg(n) into chosen from (select n from unnest(fresh) n order by (n is not distinct from h.last_question),random() limit 10) q;
 update public.challenge_question_history set seen=h.seen||chosen,last_question=chosen[cardinality(chosen)],cycle=h.cycle,updated_at=now() where player_id=v.id;
 insert into public.challenge_run_questions(run_id,seq,question_id)
 select p_run_id,coalesce((select max(seq)+1 from public.challenge_run_questions where run_id=p_run_id),0)+ord-1,qid
 from unnest(chosen) with ordinality as x(qid,ord);
 return chosen;
end $function$
;

create or replace function public.record_challenge_answer_server(
 p_telegram_id bigint,p_run_id uuid,p_question_id integer,p_answer text
) returns jsonb language plpgsql security definer set search_path to '' as $function$
declare v_player public.players; v_run public.challenge_runs; v_q public.challenge_run_questions;
 v_expected text; v_ok boolean; v_now timestamptz:=clock_timestamp(); v_score integer; v_streak integer;
 v_best integer; v_mistakes integer; v_adjustment integer; v_remaining bigint;
begin
 if p_answer is null or length(p_answer)>40 then raise exception 'bad_answer'; end if;
 select * into v_player from public.players where telegram_id=p_telegram_id for update;
 if v_player.id is null then raise exception 'player_not_found'; end if;
 select * into v_run from public.challenge_runs where id=p_run_id and player_id=v_player.id for update;
 if v_run.id is null then raise exception 'run_not_found'; end if;
 if v_run.finished_at is not null then raise exception 'run_finished'; end if;
 if v_run.mode not in ('limited','nohint','blitz') then raise exception 'bad_mode'; end if;
 if v_run.mode in ('limited','nohint') and v_run.mistakes>=3 then raise exception 'run_over'; end if;
 if v_run.mode='limited' and v_run.score>=10 then raise exception 'run_over'; end if;
 if v_run.last_answer_at is not null and v_now<v_run.last_answer_at+interval '150 milliseconds' then raise exception 'answer_wait'; end if;
 if v_run.mode='blitz' and v_now>=v_run.started_at+interval '60 seconds'+(v_run.blitz_adjustment_seconds*interval '1 second') then raise exception 'challenge_time_over'; end if;
 select * into v_q from public.challenge_run_questions
 where run_id=p_run_id and answered_at is null order by seq limit 1 for update;
 if v_q.run_id is null or v_q.question_id<>p_question_id then raise exception 'question_order'; end if;
 select case v_run.language when 'en' then answer_en when 'az' then answer_az else answer_ru end
 into v_expected from public.challenge_question_answers where question_id=v_q.question_id;
 if v_expected is null then raise exception 'answer_key_missing'; end if;
 v_ok:=upper(btrim(p_answer))=upper(v_expected);
 insert into public.challenge_answer_attempts(run_id,seq,submitted_answer,is_correct,created_at)
 values(p_run_id,v_q.seq,left(p_answer,40),v_ok,v_now);
 if v_ok then
   update public.challenge_run_questions set answered_at=v_now where run_id=p_run_id and seq=v_q.seq;
   v_score:=v_run.score+1; v_streak:=v_run.streak+1; v_best:=greatest(v_run.best_streak,v_streak);
   v_mistakes:=v_run.mistakes; v_adjustment:=v_run.blitz_adjustment_seconds+case when v_run.mode='blitz' then 3 else 0 end;
 else
   v_score:=v_run.score; v_streak:=0; v_best:=v_run.best_streak;
   v_mistakes:=v_run.mistakes+1; v_adjustment:=v_run.blitz_adjustment_seconds-case when v_run.mode='blitz' then 3 else 0 end;
 end if;
 update public.challenge_runs set score=v_score,streak=v_streak,best_streak=v_best,mistakes=v_mistakes,
  blitz_adjustment_seconds=v_adjustment,last_answer_at=v_now where id=p_run_id;
 if v_run.mode='blitz' then
  v_remaining:=greatest(0,floor(extract(epoch from (v_run.started_at+interval '60 seconds'+(v_adjustment*interval '1 second')-v_now))*1000)::bigint);
 else v_remaining:=null; end if;
 return jsonb_build_object('correct',v_ok,'score',v_score,'streak',v_streak,'best_streak',v_best,'mistakes',v_mistakes,'remaining_ms',v_remaining);
end $function$;
revoke all on function public.record_challenge_answer_server(bigint,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.record_challenge_answer_server(bigint,uuid,integer,text) to service_role;

create or replace function public.finish_challenge_run_server(p_telegram_id bigint,p_run_id uuid,p_mode text,p_score integer,p_streak integer)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare v_player public.players; v_run public.challenge_runs; v_score integer; v_streak integer; v_coins integer:=0; v_xp integer:=0; v_rewarded_today integer:=0; v_elapsed numeric;
begin
 if p_mode not in ('limited','nohint','blitz') then raise exception 'bad_mode'; end if;
 select * into v_player from public.players where telegram_id=p_telegram_id for update;
 if v_player.id is null then raise exception 'player_not_found'; end if;
 select * into v_run from public.challenge_runs where id=p_run_id and player_id=v_player.id for update;
 if v_run.id is null then raise exception 'run_not_found'; end if;
 if v_run.mode<>p_mode then raise exception 'run_mode_mismatch'; end if;
 if v_run.finished_at is not null then
  select count(*) into v_rewarded_today from public.challenge_runs where player_id=v_player.id and mode=p_mode and reward_coins>0 and finished_at>=date_trunc('day',now() at time zone 'utc') at time zone 'utc';
  return jsonb_build_object('reward_coins',v_run.reward_coins,'reward_xp',v_run.reward_xp,'rewarded_runs_today',v_rewarded_today,'reward_limit',3,'duplicate',true);
 end if;
 v_score:=greatest(0,least(case when p_mode='limited' then 10 else 100 end,coalesce(v_run.score,0)));
 v_streak:=greatest(0,least(v_score,coalesce(v_run.best_streak,0)));
 v_elapsed:=extract(epoch from (clock_timestamp()-v_run.started_at));
 if p_mode='limited' then
  if v_score>=10 then v_coins:=15;v_xp:=10; elsif v_score>=7 then v_coins:=10;v_xp:=6; elsif v_score>=4 then v_coins:=5;v_xp:=3; end if;
 elsif p_mode='nohint' then
  if v_streak>=10 then v_coins:=15;v_xp:=10; elsif v_streak>=6 then v_coins:=10;v_xp:=6; elsif v_streak>=3 then v_coins:=5;v_xp:=3; end if;
 else
  if v_score>=12 then v_coins:=15;v_xp:=10; elsif v_score>=8 then v_coins:=10;v_xp:=6; elsif v_score>=5 then v_coins:=5;v_xp:=3; end if;
 end if;
 if v_elapsed<2 then v_coins:=0;v_xp:=0; end if;
 select count(*) into v_rewarded_today from public.challenge_runs where player_id=v_player.id and mode=p_mode and reward_coins>0 and finished_at>=date_trunc('day',now() at time zone 'utc') at time zone 'utc';
 if v_rewarded_today>=3 then v_coins:=0;v_xp:=0; end if;
 update public.challenge_runs set finished_at=clock_timestamp(),score=v_score,streak=v_streak,reward_coins=v_coins,reward_xp=v_xp where id=v_run.id;
 update public.challenge_profiles set
  limited_best_score=case when p_mode='limited' then greatest(limited_best_score,v_score) else limited_best_score end,
  nohint_best_streak=case when p_mode='nohint' then greatest(nohint_best_streak,v_streak) else nohint_best_streak end,
  blitz_best_score=case when p_mode='blitz' then greatest(blitz_best_score,v_score) else blitz_best_score end,
  blitz_best_streak=case when p_mode='blitz' then greatest(blitz_best_streak,v_streak) else blitz_best_streak end,
  updated_at=clock_timestamp() where player_id=v_player.id;
 if v_coins>0 or v_xp>0 then
  update public.players set coins=coins+v_coins,xp=xp+v_xp where id=v_player.id;
  if v_coins>0 then insert into public.coin_transactions(player_id,amount,transaction_type,description)
    values(v_player.id,v_coins,'challenge_reward','Challenge '||p_mode||' score '||v_score||' streak '||v_streak); end if;
  v_rewarded_today:=v_rewarded_today+1;
 end if;
 return jsonb_build_object('reward_coins',v_coins,'reward_xp',v_xp,'rewarded_runs_today',v_rewarded_today,'reward_limit',3,'duplicate',false);
end $function$;
