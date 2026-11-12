# Portal TJAN para XAMPP

Inicia **Apache** en XAMPP y abre `http://localhost/TJA/tjan-xampp/` (o `http://localhost/TJA/`). No abras `index.html` con doble clic: la búsqueda y el visor necesitan HTTP y PHP.

El sitio conserva la portada, noticias, estructura, accesibilidad y el catálogo de 1,211 documentos. Los PDF destacados están en `pdf/`; el resto se sirve mediante `pdf.php` desde el archivo oficial, sin sacar al visitante del portal. Esto requiere conexión a internet. Las citas abren el sistema oficial del Tribunal.

Para mover el portal a otra carpeta de Apache, copia el contenido de `tjan-xampp/`; los enlaces internos son relativos.
