# Turno · app de fichaje

## Cómo ponerla en tu móvil (GitHub Pages, igual que GastosApp)

1. En GitHub crea un repositorio nuevo llamado `Turno` (público).
2. Pulsa **Add file → Upload files** y arrastra todo el contenido de esta carpeta
   (`index.html`, `sw.js`, `manifest.webmanifest` y la carpeta `icons`).
3. En el repositorio: **Settings → Pages → Branch: main / (root) → Save**.
4. Al cabo de un minuto estará en `https://maktoruk98.github.io/Turno/`.
5. Ábrela en el móvil con Chrome → menú ⋮ → **Instalar aplicación** (o «Añadir a pantalla de inicio»).
6. Abre la app desde el icono, pulsa **Fichar** y acepta las notificaciones.

## Qué hace

- **Fichar**: guarda la hora de entrada y muestra la notificación «Trabajando» con un botón «Finalizar turno».
- **Pausa / Reanudar**: el tiempo de pausa se descuenta del total.
- **Finalizar turno**: puedes ajustar la hora de salida y la pausa antes de guardar. Si fichaste sin querer, «Descartar».
- **Historial**: por meses y semanas, con el total de horas. Toca un turno para editarlo o eliminarlo; «+ Añadir turno» para meter uno a mano. Los turnos que pasan de medianoche se marcan con +1.
- **Ajustes**: horas semanales de contrato, exportar a Excel (CSV), descargar y restaurar copia de seguridad.

## Sobre la notificación

- En Android, si la deslizas para quitarla vuelve a aparecer al instante mientras sigas en turno.
- Una web no puede crear una notificación 100 % fija como las de Spotify o un GPS; eso solo lo puede hacer una app nativa.
- En iPhone solo funciona con la app añadida a la pantalla de inicio (iOS 16.4 o posterior). Ahí no lleva botones ni se queda fija, pero mientras estés en turno el icono de la app muestra un globo rojo con un 1, que desaparece al finalizar.

## En iPhone

1. Abre `https://maktoruk98.github.io/Turno/` en Safari.
2. Botón Compartir → «Añadir a pantalla de inicio» → Añadir.
3. Abre siempre la app desde el icono (no desde Safari) y acepta las notificaciones la primera vez que fiches: sin ese permiso no aparece el globo.

## Tus datos

Se guardan solo en ese móvil, dentro del navegador. Descarga una copia desde Ajustes de vez en cuando.
