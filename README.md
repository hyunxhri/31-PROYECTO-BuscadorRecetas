## Cambios realizados

* Se ha corregido que hubieran dos botones para cerrar el modal, eliminando el botón del header.
* Ahora al crearse el modal se crea el título de forma automática, en vez de por HTML.
* El botón de añadir a favoritos ha sido modificado, ahora se encuentra en el header con forma de corazón. Si está relleno, es que está añadido en favoritos. Si no, no lo está.
* Donde se encontraba el botón de favoritos ahora se encuentra el botón "Añadir a menú". Al pulsarlo se abre un formulario que te pide el día de la semana y la comida que quieres que sea. Al darle a añadir, la comida se añadirá a la celda correspondiente del menú semanal.
* Se ha creado una nueva página con una tabla que simula un calendario semanal de comidas. Al clickar en alguna de las comidas, se te abrirá el modal pero en lugar de "Añadir a menú" te saldrá el botón eliminar de menú.
* Si clickas en Añadir/Eliminar de menú aparece un toast avisándote de que lo has añadido/eliminado al menú semanal.
* Se ha creado una función que limpia la tabla.
* Se ha creado un botón para limpiar la tabla del menú semanal entera.
* Se ha creado un contador de favoritos. Ahora, si no ha favoritos aparece "Mis favoritos" pero si hay favoritos, el texto es seguido del número de favoritos que hay. Por ejemplo: "Mis favoritos: 3".
