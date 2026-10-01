begin;

alter table public.theme_level_answers drop constraint theme_level_answers_theme_id_check;
alter table public.theme_level_answers add constraint theme_level_answers_theme_id_check check (theme_id in ('sport','art','professions','travel','science','technology','cinema','food'));
alter table public.theme_progress drop constraint theme_progress_theme_id_check;
alter table public.theme_progress add constraint theme_progress_theme_id_check check (theme_id in ('sport','art','professions','travel','science','technology','cinema','food'));

CREATE OR REPLACE FUNCTION public.complete_theme_level_server(p_telegram_id bigint, p_theme_id text, p_level_id integer, p_language text, p_answer text, p_reward_coins integer DEFAULT 15, p_reward_xp integer DEFAULT 10)
 RETURNS players
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v public.players;
  v_expected text;
  v_inserted integer;
begin
  if p_theme_id not in ('sport','art','professions','travel','science','technology','cinema','food')
     or p_level_id not between 1 and 100
     or p_language not in ('ru','en','az')
     or p_reward_coins is distinct from 15
     or p_reward_xp is distinct from 10 then
    raise exception 'bad_theme_level';
  end if;

  select case p_language when 'ru' then a.ru when 'en' then a.en else a.az end
  into v_expected
  from public.theme_level_answers a
  where a.theme_id=p_theme_id and a.level_id=p_level_id;

  if v_expected is null then raise exception 'bad_theme_level'; end if;
  if trim(coalesce(p_answer,'')) is distinct from v_expected then raise exception 'wrong_answer'; end if;

  select * into v from public.players where telegram_id=p_telegram_id for update;
  if v.id is null then raise exception 'player_not_found'; end if;

  insert into public.theme_progress(player_id,theme_id,level_id)
  values(v.id,p_theme_id,p_level_id)
  on conflict(player_id,theme_id,level_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted=0 then return v; end if;

  update public.players
  set coins=coins+p_reward_coins,
      xp=xp+p_reward_xp
  where id=v.id
  returning * into v;

  insert into public.coin_transactions(player_id,amount,transaction_type,description)
  values(v.id,p_reward_coins,'theme_level_reward','Theme '||p_theme_id||' level '||p_level_id);

  return v;
end
$function$
;

CREATE OR REPLACE FUNCTION public.spend_theme_hint_server(p_telegram_id bigint, p_theme_id text, p_level_id integer, p_hint_type text, p_cost integer)
 RETURNS players
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v public.players;
  v_expected_cost integer;
begin
  if p_theme_id not in ('sport','art','professions','travel','science','technology','cinema','food')
     or p_level_id not between 1 and 100 then
    raise exception 'bad_theme_level';
  end if;
  v_expected_cost := case p_hint_type when 'letter' then 50 when 'remove' then 100 when 'text' then 150 else null end;
  if v_expected_cost is null or p_cost is distinct from v_expected_cost then raise exception 'bad_hint'; end if;

  select * into v from public.players where telegram_id=p_telegram_id for update;
  if v.id is null then raise exception 'player_not_found'; end if;
  if v.coins < p_cost then raise exception 'insufficient_coins'; end if;

  update public.players set coins=coins-p_cost where id=v.id returning * into v;
  insert into public.coin_transactions(player_id,amount,transaction_type,description)
  values(v.id,-p_cost,'theme_hint_'||p_hint_type,'Theme '||p_theme_id||' level '||p_level_id);

  return v;
end
$function$
;

insert into public.theme_level_answers(theme_id,level_id,ru,en,az) values
 ('cinema',1,'КИНОКАРТИНА','MOTIONPICTURE','KİNOƏSƏR'),
 ('cinema',2,'КОМЕДИЯ','COMEDY','KOMEDİYA'),
 ('cinema',3,'ДРАМА','DRAMA','DRAM'),
 ('cinema',4,'ТРИЛЛЕР','THRILLER','TRİLLER'),
 ('cinema',5,'УЖАСЫ','HORROR','DƏHŞƏT'),
 ('cinema',6,'ФАНТАСТИКА','SCIFI','ELMİFANTASTİKA'),
 ('cinema',7,'ФЭНТЕЗИ','FANTASY','FENTEZİ'),
 ('cinema',8,'МИСТИКА','SUPERNATURAL','MİSTİKA'),
 ('cinema',9,'БОЕВИК','ACTION','DÖYÜŞFİLMİ'),
 ('cinema',10,'МЕЛОДРАМА','MELODRAMA','MELODRAM'),
 ('cinema',11,'МУЛЬТФИЛЬМ','CARTOON','CİZGİFİLM'),
 ('cinema',12,'ДОКУМЕНТАЛКА','DOCUMENTARY','SƏNƏDLİFİLM'),
 ('cinema',13,'СЕРИАЛ','SERIES','SERİAL'),
 ('cinema',14,'ЭПИЗОД','EPISODE','EPİZOD'),
 ('cinema',15,'МИНИСЕРИАЛ','MINISERIES','MİNİSERİAL'),
 ('cinema',16,'СИКВЕЛ','SEQUEL','DAVAMFİLMİ'),
 ('cinema',17,'ПРИКВЕЛ','PREQUEL','ÖNHEKAYƏ'),
 ('cinema',18,'РЕМЕЙК','REMAKE','YENİÇƏKİLİŞ'),
 ('cinema',19,'ЭКРАНИЗАЦИЯ','ADAPTATION','EKRANLAŞDIRMA'),
 ('cinema',20,'БЛОКБАСТЕР','BLOCKBUSTER','BLOKBASTER'),
 ('cinema',21,'СЦЕНАРИЙ','SCREENPLAY','SSENARİ'),
 ('cinema',22,'СЮЖЕТ','PLOT','SÜJET'),
 ('cinema',23,'ЗАВЯЗКА','SETUP','GİRİŞ'),
 ('cinema',24,'КУЛЬМИНАЦИЯ','CLIMAX','KULMİNASİYA'),
 ('cinema',25,'РАЗВЯЗКА','RESOLUTION','HƏLL'),
 ('cinema',26,'ГЕРОЙ','PROTAGONIST','BAŞQƏHRƏMAN'),
 ('cinema',27,'ЗЛОДЕЙ','VILLAIN','CANI'),
 ('cinema',28,'ПЕРСОНАЖ','CHARACTER','OBRAZ'),
 ('cinema',29,'ДИАЛОГ','DIALOGUE','DİALOQ'),
 ('cinema',30,'МОНОЛОГ','MONOLOGUE','MONOLOQ'),
 ('cinema',31,'ЭПИЛОГ','EPILOGUE','EPİLOQ'),
 ('cinema',32,'ДУБЛЬ','TAKE','DUBL'),
 ('cinema',33,'МОНТАЖ','EDITING','MONTAJ'),
 ('cinema',34,'ТИТРЫ','CREDITS','TİTRLƏR'),
 ('cinema',35,'СУБТИТРЫ','SUBTITLES','ALTYAZI'),
 ('cinema',36,'ОЗВУЧКА','VOICEOVER','SƏSLƏNDİRMƏ'),
 ('cinema',37,'ДУБЛЯЖ','DUBBING','DUBLYAJ'),
 ('cinema',38,'САУНДТРЕК','SOUNDTRACK','SAUNDTREK'),
 ('cinema',39,'ТРЕЙЛЕР','TRAILER','TREYLER'),
 ('cinema',40,'АНОНС','TEASER','TİZER'),
 ('cinema',41,'ПОСТАНОВЩИК','FILMMAKER','QURULUŞÇU'),
 ('cinema',42,'КИНОМАГНАТ','MOGUL','KİNOMAQNAT'),
 ('cinema',43,'ДРАМАТУРГ','DRAMATIST','DRAMATURQ'),
 ('cinema',44,'КИНООПЕРАТОР','CINEMATOGRAPHER','KİNOOPERATOR'),
 ('cinema',45,'СКЛЕЙКА','CUT','KƏSİK'),
 ('cinema',46,'ТРЮК','STUNT','TRYUK'),
 ('cinema',47,'МАССОВКА','EXTRAS','KÜTLƏVİSƏHNƏ'),
 ('cinema',48,'СТАТИСТ','EXTRA','STATİST'),
 ('cinema',49,'ДУБЛЕР','DOUBLE','DUBLYOR'),
 ('cinema',50,'ГРИМЕР','MAKEUPARTIST','QRİMÇİ'),
 ('cinema',51,'РЕКВИЗИТОР','PROPMASTER','REKVİZİTÇİ'),
 ('cinema',52,'ОСВЕТИТЕЛЬ','GAFFER','İŞIQÇI'),
 ('cinema',53,'ЗВУКОРЕЖИССЕР','SOUNDDESIGNER','SƏSREJİSSORU'),
 ('cinema',54,'КИНОКОМПОЗИТОР','FILMCOMPOSER','KİNOBƏSTƏKAR'),
 ('cinema',55,'КИНОКРИТИК','FILMCRITIC','KİNOTƏNQİDÇİ'),
 ('cinema',56,'РЕЦЕНЗИЯ','REVIEW','RƏY'),
 ('cinema',57,'ПРОСЛУШИВАНИЕ','CALLBACK','TƏKRARSINAQ'),
 ('cinema',58,'КИНОПРОБА','SCREENTEST','EKRANSINAĞI'),
 ('cinema',59,'РЕПОРТАЖ','REPORTAGE','REPORTAJ'),
 ('cinema',60,'ИНТЕРВЬЮ','INTERVIEW','MÜSAHİBƏ'),
 ('cinema',61,'КИНОЗАЛ','AUDITORIUM','KİNOZAL'),
 ('cinema',62,'КИНОЭКРАН','MOVIESCREEN','KİNOEKRAN'),
 ('cinema',63,'ПРОЕКТОР','PROJECTOR','PROYEKTOR'),
 ('cinema',64,'ПОПКОРН','POPCORN','POPKORN'),
 ('cinema',65,'КИНОБИЛЕТ','MOVIETICKET','KİNOBİLET'),
 ('cinema',66,'КИНОКРЕСЛО','CINEMASEAT','KİNOTOXTU'),
 ('cinema',67,'РЯД','ROW','CƏRGƏ'),
 ('cinema',68,'СЕАНС','SCREENING','SEANS'),
 ('cinema',69,'АФИША','BILLBOARD','AFİŞA'),
 ('cinema',70,'КИНОФЕСТИВАЛЬ','FILMFESTIVAL','KİNOFESTİVAL'),
 ('cinema',71,'КИНОПРЕМИЯ','FILMAWARD','KİNOMÜKAFAT'),
 ('cinema',72,'НОМИНАЦИЯ','NOMINATION','NOMİNASİYA'),
 ('cinema',73,'КОВРОВАЯДОРОЖКА','REDCARPET','QIRMIZIXALÇA'),
 ('cinema',74,'ШТАТИВ','TRIPOD','ŞTATİV'),
 ('cinema',75,'ХЛОПУШКА','CLAPPERBOARD','KLAPET'),
 ('cinema',76,'ПАВИЛЬОН','SOUNDSTAGE','PAVİLYON'),
 ('cinema',77,'ХРОМАКЕЙ','GREENSCREEN','XRAMAKEY'),
 ('cinema',78,'ПОВОРОТКАМЕРЫ','CAMERATILT','KAMERADÖNÜŞÜ'),
 ('cinema',79,'ЗАМЕДЛЕНИЕ','SLOWMOTION','YAVAŞHƏRƏKƏT'),
 ('cinema',80,'СПЕЦЭФФЕКТ','SPECIALEFFECT','XÜSUSİEFFEKT'),
 ('cinema',81,'ГРИМ','MAKEUP','QRİM'),
 ('cinema',82,'ПАРИК','WIG','PARİK'),
 ('cinema',83,'РЕКВИЗИТ','PROPS','REKVİZİT'),
 ('cinema',84,'КИНОСТУДИЯ','FILMSTUDIO','KİNOSTUDİYA'),
 ('cinema',85,'СЪЕМКА','FILMING','ÇƏKİLİŞ'),
 ('cinema',86,'ЗАКУЛИСЬЕ','BACKSTAGE','PƏRDƏARXASI'),
 ('cinema',87,'СПОЙЛЕР','SPOILER','SPOYLER'),
 ('cinema',88,'КИНОМАН','CINEPHILE','KİNOMAN'),
 ('cinema',89,'ЗРИТЕЛЬ','VIEWER','TAMAŞAÇI'),
 ('cinema',90,'АНШЛАГ','SELLOUT','ANŞLAQ'),
 ('cinema',91,'АПЛОДИСМЕНТЫ','APPLAUSE','ALQIŞ'),
 ('cinema',92,'ФРАНШИЗА','FRANCHISE','FRANŞİZA'),
 ('cinema',93,'КИНОПРОКАТ','DISTRIBUTION','KİNOPROKAT'),
 ('cinema',94,'СТРИМИНГ','STREAMING','STRİMİNQ'),
 ('cinema',95,'ПОДПИСКА','SUBSCRIPTION','ABUNƏLİK'),
 ('cinema',96,'КИНОХИТ','BOXOFFICEHIT','KİNOHİT'),
 ('cinema',97,'РАСКАДРОВКА','STORYBOARD','KADRPLANI'),
 ('cinema',98,'СИНХРОН','SYNC','SİNXRON'),
 ('cinema',99,'КИНОЛЕНТА','FILMREEL','KİNOLENT'),
 ('cinema',100,'ПОСЛЕВКУСИЕ','AFTERTASTE','SONTƏƏSSÜRAT'),
 ('food',1,'ЯБЛОКО','APPLE','ALMA'),
 ('food',2,'БАНАН','BANANA','BANAN'),
 ('food',3,'АПЕЛЬСИН','ORANGE','PORTAĞAL'),
 ('food',4,'ЛИМОН','LEMON','LİMON'),
 ('food',5,'ГРУША','PEAR','ARMUD'),
 ('food',6,'ПЕРСИК','PEACH','ŞAFTALI'),
 ('food',7,'СЛИВА','PLUM','GAVALI'),
 ('food',8,'ВИШНЯ','CHERRY','GİLAS'),
 ('food',9,'ВИНОГРАД','GRAPES','ÜZÜM'),
 ('food',10,'КЛУБНИКА','STRAWBERRY','ÇİYƏLƏK'),
 ('food',11,'МАЛИНА','RASPBERRY','MORUQ'),
 ('food',12,'АРБУЗ','WATERMELON','QARPIZ'),
 ('food',13,'ДЫНЯ','MELON','YEMİŞ'),
 ('food',14,'АНАНАС','PINEAPPLE','ANANAS'),
 ('food',15,'МАНГО','MANGO','MANQO'),
 ('food',16,'МОРКОВЬ','CARROT','YERKÖKÜ'),
 ('food',17,'КАРТОФЕЛЬ','POTATO','KARTOF'),
 ('food',18,'ПОМИДОР','TOMATO','POMİDOR'),
 ('food',19,'ОГУРЕЦ','CUCUMBER','XİYAR'),
 ('food',20,'КАПУСТА','CABBAGE','KƏLƏM'),
 ('food',21,'БАКЛАЖАН','EGGPLANT','BADIMCAN'),
 ('food',22,'ТЫКВА','PUMPKIN','BALQABAQ'),
 ('food',23,'ЛУК','ONION','SOĞAN'),
 ('food',24,'ЧЕСНОК','GARLIC','SARIMSAQ'),
 ('food',25,'ПЕРЕЦ','PEPPER','BİBƏR'),
 ('food',26,'ГОРОХ','PEAS','NOXUD'),
 ('food',27,'ФАСОЛЬ','BEANS','LOBYA'),
 ('food',28,'КУКУРУЗА','CORN','QARĞIDALI'),
 ('food',29,'РИС','RICE','DÜYÜ'),
 ('food',30,'ГРЕЧКА','BUCKWHEAT','QARABAŞAQ'),
 ('food',31,'ОВСЯНКА','OATMEAL','YULAF'),
 ('food',32,'МУКА','FLOUR','UN'),
 ('food',33,'ХЛЕБ','BREAD','ÇÖRƏK'),
 ('food',34,'БАТОН','LOAF','BATON'),
 ('food',35,'ЛАВАШ','FLATBREAD','LAVAŞ'),
 ('food',36,'МАКАРОНЫ','PASTA','MAKARON'),
 ('food',37,'ЯЙЦО','EGG','YUMURTA'),
 ('food',38,'МОЛОКО','MILK','SÜD'),
 ('food',39,'СЛИВКИ','CREAM','QAYMAQ'),
 ('food',40,'СЫВОРОТКА','WHEY','ZƏRDAB'),
 ('food',41,'СЫР','CHEESE','PENDİR'),
 ('food',42,'ЙОГУРТ','YOGURT','YOQURT'),
 ('food',43,'ТВОРОГ','CURD','KƏSMİK'),
 ('food',44,'ГОВЯДИНА','BEEF','MALƏTİ'),
 ('food',45,'БАРАНИНА','LAMB','QUZUƏTİ'),
 ('food',46,'КУРИЦА','CHICKEN','TOYUQ'),
 ('food',47,'ИНДЕЙКА','TURKEY','HİNDQUŞU'),
 ('food',48,'РЫБА','FISH','BALIQ'),
 ('food',49,'КРЕВЕТКА','SHRIMP','KREVETKA'),
 ('food',50,'КАЛЬМАР','SQUID','KALMAR'),
 ('food',51,'СУП','SOUP','ŞORBA'),
 ('food',52,'БОРЩ','BORSCHT','BORŞ'),
 ('food',53,'ПЛОВ','PILAF','PLOV'),
 ('food',54,'САЛАТ','SALAD','SALAT'),
 ('food',55,'ОМЛЕТ','OMELET','OMLET'),
 ('food',56,'БЛИНЫ','PANCAKES','BLİNÇİK'),
 ('food',57,'ПЕЛЬМЕНИ','DUMPLINGS','DÜŞBƏRƏ'),
 ('food',58,'ВАРЕНИКИ','PIEROGI','VARENİK'),
 ('food',59,'КОТЛЕТА','PATTY','KOTLET'),
 ('food',60,'СТЕЙК','STEAK','STEK'),
 ('food',61,'ШАШЛЫК','KEBAB','KABAB'),
 ('food',62,'ПИЦЦА','PIZZA','PİZZA'),
 ('food',63,'БУРГЕР','BURGER','BURGER'),
 ('food',64,'СУШИ','SUSHI','SUŞİ'),
 ('food',65,'РОЛЛ','ROLL','ROLL'),
 ('food',66,'ЛАПША','NOODLES','ƏRİŞTƏ'),
 ('food',67,'ЛАЗАНЬЯ','LASAGNA','LAZANYA'),
 ('food',68,'РАГУ','STEW','RAQU'),
 ('food',69,'ЗАПЕКАНКА','CASSEROLE','SOBAYEMƏYİ'),
 ('food',70,'ПЮРЕ','MASH','PÜRE'),
 ('food',71,'СОУС','SAUCE','SOUS'),
 ('food',72,'МАРИНАД','MARINADE','MARİNAD'),
 ('food',73,'СЭНДВИЧ','SANDWICH','SENDVİÇ'),
 ('food',74,'КРУАССАН','CROISSANT','KRUASAN'),
 ('food',75,'ПИРОГ','PIE','PİROQ'),
 ('food',76,'ТОРТ','CAKE','TORT'),
 ('food',77,'ПЕЧЕНЬЕ','COOKIE','PEÇENYE'),
 ('food',78,'ШОКОЛАД','CHOCOLATE','ŞOKOLAD'),
 ('food',79,'МОРОЖЕНОЕ','ICECREAM','DONDURMA'),
 ('food',80,'МЁД','HONEY','BAL'),
 ('food',81,'ВАРЕНЬЕ','JAM','MÜRƏBBƏ'),
 ('food',82,'КАРАМЕЛЬ','CARAMEL','KARAMEL'),
 ('food',83,'САХАР','SUGAR','ŞƏKƏR'),
 ('food',84,'СОЛЬ','SALT','DUZ'),
 ('food',85,'КОРИЦА','CINNAMON','DARÇIN'),
 ('food',86,'ИМБИРЬ','GINGER','ZƏNCƏFİL'),
 ('food',87,'УКСУС','VINEGAR','SİRKƏ'),
 ('food',88,'ГОРЧИЦА','MUSTARD','XARDAL'),
 ('food',89,'КЕТЧУП','KETCHUP','KETÇUP'),
 ('food',90,'МАЙОНЕЗ','MAYONNAISE','MAYONEZ'),
 ('food',91,'РОЙБУШ','ROOIBOS','ROİBUŞ'),
 ('food',92,'КОФЕ','COFFEE','QƏHVƏ'),
 ('food',93,'СОК','JUICE','ŞİRƏ'),
 ('food',94,'КОМПОТ','COMPOTE','KOMPOT'),
 ('food',95,'ЛИМОНАД','LEMONADE','LİMONAD'),
 ('food',96,'ЖАРКА','FRYING','QIZARTMA'),
 ('food',97,'ВАРКА','BOILING','QAYNATMA'),
 ('food',98,'ВЫПЕЧКА','BAKING','BİŞİRMƏ'),
 ('food',99,'ТОМЛЕНИЕ','SIMMERING','ZƏİFODDABİŞİRMƏ'),
 ('food',100,'НАРЕЗКА','CHOPPING','DOĞRAMA')
on conflict (theme_id,level_id) do update set ru=excluded.ru,en=excluded.en,az=excluded.az;

commit;
