-- PIN por ubicación para el login del receptor.
-- Se guarda solo el HMAC (ver hmacPin en src/features/arpillas/sesion.ts),
-- nunca el número en claro.
alter table arp_ubicaciones
  add column if not exists pin_hmac text;

-- Dos ubicaciones activas no pueden compartir PIN: el login no sabría a cuál entrar.
create unique index if not exists arp_ubicaciones_pin_hmac_activo_uq
  on arp_ubicaciones (pin_hmac)
  where activo and pin_hmac is not null;
