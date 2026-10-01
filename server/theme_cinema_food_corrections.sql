-- Editorial fixes after the initial Cinema and Food answer import.
update public.theme_level_answers set az='MƏNFİOBRAZ' where theme_id='cinema' and level_id=27;
update public.theme_level_answers set en='MOVIEPOSTER' where theme_id='cinema' and level_id=69;
update public.theme_level_answers set en='CAMERAPAN' where theme_id='cinema' and level_id=78;
update public.theme_level_answers set ru='КИНОКЛУБ',en='FILMCLUB',az='KİNOKLUB' where theme_id='cinema' and level_id=100;
