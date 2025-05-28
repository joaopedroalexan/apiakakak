create event if not exists arquivar_compra_antigas
on schedule every 1 day
starts current_timestamp + interval 1  minute
on completion preserve
enable
do
insert into historico_compra(id_compra, data_compra, id_usuario)
select id_compra, data_compra, fk_id_usuario from compra where data_compra < now() - interval 6 month;

create event  if not exists excluir_eventos_antigos
    on schedule every 1 week
    starts current_timestamp + interval 5 minute
    on completion preserve
    enable
do
    delete from evento 
    where data_hora < now() - interval 1 year;

create event if not exists reajustePrecoEventosProximos
    on schedule every 1 day
    starts current_timestamp + interval 1 minute
    on completion preserve
    enable
do 
    update ingresso set preco = preco * 1.10
    where fk_id_evento in(
        select id_evento from evento
        where data_hora between now() and now() + interval 7 day

    );